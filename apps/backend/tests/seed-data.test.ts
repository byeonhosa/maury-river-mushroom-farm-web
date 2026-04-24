import { products, validateProductFulfillment } from "@mrmf/shared";
import { describe, expect, it } from "vitest";

describe("backend seed data contract", () => {
  it("has initial products ready for Medusa mapping", () => {
    expect(products).toHaveLength(10);
    expect(validateProductFulfillment(products)).toEqual([]);
  });
});
