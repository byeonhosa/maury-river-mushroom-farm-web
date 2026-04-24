"use client";

import { summarizeCommerceCart, type CartLineInput, type CommerceProduct } from "@mrmf/shared";
import { AlertTriangle, ArrowRight, Minus, Plus, ShoppingBasket, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  notifyCartUpdated,
  readCartItems,
  removeCartItem,
  updateCartItemQuantity
} from "../lib/cart-storage";
import { formatCurrency } from "../lib/format";

function resolveCartLines(products: CommerceProduct[], items: CartLineInput[]) {
  const productBySlug = new Map(products.map((product) => [product.slug, product]));

  return items
    .map((item) => {
      const product = productBySlug.get(item.productSlug);

      return product ? { product, quantity: item.quantity } : undefined;
    })
    .filter((line): line is { product: CommerceProduct; quantity: number } => Boolean(line));
}

export function CartClient({ products }: { products: CommerceProduct[] }) {
  const [items, setItems] = useState<CartLineInput[]>([]);

  useEffect(() => {
    const syncCart = () => setItems(readCartItems());

    syncCart();
    window.addEventListener("storage", syncCart);
    window.addEventListener("mrmf-cart-updated", syncCart);

    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener("mrmf-cart-updated", syncCart);
    };
  }, []);

  const resolvedLines = useMemo(() => resolveCartLines(products, items), [items, products]);
  const cart = useMemo(() => summarizeCommerceCart(resolvedLines), [resolvedLines]);

  function setQuantity(productSlug: string, quantity: number) {
    setItems(updateCartItemQuantity(productSlug, quantity));
    notifyCartUpdated();
  }

  function removeLine(productSlug: string) {
    setItems(removeCartItem(productSlug));
    notifyCartUpdated();
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.35fr_0.65fr] lg:px-8">
      <div className="overflow-hidden border border-brand-mahogany/20 bg-brand-ivory shadow-soft">
        <div className="grid grid-cols-[1fr_6rem_7rem] gap-4 border-b border-brand-mahogany/20 p-4 font-subheading text-xs font-extrabold uppercase tracking-[0.12em] text-brand-ebony md:grid-cols-[1fr_9rem_8rem_8rem_3rem]">
          <span>Product</span>
          <span>Qty</span>
          <span className="hidden md:block">Unit</span>
          <span>Subtotal</span>
          <span className="sr-only">Remove</span>
        </div>

        {cart.lines.length === 0 ? (
          <div className="p-6">
            <ShoppingBasket className="h-6 w-6 text-brand-ebony" aria-hidden="true" />
            <h2 className="mt-4 font-heading text-4xl">Your cart is ready for the harvest.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7">
              Add fresh mushrooms, pantry products, or inquiry items from the shop. The cart will
              keep pickup, delivery, and shippable items clearly separated before checkout.
            </p>
            <Link
              href="/shop"
              className="mt-5 inline-flex items-center gap-2 bg-brand-mahogany px-5 py-3 font-subheading text-sm font-bold uppercase tracking-[0.1em] text-brand-ivory transition hover:bg-brand-ebony"
            >
              Shop products <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          cart.lines.map((line) => (
            <article
              key={line.product.slug}
              className="grid grid-cols-[1fr_6rem_7rem] gap-4 border-b border-brand-mahogany/20 p-4 last:border-b-0 md:grid-cols-[1fr_9rem_8rem_8rem_3rem]"
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
              <div className="flex h-10 items-center border border-brand-mahogany/30 bg-white">
                <button
                  type="button"
                  aria-label={`Decrease ${line.product.name} quantity`}
                  className="flex h-full w-9 items-center justify-center text-brand-mahogany"
                  onClick={() => setQuantity(line.product.slug, line.quantity - 1)}
                >
                  <Minus className="h-4 w-4" aria-hidden="true" />
                </button>
                <input
                  aria-label={`${line.product.name} quantity`}
                  className="h-full w-10 border-x border-brand-mahogany/20 bg-white text-center font-subheading text-sm font-bold"
                  min={1}
                  max={99}
                  type="number"
                  value={line.quantity}
                  onChange={(event) =>
                    setQuantity(line.product.slug, Number(event.currentTarget.value))
                  }
                />
                <button
                  type="button"
                  aria-label={`Increase ${line.product.name} quantity`}
                  className="flex h-full w-9 items-center justify-center text-brand-mahogany"
                  onClick={() => setQuantity(line.product.slug, line.quantity + 1)}
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <p className="hidden md:block">{formatCurrency(line.unitPrice)}</p>
              <p>{formatCurrency(line.subtotal)}</p>
              <button
                type="button"
                aria-label={`Remove ${line.product.name}`}
                className="flex h-10 w-10 items-center justify-center border border-brand-mahogany/30 text-brand-mahogany transition hover:bg-brand-mahogany hover:text-brand-ivory"
                onClick={() => removeLine(line.product.slug)}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </article>
          ))
        )}
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
          {cart.lines.length > 0 ? (
            <Link
              href="/checkout"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-brand-mahogany px-5 py-3 font-subheading text-sm font-bold uppercase tracking-[0.1em] text-brand-ivory transition hover:bg-brand-ebony"
            >
              Review checkout <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : (
            <Link
              href="/shop"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 border border-brand-mahogany px-5 py-3 font-subheading text-sm font-bold uppercase tracking-[0.1em] transition hover:bg-brand-mahogany hover:text-brand-ivory"
            >
              Continue shopping <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
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
  );
}
