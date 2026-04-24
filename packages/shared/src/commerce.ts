import {
  canShipProduct,
  classifyProductFulfillment,
  getFulfillmentLabel,
  requiresLocalFulfillment
} from "./business-rules";
import { getProductBySlug, getProductsByCategory, products } from "./products";
import type { FulfillmentMode, FulfillmentType, Product, ProductCategory } from "./types";

export interface CommerceProduct {
  source: "shared-seed" | "medusa";
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  price: number;
  unitSize: string;
  shortDescription: string;
  longDescription: string;
  image: Product["images"][number];
  fulfillment: FulfillmentType[];
  fulfillmentMode: FulfillmentMode;
  fulfillmentLabel: string;
  shippable: boolean;
  localOnly: boolean;
  inventoryStatus: Product["inventoryStatus"];
  metadata: ProductMetadata;
}

export type ProductMetadata = Pick<
  Product,
  | "species"
  | "productFormat"
  | "flavorProfile"
  | "texture"
  | "cookingMethods"
  | "pairings"
  | "storageInstructions"
  | "shelfLife"
  | "relatedRecipes"
  | "relatedSpeciesPage"
  | "supplementDisclaimer"
  | "visibilityStatus"
>;

export interface MedusaProductLike {
  id?: string;
  handle?: string | null;
  title?: string | null;
  description?: string | null;
  thumbnail?: string | null;
  metadata?: Partial<ProductMetadata> & {
    mrmf_slug?: string;
    category?: ProductCategory;
    unit_size?: string;
    fulfillment?: FulfillmentType[];
    fulfillment_mode?: FulfillmentMode;
    fulfillment_label?: string;
    shippable?: boolean;
    inventory_status?: Product["inventoryStatus"];
    short_description?: string;
  };
}

export function getProductMetadata(product: Product): ProductMetadata {
  return {
    species: product.species,
    productFormat: product.productFormat,
    flavorProfile: product.flavorProfile,
    texture: product.texture,
    cookingMethods: product.cookingMethods,
    pairings: product.pairings,
    storageInstructions: product.storageInstructions,
    shelfLife: product.shelfLife,
    relatedRecipes: product.relatedRecipes,
    relatedSpeciesPage: product.relatedSpeciesPage,
    supplementDisclaimer: product.supplementDisclaimer,
    visibilityStatus: product.visibilityStatus
  };
}

export function toCommerceProduct(product: Product): CommerceProduct {
  return {
    source: "shared-seed",
    id: product.slug,
    slug: product.slug,
    name: product.name,
    category: product.category,
    price: product.price,
    unitSize: product.unitSize,
    shortDescription: product.shortDescription,
    longDescription: product.longDescription,
    image: product.images[0],
    fulfillment: product.fulfillment,
    fulfillmentMode: classifyProductFulfillment(product),
    fulfillmentLabel: getFulfillmentLabel(product),
    shippable: canShipProduct(product),
    localOnly: requiresLocalFulfillment(product),
    inventoryStatus: product.inventoryStatus,
    metadata: getProductMetadata(product)
  };
}

export function listCommerceProducts() {
  return products
    .filter((product) => product.visibilityStatus === "published")
    .map(toCommerceProduct);
}

export function getCommerceProductBySlug(slug: string) {
  const product = getProductBySlug(slug);

  return product ? toCommerceProduct(product) : undefined;
}

export function listCommerceProductsByCategory(category: ProductCategory) {
  return getProductsByCategory(category).map(toCommerceProduct);
}

export function medusaProductToCommerceProduct(product: MedusaProductLike): CommerceProduct {
  const fallbackSlug = product.handle ?? product.metadata?.mrmf_slug ?? product.id ?? "unknown";
  const seedProduct = getProductBySlug(fallbackSlug);

  if (seedProduct) {
    return {
      ...toCommerceProduct(seedProduct),
      source: "medusa",
      id: product.id ?? seedProduct.slug
    };
  }

  const metadata = product.metadata ?? {};
  const fulfillment = metadata.fulfillment ?? [];
  const fulfillmentMode = metadata.fulfillment_mode ?? "fresh-local";

  return {
    source: "medusa",
    id: product.id ?? fallbackSlug,
    slug: fallbackSlug,
    name: product.title ?? fallbackSlug,
    category: metadata.category ?? "fresh-mushrooms",
    price: 0,
    unitSize: metadata.unit_size ?? "Unit size pending",
    shortDescription: metadata.short_description ?? "Product details pending.",
    longDescription: product.description ?? "Product details pending.",
    image: {
      src: product.thumbnail ?? "/product-placeholders/mixed-box.svg",
      alt: product.title ?? "Maury River Mushroom Farm product"
    },
    fulfillment,
    fulfillmentMode,
    fulfillmentLabel: metadata.fulfillment_label ?? fulfillmentMode.replace("-", " "),
    shippable: metadata.shippable ?? fulfillment.includes("shipping"),
    localOnly: !fulfillment.includes("shipping"),
    inventoryStatus: metadata.inventory_status ?? "coming-soon",
    metadata: {
      species: metadata.species ?? [],
      productFormat: metadata.productFormat ?? "fresh",
      flavorProfile: metadata.flavorProfile ?? "Flavor notes pending.",
      texture: metadata.texture ?? "Texture notes pending.",
      cookingMethods: metadata.cookingMethods ?? [],
      pairings: metadata.pairings ?? [],
      storageInstructions: metadata.storageInstructions ?? "Storage instructions pending.",
      shelfLife: metadata.shelfLife ?? "Shelf life pending.",
      relatedRecipes: metadata.relatedRecipes ?? [],
      relatedSpeciesPage: metadata.relatedSpeciesPage ?? [],
      supplementDisclaimer: metadata.supplementDisclaimer,
      visibilityStatus: metadata.visibilityStatus ?? "draft"
    }
  };
}
