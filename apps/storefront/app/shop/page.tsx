import { getWeeklyAvailabilityNotificationCta, summarizeCommerceCart } from "@mrmf/shared";
import { LocalFulfillmentCallout } from "../../components/local-fulfillment-callout";
import { NotificationSignupForm } from "../../components/notification-signup-form";
import { PageHero } from "../../components/page-hero";
import { ProductGrid } from "../../components/product-grid";
import { getProductCatalog } from "../../lib/products";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const catalog = await getProductCatalog();
  const products = catalog.products;
  const sampleProducts = ["fresh-lions-mane", "mushroom-salt"]
    .map((slug) => products.find((product) => product.slug === slug))
    .filter((product): product is (typeof products)[number] => Boolean(product));
  const fulfillmentSummary = summarizeCommerceCart(
    sampleProducts.map((product) => ({ product, quantity: 1 }))
  );

  return (
    <>
      <PageHero eyebrow="Shop" title="Mushrooms, pantry products, and chef inquiries.">
        <p>
          Browse the initial product catalog. Checkout will later connect to Medusa while preserving
          the fresh-local and shelf-stable shipping rules tested in the shared package.
        </p>
      </PageHero>
      <section className="mrmf-shell mrmf-section">
        <LocalFulfillmentCallout />
        <p className="mrmf-card mt-5 p-4 text-sm leading-7">
          Fresh harvest products stay local by default, while dried, seasoning,
          and supplement products can be prepared for shipping when enabled.
          {" "}
          {fulfillmentSummary.warnings[0]}
        </p>
        <div className="mt-5 max-w-3xl">
          <NotificationSignupForm
            cta={getWeeklyAvailabilityNotificationCta("/shop")}
          />
        </div>
        <div className="mt-8">
          <ProductGrid products={products} />
        </div>
      </section>
    </>
  );
}
