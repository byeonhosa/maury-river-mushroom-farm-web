import { describe, expect, it } from "vitest";

import {
  buildMrmfShippingOptionsContext,
  normalizeFulfillmentMode
} from "../src/lib/mrmf-shipping-context";

describe("MRMF Medusa shipping option context", () => {
  it("scopes fresh carts to fresh-local native shipping rules", () => {
    expect(buildMrmfShippingOptionsContext(["fresh-local"])).toMatchObject({
      mrmf_cart_fulfillment_scope: "fresh-local",
      mrmf_cart_has_fresh: "true",
      mrmf_cart_has_parcel_eligible: "false",
      mrmf_cart_is_mixed: "false"
    });
  });

  it("scopes shippable pantry carts to the shelf-stable parcel profile", () => {
    expect(buildMrmfShippingOptionsContext(["shelf-stable-shipping"])).toMatchObject({
      mrmf_cart_fulfillment_scope: "shelf-stable-shipping",
      mrmf_cart_has_fresh: "false",
      mrmf_cart_has_parcel_eligible: "true",
      mrmf_cart_is_mixed: "false"
    });
  });

  it("marks mixed fulfillment carts as restricted for native option filtering", () => {
    expect(
      buildMrmfShippingOptionsContext(["fresh-local", "shelf-stable-shipping"])
    ).toMatchObject({
      mrmf_cart_fulfillment_scope: "mixed-restricted",
      mrmf_cart_has_fresh: "true",
      mrmf_cart_has_parcel_eligible: "true",
      mrmf_cart_is_mixed: "true"
    });
  });

  it("normalizes only supported seeded fulfillment modes", () => {
    expect(normalizeFulfillmentMode("supplement-shipping")).toBe("supplement-shipping");
    expect(normalizeFulfillmentMode("shipping")).toBeUndefined();
  });
});

