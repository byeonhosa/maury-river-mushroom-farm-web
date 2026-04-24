import { ArrowRight, ChefHat, Clock, Leaf, Mail, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { products, recipes, speciesPages } from "@mrmf/shared";
import { CategoryCardGrid } from "../components/category-card-grid";
import { LocalFulfillmentCallout } from "../components/local-fulfillment-callout";
import { NewsletterForm } from "../components/forms";
import { ProductGrid } from "../components/product-grid";
import { SectionHeading } from "../components/section-heading";

const freshThisWeek = products.filter((product) => product.category === "fresh-mushrooms").slice(0, 3);

export default function HomePage() {
  const featuredSpecies = speciesPages[0];
  const featuredRecipes = recipes.slice(0, 3);

  return (
    <>
      <section className="bg-brand-ivory">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
          <div>
            <p className="font-subheading text-sm font-extrabold uppercase tracking-[0.18em] text-brand-ebony">
              Gourmet mushrooms grown near the Maury River
            </p>
            <h1 className="mt-4 max-w-4xl font-heading text-5xl leading-[0.95] text-brand-mahogany sm:text-7xl">
              Fresh harvest flavor for home cooks and chefs.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8">
              Shop local fresh mushrooms, learn how to cook and store them, and connect with the farm for
              weekly availability, pickup windows, and restaurant orders.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-brand-mahogany px-5 py-3 font-subheading text-sm font-bold uppercase tracking-[0.1em] text-brand-ivory transition hover:bg-brand-ebony"
              >
                Shop mushrooms <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/markets-pickup"
                className="inline-flex items-center gap-2 border border-brand-mahogany px-5 py-3 font-subheading text-sm font-bold uppercase tracking-[0.1em] text-brand-mahogany transition hover:border-brand-ebony hover:text-brand-ebony"
              >
                Pickup details <MapPin className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div className="relative min-h-[360px] overflow-hidden bg-brand-ebony p-8 text-brand-ivory shadow-soft">
            <Image
              src="/brand/MRMF_Pattern_Ivory_png.png"
              alt=""
              fill
              className="object-cover opacity-20"
              priority
            />
            <div className="relative z-10 flex h-full min-h-[320px] flex-col justify-between">
              <Image
                src="/brand/MRMF_PrimaryLogo_Ivory.png"
                alt="The Maury River Mushroom Farm"
                width={260}
                height={260}
                className="h-40 w-40 object-contain"
                priority
              />
              <div>
                <p className="font-heading text-4xl leading-tight">
                  Fresh, dried, seasoned, and functional mushroom products.
                </p>
                <p className="mt-4 text-sm leading-7">
                  Fresh products stay local by default. Shelf-stable goods can be prepared for shipping when configured.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Shop by need" title="Find the right mushroom for the meal." />
        <div className="mt-8">
          <CategoryCardGrid />
        </div>
      </section>

      <section className="bg-brand-mahogany py-14 text-brand-ivory">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Fresh this week"
            title="Harvest availability changes with the grow room."
            dark
          >
            <p>
              Fresh mushrooms are treated like produce: harvested in small batches, announced by availability,
              and fulfilled through local pickup, market pickup, delivery, or preorder.
            </p>
          </SectionHeading>
          <div className="mt-8">
            <ProductGrid products={freshThisWeek} />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <SectionHeading eyebrow="How to buy" title="Clear fulfillment before checkout." />
          <p className="mt-4 leading-8">
            The first checkout milestone will keep fresh local-only products separate from shippable shelf-stable products
            so customers never accidentally order fresh mushrooms for shipping.
          </p>
        </div>
        <div className="grid gap-4">
          <LocalFulfillmentCallout />
          {[
            ["Farm pickup", "Reserve or buy during posted harvest windows."],
            ["Farmers-market pickup", "Meet the farm at announced markets and pickup points."],
            ["Local delivery", "Available by route and harvest capacity."],
            ["Shipping", "Reserved for dried, seasoning, and supplement products when enabled."]
          ].map(([title, body]) => (
            <div key={title} className="border border-brand-mahogany/20 bg-brand-ivory p-5">
              <p className="font-heading text-2xl">{title}</p>
              <p className="mt-2 text-sm leading-7">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-brand-ebony py-14 text-brand-ivory">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <SectionHeading eyebrow="Mushroom education" title={featuredSpecies.name} dark>
              <p>{featuredSpecies.overview}</p>
            </SectionHeading>
            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="font-subheading text-xs font-extrabold uppercase tracking-[0.14em]">Flavor</dt>
                <dd className="mt-2 text-sm leading-7">{featuredSpecies.flavor}</dd>
              </div>
              <div>
                <dt className="font-subheading text-xs font-extrabold uppercase tracking-[0.14em]">Texture</dt>
                <dd className="mt-2 text-sm leading-7">{featuredSpecies.texture}</dd>
              </div>
            </dl>
          </div>
          <div className="grid gap-4">
            {featuredSpecies.cookingTips.map((tip) => (
              <div key={tip} className="border border-brand-ivory/30 p-5">
                <Leaf className="h-5 w-5" aria-hidden="true" />
                <p className="mt-3 text-sm leading-7">{tip}</p>
              </div>
            ))}
            <Link
              href={`/mushrooms/${featuredSpecies.slug}`}
              className="inline-flex items-center gap-2 justify-self-start bg-brand-ivory px-5 py-3 font-subheading text-sm font-bold uppercase tracking-[0.1em] text-brand-mahogany"
            >
              Learn about lion's mane <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Cook the harvest" title="Recipes that make mushrooms less mysterious." />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {featuredRecipes.map((recipe) => (
            <Link key={recipe.slug} href={`/recipes-cooking/${recipe.slug}`} className="border border-brand-mahogany/20 bg-brand-ivory p-6 shadow-soft">
              <Clock className="h-5 w-5 text-brand-ebony" aria-hidden="true" />
              <h3 className="mt-4 font-heading text-3xl leading-tight">{recipe.title}</h3>
              <p className="mt-3 text-sm leading-7">{recipe.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-brand-burnt py-14 text-brand-ivory">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
          <div>
            <SectionHeading eyebrow="For restaurants" title="Chefs can plan around the harvest." dark>
              <p>
                Weekly availability, preorder communication, and chef-focused mixes make it easier to feature local mushrooms on menus.
              </p>
            </SectionHeading>
            <Link
              href="/restaurants-wholesale"
              className="mt-7 inline-flex items-center gap-2 bg-brand-ivory px-5 py-3 font-subheading text-sm font-bold uppercase tracking-[0.1em] text-brand-mahogany"
            >
              Start a wholesale inquiry <ChefHat className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="border border-brand-ivory/35 p-6">
            <p className="font-heading text-4xl">Farm story</p>
            <p className="mt-4 text-sm leading-7">
              The site is being built to earn trust through clear pickup rules, transparent product education,
              careful supplement language, and a future path into the farm's production-tracking system.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 bg-brand-ivory p-6 shadow-soft md:grid-cols-[0.75fr_1.25fr] md:p-8">
          <div>
            <Mail className="h-6 w-6 text-brand-ebony" aria-hidden="true" />
            <h2 className="mt-4 font-heading text-4xl leading-tight">Get harvest notes.</h2>
            <p className="mt-3 text-sm leading-7">
              Newsletter signup is scaffolded for harvest availability, market dates, recipes, and product launches.
            </p>
          </div>
          <div className="self-end">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  );
}
