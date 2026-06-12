# Migration Redirect Map (GoDaddy → rebuild)

Proposed 301 redirects from the live GoDaddy URLs to their rebuild equivalents,
to be applied at the edge (reverse proxy or Next.js redirects) at DNS cutover.
Seeded from the June 2026 takeover review (`docs/review/takeover-review-2026-06.md`)
and updated for owner Decisions D15/D16.

Status: planning artifact. Nothing here is live; production cutover is not
authorized yet. The internal `/mushrooms/*` retirements below are already wired
in `apps/storefront/next.config.mjs`.

## Core pages

| GoDaddy URL | → Rebuild target |
|---|---|
| `/` | `/` |
| `/shop` | `/shop` |
| `/privacy-policy` | `/privacy-policy` |
| `/terms-and-conditions` | `/terms-and-conditions` |
| `/m/login`, `/m/reset`, `/m/create`, `/m/create-account` | `/` (no customer accounts in rebuild; 410 acceptable) |
| `www.*` | 301 to apex (preserve current canonicalization) |
| `/sw.js` | Serve a kill-switch service worker (unregister + clear caches), not a 404 |

## Products (GoDaddy OLS) → rebuild

| GoDaddy product URL | → Rebuild target | Notes |
|---|---|---|
| `/ols/products/-fm-lions-mane-mushroom-4-oz` | `/shop/fresh-lions-mane` | |
| `/ols/products/fm-golden-oyster-mushroom-4-oz` | `/restaurants-wholesale` | Golden oyster is now wholesale-only (D16); no retail product page |
| `/ols/products/oyster-mushroom` (Blue Oyster) | `/shop/blue-oyster-mushrooms` | |
| `/ols/products/fm-pink-oyster-mushrooms-4-oz` | `/shop/pink-oyster-mushrooms` | |
| `/ols/products/fm-white-oyster-mushrooms-4-oz` | `/shop/white-oyster-mushrooms` | |
| `/ols/products/fm-kng-bl-ystr-mshrm` (King Blue) | `/mushrooms` | **King Blue retired (D15).** Distinct from Black King Oyster — not a rename |
| `/ols/products/-fm-chestnut-mushrooms-4oz` | `/mushrooms/chestnut` | Chestnut is a species page; add a `/shop` product when a fresh SKU is confirmed |
| `/ols/products/chestnut-mushrooms-4-oz` (duplicate) | `/mushrooms/chestnut` | Live had two chestnut listings |
| `/ols/products/lm-spplmnts` | `/shop/lions-mane-capsules` | Education + notify-me only (no online purchase) |
| `/ols/products/br-umami-garlic-salt-96ff` | `/shop/mushroom-salt` | Name/format to confirm |

## Categories (GoDaddy OLS) → rebuild

| GoDaddy category URL | → Rebuild target |
|---|---|
| `/ols/categories/fresh-mushrooms-retail` | `/fresh-mushrooms` |
| `/ols/categories/fresh-mushrooms-wholesale` | `/restaurants-wholesale` |
| `/ols/categories/value-added-products` | `/mushroom-salts-seasonings` |
| `/ols/categories/merchandise` | `/shop` |
| `/ols/categories/education-consulting` | `/mushrooms` |
| `/ols/categories/mushroom-production` | `/our-farm` |

## Internal retirements (already live in next.config.mjs)

| Old rebuild path | → | Reason |
|---|---|---|
| `/mushrooms/king-blue` | `/mushrooms` | King Blue retired (D15) |
| `/mushrooms/elm-oyster` | `/mushrooms` | Elm Oyster not in the approved 18-species lineup |
| `/mushrooms/enoki` | `/mushrooms` | Split into `/mushrooms/golden-enoki` and `/mushrooms/white-enoki` |

## Open items before cutover

- Confirm whether Chestnut and a King-Trumpet/Black-King fresh SKU should become
  `/shop` products (species pages exist now; no purchasable products yet).
- Decide final Mushroom Salt product identity vs. the live "BR Umami Garlic Salt."
- Implement the `/sw.js` kill-switch service worker.
