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
          Subscription products will depend on production cadence, pickup windows, and customer communication.
          The initial scaffold starts with the mixed gourmet box as the subscription-ready product concept.
        </p>
      </PageHero>
      <section className="mrmf-shell mrmf-section">
        <ProductGrid products={subscriptionProducts} />
      </section>
    </>
  );
}
