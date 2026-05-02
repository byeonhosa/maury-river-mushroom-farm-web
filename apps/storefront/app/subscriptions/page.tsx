import { PageHero } from "../../components/page-hero";
import { ProductGrid } from "../../components/product-grid";
import { listProducts } from "../../lib/products";

export default async function SubscriptionsPage() {
  const subscriptionProducts = (await listProducts()).filter(
    (product) => product.category === "subscriptions" || product.slug === "mixed-gourmet-mushroom-box"
  );

  return (
    <>
      <PageHero eyebrow="Subscriptions" title="CSA-style boxes for recurring fresh harvests.">
        <p>
          CSA-style boxes should make weekly cooking easier without promising harvest volume before
          the grow room confirms it. The initial concept starts with a mixed gourmet box built around
          preorder communication and local fulfillment.
        </p>
      </PageHero>
      <section className="mrmf-shell mrmf-section">
        <div className="mrmf-panel mb-8 grid gap-4 p-5 md:grid-cols-3">
          <div>
            <h2 className="font-heading text-3xl">Best for</h2>
            <p className="mt-2 text-sm leading-7">
              Home cooks who want a rotating mix, simple recipe ideas, and a reason to cook fresh
              mushrooms every week.
            </p>
          </div>
          <div>
            <h2 className="font-heading text-3xl">How it works</h2>
            <p className="mt-2 text-sm leading-7">
              The farm confirms the weekly mix and pickup or delivery timing before fulfillment.
            </p>
          </div>
          <div>
            <h2 className="font-heading text-3xl">Not shipping</h2>
            <p className="mt-2 text-sm leading-7">
              Fresh boxes remain local-only unless a future owner-approved cold-chain process is added.
            </p>
          </div>
        </div>
        <ProductGrid products={subscriptionProducts} />
      </section>
    </>
  );
}
