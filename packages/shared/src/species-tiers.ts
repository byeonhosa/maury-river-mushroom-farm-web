import type { AvailabilityTier, SpeciesPage } from "./types";

export const availabilityTiers = [
  "year-round",
  "in-rotation-now",
  "returning",
  "wholesale-only",
  "functional-coming-later"
] as const satisfies readonly AvailabilityTier[];

export interface AvailabilityTierInfo {
  tier: AvailabilityTier;
  /** Short badge text. */
  label: string;
  /** One-line plain-English explanation for section subheads and tooltips. */
  description: string;
  /** Grouping/sort order, lowest first. */
  order: number;
}

export const availabilityTierInfo: Record<AvailabilityTier, AvailabilityTierInfo> = {
  "year-round": {
    tier: "year-round",
    label: "Year-round",
    description:
      "Grown all year. These are the staples you can usually count on finding from the farm.",
    order: 0
  },
  "in-rotation-now": {
    tier: "in-rotation-now",
    label: "In rotation now",
    description:
      "Fruiting in the current harvest rotation, so these are the rotating species available right now.",
    order: 1
  },
  returning: {
    tier: "returning",
    label: "Returning",
    description:
      "Grown on a rotating schedule. Not in the current harvest, but they come back, so sign up to hear when they return.",
    order: 2
  },
  "wholesale-only": {
    tier: "wholesale-only",
    label: "Wholesale only",
    description:
      "Grown for professional kitchens rather than retail customers. Restaurants can inquire for current availability.",
    order: 3
  },
  "functional-coming-later": {
    tier: "functional-coming-later",
    label: "Functional — coming later",
    description:
      "Grown for future functional products and shown as display pieces at the farm's market tables. Not sold as fresh cooking mushrooms today.",
    order: 4
  }
};

export function getAvailabilityTierInfo(tier: AvailabilityTier): AvailabilityTierInfo {
  return availabilityTierInfo[tier];
}

export function isAvailabilityTier(value: unknown): value is AvailabilityTier {
  return availabilityTiers.includes(value as AvailabilityTier);
}

export interface SpeciesTierGroup {
  tier: AvailabilityTier;
  info: AvailabilityTierInfo;
  species: SpeciesPage[];
}

/**
 * Group species into ordered tier buckets for catalog rendering. Empty tiers
 * are omitted. Species order within a tier is preserved from the input.
 */
export function groupSpeciesByTier(species: SpeciesPage[]): SpeciesTierGroup[] {
  return availabilityTiers
    .map((tier) => ({
      tier,
      info: availabilityTierInfo[tier],
      species: species.filter((entry) => entry.availabilityTier === tier)
    }))
    .filter((group) => group.species.length > 0);
}
