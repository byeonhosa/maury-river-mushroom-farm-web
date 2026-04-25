import type { CartLineInput, CheckoutFulfillmentInput } from "@mrmf/shared";

export const cartStorageKey = "mrmf-cart-v1";
export const medusaCartStorageKey = "mrmf-medusa-cart-id-v1";
export const cartFulfillmentSelectionStorageKey = "mrmf-cart-fulfillment-selection-v1";

export interface StoredCartFulfillmentSelection extends CheckoutFulfillmentInput {
  shippingOptionId?: string;
  shippingOptionName?: string;
  source?: "staged" | "medusa";
}

function normalizeQuantity(quantity: number) {
  return Number.isFinite(quantity) ? Math.max(1, Math.min(99, Math.floor(quantity))) : 1;
}

function normalizeCartItems(items: CartLineInput[]) {
  const bySlug = new Map<string, number>();

  for (const item of items) {
    if (!item.productSlug) {
      continue;
    }

    bySlug.set(
      item.productSlug,
      (bySlug.get(item.productSlug) ?? 0) + normalizeQuantity(item.quantity)
    );
  }

  return [...bySlug].map(([productSlug, quantity]) => ({
    productSlug,
    quantity: normalizeQuantity(quantity)
  }));
}

export function readCartItems(storage: Storage = window.localStorage): CartLineInput[] {
  try {
    const rawValue = storage.getItem(cartStorageKey);

    if (!rawValue) {
      return [];
    }

    const parsed = JSON.parse(rawValue);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return normalizeCartItems(
      parsed.filter(
        (item): item is CartLineInput =>
          item &&
          typeof item === "object" &&
          typeof item.productSlug === "string" &&
          typeof item.quantity === "number"
      )
    );
  } catch {
    return [];
  }
}

export function writeCartItems(items: CartLineInput[], storage: Storage = window.localStorage) {
  storage.setItem(cartStorageKey, JSON.stringify(normalizeCartItems(items)));
}

export function addCartItem(
  productSlug: string,
  quantity = 1,
  storage: Storage = window.localStorage
) {
  const items = readCartItems(storage);
  const existing = items.find((item) => item.productSlug === productSlug);

  if (existing) {
    existing.quantity = normalizeQuantity(existing.quantity + quantity);
  } else {
    items.push({ productSlug, quantity: normalizeQuantity(quantity) });
  }

  writeCartItems(items, storage);

  return readCartItems(storage);
}

export function updateCartItemQuantity(
  productSlug: string,
  quantity: number,
  storage: Storage = window.localStorage
) {
  const items = readCartItems(storage)
    .map((item) =>
      item.productSlug === productSlug
        ? { ...item, quantity: normalizeQuantity(quantity) }
        : item
    )
    .filter((item) => item.quantity > 0);

  writeCartItems(items, storage);

  return readCartItems(storage);
}

export function removeCartItem(productSlug: string, storage: Storage = window.localStorage) {
  const items = readCartItems(storage).filter((item) => item.productSlug !== productSlug);

  writeCartItems(items, storage);

  return readCartItems(storage);
}

export function readMedusaCartId(storage: Storage = window.localStorage) {
  return storage.getItem(medusaCartStorageKey) || undefined;
}

export function writeMedusaCartId(cartId: string, storage: Storage = window.localStorage) {
  storage.setItem(medusaCartStorageKey, cartId);
}

export function clearMedusaCartId(storage: Storage = window.localStorage) {
  storage.removeItem(medusaCartStorageKey);
}

export function readCartFulfillmentSelection(storage: Storage = window.localStorage) {
  try {
    const raw = storage.getItem(cartFulfillmentSelectionStorageKey);

    if (!raw) {
      return undefined;
    }

    const parsed = JSON.parse(raw) as StoredCartFulfillmentSelection;

    return parsed && typeof parsed === "object" ? parsed : undefined;
  } catch {
    storage.removeItem(cartFulfillmentSelectionStorageKey);

    return undefined;
  }
}

export function writeCartFulfillmentSelection(
  selection: StoredCartFulfillmentSelection,
  storage: Storage = window.localStorage
) {
  storage.setItem(cartFulfillmentSelectionStorageKey, JSON.stringify(selection));
}

export function clearCartFulfillmentSelection(storage: Storage = window.localStorage) {
  storage.removeItem(cartFulfillmentSelectionStorageKey);
}

export function notifyCartUpdated() {
  window.dispatchEvent(new Event("mrmf-cart-updated"));
}
