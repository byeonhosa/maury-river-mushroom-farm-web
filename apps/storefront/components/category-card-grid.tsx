import Link from "next/link";
import type { ProductCategory } from "@mrmf/shared";
import { productCategories } from "@mrmf/shared";

const categoryHref: Record<ProductCategory, string> = {
  "fresh-mushrooms": "/fresh-mushrooms",
  "dried-mushrooms": "/dried-mushrooms",
  "salts-seasonings": "/mushroom-salts-seasonings",
  supplements: "/supplements",
  subscriptions: "/subscriptions",
  "restaurant-wholesale": "/restaurants-wholesale",
  "grow-kits": "/shop"
};

export function CategoryCardGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="category-grid">
      {productCategories.map((category) => (
        <Link
          key={category.slug}
          href={categoryHref[category.slug]}
          className="mrmf-card group p-6 transition hover:-translate-y-1 hover:shadow-lifted"
        >
          <p className="mrmf-eyebrow">
            {category.slug.replaceAll("-", " ")}
          </p>
          <h3 className="mt-3 font-heading text-3xl leading-tight text-brand-mahogany">
            {category.title}
          </h3>
          <p className="mt-3 text-sm leading-7">{category.description}</p>
          <span className="mt-5 inline-flex font-subheading text-sm font-bold uppercase tracking-[0.1em] text-brand-mahogany underline underline-offset-4">
            Explore
          </span>
        </Link>
      ))}
    </div>
  );
}
