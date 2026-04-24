import type { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  createCollectionsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createSalesChannelsWorkflow,
  createShippingProfilesWorkflow
} from "@medusajs/medusa/core-flows";
import type { ProductCategory } from "@mrmf/shared";

import {
  buildMedusaProductPayloads,
  buildSeedPlan,
  medusaSeedCategories,
  medusaSeedCollections,
  medusaSeedShippingProfiles
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

interface SalesChannelRecord extends EntityRecord {
  name: string;
}

interface ProductRecord extends EntityRecord {
  handle: string;
}

const seedSalesChannelName =
  process.env.MEDUSA_SEED_SALES_CHANNEL_NAME ?? "Maury River Storefront";

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

async function ensureCategories(query: QueryGraph, container: ExecArgs["container"]) {
  const handles = medusaSeedCategories.map((category) => category.handle);
  const existing = await queryRecords<CategoryRecord>(query, "product_category", ["id", "handle"], {
    handle: handles
  });
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
  const existingHandles = new Set(existing.map((product) => product.handle));
  const missing = payloads.filter(
    (product) => product.handle && !existingHandles.has(product.handle)
  );

  if (missing.length > 0) {
    const { result } = await createProductsWorkflow(container).run({
      input: {
        products: missing
      }
    });

    return { created: result.length, skipped: existing.length };
  }

  return { created: 0, skipped: existing.length };
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
      `Seed plan: ${plan.categories.length} categories, ${plan.collections.length} collections, ${plan.shippingProfiles.length} shipping profiles, ${plan.products.length} products.`
    );

    return;
  }

  const query = container.resolve<QueryGraph>(ContainerRegistrationKeys.QUERY);
  const categoryRecords = await ensureCategories(query, container);
  const collectionRecords = await ensureCollections(query, container);
  const shippingProfileRecords = await ensureShippingProfiles(query, container);
  const salesChannel = await ensureSalesChannel(query, container);
  const productResult = await ensureProducts({
    query,
    container,
    categoryRecords,
    collectionRecords,
    shippingProfileRecords,
    salesChannel
  });

  console.log(
    `Seeded Maury River Mushroom Farm commerce data: ${categoryRecords.length} categories, ${collectionRecords.length} collections, ${shippingProfileRecords.length} shipping profiles, ${productResult.created} products created, ${productResult.skipped} products already present.`
  );
}
