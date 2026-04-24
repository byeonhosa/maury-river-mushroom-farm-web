import { products } from "@mrmf/shared";
import { PageHero } from "../../components/page-hero";
import { ProductGrid } from "../../components/product-grid";

export default function SubscriptionsPage() {
  const subscriptionProducts = products.filter(
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
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <ProductGrid products={subscriptionProducts} />
      </section>
    </>
  );
}
