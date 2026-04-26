import {
  availabilityStateBehaviors,
  getSpeciesBySlug,
  speciesPages,
} from "@mrmf/shared";
import Image from "next/image";
import { notFound } from "next/navigation";

const speciesImages: Partial<Record<string, { src: string; alt: string }>> = {
  "lion-s-mane": {
    src: "/images/products/lions-mane-mushrooms-studio-01.webp",
    alt: "Fresh lion's mane mushroom cluster",
  },
  "pink-oyster": {
    src: "/images/products/pink-oyster-mushrooms-01.webp",
    alt: "Close view of pink oyster mushroom gills",
  },
  "white-oyster": {
    src: "/images/products/white-oyster-mushrooms-01.webp",
    alt: "White oyster mushroom cluster",
  },
};

export function generateStaticParams() {
  return speciesPages.map((species) => ({ slug: species.slug }));
}

export default async function SpeciesDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const species = getSpeciesBySlug(slug);

  if (!species) {
    notFound();
  }

  const speciesImage = speciesImages[species.slug];
  const availability = availabilityStateBehaviors[species.availabilityState];

  return (
    <article className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="font-subheading text-xs font-extrabold uppercase tracking-[0.16em] text-brand-ebony">
        Mushroom species / {species.code} / {species.catalogStatus}
      </p>
      <h1 className="mt-3 font-heading text-5xl leading-tight">
        {species.name}
      </h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <div>
          <p className="text-lg leading-8">{species.overview}</p>
          <p className="mt-6 border border-brand-mahogany/20 bg-brand-ivory p-4 text-sm leading-7">
            <span className="font-subheading text-xs font-extrabold uppercase tracking-[0.14em] text-brand-ebony">
              {availability.label}
            </span>{" "}
            {availability.defaultMessage}
          </p>
          {species.requiresLegalReview ? (
            <p className="mt-6 border border-brand-burnt bg-brand-ivory p-4 font-subheading text-xs font-extrabold uppercase tracking-[0.12em] text-brand-burnt">
              Functional mushroom copy on this page requires legal/business
              review.
            </p>
          ) : null}
        </div>
        {speciesImage ? (
          <div className="relative min-h-[300px] overflow-hidden bg-brand-ebony">
            <Image
              src={speciesImage.src}
              alt={speciesImage.alt}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 35vw, 100vw"
            />
          </div>
        ) : null}
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <div className="border border-brand-mahogany/20 bg-brand-ivory p-5">
          <h2 className="font-heading text-3xl">Flavor</h2>
          <p className="mt-3 text-sm leading-7">{species.flavor}</p>
        </div>
        <div className="border border-brand-mahogany/20 bg-brand-ivory p-5">
          <h2 className="font-heading text-3xl">Texture</h2>
          <p className="mt-3 text-sm leading-7">{species.texture}</p>
        </div>
        <div className="border border-brand-mahogany/20 bg-brand-ivory p-5">
          <h2 className="font-heading text-3xl">Storage</h2>
          <p className="mt-3 text-sm leading-7">{species.storage}</p>
        </div>
        <div className="border border-brand-mahogany/20 bg-brand-ivory p-5">
          <h2 className="font-heading text-3xl">Pairs with</h2>
          <p className="mt-3 text-sm leading-7">
            {species.pairsWith.join(", ")}
          </p>
        </div>
      </div>
      <section className="mt-8">
        <h2 className="font-heading text-3xl">Cooking tips</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 leading-7">
          {species.cookingTips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>
    </article>
  );
}
