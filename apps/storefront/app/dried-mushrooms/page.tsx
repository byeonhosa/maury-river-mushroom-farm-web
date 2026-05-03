import { PageHero } from "../../components/page-hero";
import { ProductGrid } from "../../components/product-grid";
import { listProductsByCategory } from "../../lib/products";

export default async function DriedMushroomsPage() {
  const products = await listProductsByCategory("dried-mushrooms");

  return (
    <>
      <PageHero eyebrow="Dried mushrooms" title="Pantry mushrooms for deeper broths and sauces.">
        <p>
          Dried mushrooms are the bridge between harvest weeks and pantry cooking. Rehydrate
          them for broth, sauces, beans, risotto, ramen, and any dish that needs local mushroom
          depth after the fresh harvest is gone.
        </p>
      </PageHero>
      <section className="mrmf-shell mrmf-section">
        <div className="mrmf-panel mb-8 grid gap-4 p-5 md:grid-cols-3">
          <div>
            <h2 className="font-heading text-3xl">How to use</h2>
            <p className="mt-2 text-sm leading-7">
              Soak in hot water, chop the mushrooms, and strain the soaking liquid before adding it
              to soups, rice, beans, or sauces.
            </p>
          </div>
          <div>
            <h2 className="font-heading text-3xl">How to store</h2>
            <p className="mt-2 text-sm leading-7">
              Keep dried mushrooms sealed, dry, and away from light. Moisture is the enemy.
            </p>
          </div>
          <div>
            <h2 className="font-heading text-3xl">Fulfillment</h2>
            <p className="mt-2 text-sm leading-7">
              Shelf-stable products may be configured for shipping once packaging, policy, and
              inventory details are final.
            </p>
          </div>
        </div>
        <ProductGrid products={products} />
      </section>
    </>
  );
}
