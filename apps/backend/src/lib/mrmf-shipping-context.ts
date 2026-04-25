import type { FulfillmentMode } from "@mrmf/shared";

const fulfillmentModes: FulfillmentMode[] = [
  "fresh-local",
  "shelf-stable-shipping",
  "supplement-shipping",
  "subscription-preorder",
  "wholesale-preorder"
];

export interface MrmfShippingOptionsContext {
  mrmf_cart_fulfillment_scope: FulfillmentMode | "empty" | "mixed-restricted" | "unknown";
  mrmf_cart_fulfillment_modes: string;
  mrmf_cart_has_fresh: "true" | "false";
  mrmf_cart_has_parcel_eligible: "true" | "false";
  mrmf_cart_is_mixed: "true" | "false";
}

export function normalizeFulfillmentMode(value: unknown): FulfillmentMode | undefined {
  return fulfillmentModes.includes(value as FulfillmentMode) ? (value as FulfillmentMode) : undefined;
}

export function buildMrmfShippingOptionsContext(
  modes: Array<FulfillmentMode | undefined>
): MrmfShippingOptionsContext {
  const uniqueModes = fulfillmentModes.filter((mode) => modes.includes(mode));
  const fulfillmentScope =
    uniqueModes.length === 0
      ? "unknown"
      : uniqueModes.length === 1
        ? uniqueModes[0]
        : "mixed-restricted";
  const hasParcelEligible = uniqueModes.some(
    (mode) => mode === "shelf-stable-shipping" || mode === "supplement-shipping"
  );

  return {
    mrmf_cart_fulfillment_scope: fulfillmentScope,
    mrmf_cart_fulfillment_modes: uniqueModes.join(",") || "unknown",
    mrmf_cart_has_fresh: uniqueModes.includes("fresh-local") ? "true" : "false",
    mrmf_cart_has_parcel_eligible: hasParcelEligible ? "true" : "false",
    mrmf_cart_is_mixed: uniqueModes.length > 1 ? "true" : "false"
  };
}

