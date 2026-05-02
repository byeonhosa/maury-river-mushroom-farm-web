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
          Fresh mushrooms are picked for flavor, texture, and quick cooking. They are pickup,
          market pickup, local-delivery, or preorder products by default, and they are not
          shippable unless the owner explicitly approves a future cold-chain process.
        </p>
      </PageHero>
      <section className="mrmf-shell mrmf-section">
        <LocalFulfillmentCallout />
        <div className="mrmf-panel mt-6 grid gap-4 p-5 md:grid-cols-3">
          <div>
            <h2 className="font-heading text-3xl">Buy for the week</h2>
            <p className="mt-2 text-sm leading-7">
              Choose mushrooms by cooking plan: lion's mane for searing, oysters for quick
              skillet meals, or mixed boxes for variety.
            </p>
          </div>
          <div>
            <h2 className="font-heading text-3xl">Store cold</h2>
            <p className="mt-2 text-sm leading-7">
              Keep fresh mushrooms refrigerated in breathable packaging and cook delicate
              varieties first.
            </p>
          </div>
          <div>
            <h2 className="font-heading text-3xl">Ask when unsure</h2>
            <p className="mt-2 text-sm leading-7">
              Availability changes with the grow room. Use notify-me or the inquiry form for
              harvest timing questions.
            </p>
          </div>
        </div>
        <div className="mt-8">
          <ProductGrid products={products} />
        </div>
      </section>
    </>
  );
}
