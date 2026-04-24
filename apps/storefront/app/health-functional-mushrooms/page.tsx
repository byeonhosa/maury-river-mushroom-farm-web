import { SUPPLEMENT_DISCLAIMER, speciesPages } from "@mrmf/shared";
import Link from "next/link";
import { PageHero } from "../../components/page-hero";

export default function HealthFunctionalMushroomsPage() {
  return (
    <>
      <PageHero eyebrow="Health & functional mushrooms" title="Education first, claims reviewed.">
        <p>
          This section is intentionally cautious. It can explain traditional culinary use, product formats,
          and general structure/function positioning only after review.
        </p>
      </PageHero>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="border border-brand-burnt bg-brand-ivory p-5 text-sm leading-7">
          <p className="font-subheading text-xs font-extrabold uppercase tracking-[0.14em] text-brand-burnt">
            Legal/business review required
          </p>
          <p className="mt-2">{SUPPLEMENT_DISCLAIMER}</p>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {speciesPages
            .filter((species) => species.functionalNote)
            .map((species) => (
              <Link key={species.slug} href={`/mushrooms/${species.slug}`} className="border border-brand-mahogany/20 bg-brand-ivory p-6 shadow-soft">
                <h2 className="font-heading text-3xl">{species.name}</h2>
                <p className="mt-3 text-sm leading-7">{species.functionalNote}</p>
              </Link>
            ))}
        </div>
      </section>
    </>
  );
}
