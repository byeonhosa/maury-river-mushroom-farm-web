import {
  canAddCommerceProductToCart,
  filterSafeCommerceShippingOptions,
  getCommerceProductAvailability,
  type CartLineInput,
  type CheckoutFulfillmentInput,
  type CommerceCartLineInput,
  type CommerceProduct,
  type FulfillmentMode,
  type FulfillmentType
} from "@mrmf/shared";

import {
  clearCartFulfillmentSelection,
  clearMedusaCartId,
  readCartFulfillmentSelection,
  readCartItems,
  readMedusaCartId,
  type StoredCartFulfillmentSelection,
  writeCartFulfillmentSelection,
  writeCartItems,
  writeMedusaCartId
} from "./cart-storage";

export type CartAdapterMode = "staged" | "medusa" | "medusa-hybrid";
export type CartBridgeSource = "staged" | "medusa";

export interface MedusaCartLike {
  id: string;
  region_id?: string | null;
  subtotal?: number | null;
  total?: number | null;
  items?: MedusaCartLineLike[];
  shipping_methods?: MedusaCartShippingMethodLike[];
}

export interface MedusaCartLineLike {
  id: string;
  variant_id?: string | null;
  product_handle?: string | null;
  quantity: number;
  metadata?: Record<string, unknown> | null;
}

export interface MedusaCartShippingMethodLike {
  id: string;
  shipping_option_id?: string | null;
  name?: string | null;
  amount?: number | null;
  data?: Record<string, unknown> | null;
}

export interface MedusaRegionLike {
  id: string;
  name?: string | null;
  currency_code?: string | null;
}

export interface MedusaShippingOptionLike {
  id: string;
  name: string;
  amount?: number | null;
  data?: {
    fulfillment_type?: FulfillmentType;
    allowed_fulfillment_modes?: FulfillmentMode[];
    rejected_fulfillment_modes?: FulfillmentMode[];
    mrmf_native_rule_scope?: FulfillmentMode;
    blocks_mixed_fulfillment_modes?: boolean;
    blocks_fresh_products?: boolean;
    is_parcel?: boolean;
    requires_pickup_window?: boolean;
    requires_final_confirmation?: boolean;
    [key: string]: unknown;
  } | null;
}

export interface CartBridgeResult {
  mode: CartAdapterMode;
  source: CartBridgeSource;
  items: CartLineInput[];
  medusaCartId?: string;
  medusaCart?: MedusaCartLike;
  safeShippingOptions: MedusaShippingOptionLike[];
  selectedFulfillment?: StoredCartFulfillmentSelection;
  recoveredFromCartId?: string;
  error?: string;
}

export interface CartShippingMethodSelection extends CheckoutFulfillmentInput {
  shippingOptionId?: string;
  shippingOptionName?: string;
}

export interface ShippingMethodWriteBackResult {
  source: CartBridgeSource;
  selection: StoredCartFulfillmentSelection;
  medusaCartId?: string;
  medusaCart?: MedusaCartLike;
  error?: string;
}

export interface CartAdapterOptions {
  backendUrl?: string;
  publishableKey?: string;
  regionName?: string;
  mode?: CartAdapterMode;
  fetchImpl?: typeof fetch;
  storage?: Storage;
  timeoutMs?: number;
}

export interface MedusaRequestOptions extends Required<Pick<CartAdapterOptions, "backendUrl">> {
  publishableKey: string;
  fetchImpl: typeof fetch;
  timeoutMs: number;
}

interface MedusaCartResponse {
  cart?: MedusaCartLike;
}

interface MedusaDeleteLineResponse {
  parent?: MedusaCartLike;
}

interface MedusaRegionsResponse {
  regions?: MedusaRegionLike[];
}

interface MedusaShippingOptionsResponse {
  shipping_options?: MedusaShippingOptionLike[];
}

interface MedusaShippingMethodResponse {
  cart?: MedusaCartLike;
}

const defaultBackendUrl = "http://localhost:9000";
const defaultRegionName = "Maury River Local Development Region";

function normalizeQuantity(quantity: number) {
  return Number.isFinite(quantity) ? Math.max(1, Math.min(99, Math.floor(quantity))) : 1;
}

export function getCartAdapterMode(): CartAdapterMode {
  const configured = process.env.NEXT_PUBLIC_CART_ADAPTER;

  if (configured === "staged" || configured === "medusa" || configured === "medusa-hybrid") {
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

function getRegionName() {
  return process.env.NEXT_PUBLIC_MEDUSA_REGION_NAME ?? defaultRegionName;
}

function resolveOptions(options: CartAdapterOptions): CartAdapterOptions {
  return {
    backendUrl: options.backendUrl ?? getBackendUrl(),
    publishableKey: options.publishableKey ?? getPublishableKey(),
    regionName: options.regionName ?? getRegionName(),
    mode: options.mode ?? getCartAdapterMode(),
    fetchImpl: options.fetchImpl ?? fetch,
    storage: options.storage ?? window.localStorage,
    timeoutMs: options.timeoutMs ?? 4000
  };
}

function requireMedusaOptions(options: CartAdapterOptions): MedusaRequestOptions {
  const resolved = resolveOptions(options);

  if (!resolved.backendUrl) {
    throw new Error("NEXT_PUBLIC_MEDUSA_BACKEND_URL is required for Medusa cart sync.");
  }

  if (!resolved.publishableKey) {
    throw new Error("NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is required for Medusa cart sync.");
  }

  return {
    backendUrl: resolved.backendUrl,
    publishableKey: resolved.publishableKey,
    fetchImpl: resolved.fetchImpl ?? fetch,
    timeoutMs: resolved.timeoutMs ?? 4000
  };
}

async function medusaRequest<TResponse>(
  path: string,
  {
    backendUrl,
    publishableKey,
    fetchImpl,
    timeoutMs
  }: MedusaRequestOptions,
  init: RequestInit = {}
) {
  const url = new URL(path, backendUrl);
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(url, {
      ...init,
      headers: {
        "content-type": "application/json",
        "x-publishable-api-key": publishableKey,
        ...init.headers
      },
      signal: controller.signal,
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Medusa Store API returned ${response.status} for ${url.pathname}.`);
    }

    return (await response.json()) as TResponse;
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

export function resolveCartLines(
  products: CommerceProduct[],
  items: CartLineInput[]
): CommerceCartLineInput[] {
  const productBySlug = new Map(products.map((product) => [product.slug, product]));

  return items
    .map((item) => {
      const product = productBySlug.get(item.productSlug);

      return product
        ? {
            product,
            quantity: normalizeQuantity(item.quantity)
          }
        : undefined;
    })
    .filter((line): line is CommerceCartLineInput => Boolean(line));
}

export function buildMedusaCartLinePayloads(
  products: CommerceProduct[],
  items: CartLineInput[]
) {
  return resolveCartLines(products, items).map(({ product, quantity }) => {
    const availability = getCommerceProductAvailability(product);

    if (!canAddCommerceProductToCart(product)) {
      throw new Error(`${product.name} is ${availability.label.toLowerCase()} and cannot be added to a Medusa cart yet.`);
    }

    if (!product.variantId) {
      throw new Error(
        `${product.name} is missing a Medusa variant ID. Start Medusa and use Medusa-backed product reads before syncing the cart.`
      );
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
  });
}

export async function fetchSeededRegionId(options: CartAdapterOptions = {}) {
  const resolved = resolveOptions(options);
  const medusaOptions = requireMedusaOptions(resolved);
  const data = await medusaRequest<MedusaRegionsResponse>("/store/regions", medusaOptions);
  const regions = data.regions ?? [];
  const region =
    regions.find((candidate) => candidate.name === resolved.regionName) ??
    regions.find((candidate) => candidate.currency_code === "usd");

  if (!region) {
    throw new Error(`Unable to find seeded Medusa region "${resolved.regionName}".`);
  }

  return region.id;
}

async function createMedusaCart({
  products,
  items,
  options
}: {
  products: CommerceProduct[];
  items: CartLineInput[];
  options: CartAdapterOptions;
}) {
  const medusaOptions = requireMedusaOptions(options);
  const regionId = await fetchSeededRegionId(options);
  const payload = {
    region_id: regionId,
    items: buildMedusaCartLinePayloads(products, items),
    metadata: {
      mrmf_cart_bridge: true,
      checkout_status: "staged-payment-disabled"
    }
  };
  const response = await medusaRequest<MedusaCartResponse>("/store/carts", medusaOptions, {
    method: "POST",
    body: JSON.stringify(payload)
  });

  if (!response.cart) {
    throw new Error("Medusa did not return a cart after creation.");
  }

  return response.cart;
}

async function getMedusaCart(cartId: string, options: CartAdapterOptions) {
  const medusaOptions = requireMedusaOptions(options);
  const response = await medusaRequest<MedusaCartResponse>(
    `/store/carts/${encodeURIComponent(cartId)}`,
    medusaOptions
  );

  if (!response.cart) {
    throw new Error("Medusa did not return the requested cart.");
  }

  return response.cart;
}

function getManagedLineSlug(line: MedusaCartLineLike) {
  const slug = line.metadata?.mrmf_slug;

  return typeof slug === "string" ? slug : undefined;
}

function mapManagedLinesBySlug(cart: MedusaCartLike) {
  const map = new Map<string, MedusaCartLineLike>();

  for (const line of cart.items ?? []) {
    if (line.metadata?.mrmf_managed !== true) {
      continue;
    }

    const slug = getManagedLineSlug(line);

    if (slug) {
      map.set(slug, line);
    }
  }

  return map;
}

async function addLineItem({
  cartId,
  payload,
  options
}: {
  cartId: string;
  payload: ReturnType<typeof buildMedusaCartLinePayloads>[number];
  options: CartAdapterOptions;
}) {
  const response = await medusaRequest<MedusaCartResponse>(
    `/store/carts/${encodeURIComponent(cartId)}/line-items`,
    requireMedusaOptions(options),
    {
      method: "POST",
      body: JSON.stringify(payload)
    }
  );

  return response.cart;
}

async function updateLineItem({
  cartId,
  lineId,
  payload,
  options
}: {
  cartId: string;
  lineId: string;
  payload: ReturnType<typeof buildMedusaCartLinePayloads>[number];
  options: CartAdapterOptions;
}) {
  const response = await medusaRequest<MedusaCartResponse>(
    `/store/carts/${encodeURIComponent(cartId)}/line-items/${encodeURIComponent(lineId)}`,
    requireMedusaOptions(options),
    {
      method: "POST",
      body: JSON.stringify({
        quantity: payload.quantity,
        metadata: payload.metadata
      })
    }
  );

  return response.cart;
}

async function removeLineItem({
  cartId,
  lineId,
  options
}: {
  cartId: string;
  lineId: string;
  options: CartAdapterOptions;
}) {
  const response = await medusaRequest<MedusaDeleteLineResponse>(
    `/store/carts/${encodeURIComponent(cartId)}/line-items/${encodeURIComponent(lineId)}`,
    requireMedusaOptions(options),
    {
      method: "DELETE"
    }
  );

  return response.parent;
}

export async function fetchMedusaShippingOptions(cartId: string, options: CartAdapterOptions = {}) {
  const response = await medusaRequest<MedusaShippingOptionsResponse>(
    `/store/shipping-options?cart_id=${encodeURIComponent(cartId)}`,
    requireMedusaOptions(options)
  );

  return response.shipping_options ?? [];
}

export function filterSafeShippingOptions(
  products: CommerceProduct[],
  items: CartLineInput[],
  shippingOptions: MedusaShippingOptionLike[]
) {
  return filterSafeCommerceShippingOptions(resolveCartLines(products, items), shippingOptions);
}

function buildShippingMethodData({
  option,
  selection
}: {
  option: MedusaShippingOptionLike;
  selection: CartShippingMethodSelection;
}) {
  return {
    ...(option.data ?? {}),
    mrmf_selected_fulfillment_type: selection.type,
    mrmf_checkout_status: "staged-payment-disabled",
    pickup_location_slug: selection.pickupLocationSlug,
    pickup_window_label: selection.pickupWindowLabel,
    local_delivery_notes: selection.localDeliveryNotes,
    shipping_address_note: selection.shippingAddress,
    preorder_notes: selection.preorderNotes
  };
}

export async function writeSelectedShippingMethodToMedusaCart({
  cartId,
  option,
  selection,
  options = {}
}: {
  cartId: string;
  option: MedusaShippingOptionLike;
  selection: CartShippingMethodSelection;
  options?: CartAdapterOptions;
}) {
  if (!selection.type || option.data?.fulfillment_type !== selection.type) {
    throw new Error("Selected Medusa shipping option does not match the checkout fulfillment type.");
  }

  const response = await medusaRequest<MedusaShippingMethodResponse>(
    `/store/carts/${encodeURIComponent(cartId)}/shipping-methods`,
    requireMedusaOptions(options),
    {
      method: "POST",
      body: JSON.stringify({
        option_id: option.id,
        data: buildShippingMethodData({ option, selection })
      })
    }
  );

  if (!response.cart) {
    throw new Error("Medusa did not return a cart after shipping method selection.");
  }

  return response.cart;
}

async function reconcileMedusaCart({
  cart,
  products,
  items,
  options
}: {
  cart: MedusaCartLike;
  products: CommerceProduct[];
  items: CartLineInput[];
  options: CartAdapterOptions;
}) {
  const desiredPayloads = buildMedusaCartLinePayloads(products, items);
  const desiredSlugs = new Set(
    desiredPayloads.map((payload) => payload.metadata.mrmf_slug as string)
  );
  const existingLines = mapManagedLinesBySlug(cart);
  let currentCart = cart;

  for (const payload of desiredPayloads) {
    const slug = payload.metadata.mrmf_slug as string;
    const existingLine = existingLines.get(slug);

    if (!existingLine) {
      currentCart =
        (await addLineItem({
          cartId: currentCart.id,
          payload,
          options
        })) ?? currentCart;
      continue;
    }

    if (
      existingLine.quantity !== payload.quantity ||
      existingLine.variant_id !== payload.variant_id
    ) {
      currentCart =
        (await updateLineItem({
          cartId: currentCart.id,
          lineId: existingLine.id,
          payload,
          options
        })) ?? currentCart;
    }
  }

  for (const [slug, line] of existingLines.entries()) {
    if (!desiredSlugs.has(slug)) {
      currentCart =
        (await removeLineItem({
          cartId: currentCart.id,
          lineId: line.id,
          options
        })) ?? currentCart;
    }
  }

  return currentCart;
}

export async function syncHybridCart(
  products: CommerceProduct[],
  options: CartAdapterOptions = {}
): Promise<CartBridgeResult> {
  const resolved = resolveOptions(options);
  const storage = resolved.storage;
  const mode = resolved.mode ?? "medusa-hybrid";
  const items = readCartItems(storage);
  const selectedFulfillment = readCartFulfillmentSelection(storage);

  if (mode === "staged") {
    return {
      mode,
      source: "staged",
      items,
      safeShippingOptions: [],
      selectedFulfillment
    };
  }

  try {
    let medusaCartId = readMedusaCartId(storage);
    let medusaCart: MedusaCartLike;
    let recoveredFromCartId: string | undefined;

    if (items.length === 0) {
      if (!medusaCartId) {
        return {
          mode,
          source: "staged",
          items,
          safeShippingOptions: [],
          selectedFulfillment
        };
      }

      try {
        medusaCart = await getMedusaCart(medusaCartId, resolved);
      } catch {
        clearMedusaCartId(storage);
        clearCartFulfillmentSelection(storage);

        return {
          mode,
          source: "staged",
          items,
          safeShippingOptions: [],
          error: "Saved Medusa cart was unavailable and has been cleared."
        };
      }

      medusaCart = await reconcileMedusaCart({
        cart: medusaCart,
        products,
        items,
        options: resolved
      });

      return {
        mode,
        source: "medusa",
        items,
        medusaCartId: medusaCart.id,
        medusaCart,
        safeShippingOptions: [],
        selectedFulfillment
      };
    }

    if (medusaCartId) {
      try {
        medusaCart = await getMedusaCart(medusaCartId, resolved);
      } catch {
        clearMedusaCartId(storage);
        recoveredFromCartId = medusaCartId;
        medusaCartId = undefined;
        medusaCart = await createMedusaCart({ products, items, options: resolved });
      }
    } else {
      medusaCart = await createMedusaCart({ products, items, options: resolved });
    }

    medusaCart = await reconcileMedusaCart({
      cart: medusaCart,
      products,
      items,
      options: resolved
    });

    writeMedusaCartId(medusaCart.id, storage);

    const shippingOptions = await fetchMedusaShippingOptions(medusaCart.id, resolved);
    const safeShippingOptions = filterSafeShippingOptions(products, items, shippingOptions);

    return {
      mode,
      source: "medusa",
      items,
      medusaCartId: medusaCart.id,
      medusaCart,
      safeShippingOptions,
      selectedFulfillment,
      recoveredFromCartId
    };
  } catch (error) {
    if (mode === "medusa") {
      throw error;
    }

    return {
      mode,
      source: "staged",
      items,
      safeShippingOptions: [],
      selectedFulfillment,
      error: error instanceof Error ? error.message : "Medusa cart sync failed."
    };
  }
}

export async function updateHybridCartItems(
  products: CommerceProduct[],
  items: CartLineInput[],
  options: CartAdapterOptions = {}
) {
  const resolved = resolveOptions(options);

  writeCartItems(items, resolved.storage);

  return syncHybridCart(products, resolved);
}

export async function selectCartShippingMethod({
  products,
  selection,
  options = {}
}: {
  products: CommerceProduct[];
  selection: CartShippingMethodSelection;
  options?: CartAdapterOptions;
}): Promise<ShippingMethodWriteBackResult> {
  const resolved = resolveOptions(options);
  const mode = resolved.mode ?? "medusa-hybrid";
  const storedSelection: StoredCartFulfillmentSelection = {
    ...selection,
    source: "staged"
  };

  writeCartFulfillmentSelection(storedSelection, resolved.storage);

  if (!selection.type) {
    return {
      source: "staged",
      selection: storedSelection,
      error: "Select a fulfillment method before syncing checkout."
    };
  }

  if (!selection.shippingOptionId) {
    return {
      source: "staged",
      selection: storedSelection,
      error: "Fulfillment method is staged locally until a Medusa shipping option is available."
    };
  }

  try {
    const bridge = await syncHybridCart(products, resolved);

    if (bridge.source !== "medusa" || !bridge.medusaCartId) {
      return {
        source: "staged",
        selection: storedSelection,
        error: bridge.error ?? "Medusa cart is unavailable; fulfillment selection is staged locally."
      };
    }

    const option = bridge.safeShippingOptions.find(
      (candidate) => candidate.id === selection.shippingOptionId
    );

    if (!option) {
      throw new Error("Selected shipping option is not safe for the current cart contents.");
    }

    if (option.data?.fulfillment_type !== selection.type) {
      throw new Error("Selected shipping option does not match the selected fulfillment type.");
    }

    const medusaCart = await writeSelectedShippingMethodToMedusaCart({
      cartId: bridge.medusaCartId,
      option,
      selection,
      options: resolved
    });
    const medusaSelection: StoredCartFulfillmentSelection = {
      ...selection,
      shippingOptionName: option.name,
      source: "medusa"
    };

    writeCartFulfillmentSelection(medusaSelection, resolved.storage);

    return {
      source: "medusa",
      selection: medusaSelection,
      medusaCartId: medusaCart.id,
      medusaCart
    };
  } catch (error) {
    if (mode === "medusa") {
      throw error;
    }

    return {
      source: "staged",
      selection: storedSelection,
      error: error instanceof Error ? error.message : "Medusa shipping method sync failed."
    };
  }
}
