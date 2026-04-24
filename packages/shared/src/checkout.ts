import { z } from "zod";

import type { CommerceCartSummary } from "./cart";
import { canShipCommerceProduct } from "./commerce";
import { validatePickupSelection } from "./pickup";
import type { FulfillmentType } from "./types";

export const checkoutContactSchema = z.object({
  name: z.string().trim().min(2, "Enter the customer's name."),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z.string().trim().min(7, "Enter a phone number for pickup or order questions."),
  notes: z.string().trim().max(1000, "Keep notes under 1000 characters.").optional()
});

export interface CheckoutContactInput {
  name: string;
  email: string;
  phone: string;
  notes?: string;
}

export interface CheckoutFulfillmentInput {
  type?: FulfillmentType;
  pickupLocationSlug?: string;
  pickupWindowLabel?: string;
  localDeliveryNotes?: string;
  shippingAddress?: string;
  preorderNotes?: string;
}

export interface CheckoutValidationInput {
  cart: CommerceCartSummary;
  contact: CheckoutContactInput;
  fulfillment: CheckoutFulfillmentInput;
  policyAccepted: boolean;
}

export interface CheckoutValidationResult {
  canProceed: boolean;
  errors: string[];
  warnings: string[];
  supportedFulfillmentTypes: FulfillmentType[];
}

const pickupFulfillmentTypes: FulfillmentType[] = [
  "farm-pickup",
  "farmers-market-pickup"
];

function unique<TValue>(values: TValue[]) {
  return [...new Set(values)];
}

export function getCartSupportedFulfillmentTypes(cart: CommerceCartSummary): FulfillmentType[] {
  if (cart.lines.length === 0) {
    return [];
  }

  const fulfillmentTypes = unique(
    cart.lines.flatMap((line) => line.product.fulfillment)
  );

  return fulfillmentTypes.filter((fulfillmentType) =>
    cart.lines.every((line) => line.product.fulfillment.includes(fulfillmentType))
  );
}

export function requiresPickupDetails(fulfillmentType?: FulfillmentType) {
  return Boolean(
    fulfillmentType && pickupFulfillmentTypes.includes(fulfillmentType)
  );
}

export function validateCheckout({
  cart,
  contact,
  fulfillment,
  policyAccepted
}: CheckoutValidationInput): CheckoutValidationResult {
  const errors: string[] = [];
  const supportedFulfillmentTypes = getCartSupportedFulfillmentTypes(cart);
  const selectedFulfillmentType = fulfillment.type;

  if (cart.lines.length === 0) {
    errors.push("Add products before starting checkout.");
  }

  const contactResult = checkoutContactSchema.safeParse(contact);

  if (!contactResult.success) {
    errors.push(...contactResult.error.issues.map((issue) => issue.message));
  }

  if (!selectedFulfillmentType) {
    errors.push("Select a fulfillment option for this order.");
  } else if (!supportedFulfillmentTypes.includes(selectedFulfillmentType)) {
    errors.push("The selected fulfillment option is not available for every item in the cart.");
  }

  if (selectedFulfillmentType === "shipping") {
    const localOnlyLines = cart.lines.filter((line) => !canShipCommerceProduct(line.product));

    if (localOnlyLines.length > 0) {
      errors.push(
        "Fresh and local-only products cannot use parcel shipping. Choose pickup, local delivery, or split the order."
      );
    }

    if (!fulfillment.shippingAddress?.trim()) {
      errors.push("Enter a shipping address for parcel shipping.");
    }
  }

  if (requiresPickupDetails(selectedFulfillmentType)) {
    const pickupResult = validatePickupSelection({
      locationSlug: fulfillment.pickupLocationSlug ?? "",
      windowLabel: fulfillment.pickupWindowLabel ?? "",
      allowedFulfillmentTypes: supportedFulfillmentTypes
    });

    if (!pickupResult.valid) {
      errors.push(pickupResult.message);
    }
  }

  if (selectedFulfillmentType === "local-delivery" && !fulfillment.localDeliveryNotes?.trim()) {
    errors.push("Add local delivery notes before checkout can proceed.");
  }

  if (selectedFulfillmentType === "local-preorder" && !fulfillment.preorderNotes?.trim()) {
    errors.push("Add preorder timing notes before checkout can proceed.");
  }

  if (selectedFulfillmentType === "restaurant-delivery") {
    errors.push("Restaurant and wholesale products require an inquiry or quote before checkout.");
  }

  if (cart.fulfillmentType === "mixed") {
    errors.push(
      "Mixed carts must be split into local pickup or delivery items and shippable shelf-stable items before checkout."
    );
  }

  errors.push(...cart.restrictions);

  if (!policyAccepted) {
    errors.push("Acknowledge the shipping, pickup, and refund policies before checkout.");
  }

  return {
    canProceed: errors.length === 0,
    errors: unique(errors),
    warnings: cart.warnings,
    supportedFulfillmentTypes
  };
}
