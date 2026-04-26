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
      <section className="mrmf-shell mrmf-section">
        <div className="mrmf-card border-brand-burnt p-5 text-sm leading-7">
          <p className="font-subheading text-xs font-extrabold uppercase tracking-[0.14em] text-brand-mahogany">
            Legal/business review required
          </p>
          <p className="mt-2">{SUPPLEMENT_DISCLAIMER}</p>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {speciesPages
            .filter((species) => species.functionalNote)
            .map((species) => (
              <Link key={species.slug} href={`/mushrooms/${species.slug}`} className="mrmf-card p-6 transition hover:-translate-y-1 hover:shadow-lifted">
                <h2 className="font-heading text-3xl">{species.name}</h2>
                <p className="mt-3 text-sm leading-7">{species.functionalNote}</p>
              </Link>
            ))}
        </div>
      </section>
    </>
  );
}
