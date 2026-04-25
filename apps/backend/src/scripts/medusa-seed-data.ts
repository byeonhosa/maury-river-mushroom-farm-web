import type { CreateProductWorkflowInputDTO } from "@medusajs/framework/types";
import {
  classifyProductFulfillment,
  getProductMetadata,
  getFulfillmentLabel,
  pickupLocations,
  productCategories,
  products,
  validateProductFulfillment,
  type FulfillmentMode,
  type FulfillmentType,
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

export interface MedusaSeedRegion {
  key: string;
  name: string;
  currencyCode: string;
  countries: string[];
  description: string;
}

export interface MedusaSeedStockLocation {
  key: string;
  name: string;
  address: {
    address_1: string;
    city: string;
    country_code: string;
    province: string;
    postal_code: string;
  };
  description: string;
}

export interface MedusaSeedFulfillmentSet {
  key: string;
  name: string;
  type: string;
  stockLocationKey: string;
  description: string;
}

export interface MedusaSeedServiceZone {
  key: string;
  name: string;
  fulfillmentSetKey: string;
  countryCode: string;
  description: string;
}

export interface MedusaSeedShippingOption {
  key: string;
  name: string;
  code: string;
  description: string;
  fulfillmentType: FulfillmentType;
  shippingProfileKey: FulfillmentMode;
  serviceZoneKey: string;
  amount: number;
  isParcel: boolean;
  requiresPickupWindow: boolean;
  requiresFinalConfirmation: boolean;
}

export interface MedusaProductMappingContext {
  categoryIdByKey: Record<ProductCategory, string | undefined>;
  collectionIdByKey: Record<string, string | undefined>;
  shippingProfileIdByKey: Record<FulfillmentMode, string | undefined>;
  salesChannelId?: string;
}

export interface MedusaSeedInventorySpec {
  productSlug: string;
  sku: string;
  title: string;
  description: string;
  manageInventory: boolean;
  requiresShipping: boolean;
  stockedQuantity: number;
}

export interface SeedPlan {
  categories: MedusaSeedCategory[];
  collections: MedusaSeedCollection[];
  shippingProfiles: MedusaSeedShippingProfile[];
  regions: MedusaSeedRegion[];
  stockLocations: MedusaSeedStockLocation[];
  fulfillmentSets: MedusaSeedFulfillmentSet[];
  serviceZones: MedusaSeedServiceZone[];
  shippingOptions: MedusaSeedShippingOption[];
  products: CreateProductWorkflowInputDTO[];
}

const collectionKeyByFulfillmentMode: Record<FulfillmentMode, string> = {
  "fresh-local": "fresh-local-harvest",
  "shelf-stable-shipping": "shelf-stable-pantry",
  "supplement-shipping": "functional-mushroom-products",
  "subscription-preorder": "subscription-boxes",
  "wholesale-preorder": "restaurant-wholesale"
};

const inventoryQuantityByStatus: Record<Product["inventoryStatus"], number> = {
  available: 50,
  seasonal: 24,
  preorder: 12,
  "coming-soon": 0,
  "sold-out": 0
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

export const medusaSeedRegion: MedusaSeedRegion = {
  key: "local-development-us",
  name: "Maury River Local Development Region",
  currencyCode: "usd",
  countries: ["us"],
  description: "Local development sales region for pickup, local delivery, and eligible US shipping."
};

export const medusaSeedStockLocations: MedusaSeedStockLocation[] = [
  {
    key: "maury-river-farm",
    name: "Maury River Farm Fulfillment",
    address: {
      address_1: "Farm address requires owner confirmation",
      city: "Lexington",
      country_code: "us",
      province: "VA",
      postal_code: "24450"
    },
    description:
      "Development stock location used for local pickup, market pickup, local delivery, and manual parcel fulfillment."
  }
];

export const medusaSeedFulfillmentSets: MedusaSeedFulfillmentSet[] = [
  {
    key: "maury-river-manual-fulfillment",
    name: "Maury River Manual Fulfillment",
    type: "manual",
    stockLocationKey: "maury-river-farm",
    description:
      "Manual fulfillment set for provisional local pickup, market pickup, local delivery, preorder, and shelf-stable parcel workflows."
  }
];

export const medusaSeedServiceZones: MedusaSeedServiceZone[] = [
  {
    key: "maury-river-local-and-us",
    name: "Maury River Local and US Development Zone",
    fulfillmentSetKey: "maury-river-manual-fulfillment",
    countryCode: "us",
    description:
      "Development service zone. Local pickup windows still require owner confirmation before launch."
  }
];

export const medusaSeedShippingOptions: MedusaSeedShippingOption[] = [
  ...pickupLocations.map((location) => ({
    key: location.slug,
    name: location.name,
    code: location.slug,
    description: location.description,
    fulfillmentType: location.fulfillmentType,
    shippingProfileKey: "fresh-local" as FulfillmentMode,
    serviceZoneKey: "maury-river-local-and-us",
    amount: 0,
    isParcel: false,
    requiresPickupWindow: true,
    requiresFinalConfirmation: location.requiresFinalConfirmation
  })),
  {
    key: "fresh-local-delivery",
    name: "Fresh local delivery",
    code: "fresh-local-delivery",
    description:
      "Manual local delivery for fresh mushrooms inside the approved delivery area after route confirmation.",
    fulfillmentType: "local-delivery",
    shippingProfileKey: "fresh-local",
    serviceZoneKey: "maury-river-local-and-us",
    amount: 0,
    isParcel: false,
    requiresPickupWindow: false,
    requiresFinalConfirmation: true
  },
  {
    key: "fresh-local-preorder",
    name: "Fresh preorder coordination",
    code: "fresh-local-preorder",
    description:
      "Preorder coordination for fresh harvest items when exact pickup or delivery timing is still pending.",
    fulfillmentType: "local-preorder",
    shippingProfileKey: "fresh-local",
    serviceZoneKey: "maury-river-local-and-us",
    amount: 0,
    isParcel: false,
    requiresPickupWindow: false,
    requiresFinalConfirmation: true
  },
  {
    key: "shelf-stable-parcel",
    name: "Shelf-stable parcel shipping",
    code: "shelf-stable-parcel",
    description:
      "Manual parcel shipping for eligible dried mushrooms, salts, seasonings, and pantry products.",
    fulfillmentType: "shipping",
    shippingProfileKey: "shelf-stable-shipping",
    serviceZoneKey: "maury-river-local-and-us",
    amount: 8,
    isParcel: true,
    requiresPickupWindow: false,
    requiresFinalConfirmation: true
  },
  {
    key: "supplement-parcel",
    name: "Supplement parcel shipping",
    code: "supplement-parcel",
    description:
      "Manual parcel shipping for eligible supplement products after supplement copy and policy review.",
    fulfillmentType: "shipping",
    shippingProfileKey: "supplement-shipping",
    serviceZoneKey: "maury-river-local-and-us",
    amount: 8,
    isParcel: true,
    requiresPickupWindow: false,
    requiresFinalConfirmation: true
  },
  {
    key: "subscription-preorder-pickup",
    name: "Subscription preorder pickup",
    code: "subscription-preorder-pickup",
    description:
      "Manual recurring pickup coordination for CSA-style boxes after cadence and windows are confirmed.",
    fulfillmentType: "local-preorder",
    shippingProfileKey: "subscription-preorder",
    serviceZoneKey: "maury-river-local-and-us",
    amount: 0,
    isParcel: false,
    requiresPickupWindow: false,
    requiresFinalConfirmation: true
  },
  {
    key: "chef-preorder-coordination",
    name: "Chef preorder coordination",
    code: "chef-preorder-coordination",
    description:
      "Restaurant and wholesale delivery or pickup coordination after quote approval.",
    fulfillmentType: "restaurant-delivery",
    shippingProfileKey: "wholesale-preorder",
    serviceZoneKey: "maury-river-local-and-us",
    amount: 0,
    isParcel: false,
    requiresPickupWindow: false,
    requiresFinalConfirmation: true
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

export function buildSku(product: Product) {
  return `MRMF-${product.slug.toUpperCase().replace(/-/g, "-")}`;
}

export function getSeedInventoryQuantity(product: Product) {
  return inventoryQuantityByStatus[product.inventoryStatus];
}

export function buildMedusaInventorySpecs(): MedusaSeedInventorySpec[] {
  return products.map((product) => ({
    productSlug: product.slug,
    sku: buildSku(product),
    title: product.name,
    description: product.shortDescription,
    manageInventory: product.category !== "restaurant-wholesale",
    requiresShipping: true,
    stockedQuantity: getSeedInventoryQuantity(product)
  }));
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
    regions: [medusaSeedRegion],
    stockLocations: medusaSeedStockLocations,
    fulfillmentSets: medusaSeedFulfillmentSets,
    serviceZones: medusaSeedServiceZones,
    shippingOptions: medusaSeedShippingOptions,
    products: buildMedusaProductPayloads(context)
  };
}
