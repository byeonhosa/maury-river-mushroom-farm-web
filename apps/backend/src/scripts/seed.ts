import type { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import {
  batchLinksWorkflow,
  createCollectionsWorkflow,
  createApiKeysWorkflow,
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
  updateProductsWorkflow
} from "@medusajs/medusa/core-flows";
import type { ProductCategory } from "@mrmf/shared";

import {
  buildMedusaProductPayloads,
  buildSeedPlan,
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
    ["id", "name"],
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
          data: {
            mrmf_seed_key: option.key,
            description: option.description,
            fulfillment_type: option.fulfillmentType,
            is_parcel: option.isParcel,
            requires_pickup_window: option.requiresPickupWindow,
            requires_final_confirmation: option.requiresFinalConfirmation
          }
        };
      })
    });

    return [...existing, ...result.map((option) => ({ id: option.id, name: option.name }))];
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

  console.log(
    `Seeded Maury River Mushroom Farm commerce data: ${categoryRecords.length} categories, ${collectionRecords.length} collections, ${shippingProfileRecords.length} shipping profiles, ${stockLocations.length} stock location, ${fulfillmentSets.length} fulfillment set, ${serviceZones.length} service zone, ${shippingOptions.length} shipping options, ${productResult.created} products created, ${productResult.updated} products updated, ${productResult.skipped} products already present.`
  );
  console.log(
    `Store API publishable key ready: ${publishableApiKey.token}. Set NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY to this value for Medusa-backed storefront reads.`
  );
}
