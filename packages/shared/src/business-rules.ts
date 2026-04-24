import type { FulfillmentMode, FulfillmentType, Product } from "./types";

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

export function hasFreshShippingApproval(product: Product) {
  return Boolean(
    product.freshShippingApproval?.approvedBy &&
      product.freshShippingApproval?.approvedAt &&
      product.freshShippingApproval?.reason
  );
}

export function canShipProduct(product: Product) {
  return (
    product.shippable === true &&
    product.fulfillment.includes("shipping") &&
    (!isFreshProduct(product) || hasFreshShippingApproval(product))
  );
}

export function requiresLocalFulfillment(product: Product) {
  return isFreshProduct(product) || !canShipProduct(product);
}

export function classifyProductFulfillment(product: Product): FulfillmentMode {
  if (product.category === "restaurant-wholesale" || product.productFormat === "wholesale") {
    return "wholesale-preorder";
  }

  if (product.category === "subscriptions" || product.productFormat === "subscription-box") {
    return "subscription-preorder";
  }

  if (product.category === "supplements" || product.productFormat === "capsule") {
    return "supplement-shipping";
  }

  if (canShipProduct(product)) {
    return "shelf-stable-shipping";
  }

  return "fresh-local";
}

export function getFulfillmentLabel(product: Product) {
  const mode = classifyProductFulfillment(product);

  const labels: Record<FulfillmentMode, string> = {
    "fresh-local": "Fresh local-only",
    "shelf-stable-shipping": "Shelf-stable shippable",
    "supplement-shipping": "Supplement shippable",
    "subscription-preorder": "Subscription preorder",
    "wholesale-preorder": "Restaurant preorder"
  };

  return labels[mode];
}

export function validateProductFulfillment(products: Product[]) {
  const errors: string[] = [];

  for (const product of products) {
    if (isFreshProduct(product) && product.shippable && !hasFreshShippingApproval(product)) {
      errors.push(
        `${product.name} is fresh and must not be marked shippable without a documented owner approval.`
      );
    }

    if (
      isFreshProduct(product) &&
      product.fulfillment.includes("shipping") &&
      !hasFreshShippingApproval(product)
    ) {
      errors.push(
        `${product.name} is fresh and must not include shipping fulfillment without a documented owner approval.`
      );
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
