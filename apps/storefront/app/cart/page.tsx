import { informationalModeMessage } from "@mrmf/shared";
import Link from "next/link";

import { CartClient } from "../../components/cart-client";
import { PageHero } from "../../components/page-hero";
import { listProducts } from "../../lib/products";
import { informationalModeEnabled } from "../../lib/site-mode";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  if (informationalModeEnabled()) {
    return (
      <>
        <PageHero eyebrow="Cart" title="Online ordering is paused.">
          <p>{informationalModeMessage}</p>
        </PageHero>
        <section className="mrmf-shell mrmf-section">
          <div className="mrmf-card max-w-2xl p-6">
            <h2 className="font-heading text-3xl">Browse and stay in touch</h2>
            <p className="mt-3 text-sm leading-7">
              You can explore the full catalog, learn about each mushroom, and sign up to be
              notified about returning and coming-soon items. Online checkout will return in a
              later phase.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/shop" className="mrmf-button-primary">
                Browse the shop
              </Link>
              <Link href="/mushrooms" className="mrmf-button-secondary">
                Mushroom catalog
              </Link>
              <Link href="/markets-pickup" className="mrmf-button-secondary">
                Find us at market
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  const products = await listProducts();

  return (
    <>
      <PageHero eyebrow="Cart" title="Review mushrooms by fulfillment path.">
        <p>
          The cart prices each line, keeps product fulfillment metadata attached, and warns when
          fresh local-only items need pickup, delivery, preorder, or a split order.
        </p>
      </PageHero>
      <CartClient products={products} />
    </>
  );
}
