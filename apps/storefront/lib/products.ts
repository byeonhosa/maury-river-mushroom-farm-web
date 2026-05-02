import {
  getCommerceProductBySlug,
  listCommerceProducts,
  medusaProductToCommerceProduct,
  productCategories,
  shouldShowProductInShop,
  type CartLineInput,
  type CommerceProduct,
  type MedusaProductLike,
  type ProductCategory
} from "@mrmf/shared";
import { applyDevAvailabilityOverride } from "./dev-availability-store";

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
const defaultTimeoutMs = 5000;
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
  return (
    process.env.MEDUSA_STORE_API_URL ??
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ??
    defaultBackendUrl
  );
}

function getPublishableKey() {
  return process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;
}

function getMedusaProductFetchTimeoutMs() {
  const configured = Number(process.env.MEDUSA_STORE_API_TIMEOUT_MS);

  return Number.isFinite(configured) && configured > 0 ? configured : defaultTimeoutMs;
}

function sharedSeedCatalog(mode: CommerceAdapterMode, error?: unknown): ProductCatalogResult {
  const products = listCommerceProducts()
    .map(applyDevAvailabilityOverride)
    .filter((product) => shouldShowProductInShop(product));

  return {
    mode,
    source: "shared-seed",
    products,
    error: error instanceof Error ? error.message : undefined
  };
}

export async function fetchMedusaStoreProducts({
  backendUrl,
  publishableKey,
  fetchImpl = fetch,
  timeoutMs = defaultTimeoutMs
}: FetchMedusaProductsOptions) {
  const url = new URL("/store/products", backendUrl);
  url.searchParams.set("limit", "100");
  url.searchParams.set("fields", "id,title,handle,description,thumbnail,+metadata,*images,*variants");

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

    return (data.products ?? [])
      .map(medusaProductToCommerceProduct)
      .map(applyDevAvailabilityOverride)
      .filter((product) => shouldShowProductInShop(product));
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
        publishableKey: getPublishableKey(),
        timeoutMs: getMedusaProductFetchTimeoutMs()
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

  try {
    const result = await catalogPromise;

    if (result.source === "shared-seed" && result.error) {
      catalogPromise = undefined;
    }

    return result;
  } catch (error) {
    catalogPromise = undefined;
    throw error;
  }
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

export function resetProductCatalogCache() {
  catalogPromise = undefined;
}

export const resetProductCatalogCacheForTests = resetProductCatalogCache;
