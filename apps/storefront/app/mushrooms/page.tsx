import {
  availabilityStateBehaviors,
  getWeeklyAvailabilityNotificationCta,
  speciesPages,
} from "@mrmf/shared";
import Link from "next/link";

import { NotificationSignupForm } from "../../components/notification-signup-form";
import { PageHero } from "../../components/page-hero";

export default function MushroomCatalogPage() {
  return (
    <>
      <PageHero eyebrow="Mushroom catalog" title="The farm's full mushroom catalog.">
        <p>
          This catalog separates what the farm grows or may grow from what is currently available
          for checkout. Coming-soon and research species are educational placeholders until the
          owner confirms launch availability.
        </p>
      </PageHero>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {speciesPages.map((species) => {
            const availability = availabilityStateBehaviors[species.availabilityState];

            return (
              <Link
                key={species.slug}
                href={`/mushrooms/${species.slug}`}
                className="block border border-brand-mahogany/20 bg-brand-ivory p-5 transition hover:border-brand-mahogany"
              >
                <div className="flex flex-wrap gap-2">
                  <span className="bg-brand-ebony px-3 py-1 font-subheading text-[0.7rem] font-bold uppercase tracking-[0.12em] text-brand-ivory">
                    {species.code}
                  </span>
                  <span className="bg-brand-mahogany px-3 py-1 font-subheading text-[0.7rem] font-bold uppercase tracking-[0.12em] text-brand-ivory">
                    {availability.label}
                  </span>
                </div>
                <h2 className="mt-4 font-heading text-3xl">{species.name}</h2>
                <p className="mt-3 text-sm leading-7">{species.overview}</p>
                <p className="mt-4 font-subheading text-xs font-bold uppercase tracking-[0.12em] text-brand-ebony">
                  {species.catalogStatus}
                </p>
              </Link>
            );
          })}
        </div>
        <div className="mt-8 max-w-3xl">
          <NotificationSignupForm
            cta={getWeeklyAvailabilityNotificationCta("/mushrooms")}
          />
        </div>
      </section>
    </>
  );
}
