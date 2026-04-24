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

export type InventoryStatus =
  | "available"
  | "seasonal"
  | "preorder"
  | "sold-out"
  | "coming-soon";

export type VisibilityStatus = "published" | "draft" | "archived";

export interface ProductImage {
  src: string;
  alt: string;
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
  inventoryStatus: InventoryStatus;
  images: ProductImage[];
  relatedRecipes: string[];
  relatedSpeciesPage: string[];
  supplementDisclaimer?: string;
  visibilityStatus: VisibilityStatus;
}

export interface SpeciesPage {
  name: string;
  slug: string;
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
