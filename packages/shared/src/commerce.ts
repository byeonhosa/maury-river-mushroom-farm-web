import {
  resolveProductAvailability,
  shouldShowProductInShop,
  type ResolvedProductAvailability
} from "./availability";
import {
  canShipProduct,
  classifyProductFulfillment,
  getFulfillmentLabel,
  requiresLocalFulfillment
} from "./business-rules";
import { getProductBySlug, getProductsByCategory, products } from "./products";
import type {
  FreshShippingApproval,
  FulfillmentMode,
  FulfillmentType,
  InventoryStatus,
  Product,
  ProductCategory,
  ProductFormat,
  ProductAvailabilityConfig,
  VisibilityStatus
} from "./types";

export interface CommerceProduct {
  source: "shared-seed" | "medusa";
  id: string;
  variantId?: string;
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
  availability: ProductAvailabilityConfig;
  metadata: ProductMetadata;
}

export type CommerceProductAvailability = ResolvedProductAvailability;

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
  images?: Array<{
    url?: string | null;
    metadata?: {
      alt?: string | null;
    } | null;
  }>;
  variants?: Array<{
    id?: string | null;
    prices?: Array<{
      amount?: number | string | null;
      currency_code?: string | null;
    }>;
    calculated_price?: {
      calculated_amount?: number | string | null;
      original_amount?: number | string | null;
      currency_code?: string | null;
    } | null;
  }>;
  metadata?: Partial<ProductMetadata> & {
    mrmf_slug?: string;
    category?: ProductCategory;
    unit_size?: string;
    fulfillment?: FulfillmentType[];
    fulfillment_mode?: FulfillmentMode;
    fulfillment_label?: string;
    shippable?: boolean;
    inventory_status?: Product["inventoryStatus"];
    availability_state?: Product["inventoryStatus"];
    public_visibility?: ProductAvailabilityConfig["publicVisibility"];
    cartable?: boolean;
    available_quantity?: number | string;
    stock_note?: string;
    expected_availability_date?: string;
    pickup_availability_note?: string;
    public_availability_message?: string;
    notify_me_enabled?: boolean;
    wholesale_only?: boolean;
    inquiry_only?: boolean;
    short_description?: string;
    product_format?: ProductFormat;
    flavor_profile?: string;
    cooking_methods?: string[];
    storage_instructions?: string;
    shelf_life?: string;
    related_recipes?: string[];
    related_species_page?: string[];
    supplement_disclaimer?: string;
    visibility_status?: VisibilityStatus;
    fresh_shipping_approval?: FreshShippingApproval;
    availability?: ProductAvailabilityConfig;
    storefront_metadata?: Partial<ProductMetadata>;
  };
}

const fulfillmentLabels: Record<FulfillmentMode, string> = {
  "fresh-local": "Fresh local-only",
  "shelf-stable-shipping": "Shelf-stable shippable",
  "supplement-shipping": "Supplement shippable",
  "subscription-preorder": "Subscription preorder",
  "wholesale-preorder": "Restaurant preorder"
};

function stringArray(value: unknown, fallback: string[] = []) {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : fallback;
}

function stringValue(value: unknown, fallback: string) {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function booleanValue(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function optionalBooleanValue(value: unknown, fallback?: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function numberValue(value: unknown, fallback: number) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function hasFreshShippingApprovalMetadata(value: unknown) {
  if (!value || typeof value !== "object") {
    return false;
  }

  const approval = value as Partial<FreshShippingApproval>;

  return Boolean(approval.approvedBy && approval.approvedAt && approval.reason);
}

function normalizeProductFormat(value: unknown, fallback: ProductFormat): ProductFormat {
  const allowed: ProductFormat[] = [
    "fresh",
    "dried",
    "seasoning",
    "capsule",
    "powder",
    "subscription-box",
    "wholesale"
  ];

  return allowed.includes(value as ProductFormat) ? (value as ProductFormat) : fallback;
}

function normalizeProductCategory(value: unknown, fallback: ProductCategory): ProductCategory {
  const allowed: ProductCategory[] = [
    "fresh-mushrooms",
    "dried-mushrooms",
    "salts-seasonings",
    "supplements",
    "subscriptions",
    "restaurant-wholesale",
    "grow-kits"
  ];

  return allowed.includes(value as ProductCategory) ? (value as ProductCategory) : fallback;
}

function normalizeInventoryStatus(value: unknown, fallback: InventoryStatus): InventoryStatus {
  const allowed: InventoryStatus[] = [
    "available",
    "low-stock",
    "seasonal",
    "preorder",
    "sold-out",
    "coming-soon",
    "hidden",
    "wholesale-only",
    "inquiry-only"
  ];

  return allowed.includes(value as InventoryStatus) ? (value as InventoryStatus) : fallback;
}

function normalizeVisibilityStatus(value: unknown, fallback: VisibilityStatus): VisibilityStatus {
  const allowed: VisibilityStatus[] = ["published", "draft", "archived"];

  return allowed.includes(value as VisibilityStatus) ? (value as VisibilityStatus) : fallback;
}

function normalizeFulfillmentTypes(value: unknown, fallback: FulfillmentType[]): FulfillmentType[] {
  const allowed: FulfillmentType[] = [
    "farm-pickup",
    "farmers-market-pickup",
    "local-delivery",
    "local-preorder",
    "shipping",
    "restaurant-delivery"
  ];

  return Array.isArray(value)
    ? value.filter((item): item is FulfillmentType => allowed.includes(item as FulfillmentType))
    : fallback;
}

function normalizePublicVisibility(
  value: unknown,
  fallback: ProductAvailabilityConfig["publicVisibility"]
): ProductAvailabilityConfig["publicVisibility"] {
  const allowed: Array<NonNullable<ProductAvailabilityConfig["publicVisibility"]>> = [
    "shop",
    "catalog",
    "hidden"
  ];

  return allowed.includes(value as NonNullable<ProductAvailabilityConfig["publicVisibility"]>)
    ? (value as ProductAvailabilityConfig["publicVisibility"])
    : fallback;
}

function normalizeNullableString(value: unknown, fallback?: string) {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function normalizeAvailabilityConfig(
  metadata: MedusaProductLike["metadata"] = {},
  fallback: ProductAvailabilityConfig
): ProductAvailabilityConfig {
  const metadataAvailability = metadata.availability ?? {};
  const state = normalizeInventoryStatus(
    metadata.availability_state ?? metadataAvailability.state ?? metadata.inventory_status,
    fallback.state ?? "coming-soon"
  );
  const sameStateAsFallback = state === fallback.state;
  const stateFallback = sameStateAsFallback ? fallback : {};
  const hasExplicitQuantity =
    metadata.available_quantity !== undefined ||
    metadataAvailability.availableQuantity !== undefined;

  return {
    state,
    publicVisibility: normalizePublicVisibility(
      metadata.public_visibility ?? metadataAvailability.publicVisibility,
      fallback.publicVisibility
    ),
    cartable: optionalBooleanValue(metadata.cartable ?? metadataAvailability.cartable, fallback.cartable),
    availableQuantity:
      hasExplicitQuantity
        ? numberValue(
            metadata.available_quantity ?? metadataAvailability.availableQuantity,
            stateFallback.availableQuantity ?? 0
          )
        : stateFallback.availableQuantity,
    stockNote: normalizeNullableString(
      metadata.stock_note ?? metadataAvailability.stockNote,
      stateFallback.stockNote
    ),
    expectedAvailabilityDate: normalizeNullableString(
      metadata.expected_availability_date ?? metadataAvailability.expectedAvailabilityDate,
      stateFallback.expectedAvailabilityDate
    ),
    pickupAvailabilityNote: normalizeNullableString(
      metadata.pickup_availability_note ?? metadataAvailability.pickupAvailabilityNote,
      stateFallback.pickupAvailabilityNote
    ),
    publicMessage: normalizeNullableString(
      metadata.public_availability_message ?? metadataAvailability.publicMessage,
      stateFallback.publicMessage
    ),
    notifyMeEnabled: optionalBooleanValue(
      metadata.notify_me_enabled ?? metadataAvailability.notifyMeEnabled,
      stateFallback.notifyMeEnabled
    ),
    wholesaleOnly: optionalBooleanValue(
      metadata.wholesale_only ?? metadataAvailability.wholesaleOnly,
      stateFallback.wholesaleOnly
    ),
    inquiryOnly: optionalBooleanValue(
      metadata.inquiry_only ?? metadataAvailability.inquiryOnly,
      stateFallback.inquiryOnly
    )
  };
}

function normalizeProductMetadata(
  metadata: MedusaProductLike["metadata"] = {},
  fallback: ProductMetadata
): ProductMetadata {
  const storefrontMetadata = metadata.storefront_metadata ?? {};

  return {
    species: stringArray(metadata.species, fallback.species),
    productFormat: normalizeProductFormat(
      metadata.productFormat ?? metadata.product_format ?? storefrontMetadata.productFormat,
      fallback.productFormat
    ),
    flavorProfile: stringValue(
      metadata.flavorProfile ?? metadata.flavor_profile ?? storefrontMetadata.flavorProfile,
      fallback.flavorProfile
    ),
    texture: stringValue(metadata.texture ?? storefrontMetadata.texture, fallback.texture),
    cookingMethods: stringArray(
      metadata.cookingMethods ?? metadata.cooking_methods ?? storefrontMetadata.cookingMethods,
      fallback.cookingMethods
    ),
    pairings: stringArray(metadata.pairings ?? storefrontMetadata.pairings, fallback.pairings),
    storageInstructions: stringValue(
      metadata.storageInstructions ??
        metadata.storage_instructions ??
        storefrontMetadata.storageInstructions,
      fallback.storageInstructions
    ),
    shelfLife: stringValue(
      metadata.shelfLife ?? metadata.shelf_life ?? storefrontMetadata.shelfLife,
      fallback.shelfLife
    ),
    relatedRecipes: stringArray(
      metadata.relatedRecipes ?? metadata.related_recipes ?? storefrontMetadata.relatedRecipes,
      fallback.relatedRecipes
    ),
    relatedSpeciesPage: stringArray(
      metadata.relatedSpeciesPage ??
        metadata.related_species_page ??
        storefrontMetadata.relatedSpeciesPage,
      fallback.relatedSpeciesPage
    ),
    supplementDisclaimer:
      stringValue(
        metadata.supplementDisclaimer ??
          metadata.supplement_disclaimer ??
          storefrontMetadata.supplementDisclaimer,
        fallback.supplementDisclaimer ?? ""
      ) || undefined,
    visibilityStatus: normalizeVisibilityStatus(
      metadata.visibilityStatus ?? metadata.visibility_status ?? storefrontMetadata.visibilityStatus,
      fallback.visibilityStatus
    )
  };
}

function getMedusaProductPrice(product: MedusaProductLike, fallback: number) {
  const variant = product.variants?.[0];
  const calculated = variant?.calculated_price;
  const calculatedAmount = numberValue(
    calculated?.calculated_amount ?? calculated?.original_amount,
    Number.NaN
  );

  if (Number.isFinite(calculatedAmount)) {
    return calculatedAmount;
  }

  const usdPrice = variant?.prices?.find((price) => price.currency_code === "usd");
  const firstPrice = usdPrice ?? variant?.prices?.[0];

  return numberValue(firstPrice?.amount, fallback);
}

function getMedusaProductImage(product: MedusaProductLike, fallback: Product["images"][number]) {
  const image = product.images?.[0];
  const src = product.thumbnail ?? image?.url ?? fallback.src;

  return {
    src,
    alt:
      image?.metadata?.alt ?? product.title ?? fallback.alt ?? "Maury River Mushroom Farm product"
  };
}

export function isFreshCommerceProduct(product: CommerceProduct) {
  return product.metadata.productFormat === "fresh" || product.category === "fresh-mushrooms";
}

export function canShipCommerceProduct(product: CommerceProduct) {
  return product.shippable && product.fulfillment.includes("shipping");
}

export function requiresLocalCommerceFulfillment(product: CommerceProduct) {
  return isFreshCommerceProduct(product) || !canShipCommerceProduct(product);
}

export function isCommerceProductPreorderEnabled(product: CommerceProduct) {
  return (
    product.inventoryStatus === "preorder" &&
    (product.fulfillment.includes("local-preorder") ||
      product.fulfillment.includes("restaurant-delivery"))
  );
}

export function getCommerceProductAvailability(
  product: {
    name: string;
    inventoryStatus: InventoryStatus;
    fulfillment: FulfillmentType[];
    category?: ProductCategory;
    price?: number;
    availability?: ProductAvailabilityConfig;
    visibilityStatus?: VisibilityStatus;
    metadata?: Pick<ProductMetadata, "visibilityStatus">;
  }
): CommerceProductAvailability {
  return resolveProductAvailability({
    name: product.name,
    inventoryStatus: product.inventoryStatus,
    fulfillment: product.fulfillment,
    category: product.category,
    price: product.price,
    visibilityStatus: product.visibilityStatus ?? product.metadata?.visibilityStatus,
    availability: product.availability
  });
}

export function canAddCommerceProductToCart(product: CommerceProduct) {
  return getCommerceProductAvailability(product).canAddToCart;
}

export function classifyCommerceProductFulfillment(product: Pick<CommerceProduct, "category" | "metadata" | "shippable" | "fulfillment">): FulfillmentMode {
  if (product.category === "restaurant-wholesale" || product.metadata.productFormat === "wholesale") {
    return "wholesale-preorder";
  }

  if (product.category === "subscriptions" || product.metadata.productFormat === "subscription-box") {
    return "subscription-preorder";
  }

  if (product.category === "supplements" || product.metadata.productFormat === "capsule") {
    return "supplement-shipping";
  }

  if (product.shippable && product.fulfillment.includes("shipping")) {
    return "shelf-stable-shipping";
  }

  return "fresh-local";
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

export function getProductAvailabilityConfig(product: Product): ProductAvailabilityConfig {
  return {
    state: product.availability?.state ?? product.inventoryStatus,
    publicVisibility: product.availability?.publicVisibility ?? "shop",
    cartable: product.availability?.cartable,
    availableQuantity: product.availability?.availableQuantity,
    stockNote: product.availability?.stockNote,
    expectedAvailabilityDate: product.availability?.expectedAvailabilityDate,
    pickupAvailabilityNote: product.availability?.pickupAvailabilityNote,
    publicMessage: product.availability?.publicMessage,
    notifyMeEnabled: product.availability?.notifyMeEnabled,
    wholesaleOnly: product.availability?.wholesaleOnly,
    inquiryOnly: product.availability?.inquiryOnly
  };
}

export function toCommerceProduct(product: Product): CommerceProduct {
  const availability = getProductAvailabilityConfig(product);

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
    availability,
    metadata: getProductMetadata(product)
  };
}

export function listCommerceProducts() {
  return products
    .filter((product) => shouldShowProductInShop(product))
    .map(toCommerceProduct);
}

export function getCommerceProductBySlug(slug: string) {
  const product = getProductBySlug(slug);

  return product && shouldShowProductInShop(product) ? toCommerceProduct(product) : undefined;
}

export function listCommerceProductsByCategory(category: ProductCategory) {
  return getProductsByCategory(category).map(toCommerceProduct);
}

export function medusaProductToCommerceProduct(product: MedusaProductLike): CommerceProduct {
  const fallbackSlug = product.handle ?? product.metadata?.mrmf_slug ?? product.id ?? "unknown";
  const seedProduct = getProductBySlug(fallbackSlug);
  const fallback = seedProduct
    ? toCommerceProduct(seedProduct)
    : {
        source: "shared-seed" as const,
        id: fallbackSlug,
        slug: fallbackSlug,
        name: product.title ?? fallbackSlug,
        category: "fresh-mushrooms" as ProductCategory,
        price: 0,
        unitSize: "Unit size pending",
        shortDescription: "Product details pending.",
        longDescription: "Product details pending.",
        image: {
          src: "/product-placeholders/mixed-box.svg",
          alt: product.title ?? "Maury River Mushroom Farm product"
        },
        fulfillment: [] as FulfillmentType[],
        fulfillmentMode: "fresh-local" as FulfillmentMode,
        fulfillmentLabel: fulfillmentLabels["fresh-local"],
        shippable: false,
        localOnly: true,
        inventoryStatus: "coming-soon" as InventoryStatus,
        availability: {
          state: "coming-soon" as const,
          publicVisibility: "hidden" as const,
          cartable: false,
          publicMessage: "Catalog item pending owner review before publication."
        },
        metadata: {
          species: [],
          productFormat: "fresh" as ProductFormat,
          flavorProfile: "Flavor notes pending.",
          texture: "Texture notes pending.",
          cookingMethods: [],
          pairings: [],
          storageInstructions: "Storage instructions pending.",
          shelfLife: "Shelf life pending.",
          relatedRecipes: [],
          relatedSpeciesPage: [],
          visibilityStatus: "draft" as VisibilityStatus
        }
      };
  const metadata = product.metadata ?? {};
  const normalizedMetadata = normalizeProductMetadata(metadata, fallback.metadata);
  const category = normalizeProductCategory(metadata.category, fallback.category);
  const fulfillment = normalizeFulfillmentTypes(metadata.fulfillment, fallback.fulfillment);
  const availability = normalizeAvailabilityConfig(metadata, fallback.availability);
  const requestedShippable = booleanValue(metadata.shippable, fulfillment.includes("shipping"));
  const isFresh =
    normalizedMetadata.productFormat === "fresh" || category === "fresh-mushrooms";
  const hasApprovedFreshShipping = hasFreshShippingApprovalMetadata(
    metadata.fresh_shipping_approval
  );
  const shippable =
    requestedShippable && fulfillment.includes("shipping") && (!isFresh || hasApprovedFreshShipping);

  const fulfillmentMode = classifyCommerceProductFulfillment({
    category,
    metadata: normalizedMetadata,
    fulfillment,
    shippable
  });

  const explicitFulfillmentLabel = stringValue(metadata.fulfillment_label, "");

  return {
    source: "medusa",
    id: product.id ?? fallbackSlug,
    variantId: product.variants?.[0]?.id ?? undefined,
    slug: fallbackSlug,
    name: product.title ?? fallback.name,
    category,
    price: getMedusaProductPrice(product, fallback.price),
    unitSize: stringValue(metadata.unit_size, fallback.unitSize),
    shortDescription: stringValue(metadata.short_description, fallback.shortDescription),
    longDescription: product.description ?? fallback.longDescription,
    image: getMedusaProductImage(product, fallback.image),
    fulfillment,
    fulfillmentMode,
    fulfillmentLabel: explicitFulfillmentLabel || fulfillmentLabels[fulfillmentMode],
    shippable,
    localOnly: isFresh || !shippable,
    inventoryStatus: normalizeInventoryStatus(
      metadata.availability_state ?? metadata.inventory_status,
      fallback.inventoryStatus
    ),
    availability,
    metadata: normalizedMetadata
  };
}
