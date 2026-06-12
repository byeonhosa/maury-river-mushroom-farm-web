import { describe, expect, it } from "vitest";

import {
  availabilityTierInfo,
  availabilityTiers,
  getProductBySlug,
  groupSpeciesByTier,
  isInformationalMode,
  resolveProductAvailability,
  shouldShowProductInShop,
  speciesPages
} from "../src";

describe("availability tiers", () => {
  it("defines exactly the five owner-approved tiers", () => {
    expect([...availabilityTiers]).toEqual([
      "year-round",
      "in-rotation-now",
      "returning",
      "wholesale-only",
      "functional-coming-later"
    ]);
    for (const tier of availabilityTiers) {
      expect(availabilityTierInfo[tier].label.length).toBeGreaterThan(0);
      expect(availabilityTierInfo[tier].description.length).toBeGreaterThan(0);
    }
  });

  it("groups species into ordered, non-empty tier buckets", () => {
    const groups = groupSpeciesByTier(speciesPages);

    expect(groups.map((group) => group.tier)).toEqual([
      "year-round",
      "in-rotation-now",
      "returning",
      "wholesale-only",
      "functional-coming-later"
    ]);

    const byTier = Object.fromEntries(
      groups.map((group) => [group.tier, group.species.map((species) => species.slug)])
    );

    expect(byTier["year-round"]).toEqual([
      "blue-oyster",
      "lion-s-mane",
      "shiitake",
      "chestnut"
    ]);
    expect(byTier["in-rotation-now"]).toEqual(["pink-oyster", "white-oyster"]);
    expect(byTier["wholesale-only"]).toEqual(["golden-oyster"]);
    expect(byTier["functional-coming-later"]).toEqual(["reishi", "turkey-tail"]);
    // The 9 returning species default in until the owner flags them in-rotation.
    expect(byTier["returning"]).toContain("black-king-oyster");
    expect(byTier["returning"]).toContain("golden-enoki");
    expect(byTier["returning"]).toContain("white-enoki");
    expect(byTier["returning"]).toHaveLength(9);
  });

  it("adds the new species and retires King Blue and Elm Oyster", () => {
    const slugs = new Set(speciesPages.map((species) => species.slug));

    for (const slug of [
      "black-king-oyster",
      "beech",
      "nameko",
      "golden-enoki",
      "white-enoki"
    ]) {
      expect(slugs.has(slug)).toBe(true);
    }
    expect(slugs.has("king-blue")).toBe(false);
    expect(slugs.has("elm-oyster")).toBe(false);
    expect(slugs.has("enoki")).toBe(false);
    expect(speciesPages).toHaveLength(18);
  });
});

describe("golden oyster wholesale-only rule (D16)", () => {
  const goldenOyster = getProductBySlug("golden-oyster-mushrooms");

  it("is wholesale-only, hidden from the retail shop, and not cartable", () => {
    expect(goldenOyster).toBeDefined();
    expect(goldenOyster!.inventoryStatus).toBe("wholesale-only");
    expect(shouldShowProductInShop(goldenOyster!)).toBe(false);

    const availability = resolveProductAvailability(goldenOyster!);
    expect(availability.canAddToCart).toBe(false);
    expect(availability.showWholesaleCta).toBe(true);
  });
});

describe("real-world prices (D15)", () => {
  it("prices fresh staples and rotating fresh products at $7 per 4 oz", () => {
    for (const slug of [
      "fresh-lions-mane",
      "blue-oyster-mushrooms",
      "pink-oyster-mushrooms",
      "white-oyster-mushrooms"
    ]) {
      const product = getProductBySlug(slug);
      expect(product?.price).toBe(7);
      expect(product?.unitSize).toContain("4 oz");
    }
  });

  it("prices mushroom salt and dried mushrooms at $7", () => {
    expect(getProductBySlug("mushroom-salt")?.price).toBe(7);
    expect(getProductBySlug("dried-oyster-mushrooms")?.price).toBe(7);
  });

  it("corrects the lion's mane supplement to $15 and keeps it notify-me only", () => {
    const capsules = getProductBySlug("lions-mane-capsules");
    expect(capsules?.price).toBe(15);
    expect(capsules?.unitSize).toContain("30");

    const availability = resolveProductAvailability(capsules!);
    expect(availability.canAddToCart).toBe(false);
    expect(availability.showNotifyMeLater).toBe(true);
  });
});

describe("informational mode flag", () => {
  it("is enabled only when an informational-mode env value is the string \"true\"", () => {
    expect(isInformationalMode({ NEXT_PUBLIC_INFORMATIONAL_MODE: "true" })).toBe(true);
    expect(isInformationalMode({ INFORMATIONAL_MODE: "true" })).toBe(true);
    expect(isInformationalMode({ NEXT_PUBLIC_INFORMATIONAL_MODE: "false" })).toBe(false);
    expect(isInformationalMode({})).toBe(false);
    expect(isInformationalMode()).toBe(false);
  });
});
