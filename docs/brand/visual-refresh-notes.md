# Visual Refresh Notes

Phase 4 shifts the storefront from a dark scaffold to a warmer, lighter premium food
brand experience while preserving the official palette and license-safe font stack.

## Direction implemented

- Dominant canvas is now warm cream/parchment instead of large dark fields.
- Mahogany Brown remains the primary text, heading, border, and CTA color.
- Ebony Green and Burnt Orange are used mostly as badges, section accents, and short
  high-impact panels.
- Product cards, category cards, forms, cart, checkout, policy panels, and internal
  development admin tables use brighter card surfaces with clearer separation.
- Homepage hero, Fresh this week, education, recipe, restaurant, and newsletter areas
  were rebalanced so photos and calls to action have more presence.
- Checkout remains staged/test-only; no live payment or order completion was enabled.

## Component/style changes

- Added shared Tailwind tokens for `brand.cream`, `brand.parchment`, `brand.wheat`,
  and `brand.linen`.
- Added reusable component classes in `apps/storefront/app/globals.css` for page shells,
  cards, panels, CTAs, form inputs, labels, badges, and focus states.
- Product cards now use a light image-forward card, larger title hierarchy, clearer
  availability/fulfillment badges, stronger hover/focus treatment, and brighter CTAs.
- Forms now share consistent input/button styling and stronger readable contrast.

## Review items before launch

- Confirm final owner-approved alt text and photo provenance.
- Replace generated raster-wrapper SVGs with official designer SVG exports when available.
- Add exact Blue Oyster, Golden Oyster, and packaged product photography.
- Review mobile screenshots with the owner/designer after real launch copy and final
  availability are confirmed.
- Complete a formal accessibility pass before production migration.
