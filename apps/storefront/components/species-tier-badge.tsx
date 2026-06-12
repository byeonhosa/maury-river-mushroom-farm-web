import { availabilityTierInfo, type AvailabilityTier } from "@mrmf/shared";

const tierBadgeClass: Record<AvailabilityTier, string> = {
  "year-round": "mrmf-badge-ebony",
  "in-rotation-now": "mrmf-badge-burnt",
  returning: "mrmf-badge-mahogany",
  "wholesale-only": "mrmf-badge-light",
  "functional-coming-later": "mrmf-badge-light",
};

export function SpeciesTierBadge({ tier }: { tier: AvailabilityTier }) {
  const info = availabilityTierInfo[tier];

  return (
    <span className={tierBadgeClass[tier]} title={info.description}>
      {info.label}
    </span>
  );
}
