import {
  canShipProduct,
  classifyProductFulfillment,
  getFulfillmentLabel,
  isFreshProduct,
  requiresLocalFulfillment,
  summarizeCartFulfillment
} from "./business-rules";
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
