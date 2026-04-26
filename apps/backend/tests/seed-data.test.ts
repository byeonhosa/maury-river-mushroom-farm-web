import { products, validateProductFulfillment } from "@mrmf/shared";
import { describe, expect, it } from "vitest";

import {
  buildMedusaInventorySpecs,
  buildMedusaProductMetadata,
  buildMedusaProductPayloads,
  buildMedusaShippingOptionData,
  buildMedusaShippingOptionRules,
  medusaSeedCategories,
  medusaSeedCollections,
  medusaSeedRegion,
  medusaSeedShippingProfiles,
  medusaSeedShippingOptions
} from "../src/scripts/medusa-seed-data";

describe("backend seed data contract", () => {
  it("has initial products ready for Medusa mapping", () => {
    expect(products).toHaveLength(10);
    expect(validateProductFulfillment(products)).toEqual([]);
  });

  it("defines categories, collections, and shipping profiles for the commerce catalog", () => {
    expect(medusaSeedCategories.map((category) => category.handle)).toEqual([
      "fresh-mushrooms",
      "dried-mushrooms",
      "salts-seasonings",
      "supplements",
      "subscriptions",
      "restaurant-wholesale"
    ]);
    expect(medusaSeedCollections.map((collection) => collection.handle)).toContain(
      "fresh-local-harvest"
    );
    expect(medusaSeedShippingProfiles.map((profile) => profile.key)).toEqual([
      "fresh-local",
      "shelf-stable-shipping",
      "supplement-shipping",
      "subscription-preorder",
      "wholesale-preorder"
    ]);
  });

  it("defines a local development region and safe shipping options", () => {
    expect(medusaSeedRegion).toMatchObject({
      name: "Maury River Local Development Region",
      currencyCode: "usd",
      countries: ["us"]
    });
    expect(medusaSeedShippingOptions.map((option) => option.key)).toEqual([
      "farm-pickup",
      "lexington-farmers-market-pickup",
      "natural-bridge-local-market-pickup",
      "fresh-local-delivery",
      "fresh-local-preorder",
      "shelf-stable-parcel",
      "supplement-parcel",
      "subscription-preorder-pickup",
      "chef-preorder-coordination"
    ]);
    expect(
      medusaSeedShippingOptions
        .filter((option) => option.isParcel)
        .map((option) => option.shippingProfileKey)
    ).toEqual(["shelf-stable-shipping", "supplement-shipping"]);
    expect(
      medusaSeedShippingOptions.some(
        (option) => option.isParcel && option.shippingProfileKey === "fresh-local"
      )
    ).toBe(false);

    const shelfStableParcel = medusaSeedShippingOptions.find(
      (option) => option.key === "shelf-stable-parcel"
    );
    const farmPickup = medusaSeedShippingOptions.find((option) => option.key === "farm-pickup");

    expect(shelfStableParcel).toBeDefined();
    expect(farmPickup).toBeDefined();
    expect(buildMedusaShippingOptionData(shelfStableParcel!)).toMatchObject({
      fulfillment_type: "shipping",
      allowed_fulfillment_modes: ["shelf-stable-shipping"],
      rejected_fulfillment_modes: [
        "fresh-local",
        "supplement-shipping",
        "subscription-preorder",
        "wholesale-preorder"
      ],
      mrmf_native_rule_scope: "shelf-stable-shipping",
      native_rules_required: true,
      blocks_mixed_fulfillment_modes: true,
      blocks_fresh_products: true,
      is_parcel: true
    });
    expect(buildMedusaShippingOptionRules(shelfStableParcel!)).toEqual([
      {
        attribute: "is_return",
        operator: "eq",
        value: "false"
      },
      {
        attribute: "enabled_in_store",
        operator: "eq",
        value: "true"
      },
      {
        attribute: "mrmf_cart_fulfillment_scope",
        operator: "eq",
        value: "shelf-stable-shipping"
      }
    ]);
    expect(buildMedusaShippingOptionData(farmPickup!)).toMatchObject({
      fulfillment_type: "farm-pickup",
      allowed_fulfillment_modes: ["fresh-local"],
      blocks_fresh_products: false,
      requires_pickup_window: true
    });
  });

  it("maps every seed product to a Medusa payload with rich mushroom metadata", () => {
    const payloads = buildMedusaProductPayloads({
      categoryIdByKey: {
        "fresh-mushrooms": "pcat_fresh",
        "dried-mushrooms": "pcat_dried",
        "salts-seasonings": "pcat_salts",
        supplements: "pcat_supplements",
        subscriptions: "pcat_subscriptions",
        "restaurant-wholesale": "pcat_wholesale",
        "grow-kits": undefined
      },
      collectionIdByKey: {
        "fresh-local-harvest": "pcol_fresh",
        "shelf-stable-pantry": "pcol_pantry",
        "functional-mushroom-products": "pcol_functional",
        "subscription-boxes": "pcol_subscriptions",
        "restaurant-wholesale": "pcol_wholesale"
      },
      shippingProfileIdByKey: {
        "fresh-local": "sp_fresh",
        "shelf-stable-shipping": "sp_pantry",
        "supplement-shipping": "sp_supplements",
        "subscription-preorder": "sp_subscriptions",
        "wholesale-preorder": "sp_wholesale"
      },
      salesChannelId: "sc_storefront"
    });

    expect(payloads).toHaveLength(10);
    expect(payloads.every((payload) => payload.options?.[0]?.title === "Unit")).toBe(true);
    expect(payloads.every((payload) => payload.variants?.[0]?.prices?.[0]?.currency_code === "usd")).toBe(true);
    expect(payloads.find((payload) => payload.handle === "fresh-lions-mane")?.variants?.[0]).toMatchObject({
      sku: "MRMF-FRESH-LIONS-MANE",
      manage_inventory: true
    });
    expect(payloads.find((payload) => payload.handle === "fresh-lions-mane")).toMatchObject({
      shipping_profile_id: "sp_fresh",
      collection_id: "pcol_fresh"
    });
    expect(payloads.find((payload) => payload.handle === "lions-mane-capsules")).toMatchObject({
      shipping_profile_id: "sp_supplements",
      collection_id: "pcol_functional"
    });
  });

  it("preserves fulfillment, cooking, storage, species, and supplement metadata", () => {
    const capsules = products.find((product) => product.slug === "lions-mane-capsules");

    expect(capsules).toBeDefined();

    const metadata = buildMedusaProductMetadata(capsules!);

    expect(metadata).toMatchObject({
      mrmf_slug: "lions-mane-capsules",
      product_format: "capsule",
      fulfillment_mode: "supplement-shipping",
      parcel_shipping_eligible: true,
      inventory_status: "coming-soon"
    });
    expect(metadata.species).toEqual(["lion-s-mane"]);
    expect(metadata.supplement_disclaimer).toContain(
      "not intended to diagnose, treat, cure, or prevent any disease"
    );
  });

  it("defines inventory specs for Medusa-managed product variants", () => {
    const inventorySpecs = buildMedusaInventorySpecs();

    expect(inventorySpecs).toHaveLength(10);
    expect(inventorySpecs.find((spec) => spec.productSlug === "blue-oyster-mushrooms")).toMatchObject({
      sku: "MRMF-BLUE-OYSTER-MUSHROOMS",
      manageInventory: true,
      fulfillmentMode: "fresh-local",
      parcelShippingEligible: false,
      localOnly: true,
      stockedQuantity: 50
    });
    expect(inventorySpecs.find((spec) => spec.productSlug === "mushroom-salt")).toMatchObject({
      manageInventory: true,
      fulfillmentMode: "shelf-stable-shipping",
      parcelShippingEligible: true,
      stockedQuantity: 0
    });
    expect(inventorySpecs.find((spec) => spec.productSlug === "chefs-weekly-mushroom-mix")).toMatchObject({
      manageInventory: false,
      stockedQuantity: 12
    });
  });
});
