import { products, summarizeCartFulfillment } from "@mrmf/shared";
import { LocalFulfillmentCallout } from "../../components/local-fulfillment-callout";
import { PageHero } from "../../components/page-hero";
import { ProductGrid } from "../../components/product-grid";

export default function ShopPage() {
  const fulfillmentSummary = summarizeCartFulfillment(products);

  return (
    <>
      <PageHero eyebrow="Shop" title="Mushrooms, pantry products, and chef inquiries.">
        <p>
          Browse the initial product catalog. Checkout will later connect to Medusa while preserving
          the fresh-local and shelf-stable shipping rules tested in the shared package.
        </p>
      </PageHero>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <LocalFulfillmentCallout />
        <p className="mt-5 border border-brand-mahogany/20 bg-brand-ivory p-4 text-sm leading-7">
          {fulfillmentSummary.message}
        </p>
        <div className="mt-8">
          <ProductGrid products={products} />
        </div>
      </section>
    </>
  );
}
