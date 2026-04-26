import {
  getCommerceProductAvailability,
  type CommerceProduct,
} from "@mrmf/shared";
import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "./add-to-cart-button";

function availabilityBadgeClass(status: CommerceProduct["inventoryStatus"]) {
  if (status === "available" || status === "low-stock") {
    return "mrmf-badge-ebony";
  }

  if (status === "seasonal" || status === "preorder") {
    return "mrmf-badge-burnt";
  }

  return "mrmf-badge-mahogany";
}

export function ProductCard({ product }: { product: CommerceProduct }) {
  const price =
    product.price > 0
      ? `$${product.price.toFixed(2)} / ${product.unitSize}`
      : product.unitSize;
  const availability = getCommerceProductAvailability(product);

  return (
    <article className="mrmf-card group flex h-full flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-lifted">
      <Link
        href={`/shop/${product.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-brand-ebony"
        aria-label={`View ${product.name}`}
      >
        <Image
          src={product.image.src}
          alt={product.image.alt}
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
      </Link>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap gap-2">
          <span className="mrmf-badge-ebony">
            {product.fulfillmentLabel}
          </span>
          <span className={availabilityBadgeClass(product.inventoryStatus)}>
            {availability.label}
          </span>
        </div>
        <h3 className="mt-4 font-heading text-3xl leading-tight sm:text-4xl">
          <Link href={`/shop/${product.slug}`}>{product.name}</Link>
        </h3>
        <p className="mt-2 font-subheading text-sm font-extrabold uppercase tracking-[0.08em] text-brand-mahogany">
          {price}
        </p>
        <p className="mt-3 flex-1 text-sm leading-7">
          {product.shortDescription}
        </p>
        <p className="mt-4 border-t border-brand-mahogany/15 pt-3 text-xs leading-6">
          {availability.message}
        </p>
        {availability.stockNote ? (
          <p className="mt-2 text-xs leading-6">{availability.stockNote}</p>
        ) : null}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Link
            href={`/shop/${product.slug}`}
            className="mrmf-button-secondary px-4"
          >
            Details
          </Link>
          {availability.showWholesaleCta ? (
            <Link
              href="/restaurants-wholesale"
              className="mrmf-button-primary px-4"
            >
              Wholesale inquiry
            </Link>
          ) : availability.showInquiryCta ? (
            <Link
              href="/contact"
              className="mrmf-button-primary px-4"
            >
              Ask availability
            </Link>
          ) : (
            <AddToCartButton
              productSlug={product.slug}
              productName={product.name}
              disabledReason={
                !availability.canAddToCart ? availability.message : undefined
              }
              className="mrmf-button-primary px-4"
            />
          )}
        </div>
      </div>
    </article>
  );
}
