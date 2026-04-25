import { getCommerceProductAvailability, type CommerceProduct } from "@mrmf/shared";
import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "./add-to-cart-button";

export function ProductCard({ product }: { product: CommerceProduct }) {
  const price =
    product.price > 0 ? `$${product.price.toFixed(2)} / ${product.unitSize}` : product.unitSize;
  const availability = getCommerceProductAvailability(product);

  return (
    <article className="flex h-full flex-col overflow-hidden border border-brand-mahogany/20 bg-brand-ivory shadow-soft">
      <div className="relative aspect-[4/3] bg-brand-ebony">
        <Image src={product.image.src} alt={product.image.alt} fill className="object-cover" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-2">
          <span className="bg-brand-ebony px-3 py-1 font-subheading text-[0.7rem] font-bold uppercase tracking-[0.12em] text-brand-ivory">
            {product.fulfillmentLabel}
          </span>
          <span className="bg-brand-mahogany px-3 py-1 font-subheading text-[0.7rem] font-bold uppercase tracking-[0.12em] text-brand-ivory">
            {availability.label}
          </span>
        </div>
        <h3 className="mt-4 font-heading text-3xl leading-tight">{product.name}</h3>
        <p className="mt-2 font-subheading text-sm font-bold uppercase tracking-[0.08em] text-brand-burnt">
          {price}
        </p>
        <p className="mt-3 flex-1 text-sm leading-7">{product.shortDescription}</p>
        <p className="mt-3 text-xs leading-6">{availability.message}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Link
            href={`/shop/${product.slug}`}
            className="inline-flex justify-center border border-brand-mahogany px-4 py-3 font-subheading text-sm font-bold uppercase tracking-[0.1em] transition hover:bg-brand-mahogany hover:text-brand-ivory"
          >
            Details
          </Link>
          <AddToCartButton
            productSlug={product.slug}
            productName={product.name}
            disabledReason={!availability.canAddToCart ? availability.message : undefined}
            className="inline-flex items-center justify-center gap-2 bg-brand-mahogany px-4 py-3 font-subheading text-sm font-bold uppercase tracking-[0.1em] text-brand-ivory transition hover:bg-brand-ebony disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
      </div>
    </article>
  );
}
