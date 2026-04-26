import { getRecipeBySlug, recipes } from "@mrmf/shared";
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
      <Link href="/recipes-cooking" className="mrmf-button-primary mt-8">
        Back to recipes
      </Link>
    </article>
  );
}
