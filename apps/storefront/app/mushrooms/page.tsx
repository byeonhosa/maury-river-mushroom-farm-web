import {
  availabilityStateBehaviors,
  getWeeklyAvailabilityNotificationCta,
  groupSpeciesByTier,
  speciesPages,
} from "@mrmf/shared";
import Link from "next/link";

import { NotificationSignupForm } from "../../components/notification-signup-form";
import { PageHero } from "../../components/page-hero";
import { SpeciesTierBadge } from "../../components/species-tier-badge";

export default function MushroomCatalogPage() {
  const tierGroups = groupSpeciesByTier(speciesPages);

  return (
    <>
      <PageHero eyebrow="Mushroom catalog" title="The farm's full mushroom catalog.">
        <p>
          The catalog is organized by how the farm grows each species across the season: year-round
          staples, what is in rotation right now, rotating species that are returning, wholesale-only
          mushrooms, and functional species grown for future products. Sign up to hear when a
          returning or coming-soon species is back.
        </p>
      </PageHero>
      <section className="mrmf-shell mrmf-section space-y-12">
        {tierGroups.map((group) => (
          <div key={group.tier}>
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-heading text-4xl">{group.info.label}</h2>
                <SpeciesTierBadge tier={group.tier} />
              </div>
              <p className="mt-2 text-sm leading-7">{group.info.description}</p>
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {group.species.map((species) => {
                const availability = availabilityStateBehaviors[species.availabilityState];

                return (
                  <Link
                    key={species.slug}
                    href={`/mushrooms/${species.slug}`}
                    className="mrmf-card block p-5 transition hover:-translate-y-1 hover:shadow-lifted"
                  >
                    <div className="flex flex-wrap gap-2">
                      <span className="mrmf-badge-ebony">{species.code}</span>
                      <SpeciesTierBadge tier={species.availabilityTier} />
                      <span className="mrmf-badge-mahogany">{availability.label}</span>
                    </div>
                    <h3 className="mt-4 font-heading text-3xl">{species.name}</h3>
                    <p className="mt-3 text-sm leading-7">{species.overview}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
        <div className="max-w-3xl">
          <NotificationSignupForm cta={getWeeklyAvailabilityNotificationCta("/mushrooms")} />
        </div>
      </section>
    </>
  );
}
