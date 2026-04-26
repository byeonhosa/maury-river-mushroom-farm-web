export type ProductCategory =
  | "fresh-mushrooms"
  | "dried-mushrooms"
  | "salts-seasonings"
  | "supplements"
  | "subscriptions"
  | "restaurant-wholesale"
  | "grow-kits";

export type ProductFormat =
  | "fresh"
  | "dried"
  | "seasoning"
  | "capsule"
  | "powder"
  | "subscription-box"
  | "wholesale";

export type FulfillmentType =
  | "farm-pickup"
  | "farmers-market-pickup"
  | "local-delivery"
  | "local-preorder"
  | "shipping"
  | "restaurant-delivery";

export type FulfillmentMode =
  | "fresh-local"
  | "shelf-stable-shipping"
  | "supplement-shipping"
  | "subscription-preorder"
  | "wholesale-preorder";

export type InventoryStatus =
  | "available"
  | "low-stock"
  | "seasonal"
  | "preorder"
  | "sold-out"
  | "coming-soon"
  | "hidden"
  | "wholesale-only"
  | "inquiry-only";

export type AvailabilityState = InventoryStatus;

export type PublicAvailabilityVisibility = "shop" | "catalog" | "hidden";

export type VisibilityStatus = "published" | "draft" | "archived";

export interface ProductAvailabilityConfig {
  state?: AvailabilityState;
  publicVisibility?: PublicAvailabilityVisibility;
  cartable?: boolean;
  availableQuantity?: number;
  stockNote?: string;
  expectedAvailabilityDate?: string;
  pickupAvailabilityNote?: string;
  publicMessage?: string;
  notifyMeEnabled?: boolean;
  wholesaleOnly?: boolean;
  inquiryOnly?: boolean;
}

export interface ProductImage {
  src: string;
  alt: string;
}

export interface FreshShippingApproval {
  approvedBy: string;
  approvedAt: string;
  reason: string;
}

export interface Product {
  name: string;
  slug: string;
  category: ProductCategory;
  species: string[];
  productFormat: ProductFormat;
  price: number;
  unitSize: string;
  shortDescription: string;
  longDescription: string;
  flavorProfile: string;
  texture: string;
  cookingMethods: string[];
  pairings: string[];
  storageInstructions: string;
  shelfLife: string;
  fulfillment: FulfillmentType[];
  shippable: boolean;
  freshShippingApproval?: FreshShippingApproval;
  inventoryStatus: InventoryStatus;
  availability?: ProductAvailabilityConfig;
  images: ProductImage[];
  relatedRecipes: string[];
  relatedSpeciesPage: string[];
  supplementDisclaimer?: string;
  visibilityStatus: VisibilityStatus;
}

export interface PickupWindow {
  label: string;
  weekday: string;
  startTime: string;
  endTime: string;
  cutoff: string;
  requiresConfirmation: boolean;
}

export interface PickupLocation {
  name: string;
  slug: string;
  fulfillmentType: FulfillmentType;
  description: string;
  addressNote: string;
  windows: PickupWindow[];
  requiresFinalConfirmation: boolean;
}

export interface CartLineInput {
  productSlug: string;
  quantity: number;
}

export interface SpeciesPage {
  name: string;
  code: string;
  slug: string;
  catalogStatus: "active" | "planned" | "research";
  availabilityState: AvailabilityState;
  overview: string;
  flavor: string;
  texture: string;
  cookingTips: string[];
  storage: string;
  pairsWith: string[];
  functionalNote?: string;
  requiresLegalReview?: boolean;
}

export interface Recipe {
  title: string;
  slug: string;
  summary: string;
  mushroomFocus: string[];
  prepTime: string;
  cookTime: string;
  servings: string;
  ingredients: string[];
  steps: string[];
  storageNote: string;
  relatedProducts: string[];
}
