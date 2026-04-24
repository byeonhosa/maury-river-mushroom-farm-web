import {
  canShipProduct,
  getProductBySlug,
  isFreshProduct,
  products,
  SUPPLEMENT_DISCLAIMER
} from "@mrmf/shared";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export default async function ProductDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const fulfillmentLabel = isFreshProduct(product)
    ? "Fresh local-only"
    : canShipProduct(product)
      ? "Shelf-stable shippable"
      : "Local inquiry";

  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
      <div className="relative aspect-square overflow-hidden bg-brand-ebony">
        <Image src={product.images[0].src} alt={product.images[0].alt} fill className="object-cover" priority />
      </div>
      <div>
        <p className="font-subheading text-xs font-extrabold uppercase tracking-[0.16em] text-brand-ebony">
          {fulfillmentLabel}
        </p>
        <h1 className="mt-3 font-heading text-5xl leading-tight">{product.name}</h1>
        <p className="mt-3 font-subheading text-sm font-bold uppercase tracking-[0.1em] text-brand-burnt">
          {product.price > 0 ? `$${product.price.toFixed(2)} / ${product.unitSize}` : product.unitSize}
        </p>
        <p className="mt-6 text-lg leading-8">{product.longDescription}</p>

        <dl className="mt-8 grid gap-5 sm:grid-cols-2">
          {[
            ["Flavor", product.flavorProfile],
            ["Texture", product.texture],
            ["Storage", product.storageInstructions],
            ["Shelf life", product.shelfLife]
          ].map(([label, value]) => (
            <div key={label} className="border border-brand-mahogany/20 bg-brand-ivory p-5">
              <dt className="font-subheading text-xs font-extrabold uppercase tracking-[0.14em] text-brand-ebony">
                {label}
              </dt>
              <dd className="mt-2 text-sm leading-7">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <div>
            <h2 className="font-heading text-3xl">Cook it</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7">
              {product.cookingMethods.length > 0 ? (
                product.cookingMethods.map((method) => <li key={method}>{method}</li>)
              ) : (
                <li>No cooking required for this format.</li>
              )}
            </ul>
          </div>
          <div>
            <h2 className="font-heading text-3xl">Pair it</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7">
              {product.pairings.map((pairing) => (
                <li key={pairing}>{pairing}</li>
              ))}
            </ul>
          </div>
        </div>

        {product.supplementDisclaimer ? (
          <div className="mt-8 border border-brand-burnt bg-brand-ivory p-5 text-sm leading-7">
            <p className="font-subheading text-xs font-extrabold uppercase tracking-[0.14em] text-brand-burnt">
              Requires legal/business review
            </p>
            <p className="mt-2">{SUPPLEMENT_DISCLAIMER}</p>
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/markets-pickup"
            className="bg-brand-mahogany px-5 py-3 font-subheading text-sm font-bold uppercase tracking-[0.1em] text-brand-ivory"
          >
            Pickup details
          </Link>
          <Link
            href="/contact"
            className="border border-brand-mahogany px-5 py-3 font-subheading text-sm font-bold uppercase tracking-[0.1em]"
          >
            Ask about availability
          </Link>
        </div>
      </div>
    </section>
  );
}
