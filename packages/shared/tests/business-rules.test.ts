import {
  canShipProduct,
  classifyProductFulfillment,
  getProductBySlug,
  hasFreshShippingApproval,
  products,
  summarizeCartFulfillment,
  validateProductFulfillment
} from "../src";
import { describe, expect, it } from "vitest";

describe("fulfillment business rules", () => {
  it("keeps fresh products local-only by default", () => {
    const freshProducts = products.filter((product) => product.productFormat === "fresh");

    expect(freshProducts.length).toBeGreaterThan(0);
    expect(freshProducts.every((product) => product.shippable === false)).toBe(true);
    expect(freshProducts.every((product) => !product.fulfillment.includes("shipping"))).toBe(
      true
    );
  });

  it("allows shelf-stable products to be shippable when explicitly configured", () => {
    const mushroomSalt = getProductBySlug("mushroom-salt");

    expect(mushroomSalt).toBeDefined();
    expect(canShipProduct(mushroomSalt!)).toBe(true);
  });

  it("reports no seed fulfillment errors", () => {
    expect(validateProductFulfillment(products)).toEqual([]);
  });

  it("blocks accidental fresh shipping until there is explicit approval metadata", () => {
    const fresh = getProductBySlug("fresh-lions-mane");

    expect(fresh).toBeDefined();

    const accidentallyShippable = {
      ...fresh!,
      shippable: true,
      fulfillment: [...fresh!.fulfillment, "shipping" as const]
    };

    expect(hasFreshShippingApproval(accidentallyShippable)).toBe(false);
    expect(validateProductFulfillment([accidentallyShippable])).toEqual([
      "Fresh Lion's Mane is fresh and must not be marked shippable without a documented owner approval.",
      "Fresh Lion's Mane is fresh and must not include shipping fulfillment without a documented owner approval."
    ]);
  });

  it("requires complete approval metadata before fresh shipping is considered deliberate", () => {
    const fresh = getProductBySlug("fresh-lions-mane");

    expect(fresh).toBeDefined();

    const explicitlyApproved = {
      ...fresh!,
      shippable: true,
      fulfillment: [...fresh!.fulfillment, "shipping" as const],
      freshShippingApproval: {
        approvedBy: "Owner",
        approvedAt: "2026-04-24",
        reason: "Documented cold-chain shipping pilot approval."
      }
    };

    expect(hasFreshShippingApproval(explicitlyApproved)).toBe(true);
    expect(validateProductFulfillment([explicitlyApproved])).toEqual([]);
  });

  it("classifies product fulfillment by commerce role", () => {
    expect(classifyProductFulfillment(getProductBySlug("blue-oyster-mushrooms")!)).toBe(
      "fresh-local"
    );
    expect(classifyProductFulfillment(getProductBySlug("mushroom-salt")!)).toBe(
      "shelf-stable-shipping"
    );
    expect(classifyProductFulfillment(getProductBySlug("lions-mane-capsules")!)).toBe(
      "supplement-shipping"
    );
    expect(classifyProductFulfillment(getProductBySlug("chefs-weekly-mushroom-mix")!)).toBe(
      "wholesale-preorder"
    );
  });

  it("explains mixed carts clearly", () => {
    const fresh = getProductBySlug("fresh-lions-mane");
    const shelfStable = getProductBySlug("mushroom-salt");

    expect(fresh).toBeDefined();
    expect(shelfStable).toBeDefined();
    expect(summarizeCartFulfillment([fresh!, shelfStable!])).toMatchObject({
      type: "mixed"
    });
  });
});
