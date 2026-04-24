# Implementation Assumptions

These assumptions were made for the first autonomous implementation batch and should be
confirmed before launch.

- Product prices, unit sizes, availability labels, and shelf-life wording are provisional.
- Fresh products are local-only by default and are not configured as shippable.
- Shelf-stable products may be shippable after packaging, policy, and checkout review.
- The Medusa backend is scaffolded, but final product, variant, region, shipping-profile,
  and sales-channel seed mapping is still future work.
- Forms validate on the server and return JSON. Final email or CRM delivery is not connected.
- Policy pages are serious placeholders and require legal review.
- Supplement and functional mushroom content is intentionally cautious and requires legal/business review.
- Temporary generated SVG files are wrappers around PNGs, not official vector artwork.
- Public brand PNG copies in the storefront are working assets; original brand assets remain preserved in `assets/brand-source`.
- Real product and farm photography should replace placeholder SVG product art before launch.
