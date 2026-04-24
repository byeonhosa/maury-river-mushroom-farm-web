import {
  getCommerceProductBySlug,
  listCommerceProducts,
  medusaProductToCommerceProduct,
  productCategories,
  type CartLineInput,
  type CommerceProduct,
  type MedusaProductLike,
  type ProductCategory
} from "@mrmf/shared";

export type CommerceAdapterMode = "shared-seed" | "medusa" | "medusa-hybrid";

export interface ProductCatalogResult {
  mode: CommerceAdapterMode;
  source: "shared-seed" | "medusa";
  products: CommerceProduct[];
  error?: string;
}

interface MedusaStoreProductsResponse {
  products?: MedusaProductLike[];
}

interface FetchMedusaProductsOptions {
  backendUrl: string;
  publishableKey?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

const defaultBackendUrl = "http://localhost:9000";
let catalogPromise: Promise<ProductCatalogResult> | undefined;

function getAdapterMode(): CommerceAdapterMode {
  const configured = process.env.NEXT_PUBLIC_COMMERCE_ADAPTER;

  if (
    configured === "shared-seed" ||
    configured === "medusa" ||
    configured === "medusa-hybrid"
  ) {
    return configured;
  }

  return "medusa-hybrid";
}

function getBackendUrl() {
  return process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? defaultBackendUrl;
}

function getPublishableKey() {
  return process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;
}

function sharedSeedCatalog(mode: CommerceAdapterMode, error?: unknown): ProductCatalogResult {
  return {
    mode,
    source: "shared-seed",
    products: listCommerceProducts(),
    error: error instanceof Error ? error.message : undefined
  };
}

export async function fetchMedusaStoreProducts({
  backendUrl,
  publishableKey,
  fetchImpl = fetch,
  timeoutMs = 1500
}: FetchMedusaProductsOptions) {
  const url = new URL("/store/products", backendUrl);
  url.searchParams.set("limit", "100");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(url, {
      headers: publishableKey ? { "x-publishable-api-key": publishableKey } : undefined,
      signal: controller.signal,
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Medusa Store API returned ${response.status}.`);
    }

    const data = (await response.json()) as MedusaStoreProductsResponse;

    return (data.products ?? []).map(medusaProductToCommerceProduct);
  } finally {
    clearTimeout(timeout);
  }
}

export async function getProductCatalog(): Promise<ProductCatalogResult> {
  if (catalogPromise) {
    return catalogPromise;
  }

  catalogPromise = (async () => {
    const mode = getAdapterMode();

    if (mode === "shared-seed") {
      return sharedSeedCatalog(mode);
    }

    try {
      const products = await fetchMedusaStoreProducts({
        backendUrl: getBackendUrl(),
        publishableKey: getPublishableKey()
      });

      return {
        mode,
        source: "medusa" as const,
        products
      };
    } catch (error) {
      if (mode === "medusa") {
        throw error;
      }

      return sharedSeedCatalog(mode, error);
    }
  })();

  return catalogPromise;
}

export async function listProducts() {
  return (await getProductCatalog()).products;
}

export async function listProductsByCategory(category: ProductCategory) {
  return (await listProducts()).filter((product) => product.category === category);
}

export async function getProduct(slug: string) {
  const catalogProduct = (await listProducts()).find((product) => product.slug === slug);

  if (catalogProduct) {
    return catalogProduct;
  }

  return getCommerceProductBySlug(slug);
}

export async function getProductsForCart(items: CartLineInput[]) {
  return Promise.all(
    items.map(async (item) => {
      const product = await getProduct(item.productSlug);

      if (!product) {
        throw new Error(`Unknown cart product slug: ${item.productSlug}`);
      }

      return {
        product,
        quantity: item.quantity
      };
    })
  );
}

export function listCategorySummaries() {
  return productCategories;
}

export function resetProductCatalogCacheForTests() {
  catalogPromise = undefined;
}
