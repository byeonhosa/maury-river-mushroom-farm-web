import { getRecipeBySlug, products, recipes, speciesPages } from "@mrmf/shared";
import Link from "next/link";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return recipes.map((recipe) => ({ slug: recipe.slug }));
}

export default async function RecipeDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const recipe = getRecipeBySlug(slug);

  if (!recipe) {
    notFound();
  }

  const relatedProducts = recipe.relatedProducts
    .map((productSlug) => products.find((product) => product.slug === productSlug))
    .filter((product): product is (typeof products)[number] => Boolean(product));
  const focusedSpecies = recipe.mushroomFocus
    .map((speciesSlug) =>
      speciesPages.find((species) => species.slug === speciesSlug),
    )
    .filter((species): species is (typeof speciesPages)[number] =>
      Boolean(species),
    );

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="mrmf-eyebrow">
        Recipe
      </p>
      <h1 className="mt-3 font-heading text-5xl leading-tight">{recipe.title}</h1>
      <p className="mt-5 text-lg leading-8">{recipe.summary}</p>
      <div className="mrmf-panel mt-6 grid gap-3 p-5 font-subheading text-sm font-bold uppercase tracking-[0.1em] sm:grid-cols-3">
        <p>Prep: {recipe.prepTime}</p>
        <p>Cook: {recipe.cookTime}</p>
        <p>Serves: {recipe.servings}</p>
      </div>

      <section className="mt-8">
        <h2 className="font-heading text-3xl">Ingredients</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 leading-7">
          {recipe.ingredients.map((ingredient) => (
            <li key={ingredient}>{ingredient}</li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-heading text-3xl">Steps</h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5 leading-8">
          {recipe.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <p className="mrmf-card mt-8 p-5 text-sm leading-7">
        {recipe.storageNote}
      </p>
      {relatedProducts.length > 0 || focusedSpecies.length > 0 ? (
        <section className="mrmf-panel mt-8 grid gap-5 p-5 sm:grid-cols-2">
          {relatedProducts.length > 0 ? (
            <div>
              <h2 className="font-heading text-3xl">Shop the recipe</h2>
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
          {focusedSpecies.length > 0 ? (
            <div>
              <h2 className="font-heading text-3xl">Mushroom notes</h2>
              <ul className="mt-3 space-y-2 text-sm leading-7">
                {focusedSpecies.map((species) => (
                  <li key={species.slug}>
                    <Link
                      href={`/mushrooms/${species.slug}`}
                      className="font-bold underline decoration-brand-burnt/50 underline-offset-4"
                    >
                      {species.name}: {species.flavor}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}
      <Link href="/recipes-cooking" className="mrmf-button-primary mt-8">
        Back to recipes
      </Link>
    </article>
  );
}
