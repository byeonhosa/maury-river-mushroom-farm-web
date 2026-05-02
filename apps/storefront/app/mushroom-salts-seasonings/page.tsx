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
          popcorn, vegetables, beans, and quick weeknight meals even between fresh harvests.
        </p>
      </PageHero>
      <section className="mrmf-shell mrmf-section">
        <div className="mrmf-panel mb-8 grid gap-4 p-5 md:grid-cols-3">
          <div>
            <h2 className="font-heading text-3xl">Finish</h2>
            <p className="mt-2 text-sm leading-7">
              Use a small pinch at the table on potatoes, eggs, popcorn, roasted vegetables, or
              tomato juice.
            </p>
          </div>
          <div>
            <h2 className="font-heading text-3xl">Cook</h2>
            <p className="mt-2 text-sm leading-7">
              Add early for savory background or late for a stronger mushroom-salt edge.
            </p>
          </div>
          <div>
            <h2 className="font-heading text-3xl">Launch note</h2>
            <p className="mt-2 text-sm leading-7">
              Final seasoning recipes, labels, packaging, and stock levels still need owner review.
            </p>
          </div>
        </div>
        <ProductGrid products={products} />
      </section>
    </>
  );
}
