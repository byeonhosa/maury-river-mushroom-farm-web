import { getProductsByCategory, SUPPLEMENT_DISCLAIMER } from "@mrmf/shared";
import { PageHero } from "../../components/page-hero";
import { ProductGrid } from "../../components/product-grid";

export default function SupplementsPage() {
  return (
    <>
      <PageHero eyebrow="Supplements" title="Functional mushroom products with careful language.">
        <p>
          Supplement content is scaffolded with conservative structure/function language and must be
          reviewed before launch. No product should claim to diagnose, treat, cure, prevent, or mitigate disease.
        </p>
      </PageHero>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 border border-brand-burnt bg-brand-ivory p-5 text-sm leading-7">
          <p className="font-subheading text-xs font-extrabold uppercase tracking-[0.14em] text-brand-burnt">
            Requires legal/business review
          </p>
          <p className="mt-2">{SUPPLEMENT_DISCLAIMER}</p>
        </div>
        <ProductGrid products={getProductsByCategory("supplements")} />
      </section>
    </>
  );
}
