import {
  type CommerceCartLineInput,
  summarizeCommerceCart
} from "./cart";
import { getCartSupportedFulfillmentTypes } from "./checkout";
import { canAddCommerceProductToCart, canShipCommerceProduct } from "./commerce";
import type { FulfillmentMode, FulfillmentType } from "./types";

export interface CommerceShippingOptionLike {
  id: string;
  name: string;
  data?: {
    fulfillment_type?: FulfillmentType;
    allowed_fulfillment_modes?: FulfillmentMode[];
    rejected_fulfillment_modes?: FulfillmentMode[];
    mrmf_native_rule_scope?: FulfillmentMode;
    blocks_fresh_products?: boolean;
    is_parcel?: boolean;
    [key: string]: unknown;
  } | null;
}

export function filterSafeCommerceShippingOptions<TOption extends CommerceShippingOptionLike>(
  cartLines: CommerceCartLineInput[],
  shippingOptions: TOption[]
) {
  const summary = summarizeCommerceCart(cartLines);
  const supportedFulfillmentTypes = getCartSupportedFulfillmentTypes(summary);
  const cartHasLocalOnly = summary.lines.some((line) => !canShipCommerceProduct(line.product));
  const cartHasFreshOrLocalOnly = summary.lines.some((line) => line.product.localOnly);
  const cartHasUnavailable = summary.lines.some(
    (line) => !canAddCommerceProductToCart(line.product)
  );
  const fulfillmentModes = new Set(summary.lines.map((line) => line.product.fulfillmentMode));

  if (summary.fulfillmentType === "mixed" || cartHasUnavailable) {
    return [];
  }

  return shippingOptions.filter((option) => {
    const fulfillmentType = option.data?.fulfillment_type;
    const allowedFulfillmentModes = Array.isArray(option.data?.allowed_fulfillment_modes)
      ? option.data.allowed_fulfillment_modes
      : [];
    const rejectedFulfillmentModes = Array.isArray(option.data?.rejected_fulfillment_modes)
      ? option.data.rejected_fulfillment_modes
      : [];
    const nativeRuleScope = option.data?.mrmf_native_rule_scope;
    const isParcel = option.data?.is_parcel === true;

    if (!fulfillmentType) {
      return false;
    }

    if (
      allowedFulfillmentModes.length > 0 &&
      ![...fulfillmentModes].every((mode) => allowedFulfillmentModes.includes(mode))
    ) {
      return false;
    }

    if ([...fulfillmentModes].some((mode) => rejectedFulfillmentModes.includes(mode))) {
      return false;
    }

    if (nativeRuleScope && ![...fulfillmentModes].every((mode) => mode === nativeRuleScope)) {
      return false;
    }

    if (option.data?.blocks_fresh_products === true && cartHasFreshOrLocalOnly) {
      return false;
    }

    if (isParcel && cartHasLocalOnly) {
      return false;
    }

    if (!supportedFulfillmentTypes.includes(fulfillmentType)) {
      return false;
    }

    return true;
  });
}
