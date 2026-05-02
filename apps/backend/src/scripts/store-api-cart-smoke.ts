import { loadEnv } from "@medusajs/framework/utils";
import {
  filterSafeCommerceShippingOptions,
  medusaProductToCommerceProduct,
  type CommerceCartLineInput,
  type MedusaProductLike
} from "@mrmf/shared";
import path from "node:path";

const repositoryRoot = path.resolve(__dirname, "../../../..");

loadEnv(process.env.NODE_ENV ?? "development", repositoryRoot);

interface StoreProductsResponse {
  products?: MedusaProductLike[];
}

interface StoreRegionsResponse {
  regions?: Array<{
    id: string;
    name?: string | null;
    currency_code?: string | null;
  }>;
}

interface StoreCartResponse {
  cart?: {
    id: string;
    items?: Array<{
      id: string;
      variant_id?: string | null;
      quantity: number;
    }>;
  };
}

interface StoreShippingOptionsResponse {
  shipping_options?: Array<{
    id: string;
    name: string;
    data?: {
      fulfillment_type?: CommerceCartLineInput["product"]["fulfillment"][number];
      is_parcel?: boolean;
      allowed_fulfillment_modes?: CommerceCartLineInput["product"]["fulfillmentMode"][];
      rejected_fulfillment_modes?: CommerceCartLineInput["product"]["fulfillmentMode"][];
      mrmf_native_rule_scope?: CommerceCartLineInput["product"]["fulfillmentMode"];
      blocks_fresh_products?: boolean;
      [key: string]: unknown;
    } | null;
  }>;
}

function requireValue(value: string | undefined, message: string) {
  if (!value) {
    throw new Error(message);
  }

  return value;
}

function getStoreApiBaseUrl() {
  return (
    process.env.MRMF_STORE_API_BASE_URL ??
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ??
    process.env.MEDUSA_STORE_API_URL ??
    "http://localhost:9000"
  ).replace(/\/$/, "");
}

async function storeRequest<TResponse>(
  baseUrl: string,
  publishableKey: string,
  pathAndQuery: string,
  init: RequestInit = {}
) {
  const response = await fetch(`${baseUrl}${pathAndQuery}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      "x-publishable-api-key": publishableKey,
      ...init.headers
    }
  });

  if (!response.ok) {
    throw new Error(
      `Store API ${pathAndQuery} returned ${response.status}: ${await response.text()}`
    );
  }

  return (await response.json()) as TResponse;
}

async function runCartSmoke() {
  const baseUrl = getStoreApiBaseUrl();
  const publishableKey = requireValue(
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
    "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is required for Store API cart smoke."
  );
  const handle = process.env.MRMF_CART_SMOKE_HANDLE ?? "fresh-lions-mane";
  const regionName =
    process.env.NEXT_PUBLIC_MEDUSA_REGION_NAME ?? "Maury River Local Development Region";
  const productFields =
    "id,title,handle,description,thumbnail,+metadata,*images,*variants";
  const productsResponse = await storeRequest<StoreProductsResponse>(
    baseUrl,
    publishableKey,
    `/store/products?handle=${encodeURIComponent(handle)}&fields=${encodeURIComponent(productFields)}`
  );
  const product = productsResponse.products?.[0];

  if (!product) {
    throw new Error(`Store API did not return product handle ${handle}.`);
  }

  const commerceProduct = medusaProductToCommerceProduct(product);
  const variantId = commerceProduct.variantId;

  if (!variantId) {
    throw new Error(`${commerceProduct.name} did not expose a Medusa variant ID.`);
  }

  const regionsResponse = await storeRequest<StoreRegionsResponse>(
    baseUrl,
    publishableKey,
    "/store/regions"
  );
  const region =
    regionsResponse.regions?.find((candidate) => candidate.name === regionName) ??
    regionsResponse.regions?.find((candidate) => candidate.currency_code === "usd");

  if (!region) {
    throw new Error(`Store API did not return seeded region ${regionName}.`);
  }

  const cartResponse = await storeRequest<StoreCartResponse>(baseUrl, publishableKey, "/store/carts", {
    method: "POST",
    body: JSON.stringify({
      region_id: region.id,
      items: [
        {
          variant_id: variantId,
          quantity: 1,
          metadata: {
            mrmf_managed: true,
            mrmf_slug: commerceProduct.slug,
            fulfillment_mode: commerceProduct.fulfillmentMode,
            inventory_status: commerceProduct.inventoryStatus,
            availability_state:
              commerceProduct.availability.state ?? commerceProduct.inventoryStatus,
            cartable: true,
            fulfillment: commerceProduct.fulfillment,
            shippable: commerceProduct.shippable
          }
        }
      ],
      metadata: {
        mrmf_cart_bridge: true,
        checkout_status: "staged-payment-disabled",
        smoke_script: "store-api-cart-smoke"
      }
    })
  });
  const cart = cartResponse.cart;

  if (!cart?.id) {
    throw new Error("Store API did not create a cart.");
  }

  const shippingResponse = await storeRequest<StoreShippingOptionsResponse>(
    baseUrl,
    publishableKey,
    `/store/shipping-options?cart_id=${encodeURIComponent(cart.id)}`
  );
  const rawShippingOptions = shippingResponse.shipping_options ?? [];
  const safeShippingOptions = filterSafeCommerceShippingOptions(
    [{ product: commerceProduct, quantity: 1 }],
    rawShippingOptions
  );
  const unsafeFreshParcelOption = safeShippingOptions.find(
    (option) => commerceProduct.localOnly && option.data?.is_parcel === true
  );

  if (unsafeFreshParcelOption) {
    throw new Error(
      `${commerceProduct.name} received unsafe parcel option ${unsafeFreshParcelOption.name}.`
    );
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        baseUrl,
        product: commerceProduct.slug,
        source: commerceProduct.source,
        variantId,
        cartId: cart.id,
        rawShippingOptions: rawShippingOptions.map((option) => ({
          id: option.id,
          name: option.name,
          fulfillmentType: option.data?.fulfillment_type,
          isParcel: option.data?.is_parcel === true
        })),
        safeShippingOptions: safeShippingOptions.map((option) => ({
          id: option.id,
          name: option.name,
          fulfillmentType: option.data?.fulfillment_type,
          isParcel: option.data?.is_parcel === true
        }))
      },
      null,
      2
    )
  );
}

runCartSmoke().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
