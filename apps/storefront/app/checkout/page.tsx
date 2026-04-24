import { pickupLocations } from "@mrmf/shared";
import { CreditCard, MapPin, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { PageHero } from "../../components/page-hero";
import { formatCurrency, getCartShellSummary } from "../../lib/demo-cart";

export default async function CheckoutPage() {
  const cart = await getCartShellSummary();

  return (
    <>
      <PageHero eyebrow="Checkout" title="Customer, fulfillment, and payment steps for local orders.">
        <p>
          Live card payments are disabled in this preview. Final checkout will collect payment only
          after fulfillment, policies, and launch settings are approved.
        </p>
      </PageHero>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div className="space-y-6">
          <div className="border border-brand-mahogany/20 bg-brand-ivory p-6 shadow-soft">
            <h2 className="font-heading text-4xl">Customer information</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {["Name", "Email", "Phone"].map((label) => (
                <label key={label} className="grid gap-2 font-subheading text-xs font-bold uppercase tracking-[0.12em]">
                  {label}
                  <input
                    className="border border-brand-mahogany/30 bg-white px-3 py-3 font-body text-sm normal-case tracking-normal"
                    placeholder={label}
                  />
                </label>
              ))}
              <label className="grid gap-2 font-subheading text-xs font-bold uppercase tracking-[0.12em] sm:col-span-2">
                Notes
                <textarea
                  className="min-h-24 border border-brand-mahogany/30 bg-white px-3 py-3 font-body text-sm normal-case tracking-normal"
                  placeholder="Pickup notes, delivery context, or restaurant timing"
                />
              </label>
            </div>
          </div>

          <div className="border border-brand-mahogany/20 bg-brand-ivory p-6 shadow-soft">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-brand-ebony" aria-hidden="true" />
              <h2 className="font-heading text-4xl">Fulfillment selection</h2>
            </div>
            <div className="mt-5 grid gap-4">
              {pickupLocations.map((location) => (
                <label
                  key={location.slug}
                  className="block border border-brand-mahogany/20 bg-white p-4"
                >
                  <span className="flex items-start gap-3">
                    <input type="radio" name="pickup-location" className="mt-1" />
                    <span>
                      <span className="block font-heading text-2xl">{location.name}</span>
                      <span className="mt-1 block text-sm leading-7">{location.description}</span>
                      <span className="mt-2 block font-subheading text-xs font-bold uppercase tracking-[0.12em] text-brand-ebony">
                        {location.windows[0]?.label}: {location.windows[0]?.weekday},{" "}
                        {location.windows[0]?.startTime}-{location.windows[0]?.endTime}
                      </span>
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="border border-brand-mahogany/20 bg-brand-ivory p-6 shadow-soft">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-brand-ebony" aria-hidden="true" />
              <h2 className="font-heading text-4xl">Payment</h2>
            </div>
            <p className="mt-3 text-sm leading-7">
              Online card payment is not active yet. Customers should see this as a payment step
              placeholder until the farm approves live checkout.
            </p>
          </div>

          <div className="border border-brand-burnt bg-brand-ivory p-5">
            <div className="flex items-center gap-2 font-subheading text-xs font-extrabold uppercase tracking-[0.14em] text-brand-burnt">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Policy acknowledgement
            </div>
            <label className="mt-4 flex items-start gap-3 text-sm leading-7">
              <input type="checkbox" className="mt-1" />
              <span>
                I understand fresh products require confirmed pickup, market pickup, local delivery,
                or preorder coordination, and I have reviewed the{" "}
                <Link href="/shipping-pickup-policy" className="underline">
                  shipping and pickup policy
                </Link>
                .
              </span>
            </label>
          </div>
        </div>

        <aside className="border border-brand-mahogany/20 bg-brand-ivory p-6 shadow-soft lg:self-start">
          <h2 className="font-heading text-4xl">Order summary</h2>
          <div className="mt-5 space-y-4">
            {cart.lines.map((line) => (
              <div key={line.product.slug} className="flex justify-between gap-4 border-b border-brand-mahogany/20 pb-4">
                <div>
                  <p className="font-heading text-2xl">{line.product.name}</p>
                  <p className="font-subheading text-xs font-bold uppercase tracking-[0.12em] text-brand-ebony">
                    {line.quantity} x {line.fulfillmentLabel}
                  </p>
                </div>
                <p>{formatCurrency(line.subtotal)}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between font-subheading text-sm font-extrabold uppercase tracking-[0.12em]">
            <span>Subtotal</span>
            <span>{formatCurrency(cart.subtotal)}</span>
          </div>
          <div className="mt-5 space-y-3 text-sm leading-7">
            {cart.restrictions.map((restriction) => (
              <p key={restriction}>{restriction}</p>
            ))}
          </div>
        </aside>
      </section>
    </>
  );
}
