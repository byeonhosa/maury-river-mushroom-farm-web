import {
  contactFormSchema,
  getProductBySlug,
  policyPages,
  products,
  SUPPLEMENT_DISCLAIMER,
  wholesaleInquirySchema
} from "../src";
import { describe, expect, it } from "vitest";

describe("forms and required content", () => {
  it("validates basic contact input server-side", () => {
    const result = contactFormSchema.safeParse({
      name: "Ada Customer",
      email: "ada@example.com",
      subject: "Fresh pickup",
      message: "I want to ask about this week's mushroom pickup window."
    });

    expect(result.success).toBe(true);
  });

  it("rejects incomplete wholesale inquiries", () => {
    const result = wholesaleInquirySchema.safeParse({
      restaurantName: "Kitchen",
      contactName: "Chef",
      email: "not-an-email",
      weeklyVolume: "",
      productsInterestedIn: "oysters"
    });

    expect(result.success).toBe(false);
  });

  it("keeps the supplement disclaimer on supplement products", () => {
    const supplements = products.filter((product) => product.category === "supplements");

    expect(supplements.length).toBeGreaterThan(0);
    expect(
      supplements.every((product) => product.supplementDisclaimer === SUPPLEMENT_DISCLAIMER)
    ).toBe(true);
    expect(getProductBySlug("lions-mane-capsules")?.supplementDisclaimer).toContain(
      "not intended to diagnose, treat, cure, or prevent any disease"
    );
  });

  it("defines the required policy pages", () => {
    expect(policyPages.map((policy) => policy.slug).sort()).toEqual([
      "privacy-policy",
      "refund-policy",
      "shipping-pickup-policy",
      "terms-and-conditions"
    ]);
    expect(policyPages.every((policy) => policy.requiresLegalReview)).toBe(true);
  });
});
