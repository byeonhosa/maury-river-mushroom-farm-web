# Content Model

The first implementation keeps canonical content in `packages/shared` so the storefront,
backend seed scripts, and tests read the same product and education rules.

## Product pages

Each product supports name, slug, category, species, format, price, unit size,
descriptions, flavor, texture, cooking methods, pairings, storage, shelf life,
fulfillment, inventory status, images, recipes, species links, supplement disclaimer,
and visibility.

Fresh products are local-only unless the owner explicitly approves shipping later.

## Species pages

Species content should explain taste, texture, cooking behavior, storage, and pairing
ideas. Functional mushroom content must be cautious and marked for legal/business review.

## Recipe pages

Recipes should teach customers how to use the farm's mushrooms and connect back to
products. They should be practical, seasonal, and specific to the farm's product mix.

## Forms

Forms are server-side validated now and intentionally leave email/CRM delivery abstracted
for a later provider integration.
