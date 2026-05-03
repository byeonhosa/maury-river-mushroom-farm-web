import { SUPPLEMENT_DISCLAIMER, speciesPages } from "@mrmf/shared";
import Link from "next/link";
import { PageHero } from "../../components/page-hero";

export default function HealthFunctionalMushroomsPage() {
  return (
    <>
      <PageHero eyebrow="Health & functional mushrooms" title="Education first, claims reviewed.">
        <p>
          This section is intentionally cautious. It can explain culinary uses, product formats,
          storage, labeling status, and general structure/function positioning only after owner
          and legal/business review.
        </p>
      </PageHero>
      <section className="mrmf-shell mrmf-section">
        <div className="mrmf-card border-brand-burnt p-5 text-sm leading-7">
          <p className="font-subheading text-xs font-extrabold uppercase tracking-[0.14em] text-brand-mahogany">
            Legal/business review required
          </p>
          <p className="mt-2">{SUPPLEMENT_DISCLAIMER}</p>
        </div>
        <div className="mrmf-panel mt-8 grid gap-4 p-5 md:grid-cols-3">
          <div>
            <h2 className="font-heading text-3xl">What belongs here</h2>
            <p className="mt-2 text-sm leading-7">
              Functional mushroom pages can describe formats, flavor, preparation, storage, and
              launch status without promising health outcomes.
            </p>
          </div>
          <div>
            <h2 className="font-heading text-3xl">What does not</h2>
            <p className="mt-2 text-sm leading-7">
              The site must not claim that mushrooms diagnose, treat, cure, prevent, or mitigate
              any disease.
            </p>
          </div>
          <div>
            <h2 className="font-heading text-3xl">Next step</h2>
            <p className="mt-2 text-sm leading-7">
              Use notify-me only until final product formats, labels, disclaimers, and owner review
              are complete.
            </p>
          </div>
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
