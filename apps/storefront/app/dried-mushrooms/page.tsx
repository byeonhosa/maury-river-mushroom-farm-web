import { PageHero } from "../../components/page-hero";
import { ProductGrid } from "../../components/product-grid";
import { listProductsByCategory } from "../../lib/products";

export default async function DriedMushroomsPage() {
  const products = await listProductsByCategory("dried-mushrooms");

  return (
    <>
      <PageHero eyebrow="Dried mushrooms" title="Pantry mushrooms for deeper broths and sauces.">
        <p>
          Dried mushrooms are shelf-stable and may be configured for shipping once packaging,
          inventory, and checkout rules are finalized.
        </p>
      </PageHero>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <ProductGrid products={products} />
      </section>
    </>
  );
}
