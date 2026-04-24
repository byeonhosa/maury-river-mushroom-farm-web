import {
  pickupLocations,
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
});
