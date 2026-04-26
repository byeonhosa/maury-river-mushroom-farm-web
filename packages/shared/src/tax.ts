import type { CommerceCartSummary } from "./cart";

export type TaxMode = "placeholder" | "disabled";

export interface CheckoutTaxEstimate {
  mode: TaxMode;
  estimatedTax: number;
  label: string;
  note: string;
  requiresReview: boolean;
}

export function normalizeTaxMode(value?: string): TaxMode {
  return value === "disabled" ? "disabled" : "placeholder";
}

export function calculateCheckoutTaxEstimate(
  cart: Pick<CommerceCartSummary, "subtotal">,
  mode: TaxMode = "placeholder"
): CheckoutTaxEstimate {
  if (mode === "disabled") {
    return {
      mode,
      estimatedTax: 0,
      label: "Tax disabled for local testing",
      note:
        "Tax is not calculated in this local checkout mode. Final Virginia and local tax treatment still requires legal/accounting review before launch.",
      requiresReview: true
    };
  }

  return {
    mode,
    estimatedTax: 0,
    label: "Tax estimate pending review",
    note:
      cart.subtotal > 0
        ? "No production tax is charged in this test checkout. Virginia and local tax rules, product taxability, pickup/delivery treatment, and Stripe/Medusa tax configuration must be reviewed before launch."
        : "No tax is estimated for an empty or quote-only staged checkout. Final tax treatment still requires review before launch.",
    requiresReview: true
  };
}
