import { z } from "zod";

import type {
  AvailabilityState,
  FulfillmentType,
  ProductAvailabilityConfig,
  ProductCategory,
  PublicAvailabilityVisibility,
  VisibilityStatus
} from "./types";

export const availabilityStates = [
  "available",
  "low-stock",
  "sold-out",
  "coming-soon",
  "seasonal",
  "preorder",
  "hidden",
  "wholesale-only",
  "inquiry-only"
] as const satisfies AvailabilityState[];

export interface AvailabilityStateBehavior {
  state: AvailabilityState;
  label: string;
  defaultMessage: string;
  showInShop: boolean;
  showInCatalog: boolean;
  defaultCartable: boolean;
  showNotifyMeLater: boolean;
  showPreorderMessage: boolean;
  showWholesaleCta: boolean;
  showInquiryCta: boolean;
  publicVisibility: PublicAvailabilityVisibility;
}

export interface AvailabilityProductInput {
  name: string;
  inventoryStatus: AvailabilityState;
  fulfillment: FulfillmentType[];
  category?: ProductCategory;
  price?: number;
  visibilityStatus?: VisibilityStatus;
  availability?: ProductAvailabilityConfig;
}

export interface ResolvedProductAvailability {
  state: AvailabilityState;
  label: string;
  message: string;
  canAddToCart: boolean;
  blocksCheckout: boolean;
  isPreorder: boolean;
  showInShop: boolean;
  showInCatalog: boolean;
  showNotifyMeLater: boolean;
  showWholesaleCta: boolean;
  showInquiryCta: boolean;
  publicVisibility: PublicAvailabilityVisibility;
  availableQuantity?: number;
  stockNote?: string;
  expectedAvailabilityDate?: string;
  pickupAvailabilityNote?: string;
}

export const availabilityStateBehaviors: Record<AvailabilityState, AvailabilityStateBehavior> = {
  available: {
    state: "available",
    label: "Available",
    defaultMessage: "Available for the current ordering window.",
    showInShop: true,
    showInCatalog: true,
    defaultCartable: true,
    showNotifyMeLater: false,
    showPreorderMessage: false,
    showWholesaleCta: false,
    showInquiryCta: false,
    publicVisibility: "shop"
  },
  "low-stock": {
    state: "low-stock",
    label: "Low stock",
    defaultMessage: "Limited quantity is available for the current ordering window.",
    showInShop: true,
    showInCatalog: true,
    defaultCartable: true,
    showNotifyMeLater: false,
    showPreorderMessage: false,
    showWholesaleCta: false,
    showInquiryCta: false,
    publicVisibility: "shop"
  },
  "sold-out": {
    state: "sold-out",
    label: "Sold out",
    defaultMessage: "Sold out for the current harvest window.",
    showInShop: true,
    showInCatalog: true,
    defaultCartable: false,
    showNotifyMeLater: true,
    showPreorderMessage: false,
    showWholesaleCta: false,
    showInquiryCta: false,
    publicVisibility: "shop"
  },
  "coming-soon": {
    state: "coming-soon",
    label: "Coming soon",
    defaultMessage: "Not available for ordering yet.",
    showInShop: true,
    showInCatalog: true,
    defaultCartable: false,
    showNotifyMeLater: true,
    showPreorderMessage: false,
    showWholesaleCta: false,
    showInquiryCta: true,
    publicVisibility: "shop"
  },
  seasonal: {
    state: "seasonal",
    label: "Seasonal harvest",
    defaultMessage:
      "Seasonal item. Availability depends on the current harvest and may require confirmation.",
    showInShop: true,
    showInCatalog: true,
    defaultCartable: false,
    showNotifyMeLater: true,
    showPreorderMessage: false,
    showWholesaleCta: false,
    showInquiryCta: true,
    publicVisibility: "shop"
  },
  preorder: {
    state: "preorder",
    label: "Preorder",
    defaultMessage: "Preorder item. The farm will confirm timing before this becomes a final order.",
    showInShop: true,
    showInCatalog: true,
    defaultCartable: true,
    showNotifyMeLater: false,
    showPreorderMessage: true,
    showWholesaleCta: false,
    showInquiryCta: false,
    publicVisibility: "shop"
  },
  hidden: {
    state: "hidden",
    label: "Hidden",
    defaultMessage: "Hidden from the public storefront.",
    showInShop: false,
    showInCatalog: false,
    defaultCartable: false,
    showNotifyMeLater: false,
    showPreorderMessage: false,
    showWholesaleCta: false,
    showInquiryCta: false,
    publicVisibility: "hidden"
  },
  "wholesale-only": {
    state: "wholesale-only",
    label: "Wholesale only",
    defaultMessage: "Available through restaurant or wholesale inquiry, not ordinary checkout.",
    showInShop: true,
    showInCatalog: true,
    defaultCartable: false,
    showNotifyMeLater: false,
    showPreorderMessage: false,
    showWholesaleCta: true,
    showInquiryCta: false,
    publicVisibility: "shop"
  },
  "inquiry-only": {
    state: "inquiry-only",
    label: "Inquiry only",
    defaultMessage: "Contact the farm for current availability and ordering details.",
    showInShop: true,
    showInCatalog: true,
    defaultCartable: false,
    showNotifyMeLater: false,
    showPreorderMessage: false,
    showWholesaleCta: false,
    showInquiryCta: true,
    publicVisibility: "shop"
  }
};

export const availabilityAdminUpdateSchema = z.object({
  targetType: z.enum(["product", "species"]),
  targetSlug: z.string().trim().min(1),
  state: z.enum(availabilityStates).optional(),
  publicVisibility: z.enum(["shop", "catalog", "hidden"]).optional(),
  cartable: z.boolean().optional(),
  availableQuantity: z.number().int().min(0).nullable().optional(),
  stockNote: z.string().trim().max(240).nullable().optional(),
  expectedAvailabilityDate: z.string().trim().max(80).nullable().optional(),
  pickupAvailabilityNote: z.string().trim().max(240).nullable().optional(),
  publicMessage: z.string().trim().max(280).nullable().optional(),
  notifyMeEnabled: z.boolean().optional(),
  wholesaleOnly: z.boolean().optional(),
  inquiryOnly: z.boolean().optional()
});

export type AvailabilityAdminUpdate = z.infer<typeof availabilityAdminUpdateSchema>;

function hasPreorderFulfillment(fulfillment: FulfillmentType[]) {
  return fulfillment.includes("local-preorder") || fulfillment.includes("restaurant-delivery");
}

function configuredState(input: AvailabilityProductInput) {
  return input.availability?.state ?? input.inventoryStatus;
}

function hasZeroAvailableQuantity(config?: ProductAvailabilityConfig) {
  return typeof config?.availableQuantity === "number" && config.availableQuantity <= 0;
}

export function resolveProductAvailability(
  input: AvailabilityProductInput
): ResolvedProductAvailability {
  const state = configuredState(input);
  const behavior = availabilityStateBehaviors[state];
  const config = input.availability ?? {};
  const publicVisibility = config.publicVisibility ?? behavior.publicVisibility;
  const explicitlyWholesale =
    config.wholesaleOnly === true || input.category === "restaurant-wholesale";
  const explicitlyInquiryOnly = config.inquiryOnly === true;
  const isPreorder =
    state === "preorder" && hasPreorderFulfillment(input.fulfillment) && !explicitlyWholesale;
  const defaultCartable =
    state === "preorder"
      ? isPreorder
      : state === "seasonal"
        ? config.cartable === true
        : behavior.defaultCartable;
  const requestedCartable = config.cartable ?? defaultCartable;
  const blocksByState =
    state === "hidden" ||
    state === "sold-out" ||
    state === "coming-soon" ||
    state === "wholesale-only" ||
    state === "inquiry-only" ||
    explicitlyWholesale ||
    explicitlyInquiryOnly;
  const canAddToCart =
    requestedCartable &&
    !blocksByState &&
    !hasZeroAvailableQuantity(config) &&
    input.visibilityStatus !== "draft" &&
    input.visibilityStatus !== "archived";
  const showInShop =
    input.visibilityStatus !== "draft" &&
    input.visibilityStatus !== "archived" &&
    publicVisibility === "shop" &&
    behavior.showInShop;
  const showInCatalog =
    input.visibilityStatus !== "draft" &&
    input.visibilityStatus !== "archived" &&
    publicVisibility !== "hidden" &&
    behavior.showInCatalog;

  const preorderPending = state === "preorder" && !isPreorder;

  return {
    state,
    label: explicitlyWholesale
      ? availabilityStateBehaviors["wholesale-only"].label
      : preorderPending
        ? "Preorder pending"
        : behavior.label,
    message:
      config.publicMessage ??
      (state === "sold-out"
        ? `${input.name} is sold out and cannot be added to checkout right now.`
        : state === "coming-soon"
          ? `${input.name} is not available for ordering yet.`
          : preorderPending
            ? "Preorder is not configured for this item yet."
            : behavior.defaultMessage),
    canAddToCart,
    blocksCheckout: !canAddToCart,
    isPreorder,
    showInShop,
    showInCatalog,
    showNotifyMeLater: config.notifyMeEnabled ?? behavior.showNotifyMeLater,
    showWholesaleCta: explicitlyWholesale || behavior.showWholesaleCta,
    showInquiryCta: (explicitlyInquiryOnly || behavior.showInquiryCta) && !canAddToCart,
    publicVisibility,
    availableQuantity: config.availableQuantity,
    stockNote: config.stockNote,
    expectedAvailabilityDate: config.expectedAvailabilityDate,
    pickupAvailabilityNote: config.pickupAvailabilityNote
  };
}

export function shouldShowProductInShop(input: AvailabilityProductInput) {
  return resolveProductAvailability(input).showInShop;
}

export function shouldShowProductInCatalog(input: AvailabilityProductInput) {
  return resolveProductAvailability(input).showInCatalog;
}

export function isAvailabilityState(value: unknown): value is AvailabilityState {
  return availabilityStates.includes(value as AvailabilityState);
}
