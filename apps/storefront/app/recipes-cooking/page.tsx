import { recipes } from "@mrmf/shared";
import { Clock } from "lucide-react";
import Link from "next/link";
import { PageHero } from "../../components/page-hero";

export default function RecipesPage() {
  return (
    <>
      <PageHero eyebrow="Recipes & cooking" title="Cook mushrooms with confidence.">
        <p>
          Recipes focus on practical ways to bring out texture, flavor, and storage value from the farm's mushrooms.
        </p>
      </PageHero>
      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        {recipes.map((recipe) => (
          <Link key={recipe.slug} href={`/recipes-cooking/${recipe.slug}`} className="border border-brand-mahogany/20 bg-brand-ivory p-6 shadow-soft">
            <Clock className="h-5 w-5 text-brand-ebony" aria-hidden="true" />
            <h2 className="mt-4 font-heading text-3xl leading-tight">{recipe.title}</h2>
            <p className="mt-3 text-sm leading-7">{recipe.summary}</p>
            <p className="mt-4 font-subheading text-xs font-extrabold uppercase tracking-[0.12em] text-brand-burnt">
              {recipe.prepTime} prep / {recipe.cookTime} cook
            </p>
          </Link>
        ))}
      </section>
    </>
  );
}
