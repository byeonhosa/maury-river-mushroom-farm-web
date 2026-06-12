# Photography Shot List

A checklist for the family photo sessions. Every slot below renders a graceful
branded placeholder until a real photo is added, so the site looks intentional
in the meantime and photos can be dropped in one at a time.

## How a photo goes live (no code changes)

1. Optimize the photo to WebP (~1600px on the long edge, quality ~82) and save it
   under `apps/storefront/public/images/products/` or `.../farm/`.
2. Add one line to the manifest:
   - Species hero → `apps/storefront/lib/image-manifest.ts` (`speciesImageManifest`),
     keyed by species slug.
   - Product card/detail → `packages/shared/src/products.ts` (`images[0].src`/`alt`).
3. That's it — no component edits. Record the file in `docs/content/image-inventory.md`.

Write alt text for every photo and have the owner approve it before launch.

## Priority 1 — brand and lifestyle (used across the site)

- [ ] Farm / grow room: tidy shelves of fruiting blocks, good light (homepage, Our Farm).
- [ ] Harvest in hand: freshly cut mushrooms held or in a basket (homepage, markets).
- [ ] Market table: the MRMF stall at Lexington or Staunton with product laid out
      (markets & pickup page; reinforces the two-market schedule).
- [ ] Commercial kitchen: a chef plating or cooking with the mushrooms
      (restaurants & wholesale page; supports the golden-oyster wholesale story).
- [ ] Family / founders: a warm portrait for the Our Farm story.
- [ ] Local delivery / pickup moment: handoff or packed order (markets page).

## Priority 2 — per-species beauty shots (18 species)

Each species page shows a hero image. Filled slots use existing optimized photos;
the rest fall back to a branded placeholder until shot.

Year-round staples:
- [x] Lion's Mane — `images/products/lions-mane-mushrooms-studio-01.webp`
- [ ] Blue Oyster — needed (currently placeholder)
- [ ] Shiitake — needed
- [ ] Chestnut — needed

In rotation now:
- [x] Pink Oyster — `images/products/pink-oyster-mushrooms-01.webp`
- [x] White Oyster — `images/products/white-oyster-mushrooms-01.webp`

Returning (rotating):
- [ ] King Trumpet — needed
- [ ] Black King Oyster — needed (distinct from the retired King Blue)
- [ ] Pioppino — needed
- [ ] Maitake — needed
- [ ] Beech — needed
- [ ] Nameko — needed
- [ ] Golden Enoki — needed
- [ ] White Enoki — needed
- [ ] Cordyceps — needed

Wholesale-only:
- [ ] Golden Oyster — needed (chef/kitchen context fits the wholesale framing)

Functional — coming later (display pieces at market tables):
- [x] Turkey Tail — `images/farm/turkey-tail-mushrooms-01.webp` (existing; review fit)
- [ ] Reishi — needed (a display-piece shot at the market table works well)

## Priority 3 — product / packaging shots

- [ ] Fresh product clamshell/bag with the MRMF label, styled on a clean surface.
- [ ] Mushroom Salt — packaged jar (front label legible).
- [ ] Dried mushrooms — packaged bag.
- [ ] Lion's Mane capsules — the 30-count tin and the 100-count bag together
      (supports the education + notify-me supplement page).
- [ ] Any future powders — packaged.

## Priority 4 — recipe photos

One finished-dish photo per recipe currently on the site:
- [ ] Lion's Mane "crab cake" style patties
- [ ] Crispy oyster mushroom tacos
- [ ] Mushroom salt roasted potatoes
- [ ] Garlic blue oyster mushroom stir-fry
- [ ] Golden oyster mushroom soup
- [ ] Pink oyster rice bowls
- [ ] Lion's Mane steak bites

## Notes

- Keep fresh mushrooms looking fresh and local — avoid stock-photo gloss.
- For functional species (Reishi, Turkey Tail), photograph them as display pieces
  at the market table, consistent with the "grown for future functional products"
  framing. No health-claim styling.
- Confirm provenance/usage rights for any non-original images before launch
  (see `docs/content/image-inventory.md`).
