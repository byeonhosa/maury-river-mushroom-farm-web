import { AlertTriangle, ArrowRight, ShoppingBasket } from "lucide-react";
import Link from "next/link";

import { PageHero } from "../../components/page-hero";
import { formatCurrency, getCartShellSummary } from "../../lib/demo-cart";

export default async function CartPage() {
  const cart = await getCartShellSummary();

  return (
    <>
      <PageHero eyebrow="Cart" title="A checkout-ready cart foundation.">
        <p>
          The cart shell already prices lines, separates fulfillment types, and warns customers when a
          cart mixes local-only fresh mushrooms with shippable shelf-stable items.
        </p>
      </PageHero>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.35fr_0.65fr] lg:px-8">
        <div className="overflow-hidden border border-brand-mahogany/20 bg-brand-ivory shadow-soft">
          <div className="grid grid-cols-[1fr_5rem_7rem] gap-4 border-b border-brand-mahogany/20 p-4 font-subheading text-xs font-extrabold uppercase tracking-[0.12em] text-brand-ebony md:grid-cols-[1fr_6rem_8rem_8rem]">
            <span>Product</span>
            <span>Qty</span>
            <span className="hidden md:block">Unit</span>
            <span>Subtotal</span>
          </div>
          {cart.lines.map((line) => (
            <article
              key={line.product.slug}
              className="grid grid-cols-[1fr_5rem_7rem] gap-4 border-b border-brand-mahogany/20 p-4 last:border-b-0 md:grid-cols-[1fr_6rem_8rem_8rem]"
            >
              <div>
                <h2 className="font-heading text-3xl leading-tight">{line.product.name}</h2>
                <p className="mt-2 font-subheading text-xs font-extrabold uppercase tracking-[0.12em] text-brand-ebony">
                  {line.fulfillmentLabel}
                </p>
                {line.warnings.map((warning) => (
                  <p key={warning} className="mt-2 text-xs leading-6">
                    {warning}
                  </p>
                ))}
              </div>
              <p>{line.quantity}</p>
              <p className="hidden md:block">{formatCurrency(line.unitPrice)}</p>
              <p>{formatCurrency(line.subtotal)}</p>
            </article>
          ))}
        </div>

        <aside className="space-y-5">
          <div className="border border-brand-mahogany/20 bg-brand-ivory p-6 shadow-soft">
            <ShoppingBasket className="h-5 w-5 text-brand-ebony" aria-hidden="true" />
            <h2 className="mt-4 font-heading text-4xl">Order summary</h2>
            <div className="mt-5 flex items-center justify-between border-t border-brand-mahogany/20 pt-4">
              <span className="font-subheading text-sm font-extrabold uppercase tracking-[0.12em]">
                Subtotal
              </span>
              <span>{formatCurrency(cart.subtotal)}</span>
            </div>
            <Link
              href="/checkout"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-brand-mahogany px-5 py-3 font-subheading text-sm font-bold uppercase tracking-[0.1em] text-brand-ivory transition hover:bg-brand-ebony"
            >
              Checkout shell <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="border border-brand-burnt bg-brand-ivory p-5">
            <div className="flex items-center gap-2 font-subheading text-xs font-extrabold uppercase tracking-[0.14em] text-brand-burnt">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              Fulfillment notices
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-7">
              {cart.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
              {cart.restrictions.map((restriction) => (
                <li key={restriction}>{restriction}</li>
              ))}
            </ul>
          </div>
        </aside>
      </section>
    </>
  );
}
