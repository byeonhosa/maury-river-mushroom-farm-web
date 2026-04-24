import type { FulfillmentType, Product } from "./types";

const localFulfillmentTypes: FulfillmentType[] = [
  "farm-pickup",
  "farmers-market-pickup",
  "local-delivery",
  "local-preorder",
  "restaurant-delivery"
];

export function isFreshProduct(product: Product) {
  return product.productFormat === "fresh" || product.category === "fresh-mushrooms";
}

export function canShipProduct(product: Product) {
  return (
    product.shippable === true &&
    product.fulfillment.includes("shipping") &&
    !isFreshProduct(product)
  );
}

export function requiresLocalFulfillment(product: Product) {
  return isFreshProduct(product) || !canShipProduct(product);
}

export function validateProductFulfillment(products: Product[]) {
  const errors: string[] = [];

  for (const product of products) {
    if (isFreshProduct(product) && product.shippable) {
      errors.push(`${product.name} is fresh and must not be marked shippable.`);
    }

    if (isFreshProduct(product) && product.fulfillment.includes("shipping")) {
      errors.push(`${product.name} is fresh and must not include shipping fulfillment.`);
    }

    if (product.shippable && !product.fulfillment.includes("shipping")) {
      errors.push(`${product.name} is marked shippable but lacks shipping fulfillment.`);
    }

    if (
      !product.fulfillment.some((fulfillmentType) =>
        localFulfillmentTypes.includes(fulfillmentType)
      ) &&
      !product.fulfillment.includes("shipping")
    ) {
      errors.push(`${product.name} does not define a usable fulfillment path.`);
    }
  }

  return errors;
}

export function summarizeCartFulfillment(cartProducts: Product[]) {
  const hasFresh = cartProducts.some(isFreshProduct);
  const hasShippableShelfStable = cartProducts.some(canShipProduct);
  const hasLocalOnly = cartProducts.some(requiresLocalFulfillment);

  if (cartProducts.length === 0) {
    return {
      type: "empty" as const,
      message: "Your cart is empty."
    };
  }

  if (hasFresh && hasShippableShelfStable) {
    return {
      type: "mixed" as const,
      message:
        "This cart includes fresh local-only items and shelf-stable shippable items. Checkout must keep pickup/local delivery separate from shipping."
    };
  }

  if (hasLocalOnly) {
    return {
      type: "local" as const,
      message:
        "This cart requires farm pickup, farmers-market pickup, local delivery, or preorder coordination."
    };
  }

  return {
    type: "shipping" as const,
    message: "This cart contains shelf-stable products that may be eligible for shipping."
  };
}
