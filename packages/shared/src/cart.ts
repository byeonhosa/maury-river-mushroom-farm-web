import {
  canShipProduct,
  classifyProductFulfillment,
  getFulfillmentLabel,
  isFreshProduct,
  requiresLocalFulfillment,
  summarizeCartFulfillment
} from "./business-rules";
import {
  canShipCommerceProduct,
  canAddCommerceProductToCart,
  getCommerceProductAvailability,
  isFreshCommerceProduct,
  requiresLocalCommerceFulfillment,
  type CommerceProduct
} from "./commerce";
import { getProductBySlug } from "./products";
import type { CartLineInput, FulfillmentMode, Product } from "./types";

export interface CartLine {
  product: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  fulfillmentMode: FulfillmentMode;
  fulfillmentLabel: string;
  warnings: string[];
}

export interface CartSummary {
  lines: CartLine[];
  subtotal: number;
  fulfillmentType: ReturnType<typeof summarizeCartFulfillment>["type"];
  warnings: string[];
  restrictions: string[];
}

export interface CommerceCartLineInput {
  product: CommerceProduct;
  quantity: number;
}

export interface CommerceCartLine {
  product: CommerceProduct;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  fulfillmentMode: FulfillmentMode;
  fulfillmentLabel: string;
  warnings: string[];
}

export interface CommerceCartSummary {
  lines: CommerceCartLine[];
  subtotal: number;
  fulfillmentType: "empty" | "mixed" | "local" | "shipping";
  warnings: string[];
  restrictions: string[];
}

export function buildCartLine(product: Product, quantity: number): CartLine {
  const normalizedQuantity = Math.max(1, Math.floor(quantity));
  const warnings: string[] = [];

  if (isFreshProduct(product)) {
    warnings.push("Fresh mushrooms require pickup, local delivery, or preorder coordination.");
  }

  if (product.category === "restaurant-wholesale") {
    warnings.push("Restaurant and wholesale products require a quote before checkout.");
  }

  if (product.category === "subscriptions") {
    warnings.push("Subscription products require a confirmed pickup cadence before launch.");
  }

  const availability = getCommerceProductAvailability(product);

  if (product.inventoryStatus !== "available") {
    warnings.push(availability.message);
  }

  return {
    product,
    quantity: normalizedQuantity,
    unitPrice: product.price,
    subtotal: product.price * normalizedQuantity,
    fulfillmentMode: classifyProductFulfillment(product),
    fulfillmentLabel: getFulfillmentLabel(product),
    warnings
  };
}

export function buildCartLines(inputs: CartLineInput[]): CartLine[] {
  return inputs.map((input) => {
    const product = getProductBySlug(input.productSlug);

    if (!product) {
      throw new Error(`Unknown cart product slug: ${input.productSlug}`);
    }

    return buildCartLine(product, input.quantity);
  });
}

export function summarizeCart(inputs: CartLineInput[]): CartSummary {
  const lines = buildCartLines(inputs);
  const products = lines.map((line) => line.product);
  const fulfillmentSummary = summarizeCartFulfillment(products);
  const warnings = [
    ...new Set([
      fulfillmentSummary.message,
      ...lines.flatMap((line) => line.warnings)
    ])
  ];
  const restrictions: string[] = [];
  const hasLocalOnly = products.some(requiresLocalFulfillment);
  const hasShipping = products.some(canShipProduct);
  const hasQuoteOnly = products.some((product) => product.price <= 0);

  if (hasLocalOnly && hasShipping) {
    restrictions.push(
      "Mixed carts must separate local pickup or delivery items from shipped shelf-stable items before live checkout."
    );
  }

  if (hasQuoteOnly) {
    restrictions.push("Quote-only products cannot enter paid checkout until pricing is confirmed.");
  }

  return {
    lines,
    subtotal: lines.reduce((sum, line) => sum + line.subtotal, 0),
    fulfillmentType: fulfillmentSummary.type,
    warnings,
    restrictions
  };
}

export function buildCommerceCartLine(
  product: CommerceProduct,
  quantity: number
): CommerceCartLine {
  const normalizedQuantity = Math.max(1, Math.floor(quantity));
  const warnings: string[] = [];

  if (isFreshCommerceProduct(product)) {
    warnings.push("Fresh mushrooms require pickup, local delivery, or preorder coordination.");
  }

  if (product.category === "restaurant-wholesale") {
    warnings.push("Restaurant and wholesale products require a quote before checkout.");
  }

  if (product.category === "subscriptions") {
    warnings.push("Subscription products require a confirmed pickup cadence before launch.");
  }

  return {
    product,
    quantity: normalizedQuantity,
    unitPrice: product.price,
    subtotal: product.price * normalizedQuantity,
    fulfillmentMode: product.fulfillmentMode,
    fulfillmentLabel: product.fulfillmentLabel,
    warnings
  };
}

export function summarizeCommerceCart(inputs: CommerceCartLineInput[]): CommerceCartSummary {
  const lines = inputs.map((input) => buildCommerceCartLine(input.product, input.quantity));
  const products = lines.map((line) => line.product);
  const hasFresh = products.some(isFreshCommerceProduct);
  const hasShippableShelfStable = products.some(canShipCommerceProduct);
  const hasLocalOnly = products.some(requiresLocalCommerceFulfillment);
  const hasQuoteOnly = products.some((product) => product.price <= 0);
  const unavailableProducts = products.filter((product) => !canAddCommerceProductToCart(product));
  const fulfillmentSummary =
    products.length === 0
      ? {
          type: "empty" as const,
          message: "Your cart is empty."
        }
      : hasFresh && hasShippableShelfStable
        ? {
            type: "mixed" as const,
            message:
              "This cart includes fresh local-only items and shelf-stable shippable items. Checkout must keep pickup/local delivery separate from shipping."
          }
        : hasLocalOnly
          ? {
              type: "local" as const,
              message:
                "This cart requires farm pickup, farmers-market pickup, local delivery, or preorder coordination."
            }
          : {
              type: "shipping" as const,
              message: "This cart contains shelf-stable products that may be eligible for shipping."
            };
  const warnings = [
    ...new Set([fulfillmentSummary.message, ...lines.flatMap((line) => line.warnings)])
  ];
  const restrictions: string[] = [];

  if (hasLocalOnly && hasShippableShelfStable) {
    restrictions.push(
      "Mixed carts must separate local pickup or delivery items from shipped shelf-stable items before live checkout."
    );
  }

  if (hasQuoteOnly) {
    restrictions.push("Quote-only products cannot enter paid checkout until pricing is confirmed.");
  }

  if (unavailableProducts.length > 0) {
    restrictions.push(
      `${unavailableProducts.map((product) => product.name).join(", ")} cannot be checked out until availability changes.`
    );
  }

  return {
    lines,
    subtotal: lines.reduce((sum, line) => sum + line.subtotal, 0),
    fulfillmentType: fulfillmentSummary.type,
    warnings,
    restrictions
  };
}
