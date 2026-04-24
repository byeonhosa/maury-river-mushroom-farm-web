import { products, validateProductFulfillment } from "@mrmf/shared";
import { describe, expect, it } from "vitest";

import {
  buildMedusaProductMetadata,
  buildMedusaProductPayloads,
  medusaSeedCategories,
  medusaSeedCollections,
  medusaSeedShippingProfiles
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
      inventory_status: "coming-soon"
    });
    expect(metadata.species).toEqual(["lion-s-mane"]);
    expect(metadata.supplement_disclaimer).toContain(
      "not intended to diagnose, treat, cure, or prevent any disease"
    );
  });
});
