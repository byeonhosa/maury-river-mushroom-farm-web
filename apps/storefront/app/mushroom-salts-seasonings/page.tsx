import { PageHero } from "../../components/page-hero";
import { ProductGrid } from "../../components/product-grid";
import { listProductsByCategory } from "../../lib/products";

export default function MushroomSaltsPage() {
  return (
    <>
      <PageHero eyebrow="Mushroom salts & seasonings" title="Mushroom flavor for everyday cooking.">
        <p>
          Seasoning products help customers bring local mushroom depth to potatoes, eggs, soups,
          popcorn, vegetables, and proteins even between fresh harvests.
        </p>
      </PageHero>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <ProductGrid products={listProductsByCategory("salts-seasonings")} />
      </section>
    </>
  );
}
