import { LocalFulfillmentCallout } from "../../components/local-fulfillment-callout";
import { PageHero } from "../../components/page-hero";
import { ProductGrid } from "../../components/product-grid";
import { listProductsByCategory } from "../../lib/products";

export default async function FreshMushroomsPage() {
  const products = await listProductsByCategory("fresh-mushrooms");

  return (
    <>
      <PageHero eyebrow="Fresh mushrooms" title="Local harvest, handled like produce.">
        <p>
          Fresh mushrooms are pickup, local-delivery, or preorder products by default. They are not
          shippable unless the owner explicitly approves a future cold-chain process.
        </p>
      </PageHero>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <LocalFulfillmentCallout />
        <div className="mt-8">
          <ProductGrid products={products} />
        </div>
      </section>
    </>
  );
}
