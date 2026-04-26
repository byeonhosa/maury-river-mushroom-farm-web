import { PageHero } from "../../components/page-hero";
import { ProductGrid } from "../../components/product-grid";
import { listProductsByCategory } from "../../lib/products";

export default async function MushroomSaltsPage() {
  const products = await listProductsByCategory("salts-seasonings");

  return (
    <>
      <PageHero eyebrow="Mushroom salts & seasonings" title="Mushroom flavor for everyday cooking.">
        <p>
          Seasoning products help customers bring local mushroom depth to potatoes, eggs, soups,
          popcorn, vegetables, and proteins even between fresh harvests.
        </p>
      </PageHero>
      <section className="mrmf-shell mrmf-section">
        <ProductGrid products={products} />
      </section>
    </>
  );
}
