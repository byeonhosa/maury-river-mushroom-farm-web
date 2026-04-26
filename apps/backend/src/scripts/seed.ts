import type { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import {
  batchLinksWorkflow,
  batchShippingOptionRulesWorkflow,
  createCollectionsWorkflow,
  createApiKeysWorkflow,
  createInventoryItemsWorkflow,
  createInventoryLevelsWorkflow,
  createLocationFulfillmentSetWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createServiceZonesWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateInventoryItemsWorkflow,
  updateInventoryLevelsWorkflow,
  updateProductsWorkflow
} from "@medusajs/medusa/core-flows";
import type { ProductCategory } from "@mrmf/shared";

import {
  buildMedusaInventorySpecs,
  buildMedusaProductPayloads,
  buildMedusaShippingOptionData,
  buildMedusaShippingOptionRules,
  buildSeedPlan,
  type MedusaSeedInventorySpec,
  type MedusaSeedShippingOptionRule,
  medusaSeedCategories,
  medusaSeedCollections,
  medusaSeedFulfillmentSets,
  medusaSeedRegion,
  medusaSeedServiceZones,
  medusaSeedShippingProfiles,
  medusaSeedShippingOptions,
  medusaSeedStockLocations
} from "./medusa-seed-data";

interface QueryGraph {
  graph<TRecord>(input: {
    entity: string;
    fields: string[];
    filters?: Record<string, unknown>;
  }): Promise<{ data: TRecord[] }>;
}

interface EntityRecord {
  id: string;
}

interface CategoryRecord extends EntityRecord {
  handle: ProductCategory;
}

interface CollectionRecord extends EntityRecord {
  handle: string;
}

interface ShippingProfileRecord extends EntityRecord {
  type: string;
}

interface RegionRecord extends EntityRecord {
  name: string;
  currency_code: string;
}

interface StockLocationRecord extends EntityRecord {
  name: string;
}

interface FulfillmentSetRecord extends EntityRecord {
  name: string;
  type: string;
}

interface ServiceZoneRecord extends EntityRecord {
  name: string;
}

interface ShippingOptionRecord extends EntityRecord {
  name: string;
  data?: Record<string, unknown> | null;
  rules?: ShippingOptionRuleRecord[];
}

interface ShippingOptionRuleRecord extends EntityRecord {
  attribute: string;
  operator: string;
  value?: unknown;
}

interface SalesChannelRecord extends EntityRecord {
  name: string;
}

interface ApiKeyRecord extends EntityRecord {
  title: string;
  token: string;
  type: string;
}

interface ProductRecord extends EntityRecord {
  handle: string;
}

interface ProductVariantRecord extends EntityRecord {
  sku: string | null;
  manage_inventory: boolean;
}

interface InventoryItemRecord extends EntityRecord {
  sku?: string | null;
  metadata?: Record<string, unknown> | null;
}

interface InventoryLevelRecord extends EntityRecord {
  inventory_item_id: string;
  location_id: string;
  stocked_quantity: number | string;
}

interface ProductModuleService {
  listProductVariants(
    filters?: Record<string, unknown>,
    config?: Record<string, unknown>
  ): Promise<ProductVariantRecord[]>;
}

interface InventoryModuleService {
  listInventoryItems(
    selector: Record<string, unknown>,
    config?: Record<string, unknown>
  ): Promise<InventoryItemRecord[]>;
  listInventoryLevels(
    selector: Record<string, unknown>,
    config?: Record<string, unknown>
  ): Promise<InventoryLevelRecord[]>;
}

interface FulfillmentModuleService {
  updateShippingOptions(
    id: string,
    data: { name?: string; data?: Record<string, unknown> | null }
  ): Promise<unknown>;
  listShippingOptionRules(
    selector: Record<string, unknown>,
    config?: Record<string, unknown>
  ): Promise<ShippingOptionRuleRecord[]>;
}

const seedSalesChannelName =
  process.env.MEDUSA_SEED_SALES_CHANNEL_NAME ?? "Maury River Storefront";
const seedPublishableKeyTitle =
  process.env.MEDUSA_SEED_PUBLISHABLE_KEY_TITLE ?? "Maury River Storefront Publishable Key";
const seedFulfillmentProviderId =
  process.env.MEDUSA_SEED_FULFILLMENT_PROVIDER_ID ?? "manual_manual";

function categoryMap(records: CategoryRecord[]): Record<ProductCategory, string | undefined> {
  const byHandle = new Map(records.map((record) => [record.handle, record.id]));

  return {
    "fresh-mushrooms": byHandle.get("fresh-mushrooms"),
    "dried-mushrooms": byHandle.get("dried-mushrooms"),
    "salts-seasonings": byHandle.get("salts-seasonings"),
    supplements: byHandle.get("supplements"),
    subscriptions: byHandle.get("subscriptions"),
    "restaurant-wholesale": byHandle.get("restaurant-wholesale"),
    "grow-kits": byHandle.get("grow-kits")
  };
}

function idMap<TRecord extends { id: string }, TKey extends string>(
  records: TRecord[],
  getKey: (record: TRecord) => TKey
) {
  return Object.fromEntries(records.map((record) => [getKey(record), record.id])) as Record<
    TKey,
    string | undefined
  >;
}

async function queryRecords<TRecord>(
  query: QueryGraph,
  entity: string,
  fields: string[],
  filters?: Record<string, unknown>
) {
  const { data } = await query.graph<TRecord>({ entity, fields, filters });

  return data;
}

function assertUniqueSeedRecords<TRecord>(
  records: TRecord[],
  getKey: (record: TRecord) => string,
  label: string
) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const record of records) {
    const key = getKey(record);

    if (seen.has(key)) {
      duplicates.add(key);
    }

    seen.add(key);
  }

  if (duplicates.size > 0) {
    throw new Error(
      `Duplicate existing ${label} records found for seed keys: ${[...duplicates].join(", ")}`
    );
  }
}

async function ensureCategories(query: QueryGraph, container: ExecArgs["container"]) {
  const handles = medusaSeedCategories.map((category) => category.handle);
  const existing = await queryRecords<CategoryRecord>(query, "product_category", ["id", "handle"], {
    handle: handles
  });
  assertUniqueSeedRecords(existing, (category) => category.handle, "product category");
  const existingHandles = new Set(existing.map((category) => category.handle));
  const missing = medusaSeedCategories.filter((category) => !existingHandles.has(category.handle));

  if (missing.length > 0) {
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: missing.map((category) => ({
          name: category.name,
          handle: category.handle,
          description: category.description,
          rank: category.rank,
          is_active: true,
          is_internal: false,
          external_id: `mrmf:${category.key}`,
          metadata: {
            mrmf_seed_key: category.key
          }
        }))
      }
    });

    return [...existing, ...result.map((category) => ({ id: category.id, handle: category.handle as ProductCategory }))];
  }

  return existing;
}

async function ensureCollections(query: QueryGraph, container: ExecArgs["container"]) {
  const handles = medusaSeedCollections.map((collection) => collection.handle);
  const existing = await queryRecords<CollectionRecord>(query, "product_collection", ["id", "handle"], {
    handle: handles
  });
  assertUniqueSeedRecords(existing, (collection) => collection.handle, "product collection");
  const existingHandles = new Set(existing.map((collection) => collection.handle));
  const missing = medusaSeedCollections.filter(
    (collection) => !existingHandles.has(collection.handle)
  );

  if (missing.length > 0) {
    const { result } = await createCollectionsWorkflow(container).run({
      input: {
        collections: missing.map((collection) => ({
          title: collection.title,
          handle: collection.handle,
          metadata: {
            mrmf_seed_key: collection.key,
            description: collection.description
          }
        }))
      }
    });

    return [...existing, ...result.map((collection) => ({ id: collection.id, handle: collection.handle }))];
  }

  return existing;
}

async function ensureShippingProfiles(query: QueryGraph, container: ExecArgs["container"]) {
  const types = medusaSeedShippingProfiles.map((profile) => profile.type);
  const existing = await queryRecords<ShippingProfileRecord>(
    query,
    "shipping_profile",
    ["id", "type"],
    {
      type: types
    }
  );
  assertUniqueSeedRecords(existing, (profile) => profile.type, "shipping profile");
  const existingTypes = new Set(existing.map((profile) => profile.type));
  const missing = medusaSeedShippingProfiles.filter((profile) => !existingTypes.has(profile.type));

  if (missing.length > 0) {
    const { result } = await createShippingProfilesWorkflow(container).run({
      input: {
        data: missing.map((profile) => ({
          name: profile.name,
          type: profile.type
        }))
      }
    });

    return [...existing, ...result.map((profile) => ({ id: profile.id, type: profile.type }))];
  }

  return existing;
}

async function ensureRegion(query: QueryGraph, container: ExecArgs["container"]) {
  const existing = await queryRecords<RegionRecord>(query, "region", ["id", "name", "currency_code"], {
    name: medusaSeedRegion.name
  });

  assertUniqueSeedRecords(existing, (region) => region.name, "region");

  if (existing[0]) {
    return existing[0];
  }

  const { result } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: medusaSeedRegion.name,
          currency_code: medusaSeedRegion.currencyCode,
          countries: medusaSeedRegion.countries,
          automatic_taxes: false,
          metadata: {
            mrmf_seed_key: medusaSeedRegion.key,
            description: medusaSeedRegion.description
          }
        }
      ]
    }
  });

  return result[0] as RegionRecord;
}

async function ensureSalesChannel(query: QueryGraph, container: ExecArgs["container"]) {
  const existing = await queryRecords<SalesChannelRecord>(
    query,
    "sales_channel",
    ["id", "name"],
    {
      name: seedSalesChannelName
    }
  );

  if (existing[0]) {
    return existing[0];
  }

  const { result } = await createSalesChannelsWorkflow(container).run({
    input: {
      salesChannelsData: [
        {
          name: seedSalesChannelName,
          description: "Storefront sales channel for The Maury River Mushroom Farm website."
        }
      ]
    }
  });

  return result[0];
}

function isDuplicateLinkError(error: unknown) {
  return error instanceof Error && /duplicate|already exists|violates unique/i.test(error.message);
}

function normalizeRuleValue(value: unknown) {
  if (Array.isArray(value)) {
    return JSON.stringify([...value].sort());
  }

  return JSON.stringify(value);
}

function ruleKey(rule: MedusaSeedShippingOptionRule | ShippingOptionRuleRecord) {
  return `${rule.attribute}:${rule.operator}:${normalizeRuleValue(rule.value)}`;
}

async function ensureStockLocations({
  query,
  container,
  salesChannel
}: {
  query: QueryGraph;
  container: ExecArgs["container"];
  salesChannel: SalesChannelRecord;
}) {
  const names = medusaSeedStockLocations.map((location) => location.name);
  const existing = await queryRecords<StockLocationRecord>(
    query,
    "stock_location",
    ["id", "name"],
    {
      name: names
    }
  );
  assertUniqueSeedRecords(existing, (location) => location.name, "stock location");
  const existingNames = new Set(existing.map((location) => location.name));
  const missing = medusaSeedStockLocations.filter(
    (location) => !existingNames.has(location.name)
  );

  const created =
    missing.length > 0
      ? (
          await createStockLocationsWorkflow(container).run({
            input: {
              locations: missing.map((location) => ({
                name: location.name,
                address: location.address,
                metadata: {
                  mrmf_seed_key: location.key,
                  description: location.description
                }
              }))
            }
          })
        ).result.map((location) => ({ id: location.id, name: location.name }))
      : [];
  const stockLocations = [...existing, ...created];

  for (const location of stockLocations) {
    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: {
        id: location.id,
        add: [salesChannel.id],
        remove: []
      }
    });

    try {
      await batchLinksWorkflow(container).run({
        input: {
          create: [
            {
              [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
              [Modules.FULFILLMENT]: { fulfillment_provider_id: seedFulfillmentProviderId }
            }
          ],
          delete: []
        }
      });
    } catch (error) {
      if (!isDuplicateLinkError(error)) {
        throw error;
      }
    }
  }

  return stockLocations;
}

async function ensureFulfillmentSets({
  query,
  container,
  stockLocations
}: {
  query: QueryGraph;
  container: ExecArgs["container"];
  stockLocations: StockLocationRecord[];
}) {
  const names = medusaSeedFulfillmentSets.map((set) => set.name);
  const existing = await queryRecords<FulfillmentSetRecord>(
    query,
    "fulfillment_set",
    ["id", "name", "type"],
    {
      name: names
    }
  );
  assertUniqueSeedRecords(existing, (set) => set.name, "fulfillment set");
  const existingNames = new Set(existing.map((set) => set.name));
  const created: FulfillmentSetRecord[] = [];

  for (const fulfillmentSet of medusaSeedFulfillmentSets.filter(
    (set) => !existingNames.has(set.name)
  )) {
    const stockLocationSeed = medusaSeedStockLocations.find(
      (location) => location.key === fulfillmentSet.stockLocationKey
    );
    const stockLocation = stockLocations.find(
      (location) => location.name === stockLocationSeed?.name
    );

    if (!stockLocation) {
      throw new Error(`Missing stock location for fulfillment set ${fulfillmentSet.name}.`);
    }

    await createLocationFulfillmentSetWorkflow(container).run({
      input: {
        location_id: stockLocation.id,
        fulfillment_set_data: {
          name: fulfillmentSet.name,
          type: fulfillmentSet.type
        }
      }
    });

    const newRecord = await queryRecords<FulfillmentSetRecord>(
      query,
      "fulfillment_set",
      ["id", "name", "type"],
      {
        name: fulfillmentSet.name
      }
    );

    if (!newRecord[0]) {
      throw new Error(`Failed to create fulfillment set ${fulfillmentSet.name}.`);
    }

    created.push(newRecord[0]);
  }

  return [...existing, ...created];
}

async function ensureServiceZones({
  query,
  container,
  fulfillmentSets
}: {
  query: QueryGraph;
  container: ExecArgs["container"];
  fulfillmentSets: FulfillmentSetRecord[];
}) {
  const names = medusaSeedServiceZones.map((zone) => zone.name);
  const existing = await queryRecords<ServiceZoneRecord>(
    query,
    "service_zone",
    ["id", "name"],
    {
      name: names
    }
  );
  assertUniqueSeedRecords(existing, (zone) => zone.name, "service zone");
  const existingNames = new Set(existing.map((zone) => zone.name));
  const missing = medusaSeedServiceZones.filter((zone) => !existingNames.has(zone.name));

  if (missing.length > 0) {
    const { result } = await createServiceZonesWorkflow(container).run({
      input: {
        data: missing.map((zone) => {
          const fulfillmentSetSeed = medusaSeedFulfillmentSets.find(
            (set) => set.key === zone.fulfillmentSetKey
          );
          const fulfillmentSet = fulfillmentSets.find(
            (set) => set.name === fulfillmentSetSeed?.name
          );

          if (!fulfillmentSet) {
            throw new Error(`Missing fulfillment set for service zone ${zone.name}.`);
          }

          return {
            name: zone.name,
            fulfillment_set_id: fulfillmentSet.id,
            geo_zones: [
              {
                type: "country" as const,
                country_code: zone.countryCode
              }
            ]
          };
        })
      }
    });

    return [...existing, ...result.map((zone) => ({ id: zone.id, name: zone.name }))];
  }

  return existing;
}

async function ensureShippingOptions({
  query,
  container,
  region,
  shippingProfileRecords,
  serviceZoneRecords
}: {
  query: QueryGraph;
  container: ExecArgs["container"];
  region: RegionRecord;
  shippingProfileRecords: ShippingProfileRecord[];
  serviceZoneRecords: ServiceZoneRecord[];
}) {
  const names = medusaSeedShippingOptions.map((option) => option.name);
  const existing = await queryRecords<ShippingOptionRecord>(
    query,
    "shipping_option",
    ["id", "name", "data", "rules.id", "rules.attribute", "rules.operator", "rules.value"],
    {
      name: names
    }
  );
  assertUniqueSeedRecords(existing, (option) => option.name, "shipping option");
  const existingNames = new Set(existing.map((option) => option.name));
  const shippingProfileIdByKey = idMap(
    shippingProfileRecords,
    (record) =>
      medusaSeedShippingProfiles.find((profile) => profile.type === record.type)?.key ??
      "fresh-local"
  );
  const serviceZoneSeedByName = new Map(medusaSeedServiceZones.map((zone) => [zone.name, zone]));
  const serviceZoneIdByKey = serviceZoneRecords.reduce<Record<string, string | undefined>>(
    (map, record) => {
      const serviceZoneSeed = serviceZoneSeedByName.get(record.name);

      if (serviceZoneSeed) {
        map[serviceZoneSeed.key] = record.id;
      }

      return map;
    },
    {}
  );
  const missing = medusaSeedShippingOptions.filter((option) => !existingNames.has(option.name));
  const optionByName = new Map(medusaSeedShippingOptions.map((option) => [option.name, option]));
  const updateExistingShippingOptionMetadata = async (records: ShippingOptionRecord[]) => {
    const fulfillmentModule = container.resolve<FulfillmentModuleService>(Modules.FULFILLMENT);

    for (const record of records) {
      const seedOption = optionByName.get(record.name);

      if (!seedOption) {
        continue;
      }

      await fulfillmentModule.updateShippingOptions(record.id, {
        name: seedOption.name,
        data: {
          ...(record.data ?? {}),
          ...buildMedusaShippingOptionData(seedOption)
        }
      });
    }
  };
  const ensureShippingOptionRules = async (records: ShippingOptionRecord[]) => {
    const fulfillmentModule = container.resolve<FulfillmentModuleService>(Modules.FULFILLMENT);

    for (const record of records) {
      const seedOption = optionByName.get(record.name);

      if (!seedOption) {
        continue;
      }

      const desiredRules = buildMedusaShippingOptionRules(seedOption);
      const existingRules =
        record.rules ??
        (await fulfillmentModule.listShippingOptionRules(
          {
            shipping_option_id: record.id
          },
          {
            take: 100
          }
        ));
      const managedAttributes = new Set(desiredRules.map((rule) => rule.attribute));
      const desiredKeys = new Set(desiredRules.map(ruleKey));
      const existingManagedRules = existingRules.filter((rule) =>
        managedAttributes.has(rule.attribute)
      );
      const existingKeys = new Set(existingManagedRules.map(ruleKey));
      const create = desiredRules
        .filter((rule) => !existingKeys.has(ruleKey(rule)))
        .map((rule) => ({
          ...rule,
          shipping_option_id: record.id
        }));
      const deleteIds = existingManagedRules
        .filter((rule) => !desiredKeys.has(ruleKey(rule)))
        .map((rule) => rule.id);

      if (create.length === 0 && deleteIds.length === 0) {
        continue;
      }

      await batchShippingOptionRulesWorkflow(container).run({
        input: {
          create,
          update: [],
          delete: deleteIds
        }
      });
    }
  };

  if (missing.length > 0) {
    const { result } = await createShippingOptionsWorkflow(container).run({
      input: missing.map((option) => {
        const shippingProfileId = shippingProfileIdByKey[option.shippingProfileKey];
        const serviceZoneId = serviceZoneIdByKey[option.serviceZoneKey];

        if (!shippingProfileId) {
          throw new Error(`Missing shipping profile for shipping option ${option.name}.`);
        }

        if (!serviceZoneId) {
          throw new Error(`Missing service zone for shipping option ${option.name}.`);
        }

        return {
          name: option.name,
          service_zone_id: serviceZoneId,
          shipping_profile_id: shippingProfileId,
          provider_id: seedFulfillmentProviderId,
          type: {
            label: option.name,
            code: option.code,
            description: option.description
          },
          price_type: "flat" as const,
          prices: [
            {
              region_id: region.id,
              amount: option.amount
            }
          ],
          data: buildMedusaShippingOptionData(option),
          rules: buildMedusaShippingOptionRules(option)
        };
      })
    });

    const created = result.map((option) => ({ id: option.id, name: option.name }));

    if (existing.length > 0) {
      await updateExistingShippingOptionMetadata(existing);
    }

    const records = [...existing, ...created];
    await ensureShippingOptionRules(records);

    return records;
  }

  if (existing.length > 0) {
    await updateExistingShippingOptionMetadata(existing);
    await ensureShippingOptionRules(existing);
  }

  return existing;
}

async function ensurePublishableApiKey({
  query,
  container,
  salesChannel
}: {
  query: QueryGraph;
  container: ExecArgs["container"];
  salesChannel: SalesChannelRecord;
}) {
  const existing = await queryRecords<ApiKeyRecord>(query, "api_key", ["id", "title", "token", "type"], {
    title: seedPublishableKeyTitle,
    type: "publishable"
  });

  assertUniqueSeedRecords(existing, (apiKey) => apiKey.title, "publishable API key");

  const apiKey =
    existing[0] ??
    (
      await createApiKeysWorkflow(container).run({
        input: {
          api_keys: [
            {
              title: seedPublishableKeyTitle,
              type: "publishable",
              created_by: "mrmf-seed"
            }
          ]
        }
      })
    ).result[0];

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: apiKey.id,
      add: [salesChannel.id],
      remove: []
    }
  });

  return apiKey;
}

async function ensureProducts({
  query,
  container,
  categoryRecords,
  collectionRecords,
  shippingProfileRecords,
  salesChannel
}: {
  query: QueryGraph;
  container: ExecArgs["container"];
  categoryRecords: CategoryRecord[];
  collectionRecords: CollectionRecord[];
  shippingProfileRecords: ShippingProfileRecord[];
  salesChannel: SalesChannelRecord;
}) {
  const payloads = buildMedusaProductPayloads({
    categoryIdByKey: categoryMap(categoryRecords),
    collectionIdByKey: idMap(collectionRecords, (record) => record.handle),
    shippingProfileIdByKey: idMap(
      shippingProfileRecords,
      (record) =>
        medusaSeedShippingProfiles.find((profile) => profile.type === record.type)?.key ??
        "fresh-local"
    ),
    salesChannelId: salesChannel.id
  });
  const handles = payloads.map((product) => product.handle).filter((handle) => typeof handle === "string");
  const existing = await queryRecords<ProductRecord>(query, "product", ["id", "handle"], {
    handle: handles
  });
  assertUniqueSeedRecords(existing, (product) => product.handle, "product");
  const payloadByHandle = new Map(payloads.map((product) => [product.handle, product]));
  const existingHandles = new Set(existing.map((product) => product.handle));
  const missing = payloads.filter(
    (product) => product.handle && !existingHandles.has(product.handle)
  );
  const existingUpdates = existing
    .map((product) => {
      const payload = payloadByHandle.get(product.handle);

      if (!payload) {
        return undefined;
      }

      return {
        id: product.id,
        title: payload.title,
        subtitle: payload.subtitle,
        handle: payload.handle ?? product.handle,
        description: payload.description,
        status: payload.status,
        thumbnail: payload.thumbnail,
        category_ids: payload.category_ids,
        collection_id: payload.collection_id,
        shipping_profile_id: payload.shipping_profile_id,
        sales_channels: payload.sales_channels,
        metadata: payload.metadata
      };
    })
    .filter((product): product is NonNullable<typeof product> => Boolean(product));

  if (missing.length > 0) {
    const { result } = await createProductsWorkflow(container).run({
      input: {
        products: missing
      }
    });

    if (existingUpdates.length > 0) {
      await updateProductsWorkflow(container).run({
        input: {
          products: existingUpdates
        }
      });
    }

    return { created: result.length, updated: existingUpdates.length, skipped: existing.length };
  }

  if (existingUpdates.length > 0) {
    await updateProductsWorkflow(container).run({
      input: {
        products: existingUpdates
      }
    });
  }

  return { created: 0, updated: existingUpdates.length, skipped: existing.length };
}

function inventoryItemMetadata(spec: MedusaSeedInventorySpec) {
  return {
    mrmf_seed_key: spec.productSlug,
    mrmf_product_slug: spec.productSlug,
    fulfillment_mode: spec.fulfillmentMode,
    fulfillment: spec.fulfillment,
    product_format: spec.productFormat,
    inventory_status: spec.inventoryStatus,
    availability_state: spec.availabilityState,
    public_visibility: spec.publicVisibility,
    cartable: spec.cartable,
    available_quantity: spec.availableQuantity,
    stock_note: spec.stockNote,
    shippable: spec.shippable,
    parcel_shipping_eligible: spec.parcelShippingEligible,
    local_only: spec.localOnly,
    managed_by_seed: true
  };
}

function toNumber(value: number | string) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

async function ensureProductInventory({
  container,
  stockLocations
}: {
  container: ExecArgs["container"];
  stockLocations: StockLocationRecord[];
}) {
  const stockLocation = stockLocations[0];

  if (!stockLocation) {
    throw new Error("Missing stock location for seeded product inventory.");
  }

  const specs = buildMedusaInventorySpecs().filter((spec) => spec.manageInventory);
  const skus = specs.map((spec) => spec.sku);
  const productModule = container.resolve<ProductModuleService>(Modules.PRODUCT);
  const inventoryModule = container.resolve<InventoryModuleService>(Modules.INVENTORY);
  const variants = await productModule.listProductVariants(
    {
      sku: skus
    },
    {
      take: skus.length + 10
    }
  );

  assertUniqueSeedRecords(
    variants.filter((variant) => typeof variant.sku === "string"),
    (variant) => variant.sku ?? "",
    "product variant sku"
  );

  const variantBySku = new Map(
    variants.flatMap((variant) => (variant.sku ? [[variant.sku, variant]] : []))
  );
  const missingVariantSkus = specs
    .filter((spec) => !variantBySku.has(spec.sku))
    .map((spec) => spec.sku);

  if (missingVariantSkus.length > 0) {
    throw new Error(
      `Missing seeded product variants for inventory SKUs: ${missingVariantSkus.join(", ")}`
    );
  }

  const existingItems = await inventoryModule.listInventoryItems(
    {
      sku: skus
    },
    {
      take: skus.length + 10
    }
  );

  assertUniqueSeedRecords(
    existingItems.filter((item) => typeof item.sku === "string"),
    (item) => item.sku ?? "",
    "inventory item sku"
  );

  const itemBySku = new Map(
    existingItems.flatMap((item) => (item.sku ? [[item.sku, item]] : []))
  );
  const missingItemSpecs = specs.filter((spec) => !itemBySku.has(spec.sku));
  const createdItemIds = new Set<string>();

  if (missingItemSpecs.length > 0) {
    const { result } = await createInventoryItemsWorkflow(container).run({
      input: {
        items: missingItemSpecs.map((spec) => ({
          sku: spec.sku,
          title: spec.title,
          description: spec.description,
          requires_shipping: spec.requiresShipping,
          metadata: inventoryItemMetadata(spec),
          location_levels: [
            {
              location_id: stockLocation.id,
              stocked_quantity: spec.stockedQuantity
            }
          ]
        }))
      }
    });

    for (const item of result) {
      if (item.sku) {
        itemBySku.set(item.sku, item);
        createdItemIds.add(item.id);
      }
    }
  }

  const itemUpdates = specs
    .map((spec) => {
      const item = itemBySku.get(spec.sku);

      if (!item || createdItemIds.has(item.id)) {
        return undefined;
      }

      return {
        id: item.id,
        sku: spec.sku,
        title: spec.title,
        description: spec.description,
        requires_shipping: spec.requiresShipping,
        metadata: {
          ...(item.metadata ?? {}),
          ...inventoryItemMetadata(spec)
        }
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  if (itemUpdates.length > 0) {
    await updateInventoryItemsWorkflow(container).run({
      input: {
        updates: itemUpdates
      }
    });
  }

  const inventoryItemIds = specs
    .map((spec) => itemBySku.get(spec.sku)?.id)
    .filter((id): id is string => typeof id === "string");
  const existingLevels =
    inventoryItemIds.length > 0
      ? await inventoryModule.listInventoryLevels(
          {
            inventory_item_id: inventoryItemIds,
            location_id: stockLocation.id
          },
          {
            take: inventoryItemIds.length + 10
          }
        )
      : [];
  const levelByInventoryItemId = new Map(
    existingLevels.map((level) => [level.inventory_item_id, level])
  );
  const levelCreates = specs
    .map((spec) => {
      const inventoryItemId = itemBySku.get(spec.sku)?.id;

      if (!inventoryItemId || levelByInventoryItemId.has(inventoryItemId)) {
        return undefined;
      }

      return {
        inventory_item_id: inventoryItemId,
        location_id: stockLocation.id,
        stocked_quantity: spec.stockedQuantity
      };
    })
    .filter((level): level is NonNullable<typeof level> => Boolean(level));
  const levelUpdates = specs
    .map((spec) => {
      const inventoryItemId = itemBySku.get(spec.sku)?.id;
      const level = inventoryItemId ? levelByInventoryItemId.get(inventoryItemId) : undefined;

      if (!inventoryItemId || !level || toNumber(level.stocked_quantity) === spec.stockedQuantity) {
        return undefined;
      }

      return {
        id: level.id,
        inventory_item_id: inventoryItemId,
        location_id: stockLocation.id,
        stocked_quantity: spec.stockedQuantity
      };
    })
    .filter((level): level is NonNullable<typeof level> => Boolean(level));

  if (levelCreates.length > 0) {
    await createInventoryLevelsWorkflow(container).run({
      input: {
        inventory_levels: levelCreates
      }
    });
  }

  if (levelUpdates.length > 0) {
    await updateInventoryLevelsWorkflow(container).run({
      input: {
        updates: levelUpdates
      }
    });
  }

  let linkedVariants = 0;

  for (const spec of specs) {
    const variant = variantBySku.get(spec.sku);
    const item = itemBySku.get(spec.sku);

    if (!variant || !item) {
      continue;
    }

    try {
      await batchLinksWorkflow(container).run({
        input: {
          create: [
            {
              [Modules.PRODUCT]: { variant_id: variant.id },
              [Modules.INVENTORY]: { inventory_item_id: item.id }
            }
          ],
          delete: []
        }
      });
    } catch (error) {
      if (!isDuplicateLinkError(error)) {
        throw error;
      }
    }

    linkedVariants += 1;
  }

  return {
    stockLocation: stockLocation.name,
    inventoryItemsCreated: missingItemSpecs.length,
    inventoryItemsUpdated: itemUpdates.length,
    inventoryLevelsCreated: levelCreates.length,
    inventoryLevelsUpdated: levelUpdates.length,
    variantLinksEnsured: linkedVariants
  };
}

export default async function seedMauryRiverMushroomFarm({ container, args }: ExecArgs) {
  if (args.includes("--plan") || args.includes("--dry-run")) {
    const plan = buildSeedPlan({
      categoryIdByKey: categoryMap([]),
      collectionIdByKey: {},
      shippingProfileIdByKey: {
        "fresh-local": "shipping-profile-fresh-local",
        "shelf-stable-shipping": "shipping-profile-shelf-stable",
        "supplement-shipping": "shipping-profile-supplement",
        "subscription-preorder": "shipping-profile-subscription",
        "wholesale-preorder": "shipping-profile-wholesale"
      },
      salesChannelId: "sales-channel-plan"
    });

    console.log(
      `Seed plan: ${plan.categories.length} categories, ${plan.collections.length} collections, ${plan.shippingProfiles.length} shipping profiles, ${plan.regions.length} region, ${plan.stockLocations.length} stock location, ${plan.fulfillmentSets.length} fulfillment set, ${plan.serviceZones.length} service zone, ${plan.shippingOptions.length} shipping options, ${plan.products.length} products.`
    );

    return;
  }

  const query = container.resolve<QueryGraph>(ContainerRegistrationKeys.QUERY);
  const categoryRecords = await ensureCategories(query, container);
  const collectionRecords = await ensureCollections(query, container);
  const shippingProfileRecords = await ensureShippingProfiles(query, container);
  const region = await ensureRegion(query, container);
  const salesChannel = await ensureSalesChannel(query, container);
  const stockLocations = await ensureStockLocations({
    query,
    container,
    salesChannel
  });
  const fulfillmentSets = await ensureFulfillmentSets({
    query,
    container,
    stockLocations
  });
  const serviceZones = await ensureServiceZones({
    query,
    container,
    fulfillmentSets
  });
  const shippingOptions = await ensureShippingOptions({
    query,
    container,
    region,
    shippingProfileRecords,
    serviceZoneRecords: serviceZones
  });
  const publishableApiKey = await ensurePublishableApiKey({
    query,
    container,
    salesChannel
  });
  const productResult = await ensureProducts({
    query,
    container,
    categoryRecords,
    collectionRecords,
    shippingProfileRecords,
    salesChannel
  });
  const inventoryResult = await ensureProductInventory({
    container,
    stockLocations
  });

  console.log(
    `Seeded Maury River Mushroom Farm commerce data: ${categoryRecords.length} categories, ${collectionRecords.length} collections, ${shippingProfileRecords.length} shipping profiles, ${stockLocations.length} stock location, ${fulfillmentSets.length} fulfillment set, ${serviceZones.length} service zone, ${shippingOptions.length} shipping options, ${productResult.created} products created, ${productResult.updated} products updated, ${productResult.skipped} products already present.`
  );
  console.log(
    `Seeded inventory at ${inventoryResult.stockLocation}: ${inventoryResult.inventoryItemsCreated} inventory items created, ${inventoryResult.inventoryItemsUpdated} inventory items updated, ${inventoryResult.inventoryLevelsCreated} inventory levels created, ${inventoryResult.inventoryLevelsUpdated} inventory levels updated, ${inventoryResult.variantLinksEnsured} variant links ensured.`
  );
  console.log(
    `Store API publishable key ready: ${publishableApiKey.token}. Set NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY to this value for Medusa-backed storefront reads.`
  );
}
