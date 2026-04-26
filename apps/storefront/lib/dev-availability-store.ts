import {
  availabilityAdminUpdateSchema,
  getCommerceProductAvailability,
  getProductAvailabilityConfig,
  products,
  speciesPages,
  type AvailabilityAdminUpdate,
  type CommerceProduct,
  type ProductAvailabilityConfig
} from "@mrmf/shared";

export interface AvailabilityAdminRecord {
  targetType: "product" | "species";
  slug: string;
  name: string;
  code?: string;
  category?: string;
  state: ProductAvailabilityConfig["state"];
  publicVisibility?: ProductAvailabilityConfig["publicVisibility"];
  cartable?: boolean;
  availableQuantity?: number;
  stockNote?: string;
  expectedAvailabilityDate?: string;
  pickupAvailabilityNote?: string;
  publicMessage?: string;
  notifyMeEnabled?: boolean;
  wholesaleOnly?: boolean;
  inquiryOnly?: boolean;
  source: "seed" | "dev-override";
}

type AvailabilityOverrideMap = Map<string, AvailabilityAdminUpdate>;

declare global {
  var __mrmfAvailabilityOverrides: AvailabilityOverrideMap | undefined;
}

function overrides() {
  globalThis.__mrmfAvailabilityOverrides ??= new Map<string, AvailabilityAdminUpdate>();

  return globalThis.__mrmfAvailabilityOverrides;
}

function key(targetType: "product" | "species", slug: string) {
  return `${targetType}:${slug}`;
}

function cleanUpdate(update: AvailabilityAdminUpdate): AvailabilityAdminUpdate {
  return Object.fromEntries(
    Object.entries(update).filter(([, value]) => value !== undefined)
  ) as AvailabilityAdminUpdate;
}

export function isDevAvailabilityAdminEnabled() {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.MRMF_ENABLE_DEV_AVAILABILITY_ADMIN !== "false"
  );
}

function overrideFor(targetType: "product" | "species", slug: string) {
  return overrides().get(key(targetType, slug));
}

function mergeProductAvailability(
  base: ProductAvailabilityConfig,
  override?: AvailabilityAdminUpdate
): ProductAvailabilityConfig {
  if (!override) {
    return base;
  }

  return {
    ...base,
    state: override.state ?? base.state,
    publicVisibility: override.publicVisibility ?? base.publicVisibility,
    cartable: override.cartable ?? base.cartable,
    availableQuantity:
      override.availableQuantity === null
        ? undefined
        : override.availableQuantity ?? base.availableQuantity,
    stockNote: override.stockNote === null ? undefined : override.stockNote ?? base.stockNote,
    expectedAvailabilityDate:
      override.expectedAvailabilityDate === null
        ? undefined
        : override.expectedAvailabilityDate ?? base.expectedAvailabilityDate,
    pickupAvailabilityNote:
      override.pickupAvailabilityNote === null
        ? undefined
        : override.pickupAvailabilityNote ?? base.pickupAvailabilityNote,
    publicMessage:
      override.publicMessage === null ? undefined : override.publicMessage ?? base.publicMessage,
    notifyMeEnabled: override.notifyMeEnabled ?? base.notifyMeEnabled,
    wholesaleOnly: override.wholesaleOnly ?? base.wholesaleOnly,
    inquiryOnly: override.inquiryOnly ?? base.inquiryOnly
  };
}

export function applyDevAvailabilityOverride(product: CommerceProduct): CommerceProduct {
  if (!isDevAvailabilityAdminEnabled()) {
    return product;
  }

  const override = overrideFor("product", product.slug);

  if (!override) {
    return product;
  }

  const availability = mergeProductAvailability(product.availability, override);

  return {
    ...product,
    inventoryStatus: availability.state ?? product.inventoryStatus,
    availability
  };
}

export function listDevAvailabilityRecords(): AvailabilityAdminRecord[] {
  const productRecords = products.map((product): AvailabilityAdminRecord => {
    const override = overrideFor("product", product.slug);
    const baseAvailability = getProductAvailabilityConfig(product);
    const mergedAvailability = mergeProductAvailability(baseAvailability, override);
    const resolved = getCommerceProductAvailability({
      ...product,
      inventoryStatus: mergedAvailability.state ?? product.inventoryStatus,
      availability: mergedAvailability
    });

    return {
      targetType: "product",
      slug: product.slug,
      name: product.name,
      category: product.category,
      state: resolved.state,
      publicVisibility: resolved.publicVisibility,
      cartable: resolved.canAddToCart,
      availableQuantity: resolved.availableQuantity,
      stockNote: resolved.stockNote,
      expectedAvailabilityDate: resolved.expectedAvailabilityDate,
      pickupAvailabilityNote: resolved.pickupAvailabilityNote,
      publicMessage: resolved.message,
      notifyMeEnabled: resolved.showNotifyMeLater,
      wholesaleOnly: resolved.showWholesaleCta,
      inquiryOnly: resolved.showInquiryCta,
      source: override ? "dev-override" : "seed"
    };
  });
  const speciesRecords = speciesPages.map((species): AvailabilityAdminRecord => {
    const override = overrideFor("species", species.slug);

    return {
      targetType: "species",
      slug: species.slug,
      name: species.name,
      code: species.code,
      state: override?.state ?? species.availabilityState,
      publicVisibility: override?.publicVisibility ?? "catalog",
      cartable: false,
      publicMessage: override?.publicMessage ?? species.overview,
      source: override ? "dev-override" : "seed"
    };
  });

  return [...productRecords, ...speciesRecords];
}

export function updateDevAvailabilityRecord(input: unknown) {
  if (!isDevAvailabilityAdminEnabled()) {
    throw new Error("Development availability admin is disabled.");
  }

  const parsed = availabilityAdminUpdateSchema.parse(input);
  const update = cleanUpdate(parsed);

  overrides().set(key(update.targetType, update.targetSlug), update);

  return listDevAvailabilityRecords().find(
    (record) => record.targetType === update.targetType && record.slug === update.targetSlug
  );
}
