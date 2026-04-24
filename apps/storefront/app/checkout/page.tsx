import { CheckoutClient } from "../../components/checkout-client";
import { PageHero } from "../../components/page-hero";
import { listProducts } from "../../lib/products";

export default async function CheckoutPage() {
  const products = await listProducts();

  return (
    <>
      <PageHero eyebrow="Checkout" title="Confirm fulfillment before payment goes live.">
        <p>
          This staged checkout collects contact details, validates pickup or shipping choices, and
          keeps live payment disabled until policies, Stripe, and fulfillment settings are approved.
        </p>
      </PageHero>
      <CheckoutClient products={products} />
    </>
  );
}
