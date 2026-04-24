import type { CreateProductWorkflowInputDTO } from "@medusajs/framework/types";
import {
  classifyProductFulfillment,
  getProductMetadata,
  getFulfillmentLabel,
  productCategories,
  products,
  validateProductFulfillment,
  type FulfillmentMode,
  type Product,
  type ProductCategory
} from "@mrmf/shared";

export interface MedusaSeedCategory {
  key: ProductCategory;
  name: string;
  handle: ProductCategory;
  description: string;
  rank: number;
}

export interface MedusaSeedCollection {
  key: string;
  title: string;
  handle: string;
  description: string;
}

export interface MedusaSeedShippingProfile {
  key: FulfillmentMode;
  name: string;
  type: string;
  description: string;
}

export interface MedusaProductMappingContext {
  categoryIdByKey: Record<ProductCategory, string | undefined>;
  collectionIdByKey: Record<string, string | undefined>;
  shippingProfileIdByKey: Record<FulfillmentMode, string | undefined>;
  salesChannelId?: string;
}

export interface SeedPlan {
  categories: MedusaSeedCategory[];
  collections: MedusaSeedCollection[];
  shippingProfiles: MedusaSeedShippingProfile[];
  products: CreateProductWorkflowInputDTO[];
}

const collectionKeyByFulfillmentMode: Record<FulfillmentMode, string> = {
  "fresh-local": "fresh-local-harvest",
  "shelf-stable-shipping": "shelf-stable-pantry",
  "supplement-shipping": "functional-mushroom-products",
  "subscription-preorder": "subscription-boxes",
  "wholesale-preorder": "restaurant-wholesale"
};

export const medusaSeedCategories: MedusaSeedCategory[] = productCategories.map(
  (category, index) => ({
    key: category.slug,
    name: category.title,
    handle: category.slug,
    description: category.description,
    rank: index
  })
);

export const medusaSeedCollections: MedusaSeedCollection[] = [
  {
    key: "fresh-local-harvest",
    title: "Fresh Local Harvest",
    handle: "fresh-local-harvest",
    description: "Fresh mushrooms reserved for pickup, local delivery, and local preorders."
  },
  {
    key: "shelf-stable-pantry",
    title: "Shelf-Stable Pantry",
    handle: "shelf-stable-pantry",
    description: "Dried mushrooms, salts, and seasonings that may become shippable."
  },
  {
    key: "functional-mushroom-products",
    title: "Functional Mushroom Products",
    handle: "functional-mushroom-products",
    description: "Supplement products that require careful claims review before launch."
  },
  {
    key: "subscription-boxes",
    title: "Subscription and CSA Boxes",
    handle: "subscription-boxes",
    description: "Recurring or preorder boxes tied to harvest availability and pickup windows."
  },
  {
    key: "restaurant-wholesale",
    title: "Restaurant and Wholesale",
    handle: "restaurant-wholesale",
    description: "Chef-focused harvest products that require inquiry or quote workflows."
  }
];

export const medusaSeedShippingProfiles: MedusaSeedShippingProfile[] = [
  {
    key: "fresh-local",
    name: "Fresh local-only",
    type: "fresh-local",
    description: "Perishable fresh mushrooms. No parcel shipping unless explicitly approved."
  },
  {
    key: "shelf-stable-shipping",
    name: "Shelf-stable shipping",
    type: "shelf-stable",
    description: "Dried mushrooms and pantry products that may ship after packaging is finalized."
  },
  {
    key: "supplement-shipping",
    name: "Supplement shipping",
    type: "supplement",
    description: "Shelf-stable supplement products requiring disclaimer and review controls."
  },
  {
    key: "subscription-preorder",
    name: "Subscription preorder",
    type: "subscription-preorder",
    description: "CSA-style boxes tied to recurring pickup or delivery cadence."
  },
  {
    key: "wholesale-preorder",
    name: "Wholesale preorder",
    type: "wholesale-preorder",
    description: "Restaurant and chef products requiring quote or direct coordination."
  }
];

export function buildMedusaProductMetadata(product: Product) {
  const fulfillmentMode = classifyProductFulfillment(product);

  return {
    mrmf_slug: product.slug,
    category: product.category,
    species: product.species,
    product_format: product.productFormat,
    productFormat: product.productFormat,
    unit_size: product.unitSize,
    short_description: product.shortDescription,
    flavor_profile: product.flavorProfile,
    flavorProfile: product.flavorProfile,
    texture: product.texture,
    cooking_methods: product.cookingMethods,
    cookingMethods: product.cookingMethods,
    pairings: product.pairings,
    storage_instructions: product.storageInstructions,
    storageInstructions: product.storageInstructions,
    shelf_life: product.shelfLife,
    shelfLife: product.shelfLife,
    fulfillment: product.fulfillment,
    fulfillment_type: product.fulfillment,
    fulfillment_mode: fulfillmentMode,
    fulfillment_label: getFulfillmentLabel(product),
    inventory_status: product.inventoryStatus,
    related_recipes: product.relatedRecipes,
    relatedRecipes: product.relatedRecipes,
    related_species_page: product.relatedSpeciesPage,
    relatedSpeciesPage: product.relatedSpeciesPage,
    supplement_disclaimer: product.supplementDisclaimer,
    supplementDisclaimer: product.supplementDisclaimer,
    visibility_status: product.visibilityStatus,
    visibilityStatus: product.visibilityStatus,
    shippable: product.shippable,
    can_ship: product.fulfillment.includes("shipping"),
    fresh_shipping_approval: product.freshShippingApproval,
    requires_quote: product.price <= 0,
    storefront_metadata: getProductMetadata(product)
  };
}

function buildSku(product: Product) {
  return `MRMF-${product.slug.toUpperCase().replace(/-/g, "-")}`;
}

export function buildMedusaProductPayloads(
  context: MedusaProductMappingContext
): CreateProductWorkflowInputDTO[] {
  const fulfillmentErrors = validateProductFulfillment(products);

  if (fulfillmentErrors.length > 0) {
    throw new Error(`Invalid Maury River product fulfillment data: ${fulfillmentErrors.join(" ")}`);
  }

  return products.map((product) => {
    const fulfillmentMode = classifyProductFulfillment(product);
    const collectionKey = collectionKeyByFulfillmentMode[fulfillmentMode];
    const shippingProfileId = context.shippingProfileIdByKey[fulfillmentMode];
    const categoryId = context.categoryIdByKey[product.category];

    if (!shippingProfileId) {
      throw new Error(`Missing Medusa shipping profile id for ${fulfillmentMode}.`);
    }

    return {
      title: product.name,
      subtitle: getFulfillmentLabel(product),
      handle: product.slug,
      description: product.longDescription,
      status: product.visibilityStatus === "published" ? "published" : "draft",
      thumbnail: product.images[0]?.src,
      images: product.images.map((image) => ({
        url: image.src,
        metadata: {
          alt: image.alt
        }
      })),
      external_id: `mrmf:${product.slug}`,
      category_ids: categoryId ? [categoryId] : [],
      collection_id: context.collectionIdByKey[collectionKey],
      shipping_profile_id: shippingProfileId,
      options: [
        {
          title: "Unit",
          values: [product.unitSize]
        }
      ],
      variants: [
        {
          title: product.unitSize,
          sku: buildSku(product),
          allow_backorder:
            product.inventoryStatus === "preorder" || product.category === "restaurant-wholesale",
          manage_inventory: product.category !== "restaurant-wholesale",
          options: {
            Unit: product.unitSize
          },
          prices: [
            {
              currency_code: "usd",
              amount: product.price
            }
          ],
          metadata: {
            mrmf_slug: product.slug,
            inventory_status: product.inventoryStatus,
            fulfillment_mode: fulfillmentMode,
            requires_quote: product.price <= 0
          }
        }
      ],
      sales_channels: context.salesChannelId ? [{ id: context.salesChannelId }] : undefined,
      metadata: buildMedusaProductMetadata(product)
    };
  });
}

export function buildSeedPlan(context: MedusaProductMappingContext): SeedPlan {
  return {
    categories: medusaSeedCategories,
    collections: medusaSeedCollections,
    shippingProfiles: medusaSeedShippingProfiles,
    products: buildMedusaProductPayloads(context)
  };
}
