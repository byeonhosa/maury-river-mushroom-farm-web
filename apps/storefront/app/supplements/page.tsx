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
          Supplement content is scaffolded for future launch with conservative educational language,
          clear disclaimers, and owner/legal review. No product should claim to diagnose, treat,
          cure, prevent, or mitigate disease.
        </p>
      </PageHero>
      <section className="mrmf-shell mrmf-section">
        <div className="mrmf-card mb-8 border-brand-burnt p-5 text-sm leading-7">
          <p className="font-subheading text-xs font-extrabold uppercase tracking-[0.14em] text-brand-mahogany">
            Requires legal/business review
          </p>
          <p className="mt-2">{SUPPLEMENT_DISCLAIMER}</p>
        </div>
        <div className="mrmf-panel mb-8 grid gap-4 p-5 md:grid-cols-3">
          <div>
            <h2 className="font-heading text-3xl">Current status</h2>
            <p className="mt-2 text-sm leading-7">
              Supplement listings are coming-soon content until final labels, packaging, supplement
              facts, and policies are reviewed.
            </p>
          </div>
          <div>
            <h2 className="font-heading text-3xl">Customer path</h2>
            <p className="mt-2 text-sm leading-7">
              Customers can join notify-me updates, but checkout remains blocked until the product
              is explicitly approved for sale.
            </p>
          </div>
          <div>
            <h2 className="font-heading text-3xl">Language rule</h2>
            <p className="mt-2 text-sm leading-7">
              Keep copy factual and cautious. Any structure/function language must be reviewed before launch.
            </p>
          </div>
        </div>
        <ProductGrid products={products} />
      </section>
    </>
  );
}
