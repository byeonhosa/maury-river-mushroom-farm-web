import { recipes } from "@mrmf/shared";
import { Clock } from "lucide-react";
import Link from "next/link";
import { PageHero } from "../../components/page-hero";

export default function RecipesPage() {
  const kitchenGuides = [
    {
      title: "Store fresh mushrooms",
      body:
        "Keep fresh mushrooms cold and breathable. Avoid sealed plastic after pickup, and cook delicate pink or golden oysters first."
    },
    {
      title: "Cook oyster mushrooms",
      body:
        "Tear clusters by hand, use a wide hot pan, and let steam escape before adding heavier sauces or salt."
    },
    {
      title: "Cook lion's mane",
      body:
        "Press gently in the skillet to release moisture, then finish with butter, herbs, lemon, or a crisp breadcrumb crust."
    },
    {
      title: "Use dried mushrooms",
      body:
        "Rehydrate in hot water for broths and sauces, then strain the soaking liquid before using it in soups, beans, or rice."
    }
  ];

  return (
    <>
      <PageHero eyebrow="Recipes & cooking" title="Cook mushrooms with confidence.">
        <p>
          Recipes focus on practical ways to bring out texture, flavor, and storage value from the farm's mushrooms. Start with a hot pan, a breathable storage plan, and a recipe that fits the harvest you have.
        </p>
      </PageHero>
      <section className="mrmf-shell pt-12">
        <div className="grid gap-5 md:grid-cols-4">
          {kitchenGuides.map((guide) => (
            <div key={guide.title} className="mrmf-card p-5">
              <h2 className="font-heading text-3xl leading-tight">{guide.title}</h2>
              <p className="mt-3 text-sm leading-7">{guide.body}</p>
            </div>
          ))}
        </div>
      </section>
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
