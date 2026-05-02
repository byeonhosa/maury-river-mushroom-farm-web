import { ArrowRight, ChefHat, Clock, Leaf, Mail, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getWeeklyAvailabilityNotificationCta, recipes, speciesPages } from "@mrmf/shared";
import { CategoryCardGrid } from "../components/category-card-grid";
import { LocalFulfillmentCallout } from "../components/local-fulfillment-callout";
import { NewsletterForm } from "../components/forms";
import { NotificationSignupForm } from "../components/notification-signup-form";
import { ProductGrid } from "../components/product-grid";
import { SectionHeading } from "../components/section-heading";
import { listProductsByCategory } from "../lib/products";

export default async function HomePage() {
  const freshThisWeek = (await listProductsByCategory("fresh-mushrooms")).slice(
    0,
    3,
  );
  const featuredSpecies = speciesPages[0];
  const featuredRecipes = recipes.slice(0, 3);

  return (
    <>
      <section className="border-b border-brand-mahogany/15 bg-brand-cream">
        <div className="mrmf-shell grid items-center gap-10 py-12 lg:grid-cols-[1.04fr_0.96fr] lg:py-20">
          <div>
            <p className="mrmf-eyebrow text-sm">
              Gourmet mushrooms grown near the Maury River
            </p>
            <h1 className="mt-4 max-w-4xl font-heading text-5xl leading-[0.98] text-brand-mahogany sm:text-7xl">
              Fresh harvest flavor for home cooks and chefs.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8">
              Shop local fresh mushrooms, learn how to cook and store them, and
              connect with the farm for weekly availability, pickup windows, and
              restaurant orders.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="mrmf-button-primary"
              >
                Shop mushrooms{" "}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/markets-pickup"
                className="mrmf-button-secondary"
              >
                Pickup details <MapPin className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div className="mrmf-card relative min-h-[430px] overflow-hidden p-3">
            <Image
              src="/images/farm/lions-mane-growing-block-01.webp"
              alt="Lion's mane mushrooms fruiting from a grow block"
              fill
              className="object-cover"
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
            />
            <div className="absolute inset-x-3 bottom-3 bg-brand-mahogany p-5 text-brand-ivory">
              <p className="font-heading text-3xl leading-tight">
                Fresh, dried, seasoned, and functional mushroom products.
              </p>
              <p className="mt-3 text-sm leading-7">
                Fresh products stay local by default. Shelf-stable goods can be
                prepared for shipping when configured.
              </p>
            </div>
            <div className="absolute left-5 top-5">
              <Image
                src="/brand/MRMF_PrimaryLogo_Ivory.png"
                alt="The Maury River Mushroom Farm"
                width={260}
                height={260}
                className="h-32 w-32 object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mrmf-shell mrmf-section">
        <SectionHeading
          eyebrow="Shop by need"
          title="Find the right mushroom for the meal."
        />
        <div className="mt-8">
          <CategoryCardGrid />
        </div>
      </section>

      <section className="border-y border-brand-mahogany/15 bg-brand-parchment py-14 text-brand-mahogany">
        <div className="mrmf-shell">
          <SectionHeading
            eyebrow="Fresh this week"
            title="Harvest availability changes with the grow room."
          >
            <p>
              Fresh mushrooms are treated like produce: harvested in small
              batches, announced by availability, and fulfilled through local
              pickup, market pickup, delivery, or preorder.
            </p>
          </SectionHeading>
          <div className="mt-8">
            <ProductGrid products={freshThisWeek} />
          </div>
        </div>
      </section>

      <section className="mrmf-shell grid gap-8 py-14 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SectionHeading
            eyebrow="How to buy"
            title="Clear fulfillment before checkout."
          />
          <p className="mt-4 leading-8">
            The first checkout milestone will keep fresh local-only products
            separate from shippable shelf-stable products so customers never
            accidentally order fresh mushrooms for shipping.
          </p>
        </div>
        <div className="grid gap-4">
          <LocalFulfillmentCallout />
          {[
            ["Farm pickup", "Reserve or buy during posted harvest windows."],
            [
              "Farmers-market pickup",
              "Meet the farm at announced markets and pickup points.",
            ],
            ["Local delivery", "Available by route and harvest capacity."],
            [
              "Shipping",
              "Reserved for dried, seasoning, and supplement products when enabled.",
            ],
          ].map(([title, body]) => (
            <div
              key={title}
              className="mrmf-card p-5"
            >
              <p className="font-heading text-2xl">{title}</p>
              <p className="mt-2 text-sm leading-7">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-brand-mahogany/15 bg-brand-cream py-14 text-brand-mahogany">
        <div className="mrmf-shell grid gap-8 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Mushroom education"
              title={featuredSpecies.name}
            >
              <p>{featuredSpecies.overview}</p>
            </SectionHeading>
            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="mrmf-card p-5">
                <dt className="font-subheading text-xs font-extrabold uppercase tracking-[0.14em]">
                  Flavor
                </dt>
                <dd className="mt-2 text-sm leading-7">
                  {featuredSpecies.flavor}
                </dd>
              </div>
              <div className="mrmf-card p-5">
                <dt className="font-subheading text-xs font-extrabold uppercase tracking-[0.14em]">
                  Texture
                </dt>
                <dd className="mt-2 text-sm leading-7">
                  {featuredSpecies.texture}
                </dd>
              </div>
            </dl>
          </div>
          <div className="grid gap-4">
            {featuredSpecies.cookingTips.map((tip) => (
              <div key={tip} className="mrmf-card p-5">
                <Leaf className="h-5 w-5" aria-hidden="true" />
                <p className="mt-3 text-sm leading-7">{tip}</p>
              </div>
            ))}
            <Link
              href={`/mushrooms/${featuredSpecies.slug}`}
              className="mrmf-button-primary justify-self-start"
            >
              Learn about lion's mane{" "}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mrmf-shell mrmf-section">
        <SectionHeading
          eyebrow="Cook the harvest"
          title="Recipes that make mushrooms less mysterious."
        />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {featuredRecipes.map((recipe) => (
            <Link
              key={recipe.slug}
              href={`/recipes-cooking/${recipe.slug}`}
              className="mrmf-card p-6 transition hover:-translate-y-1 hover:shadow-lifted"
            >
              <Clock className="h-5 w-5 text-brand-mahogany" aria-hidden="true" />
              <h3 className="mt-4 font-heading text-3xl leading-tight">
                {recipe.title}
              </h3>
              <p className="mt-3 text-sm leading-7">{recipe.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-brand-ebony py-14 text-brand-ivory">
        <div className="mrmf-shell grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <SectionHeading
              eyebrow="For restaurants"
              title="Chefs can plan around the harvest."
              dark
            >
              <p>
                Weekly availability, preorder communication, and chef-focused
                mixes make it easier to feature local mushrooms on menus.
              </p>
            </SectionHeading>
            <Link
              href="/restaurants-wholesale"
              className="mrmf-button-light mt-7"
            >
              Start a wholesale inquiry{" "}
              <ChefHat className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="relative min-h-[320px] overflow-hidden border border-brand-ivory/35 p-6">
            <Image
              src="/images/farm/mixed-mushrooms-growing-blocks-01.webp"
              alt="Pink oyster and lion's mane mushrooms fruiting from grow blocks"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 40vw, 100vw"
            />
            <div className="absolute inset-0 bg-brand-ebony/70" />
            <div className="relative">
              <p className="font-heading text-4xl">Farm story</p>
              <p className="mt-4 text-sm leading-7">
                The site is being built to earn trust through clear pickup
                rules, transparent product education, careful supplement
                language, and a future path into the farm's production-tracking
                system.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mrmf-shell mrmf-section">
        <div className="mrmf-panel grid gap-6 p-6 md:grid-cols-[0.75fr_1.25fr] md:p-8">
          <div>
            <Mail className="h-6 w-6 text-brand-mahogany" aria-hidden="true" />
            <h2 className="mt-4 font-heading text-4xl leading-tight">
              Get harvest notes.
            </h2>
            <p className="mt-3 text-sm leading-7">
              Newsletter signup is scaffolded for harvest availability, market
              dates, recipes, and product launches.
            </p>
          </div>
          <div className="self-end">
            <div className="grid gap-4">
              <NotificationSignupForm
                cta={getWeeklyAvailabilityNotificationCta("/")}
                compact
              />
              <NewsletterForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
