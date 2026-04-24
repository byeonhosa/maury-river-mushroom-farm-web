import { canShipProduct, isFreshProduct, type Product } from "@mrmf/shared";
import Image from "next/image";
import Link from "next/link";

export function ProductCard({ product }: { product: Product }) {
  const price =
    product.price > 0 ? `$${product.price.toFixed(2)} / ${product.unitSize}` : product.unitSize;

  return (
    <article className="flex h-full flex-col overflow-hidden border border-brand-mahogany/20 bg-brand-ivory shadow-soft">
      <div className="relative aspect-[4/3] bg-brand-ebony">
        <Image src={product.images[0].src} alt={product.images[0].alt} fill className="object-cover" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-2">
          <span className="bg-brand-ebony px-3 py-1 font-subheading text-[0.7rem] font-bold uppercase tracking-[0.12em] text-brand-ivory">
            {isFreshProduct(product) ? "Fresh local-only" : canShipProduct(product) ? "Shippable" : "Local inquiry"}
          </span>
          <span className="bg-brand-mahogany px-3 py-1 font-subheading text-[0.7rem] font-bold uppercase tracking-[0.12em] text-brand-ivory">
            {product.inventoryStatus.replace("-", " ")}
          </span>
        </div>
        <h3 className="mt-4 font-heading text-3xl leading-tight">{product.name}</h3>
        <p className="mt-2 font-subheading text-sm font-bold uppercase tracking-[0.08em] text-brand-burnt">
          {price}
        </p>
        <p className="mt-3 flex-1 text-sm leading-7">{product.shortDescription}</p>
        <Link
          href={`/shop/${product.slug}`}
          className="mt-5 inline-flex justify-center bg-brand-mahogany px-4 py-3 font-subheading text-sm font-bold uppercase tracking-[0.1em] text-brand-ivory transition hover:bg-brand-ebony"
        >
          View details
        </Link>
      </div>
    </article>
  );
}
