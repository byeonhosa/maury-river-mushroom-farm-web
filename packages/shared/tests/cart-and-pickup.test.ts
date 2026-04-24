import {
  getProductBySlug,
  medusaProductToCommerceProduct,
  pickupLocations,
  summarizeCommerceCart,
  summarizeCart,
  validatePickupSelection
} from "../src";
import { describe, expect, it } from "vitest";

describe("cart and pickup commerce rules", () => {
  it("summarizes line prices and mixed fulfillment restrictions", () => {
    const summary = summarizeCart([
      { productSlug: "fresh-lions-mane", quantity: 2 },
      { productSlug: "mushroom-salt", quantity: 1 }
    ]);

    expect(summary.lines).toHaveLength(2);
    expect(summary.subtotal).toBe(40);
    expect(summary.fulfillmentType).toBe("mixed");
    expect(summary.restrictions).toContain(
      "Mixed carts must separate local pickup or delivery items from shipped shelf-stable items before live checkout."
    );
  });

  it("keeps quote-only chef products out of paid checkout", () => {
    const summary = summarizeCart([
      { productSlug: "chefs-weekly-mushroom-mix", quantity: 1 }
    ]);

    expect(summary.subtotal).toBe(0);
    expect(summary.restrictions).toContain(
      "Quote-only products cannot enter paid checkout until pricing is confirmed."
    );
  });

  it("defines provisional pickup locations and validates selections", () => {
    expect(pickupLocations.map((location) => location.slug)).toEqual([
      "farm-pickup",
      "lexington-farmers-market-pickup",
      "natural-bridge-local-market-pickup"
    ]);

    expect(
      validatePickupSelection({
        locationSlug: "farm-pickup",
        windowLabel: "Provisional farm pickup",
        allowedFulfillmentTypes: ["farm-pickup", "farmers-market-pickup"]
      })
    ).toMatchObject({ valid: true });

    expect(
      validatePickupSelection({
        locationSlug: "farm-pickup",
        windowLabel: "Provisional farm pickup",
        allowedFulfillmentTypes: ["shipping"]
      })
    ).toMatchObject({ valid: false });
  });

  it("summarizes Medusa-backed products with the same mixed-cart restrictions", () => {
    const fresh = medusaProductToCommerceProduct({
      id: "prod_fresh_lions_mane",
      handle: "fresh-lions-mane",
      metadata: {
        fulfillment: [
          "farm-pickup",
          "farmers-market-pickup",
          "local-delivery",
          "local-preorder",
          "shipping"
        ],
        shippable: true
      }
    });
    const salt = medusaProductToCommerceProduct({
      id: "prod_mushroom_salt",
      handle: "mushroom-salt"
    });
    const summary = summarizeCommerceCart([
      { product: fresh, quantity: 1 },
      { product: salt, quantity: 1 }
    ]);

    expect(fresh.source).toBe("medusa");
    expect(fresh.shippable).toBe(false);
    expect(fresh.fulfillmentMode).toBe("fresh-local");
    expect(summary.fulfillmentType).toBe("mixed");
    expect(summary.restrictions).toContain(
      "Mixed carts must separate local pickup or delivery items from shipped shelf-stable items before live checkout."
    );
  });

  it("normalizes Medusa snake_case metadata into the storefront product contract", () => {
    const seed = getProductBySlug("mushroom-salt");

    expect(seed).toBeDefined();

    const product = medusaProductToCommerceProduct({
      id: "prod_mushroom_salt",
      handle: "mushroom-salt",
      title: "Mushroom Salt",
      metadata: {
        product_format: "seasoning",
        flavor_profile: "Savory test profile.",
        cooking_methods: ["finish"],
        storage_instructions: "Keep dry.",
        shelf_life: "Test shelf life.",
        related_recipes: ["mushroom-salt-roasted-potatoes"],
        related_species_page: ["blue-oyster"],
        visibility_status: "published"
      }
    });

    expect(product.metadata).toMatchObject({
      productFormat: "seasoning",
      flavorProfile: "Savory test profile.",
      cookingMethods: ["finish"],
      storageInstructions: "Keep dry.",
      shelfLife: "Test shelf life.",
      relatedRecipes: ["mushroom-salt-roasted-potatoes"],
      relatedSpeciesPage: ["blue-oyster"],
      visibilityStatus: "published"
    });
  });
});
