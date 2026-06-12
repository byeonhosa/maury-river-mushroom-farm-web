import { resolveCheckoutModeConfig } from "@mrmf/shared";
import { redirect } from "next/navigation";

import { CheckoutClient } from "../../components/checkout-client";
import { PageHero } from "../../components/page-hero";
import { listProducts } from "../../lib/products";
import { informationalModeEnabled } from "../../lib/site-mode";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  if (informationalModeEnabled()) {
    // Online ordering is paused; send checkout traffic to the cart page, which
    // explains the informational-mode state gracefully.
    redirect("/cart");
  }

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
