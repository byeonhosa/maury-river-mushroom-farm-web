import { resolveCheckoutModeConfig } from "@mrmf/shared";

import { CheckoutClient } from "../../components/checkout-client";
import { PageHero } from "../../components/page-hero";
import { listProducts } from "../../lib/products";

export default async function CheckoutPage() {
  const products = await listProducts();
  const checkoutMode = resolveCheckoutModeConfig(process.env);

  return (
    <>
      <PageHero eyebrow="Checkout" title="Test checkout stays clearly separated from live orders.">
        <p>
          This checkout collects contact details, validates pickup or shipping choices, can create
          a marked test record for owner review, and keeps live payment disabled until policies,
          Stripe, tax, and fulfillment settings are approved.
        </p>
      </PageHero>
      <CheckoutClient checkoutMode={checkoutMode} products={products} />
    </>
  );
}
