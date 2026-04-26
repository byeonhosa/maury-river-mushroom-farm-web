import {
  canAddCommerceProductToCart,
  availabilityStates,
  getProductBySlug,
  getCommerceProductAvailability,
  getCartSupportedFulfillmentTypes,
  filterSafeCommerceShippingOptions,
  medusaProductToCommerceProduct,
  pickupLocations,
  resolveProductAvailability,
  shouldShowProductInShop,
  speciesPages,
  summarizeCommerceCart,
  summarizeCart,
  validateCheckout,
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

  it("blocks checkout when fresh products are assigned parcel shipping", () => {
    const fresh = medusaProductToCommerceProduct({
      id: "prod_fresh_lions_mane",
      handle: "fresh-lions-mane"
    });
    const summary = summarizeCommerceCart([{ product: fresh, quantity: 1 }]);
    const validation = validateCheckout({
      cart: summary,
      contact: {
        name: "Test Customer",
        email: "customer@example.com",
        phone: "540-555-0100"
      },
      fulfillment: {
        type: "shipping",
        shippingAddress: "123 Test Street"
      },
      policyAccepted: true
    });

    expect(validation.canProceed).toBe(false);
    expect(validation.errors).toContain(
      "The selected fulfillment option is not available for every item in the cart."
    );
    expect(validation.errors).toContain(
      "Fresh and local-only products cannot use parcel shipping. Choose pickup, local delivery, or split the order."
    );
  });

  it("filters Store API shipping options through shared fulfillment metadata", () => {
    const fresh = medusaProductToCommerceProduct({
      id: "prod_fresh_lions_mane",
      handle: "fresh-lions-mane"
    });
    const salt = medusaProductToCommerceProduct({
      id: "prod_mushroom_salt",
      handle: "mushroom-salt",
      metadata: {
        inventory_status: "available"
      }
    });
    const options = [
      {
        id: "so_pickup",
        name: "Farm pickup",
        data: {
          fulfillment_type: "farm-pickup" as const,
          allowed_fulfillment_modes: ["fresh-local" as const],
          mrmf_native_rule_scope: "fresh-local" as const,
          is_parcel: false
        }
      },
      {
        id: "so_parcel",
        name: "Shelf-stable parcel shipping",
        data: {
          fulfillment_type: "shipping" as const,
          allowed_fulfillment_modes: ["shelf-stable-shipping" as const],
          rejected_fulfillment_modes: ["fresh-local" as const],
          mrmf_native_rule_scope: "shelf-stable-shipping" as const,
          is_parcel: true
        }
      }
    ];

    expect(
      filterSafeCommerceShippingOptions([{ product: fresh, quantity: 1 }], options).map(
        (option) => option.id
      )
    ).toEqual(["so_pickup"]);
    expect(
      filterSafeCommerceShippingOptions([{ product: salt, quantity: 1 }], options).map(
        (option) => option.id
      )
    ).toEqual(["so_parcel"]);
    expect(
      filterSafeCommerceShippingOptions(
        [
          { product: fresh, quantity: 1 },
          { product: salt, quantity: 1 }
        ],
        options
      )
    ).toEqual([]);
  });

  it("requires pickup location and window for local fresh checkout", () => {
    const fresh = medusaProductToCommerceProduct({
      id: "prod_fresh_lions_mane",
      handle: "fresh-lions-mane"
    });
    const summary = summarizeCommerceCart([{ product: fresh, quantity: 1 }]);

    expect(getCartSupportedFulfillmentTypes(summary)).toEqual([
      "farm-pickup",
      "farmers-market-pickup",
      "local-delivery",
      "local-preorder"
    ]);

    const missingPickup = validateCheckout({
      cart: summary,
      contact: {
        name: "Test Customer",
        email: "customer@example.com",
        phone: "540-555-0100"
      },
      fulfillment: {
        type: "farm-pickup"
      },
      policyAccepted: true
    });

    expect(missingPickup.canProceed).toBe(false);
    expect(missingPickup.errors).toContain("Select a valid pickup location.");

    const validPickup = validateCheckout({
      cart: summary,
      contact: {
        name: "Test Customer",
        email: "customer@example.com",
        phone: "540-555-0100"
      },
      fulfillment: {
        type: "farm-pickup",
        pickupLocationSlug: "farm-pickup",
        pickupWindowLabel: "Provisional farm pickup"
      },
      policyAccepted: true
    });

    expect(validPickup.canProceed).toBe(true);
  });

  it("keeps mixed carts blocked until fulfillment is split", () => {
    const fresh = medusaProductToCommerceProduct({
      id: "prod_fresh_lions_mane",
      handle: "fresh-lions-mane"
    });
    const salt = medusaProductToCommerceProduct({
      id: "prod_mushroom_salt",
      handle: "mushroom-salt"
    });
    const summary = summarizeCommerceCart([
      { product: fresh, quantity: 1 },
      { product: salt, quantity: 1 }
    ]);
    const validation = validateCheckout({
      cart: summary,
      contact: {
        name: "Test Customer",
        email: "customer@example.com",
        phone: "540-555-0100"
      },
      fulfillment: {
        type: "farm-pickup",
        pickupLocationSlug: "farm-pickup",
        pickupWindowLabel: "Provisional farm pickup"
      },
      policyAccepted: true
    });

    expect(validation.canProceed).toBe(false);
    expect(validation.errors).toContain(
      "Mixed carts must be split into local pickup or delivery items and shippable shelf-stable items before checkout."
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

  it("blocks coming-soon and sold-out products from cartable checkout", () => {
    const comingSoon = medusaProductToCommerceProduct({
      id: "prod_mushroom_salt",
      handle: "mushroom-salt"
    });
    const soldOut = medusaProductToCommerceProduct({
      id: "prod_sold_out",
      handle: "blue-oyster-mushrooms",
      metadata: {
        inventory_status: "sold-out"
      }
    });
    const summary = summarizeCommerceCart([
      { product: comingSoon, quantity: 1 },
      { product: soldOut, quantity: 1 }
    ]);

    expect(canAddCommerceProductToCart(comingSoon)).toBe(false);
    expect(canAddCommerceProductToCart(soldOut)).toBe(false);
    expect(getCommerceProductAvailability(comingSoon)).toMatchObject({
      label: "Coming soon",
      canAddToCart: false,
      blocksCheckout: true
    });
    expect(getCommerceProductAvailability(soldOut)).toMatchObject({
      label: "Sold out",
      canAddToCart: false,
      blocksCheckout: true
    });
    expect(summary.restrictions.join(" ")).toContain(
      "Mushroom Salt, Blue Oyster Mushrooms cannot be checked out"
    );
  });

  it("defines the full master mushroom species catalog without making every species cartable", () => {
    expect(speciesPages.map((species) => species.code)).toEqual([
      "LM",
      "BO",
      "GO",
      "PO",
      "WO",
      "EO",
      "KB",
      "KT",
      "PP",
      "CNT",
      "STK",
      "MTK",
      "TT",
      "RSH",
      "CDY",
      "ENK"
    ]);
    expect(speciesPages.filter((species) => species.requiresLegalReview).map((species) => species.code)).toEqual([
      "LM",
      "TT",
      "RSH",
      "CDY"
    ]);
    expect(speciesPages.filter((species) => species.availabilityState === "coming-soon").length).toBeGreaterThan(8);
  });

  it("documents all availability states and their safe storefront behavior", () => {
    expect(availabilityStates).toEqual([
      "available",
      "low-stock",
      "sold-out",
      "coming-soon",
      "seasonal",
      "preorder",
      "hidden",
      "wholesale-only",
      "inquiry-only"
    ]);

    const base = {
      name: "Catalog Placeholder",
      fulfillment: ["farm-pickup" as const],
      category: "fresh-mushrooms" as const,
      visibilityStatus: "published" as const
    };

    expect(
      resolveProductAvailability({
        ...base,
        inventoryStatus: "hidden",
        availability: { state: "hidden" }
      })
    ).toMatchObject({ showInShop: false, showInCatalog: false, canAddToCart: false });
    expect(
      resolveProductAvailability({
        ...base,
        inventoryStatus: "available",
        availability: { state: "available", availableQuantity: 0 }
      })
    ).toMatchObject({ showInShop: true, canAddToCart: false });
    expect(
      resolveProductAvailability({
        ...base,
        inventoryStatus: "low-stock",
        availability: { state: "low-stock", availableQuantity: 3 }
      })
    ).toMatchObject({ label: "Low stock", canAddToCart: true });
  });

  it("allows seasonal products with harvest messaging and preorder products only through preorder fulfillment", () => {
    const seasonal = medusaProductToCommerceProduct({
      id: "prod_fresh_lions_mane",
      handle: "fresh-lions-mane"
    });
    const preorder = medusaProductToCommerceProduct({
      id: "prod_mixed_box",
      handle: "mixed-gourmet-mushroom-box"
    });
    const preorderWithoutFlow = medusaProductToCommerceProduct({
      id: "prod_bad_preorder",
      handle: "mushroom-salt",
      metadata: {
        inventory_status: "preorder",
        fulfillment: ["shipping"]
      }
    });

    expect(getCommerceProductAvailability(seasonal)).toMatchObject({
      label: "Seasonal harvest",
      canAddToCart: true
    });
    expect(getCommerceProductAvailability(preorder)).toMatchObject({
      label: "Preorder",
      canAddToCart: true,
      isPreorder: true
    });
    expect(getCommerceProductAvailability(preorderWithoutFlow)).toMatchObject({
      label: "Preorder pending",
      canAddToCart: false,
      blocksCheckout: true
    });
  });

  it("routes wholesale-only and inquiry-only products to CTAs instead of cart", () => {
    const wholesale = medusaProductToCommerceProduct({
      id: "prod_chef_mix",
      handle: "chefs-weekly-mushroom-mix"
    });
    const inquiryOnly = medusaProductToCommerceProduct({
      id: "prod_inquiry",
      handle: "blue-oyster-mushrooms",
      metadata: {
        availability_state: "inquiry-only",
        inquiry_only: true
      }
    });

    expect(getCommerceProductAvailability(wholesale)).toMatchObject({
      label: "Wholesale only",
      canAddToCart: false,
      showWholesaleCta: true
    });
    expect(getCommerceProductAvailability(inquiryOnly)).toMatchObject({
      label: "Inquiry only",
      canAddToCart: false,
      showInquiryCta: true
    });
  });

  it("excludes hidden products from public shop filtering", () => {
    const hidden = medusaProductToCommerceProduct({
      id: "prod_hidden",
      handle: "blue-oyster-mushrooms",
      metadata: {
        availability_state: "hidden",
        public_visibility: "hidden"
      }
    });

    expect(shouldShowProductInShop(hidden)).toBe(false);
    expect(canAddCommerceProductToCart(hidden)).toBe(false);
  });
});
