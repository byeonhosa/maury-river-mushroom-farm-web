import { SUPPLEMENT_DISCLAIMER } from "@mrmf/shared";
import { PageHero } from "../../components/page-hero";
import { ProductGrid } from "../../components/product-grid";
import { listProductsByCategory } from "../../lib/products";

export default async function SupplementsPage() {
  const products = await listProductsByCategory("supplements");

  return (
    <>
      <PageHero eyebrow="Supplements" title="Functional mushroom products with careful language.">
        <p>
          Supplement content is scaffolded with conservative structure/function language and must be
          reviewed before launch. No product should claim to diagnose, treat, cure, prevent, or mitigate disease.
        </p>
      </PageHero>
      <section className="mrmf-shell mrmf-section">
        <div className="mrmf-card mb-8 border-brand-burnt p-5 text-sm leading-7">
          <p className="font-subheading text-xs font-extrabold uppercase tracking-[0.14em] text-brand-mahogany">
            Requires legal/business review
          </p>
          <p className="mt-2">{SUPPLEMENT_DISCLAIMER}</p>
        </div>
        <ProductGrid products={products} />
      </section>
    </>
  );
}
