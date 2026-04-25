import { loadEnv } from "@medusajs/framework/utils";
import {
  classifyProductFulfillment,
  products,
  type FulfillmentMode,
  type Product
} from "@mrmf/shared";
import path from "node:path";
import pg from "pg";

import {
  buildMedusaInventorySpecs,
  buildMedusaShippingOptionData,
  medusaSeedCategories,
  medusaSeedCollections,
  medusaSeedRegion,
  medusaSeedServiceZones,
  medusaSeedShippingOptions,
  medusaSeedShippingProfiles
} from "./medusa-seed-data";

const repositoryRoot = path.resolve(__dirname, "../../../..");

loadEnv(process.env.NODE_ENV ?? "development", repositoryRoot);

interface SeedProductRow {
  id: string;
  handle: string;
  title: string;
  status: string;
  metadata: Record<string, unknown> | null;
  collection_handle: string | null;
  shipping_profile_type: string | null;
  category_handles: string[] | null;
  variant_count: string | number;
  price_count: string | number;
  price_amount: string | number | null;
}

interface SeedApiKeyRow {
  title: string;
  token: string;
  sales_channel_count: string | number;
}

interface SeedRegionRow {
  id: string;
  name: string;
  currency_code: string;
  country_codes: string[] | null;
}

interface SeedShippingOptionRow {
  name: string;
  code: string;
  shipping_profile_type: string | null;
  service_zone_name: string | null;
  provider_id: string | null;
  price_amount: string | number | null;
  data: Record<string, unknown> | null;
}

interface SeedInventoryRow {
  handle: string;
  sku: string | null;
  manage_inventory: boolean;
  inventory_item_id: string | null;
  requires_shipping: boolean | null;
  stocked_quantity: string | number | null;
}

const shippingProfileTypeByFulfillmentMode = Object.fromEntries(
  medusaSeedShippingProfiles.map((profile) => [profile.key, profile.type])
) as Record<FulfillmentMode, string>;

const collectionHandleByFulfillmentMode: Record<FulfillmentMode, string> = {
  "fresh-local": "fresh-local-harvest",
  "shelf-stable-shipping": "shelf-stable-pantry",
  "supplement-shipping": "functional-mushroom-products",
  "subscription-preorder": "subscription-boxes",
  "wholesale-preorder": "restaurant-wholesale"
};

function requireCondition(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function asNumber(value: string | number | null) {
  return typeof value === "number" ? value : Number(value ?? 0);
}

function assertArrayMetadata(
  metadata: Record<string, unknown>,
  key: string,
  expected: string[],
  product: Product
) {
  const value = metadata[key];

  requireCondition(
    Array.isArray(value) && JSON.stringify(value) === JSON.stringify(expected),
    `${product.name} metadata.${key} did not match the shared seed data.`
  );
}

function assertShippingOptionMetadata(
  data: Record<string, unknown>,
  option: (typeof medusaSeedShippingOptions)[number]
) {
  const expected = buildMedusaShippingOptionData(option);

  for (const [key, expectedValue] of Object.entries(expected)) {
    requireCondition(
      JSON.stringify(data[key]) === JSON.stringify(expectedValue),
      `${option.name} data.${key} did not match the shared seed data.`
    );
  }
}

async function verifySeed() {
  const databaseUrl = process.env.DATABASE_URL;

  requireCondition(Boolean(databaseUrl), "DATABASE_URL is required to verify the Medusa seed.");

  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    const categoryResult = await client.query<{ handle: string }>(
      "select handle from product_category where deleted_at is null order by handle"
    );
    const collectionResult = await client.query<{ handle: string }>(
      "select handle from product_collection where deleted_at is null order by handle"
    );
    const shippingProfileResult = await client.query<{ type: string }>(
      "select type from shipping_profile where deleted_at is null order by type"
    );
    const regionResult = await client.query<SeedRegionRow>(
      `
        select
          r.id,
          r.name,
          r.currency_code,
          array_remove(array_agg(rc.iso_2), null) as country_codes
        from region r
        left join region_country rc
          on rc.region_id = r.id
          and rc.deleted_at is null
        where r.name = $1
          and r.deleted_at is null
        group by r.id, r.name, r.currency_code
      `,
      [medusaSeedRegion.name]
    );
    const publishableKeyResult = await client.query<SeedApiKeyRow>(
      `
        select
          ak.title,
          ak.token,
          count(distinct pksc.sales_channel_id) as sales_channel_count
        from api_key ak
        left join publishable_api_key_sales_channel pksc
          on pksc.publishable_key_id = ak.id
          and pksc.deleted_at is null
        where ak.title = $1
          and ak.type = 'publishable'
          and ak.revoked_at is null
          and ak.deleted_at is null
        group by ak.id, ak.title, ak.token
      `,
      [process.env.MEDUSA_SEED_PUBLISHABLE_KEY_TITLE ?? "Maury River Storefront Publishable Key"]
    );
    const productResult = await client.query<SeedProductRow>(`
      select
        p.id,
        p.handle,
        p.title,
        p.status,
        p.metadata,
        pc.handle as collection_handle,
        sp.type as shipping_profile_type,
        array_remove(array_agg(distinct pcat.handle), null) as category_handles,
        count(distinct pv.id) as variant_count,
        count(distinct price.id) as price_count,
        max(price.amount) as price_amount
      from product p
      left join product_collection pc on pc.id = p.collection_id and pc.deleted_at is null
      left join product_shipping_profile psp on psp.product_id = p.id and psp.deleted_at is null
      left join shipping_profile sp on sp.id = psp.shipping_profile_id and sp.deleted_at is null
      left join product_category_product pcp on pcp.product_id = p.id
      left join product_category pcat on pcat.id = pcp.product_category_id and pcat.deleted_at is null
      left join product_variant pv on pv.product_id = p.id and pv.deleted_at is null
      left join product_variant_price_set pvps on pvps.variant_id = pv.id and pvps.deleted_at is null
      left join price on price.price_set_id = pvps.price_set_id and price.deleted_at is null
      where p.external_id like 'mrmf:%'
        and p.deleted_at is null
      group by p.id, p.handle, p.title, p.status, p.metadata, pc.handle, sp.type
      order by p.handle
    `);
    const shippingOptionResult = await client.query<SeedShippingOptionRow>(`
      select
        so.name,
        sot.code,
        sp.type as shipping_profile_type,
        sz.name as service_zone_name,
        so.provider_id,
        max(price.amount) as price_amount,
        so.data
      from shipping_option so
      left join shipping_option_type sot on sot.id = so.shipping_option_type_id
      left join shipping_profile sp on sp.id = so.shipping_profile_id and sp.deleted_at is null
      left join service_zone sz on sz.id = so.service_zone_id and sz.deleted_at is null
      left join shipping_option_price_set sops on sops.shipping_option_id = so.id and sops.deleted_at is null
      left join price on price.price_set_id = sops.price_set_id and price.deleted_at is null
      where so.deleted_at is null
        and so.name = any($1)
      group by so.id, so.name, sot.code, sp.type, sz.name, so.provider_id, so.data
      order by so.name
    `, [medusaSeedShippingOptions.map((option) => option.name)]);
    const inventoryResult = await client.query<SeedInventoryRow>(`
      select
        p.handle,
        pv.sku,
        pv.manage_inventory,
        ii.id as inventory_item_id,
        ii.requires_shipping,
        il.stocked_quantity
      from product p
      join product_variant pv on pv.product_id = p.id and pv.deleted_at is null
      left join product_variant_inventory_item pvii
        on pvii.variant_id = pv.id
        and pvii.deleted_at is null
      left join inventory_item ii
        on ii.id = pvii.inventory_item_id
        and ii.deleted_at is null
      left join inventory_level il
        on il.inventory_item_id = ii.id
        and il.deleted_at is null
      where p.external_id like 'mrmf:%'
        and p.deleted_at is null
      order by p.handle
    `);

    const categoryHandles = new Set(categoryResult.rows.map((row) => row.handle));
    const collectionHandles = new Set(collectionResult.rows.map((row) => row.handle));
    const shippingProfileTypes = new Set(shippingProfileResult.rows.map((row) => row.type));
    const productRows = new Map(productResult.rows.map((row) => [row.handle, row]));
    const region = regionResult.rows[0];
    const shippingOptionRows = new Map(shippingOptionResult.rows.map((row) => [row.name, row]));
    const inventoryRows = new Map(inventoryResult.rows.map((row) => [row.sku, row]));
    const publishableKey = publishableKeyResult.rows[0];

    for (const category of medusaSeedCategories) {
      requireCondition(
        categoryHandles.has(category.handle),
        `Missing Medusa product category ${category.handle}.`
      );
    }

    for (const collection of medusaSeedCollections) {
      requireCondition(
        collectionHandles.has(collection.handle),
        `Missing Medusa product collection ${collection.handle}.`
      );
    }

    for (const profile of medusaSeedShippingProfiles) {
      requireCondition(
        shippingProfileTypes.has(profile.type),
        `Missing Medusa shipping profile ${profile.type}.`
      );
    }

    requireCondition(Boolean(region), `Missing Medusa region ${medusaSeedRegion.name}.`);
    requireCondition(
      region!.currency_code === medusaSeedRegion.currencyCode,
      "Seeded Medusa region currency mismatch."
    );
    for (const countryCode of medusaSeedRegion.countries) {
      requireCondition(
        (region!.country_codes ?? []).includes(countryCode),
        `Seeded Medusa region is missing country ${countryCode}.`
      );
    }

    for (const option of medusaSeedShippingOptions) {
      const row = shippingOptionRows.get(option.name);
      const profileType = shippingProfileTypeByFulfillmentMode[option.shippingProfileKey];
      const serviceZone = medusaSeedServiceZones.find(
        (zone) => zone.key === option.serviceZoneKey
      );

      requireCondition(Boolean(row), `Missing Medusa shipping option ${option.name}.`);
      requireCondition(row!.code === option.code, `${option.name} code mismatch.`);
      requireCondition(
        row!.shipping_profile_type === profileType,
        `${option.name} shipping profile mismatch.`
      );
      requireCondition(
        row!.service_zone_name === serviceZone?.name,
        `${option.name} service zone mismatch.`
      );
      requireCondition(
        row!.provider_id === (process.env.MEDUSA_SEED_FULFILLMENT_PROVIDER_ID ?? "manual_manual"),
        `${option.name} fulfillment provider mismatch.`
      );
      requireCondition(
        asNumber(row!.price_amount) === option.amount,
        `${option.name} price mismatch.`
      );
      assertShippingOptionMetadata(row!.data ?? {}, option);
      requireCondition(
        !(option.isParcel && option.shippingProfileKey === "fresh-local"),
        `${option.name} must not attach parcel shipping to the fresh-local shipping profile.`
      );
    }

    requireCondition(Boolean(publishableKey), "Missing storefront publishable API key.");
    requireCondition(
      publishableKey!.token.startsWith("pk_"),
      "Storefront publishable API key should use a pk_ token."
    );
    requireCondition(
      asNumber(publishableKey!.sales_channel_count) >= 1,
      "Storefront publishable API key is not linked to a sales channel."
    );

    requireCondition(
      productRows.size === products.length,
      `Expected ${products.length} Maury River products, found ${productRows.size}.`
    );

    for (const spec of buildMedusaInventorySpecs()) {
      const row = inventoryRows.get(spec.sku);

      requireCondition(Boolean(row), `Missing product variant for inventory SKU ${spec.sku}.`);
      requireCondition(
        row!.manage_inventory === spec.manageInventory,
        `${spec.title} manage_inventory mismatch.`
      );

      if (spec.manageInventory) {
        requireCondition(
          Boolean(row!.inventory_item_id),
          `${spec.title} is missing a linked inventory item.`
        );
        requireCondition(
          row!.requires_shipping === spec.requiresShipping,
          `${spec.title} inventory requires_shipping mismatch.`
        );
        requireCondition(
          asNumber(row!.stocked_quantity) === spec.stockedQuantity,
          `${spec.title} stocked quantity mismatch.`
        );
      }
    }

    for (const product of products) {
      const row = productRows.get(product.slug);
      const fulfillmentMode = classifyProductFulfillment(product);

      requireCondition(Boolean(row), `Missing Medusa product ${product.slug}.`);
      requireCondition(row!.title === product.name, `${product.name} title mismatch.`);
      requireCondition(row!.status === "published", `${product.name} should be published.`);
      requireCondition(
        row!.collection_handle === collectionHandleByFulfillmentMode[fulfillmentMode],
        `${product.name} collection mismatch.`
      );
      requireCondition(
        row!.shipping_profile_type === shippingProfileTypeByFulfillmentMode[fulfillmentMode],
        `${product.name} shipping profile mismatch.`
      );
      requireCondition(
        (row!.category_handles ?? []).includes(product.category),
        `${product.name} category link mismatch.`
      );
      requireCondition(asNumber(row!.variant_count) >= 1, `${product.name} is missing variants.`);
      requireCondition(asNumber(row!.price_count) >= 1, `${product.name} is missing prices.`);
      requireCondition(
        asNumber(row!.price_amount) === product.price,
        `${product.name} price mismatch.`
      );

      const metadata = row!.metadata ?? {};

      requireCondition(metadata.species !== undefined, `${product.name} is missing species metadata.`);
      assertArrayMetadata(metadata, "species", product.species, product);
      requireCondition(
        metadata.product_format === product.productFormat,
        `${product.name} product format metadata mismatch.`
      );
      requireCondition(
        metadata.fulfillment_mode === fulfillmentMode,
        `${product.name} fulfillment mode metadata mismatch.`
      );
      requireCondition(
        metadata.inventory_status === product.inventoryStatus,
        `${product.name} inventory status metadata mismatch.`
      );
      requireCondition(
        metadata.visibility_status === product.visibilityStatus,
        `${product.name} visibility status metadata mismatch.`
      );
      assertArrayMetadata(metadata, "cooking_methods", product.cookingMethods, product);
      assertArrayMetadata(metadata, "pairings", product.pairings, product);
      assertArrayMetadata(metadata, "related_recipes", product.relatedRecipes, product);
      assertArrayMetadata(metadata, "related_species_page", product.relatedSpeciesPage, product);

      if (product.supplementDisclaimer) {
        requireCondition(
          metadata.supplement_disclaimer === product.supplementDisclaimer,
          `${product.name} supplement disclaimer metadata mismatch.`
        );
      }

      if (product.productFormat === "fresh") {
        requireCondition(
          metadata.shippable === false,
          `${product.name} is fresh and must not be shippable.`
        );
      }
    }
  } finally {
    await client.end();
  }

  console.log(
    `Verified Maury River Medusa seed: ${products.length} products, ${medusaSeedCategories.length} categories, ${medusaSeedCollections.length} collections, ${medusaSeedShippingProfiles.length} shipping profiles, ${medusaSeedShippingOptions.length} shipping options, one local region, storefront publishable API key, and ${buildMedusaInventorySpecs().filter((spec) => spec.manageInventory).length} managed inventory variants.`
  );
}

void verifySeed();
