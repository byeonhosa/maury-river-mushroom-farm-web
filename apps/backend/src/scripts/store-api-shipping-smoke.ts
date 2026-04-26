import { loadEnv } from "@medusajs/framework/utils";
import {
  canAddCommerceProductToCart,
  filterSafeCommerceShippingOptions,
  getCommerceProductAvailability,
  medusaProductToCommerceProduct,
  type CommerceCartLineInput,
  type CommerceProduct,
  type CommerceShippingOptionLike,
  type MedusaProductLike
} from "@mrmf/shared";
import path from "node:path";
import pg from "pg";

const repositoryRoot = path.resolve(__dirname, "../../../..");

loadEnv(process.env.NODE_ENV ?? "development", repositoryRoot);

const backendUrl =
  process.env.MEDUSA_BACKEND_URL ??
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ??
  "http://localhost:9000";
const regionName =
  process.env.NEXT_PUBLIC_MEDUSA_REGION_NAME ?? "Maury River Local Development Region";
const requestTimeoutMs = Number(process.env.MRMF_SHIPPING_SMOKE_TIMEOUT_MS ?? 30000);

interface MedusaRegionResponse {
  regions?: Array<{
    id: string;
    name?: string | null;
    currency_code?: string | null;
  }>;
}

interface MedusaProductsResponse {
  products?: MedusaProductLike[];
}

interface MedusaCartResponse {
  cart?: {
    id: string;
  };
}

type SmokeShippingOption = CommerceShippingOptionLike;

interface MedusaShippingOptionsResponse {
  shipping_options?: SmokeShippingOption[];
}

interface SmokeScenario {
  name: string;
  handles: string[];
  expectParcelSafe: boolean;
  expectRawParcelBlocked: boolean;
}

async function getPublishableKey() {
  if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
    return process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;
  }

  if (!process.env.DATABASE_URL) {
    throw new Error(
      "Set NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY or DATABASE_URL before running the Store API shipping smoke."
    );
  }

  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    const result = await client.query<{ token: string }>(
      `
        select token
        from api_key
        where title = $1
          and type = 'publishable'
          and revoked_at is null
          and deleted_at is null
        limit 1
      `,
      [process.env.MEDUSA_SEED_PUBLISHABLE_KEY_TITLE ?? "Maury River Storefront Publishable Key"]
    );

    if (!result.rows[0]?.token) {
      throw new Error("Missing seeded storefront publishable API key.");
    }

    return result.rows[0].token;
  } finally {
    await client.end();
  }
}

async function medusaRequest<TResponse>(
  pathName: string,
  publishableKey: string,
  init: RequestInit = {}
) {
  const url = new URL(pathName, backendUrl);
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        "content-type": "application/json",
        "x-publishable-api-key": publishableKey,
        ...init.headers
      },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`${response.status} ${url.pathname}: ${await response.text()}`);
    }

    return (await response.json()) as TResponse;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Timed out after ${requestTimeoutMs}ms requesting ${url.pathname}.`);
    }

    throw error;
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

function describeOption(option: SmokeShippingOption) {
  return [
    option.name,
    `type=${option.data?.fulfillment_type ?? "unknown"}`,
    `scope=${option.data?.mrmf_native_rule_scope ?? "missing"}`,
    `parcel=${option.data?.is_parcel === true ? "yes" : "no"}`
  ].join(" | ");
}

function buildCartLines(products: CommerceProduct[], handles: string[]): CommerceCartLineInput[] {
  return handles.map((handle) => {
    const product = products.find((candidate) => candidate.slug === handle);

    if (!product) {
      throw new Error(`Missing Store API product ${handle}.`);
    }

    return {
      product,
      quantity: 1
    };
  });
}

function buildCartPayload(lines: CommerceCartLineInput[], regionId: string, scenario: string) {
  return {
    region_id: regionId,
    items: lines.map(({ product, quantity }) => {
      if (!product.variantId) {
        throw new Error(`${product.name} is missing a Store API variant ID.`);
      }

      return {
        variant_id: product.variantId,
        quantity,
        metadata: {
          mrmf_managed: true,
          mrmf_slug: product.slug,
          fulfillment_mode: product.fulfillmentMode,
          inventory_status: product.inventoryStatus,
          fulfillment: product.fulfillment,
          shippable: product.shippable
        }
      };
    }),
    metadata: {
      mrmf_shipping_smoke: scenario,
      checkout_status: "staged-payment-disabled"
    }
  };
}

async function runScenario(
  scenario: SmokeScenario,
  products: CommerceProduct[],
  regionId: string,
  publishableKey: string
) {
  console.log(`\nScenario: ${scenario.name}`);

  const lines = buildCartLines(products, scenario.handles);
  const unavailable = lines.filter((line) => !canAddCommerceProductToCart(line.product));

  for (const line of lines) {
    const availability = getCommerceProductAvailability(line.product);
    console.log(
      `- ${line.product.name}: ${line.product.fulfillmentMode}, ${availability.label}, cartable=${availability.canAddToCart}`
    );
  }

  if (unavailable.length > 0) {
    console.log(
      `Store API cart creation skipped: ${unavailable
        .map((line) => `${line.product.name} is ${getCommerceProductAvailability(line.product).label}`)
        .join("; ")}.`
    );
    console.log("Raw Medusa options: unavailable because the cart cannot be safely created.");
    console.log("App-filtered safe options: []");

    return {
      rawOptions: [] as SmokeShippingOption[],
      safeOptions: [] as SmokeShippingOption[],
      appBlockedInvalidParcel: true,
      rawBlockedInvalidParcel: true,
      skipped: true
    };
  }

  const cartResponse = await medusaRequest<MedusaCartResponse>("/store/carts", publishableKey, {
    method: "POST",
    body: JSON.stringify(buildCartPayload(lines, regionId, scenario.name))
  });

  if (!cartResponse.cart?.id) {
    throw new Error(`Medusa did not return a cart for scenario ${scenario.name}.`);
  }

  const shippingResponse = await medusaRequest<MedusaShippingOptionsResponse>(
    `/store/shipping-options?cart_id=${encodeURIComponent(cartResponse.cart.id)}`,
    publishableKey
  );
  const rawOptions = shippingResponse.shipping_options ?? [];
  const safeOptions = filterSafeCommerceShippingOptions(lines, rawOptions);
  const rawParcelOptions = rawOptions.filter((option) => option.data?.is_parcel === true);
  const safeParcelOptions = safeOptions.filter((option) => option.data?.is_parcel === true);
  const rawBlockedInvalidParcel = scenario.expectRawParcelBlocked
    ? rawParcelOptions.length === 0
    : true;
  const appBlockedInvalidParcel = scenario.expectParcelSafe
    ? safeParcelOptions.length > 0
    : safeParcelOptions.length === 0;

  console.log(`Raw Medusa options (${rawOptions.length}):`);
  for (const option of rawOptions) {
    console.log(`- ${describeOption(option)}`);
  }

  console.log(`App-filtered safe options (${safeOptions.length}):`);
  for (const option of safeOptions) {
    console.log(`- ${describeOption(option)}`);
  }

  console.log(
    `Invalid parcel blocked by app: ${appBlockedInvalidParcel ? "yes" : "no"}; raw parcel blocked by Medusa: ${rawBlockedInvalidParcel ? "yes" : "no"}`
  );

  return {
    rawOptions,
    safeOptions,
    appBlockedInvalidParcel,
    rawBlockedInvalidParcel,
    skipped: false
  };
}

async function runSmoke() {
  const publishableKey = await getPublishableKey();
  const regionsResponse = await medusaRequest<MedusaRegionResponse>("/store/regions", publishableKey);
  const region =
    regionsResponse.regions?.find((candidate) => candidate.name === regionName) ??
    regionsResponse.regions?.find((candidate) => candidate.currency_code === "usd");

  if (!region) {
    throw new Error(`Missing Store API region ${regionName}.`);
  }

  const productsResponse = await medusaRequest<MedusaProductsResponse>(
    "/store/products?limit=100&fields=id,title,handle,description,thumbnail,+metadata,*images,*variants",
    publishableKey
  );
  const products = (productsResponse.products ?? []).map(medusaProductToCommerceProduct);
  const shelfStableHandle = process.env.MRMF_SHIPPING_SMOKE_SHELF_STABLE_HANDLE ?? "mushroom-salt";
  const scenarios: SmokeScenario[] = [
    {
      name: "fresh-only",
      handles: ["fresh-lions-mane"],
      expectParcelSafe: false,
      expectRawParcelBlocked: true
    },
    {
      name: "shelf-stable-only",
      handles: [shelfStableHandle],
      expectParcelSafe: true,
      expectRawParcelBlocked: false
    },
    {
      name: "mixed-fresh-and-shelf-stable",
      handles: ["fresh-lions-mane", shelfStableHandle],
      expectParcelSafe: false,
      expectRawParcelBlocked: true
    }
  ];
  const results = [];

  console.log(`Store API shipping smoke against ${backendUrl}`);
  console.log(`Region: ${region.name ?? region.id}`);

  for (const scenario of scenarios) {
    results.push(await runScenario(scenario, products, region.id, publishableKey));
  }

  const unsafeAppResults = results.filter((result) => !result.appBlockedInvalidParcel);
  const rawFreshResult = results[0];

  console.log(
    `\nSummary: app safety ${unsafeAppResults.length === 0 ? "passed" : "failed"}; fresh raw parcel options ${
      rawFreshResult.rawOptions.some((option) => option.data?.is_parcel === true)
        ? "still returned"
        : "not returned"
    }.`
  );

  if (unsafeAppResults.length > 0) {
    throw new Error("Store API shipping smoke found unsafe app-filtered parcel options.");
  }
}

void runSmoke();
