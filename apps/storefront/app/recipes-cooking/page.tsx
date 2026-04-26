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
      <section className="mrmf-shell grid gap-5 py-12 md:grid-cols-3">
        {recipes.map((recipe) => (
          <Link key={recipe.slug} href={`/recipes-cooking/${recipe.slug}`} className="mrmf-card p-6 transition hover:-translate-y-1 hover:shadow-lifted">
            <Clock className="h-5 w-5 text-brand-mahogany" aria-hidden="true" />
            <h2 className="mt-4 font-heading text-3xl leading-tight">{recipe.title}</h2>
            <p className="mt-3 text-sm leading-7">{recipe.summary}</p>
            <p className="mt-4 font-subheading text-xs font-extrabold uppercase tracking-[0.12em] text-brand-mahogany">
              {recipe.prepTime} prep / {recipe.cookTime} cook
            </p>
          </Link>
        ))}
      </section>
    </>
  );
}
