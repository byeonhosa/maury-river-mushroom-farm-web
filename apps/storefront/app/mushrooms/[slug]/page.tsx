import {
  availabilityStateBehaviors,
  getSpeciesNotificationCta,
  getSpeciesBySlug,
  products,
  recipes,
  shouldShowProductInShop,
  speciesPages,
} from "@mrmf/shared";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NotificationSignupForm } from "../../../components/notification-signup-form";

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
  const notificationCta = getSpeciesNotificationCta(
    species,
    `/mushrooms/${species.slug}`,
  );
  const relatedProducts = products.filter(
    (product) =>
      product.relatedSpeciesPage.includes(species.slug) &&
      shouldShowProductInShop(product),
  );
  const relatedRecipes = recipes.filter((recipe) =>
    recipe.mushroomFocus.includes(species.slug),
  );

  return (
    <article className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="mrmf-eyebrow">
        Mushroom species / {species.code} / {species.catalogStatus}
      </p>
      <h1 className="mt-3 font-heading text-5xl leading-tight">
        {species.name}
      </h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <div>
          <p className="text-lg leading-8">{species.overview}</p>
          <p className="mrmf-panel mt-6 p-4 text-sm leading-7">
            <span className="font-subheading text-xs font-extrabold uppercase tracking-[0.14em] text-brand-mahogany">
              {availability.label}
            </span>{" "}
            {availability.defaultMessage}
          </p>
          {species.requiresLegalReview ? (
            <p className="mrmf-card mt-6 border-brand-burnt p-4 font-subheading text-xs font-extrabold uppercase tracking-[0.12em] text-brand-mahogany">
              Functional mushroom copy on this page requires legal/business
              review.
            </p>
          ) : null}
          {notificationCta ? (
            <div className="mt-6">
              <NotificationSignupForm cta={notificationCta} />
            </div>
          ) : null}
        </div>
        {speciesImage ? (
          <div className="mrmf-card relative min-h-[300px] overflow-hidden">
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
        <div className="mrmf-card p-5">
          <h2 className="font-heading text-3xl">Flavor</h2>
          <p className="mt-3 text-sm leading-7">{species.flavor}</p>
        </div>
        <div className="mrmf-card p-5">
          <h2 className="font-heading text-3xl">Texture</h2>
          <p className="mt-3 text-sm leading-7">{species.texture}</p>
        </div>
        <div className="mrmf-card p-5">
          <h2 className="font-heading text-3xl">Storage</h2>
          <p className="mt-3 text-sm leading-7">{species.storage}</p>
        </div>
        <div className="mrmf-card p-5">
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
      {relatedProducts.length > 0 || relatedRecipes.length > 0 ? (
        <section className="mrmf-panel mt-8 grid gap-5 p-5 sm:grid-cols-2">
          {relatedProducts.length > 0 ? (
            <div>
              <h2 className="font-heading text-3xl">Related products</h2>
              <ul className="mt-3 space-y-2 text-sm leading-7">
                {relatedProducts.map((product) => (
                  <li key={product.slug}>
                    <Link
                      href={`/shop/${product.slug}`}
                      className="font-bold underline decoration-brand-burnt/50 underline-offset-4"
                    >
                      {product.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {relatedRecipes.length > 0 ? (
            <div>
              <h2 className="font-heading text-3xl">Recipe ideas</h2>
              <ul className="mt-3 space-y-2 text-sm leading-7">
                {relatedRecipes.map((recipe) => (
                  <li key={recipe.slug}>
                    <Link
                      href={`/recipes-cooking/${recipe.slug}`}
                      className="font-bold underline decoration-brand-burnt/50 underline-offset-4"
                    >
                      {recipe.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}
    </article>
  );
}
