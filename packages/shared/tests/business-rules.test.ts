import {
  canShipProduct,
  getProductBySlug,
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
