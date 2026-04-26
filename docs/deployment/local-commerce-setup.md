# Local Commerce Setup

This repository now has a commerce foundation, but live checkout remains disabled.

## Services

Start local infrastructure:

```bash
docker compose up -d postgres redis
```

PostgreSQL uses:

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/mrmf
```

If port `5432` is already taken on your machine, use another host port:

```powershell
$env:POSTGRES_HOST_PORT="5433"
docker compose up -d postgres redis
```

Then update both `.env` and `apps/backend/.env`:

```bash
POSTGRES_HOST_PORT=5433
DATABASE_URL=postgres://postgres:postgres@localhost:5433/mrmf
```

Redis is present for Medusa-compatible local infrastructure:

```bash
REDIS_URL=redis://localhost:6379
```

## Medusa Backend

Medusa CLI database commands expect an ignored `.env` file in `apps/backend`. Keep it in sync with the repository-root `.env`:

```bash
cp .env apps/backend/.env
```

PowerShell:

```powershell
Copy-Item .env apps\backend\.env
```

Start the backend:

```bash
corepack pnpm --filter @mrmf/backend dev
```

Run the seed:

```bash
corepack pnpm --filter @mrmf/backend db:migrate
corepack pnpm --filter @mrmf/backend seed
corepack pnpm --filter @mrmf/backend seed:verify
```

Preview the seed plan without writing product records or booting Medusa:

```bash
corepack pnpm --filter @mrmf/backend seed:plan
```

The seed creates product categories, collections, shipping profiles, a local development region, a manual fulfillment stock location, one fulfillment set, one US development service zone, provisional pickup/local-delivery/preorder shipping options, safe parcel shipping options for shelf-stable and supplement products, a storefront sales channel, the initial 10 products, inventory items, inventory levels, and product variant inventory links for managed products. It is idempotent: repeated runs update existing seeded products, shipping-option safety metadata, seed-managed shipping-option rules, and inventory records rather than creating duplicates and reuse seeded region/shipping records by name. Product, variant, and inventory metadata preserve mushroom-specific fields for species, product format, flavor, texture, cooking, storage, shelf life, fulfillment, related recipes, related species pages, supplement disclaimer, inventory status, visibility status, local-only status, and parcel eligibility.

`seed:verify` connects to PostgreSQL through `DATABASE_URL` and checks that the expected products, categories, collections, variants, prices, metadata, shipping profile links, region, service zone, shipping options, native shipping-option rules, managed inventory items, inventory levels, and variant inventory links exist in the database. It also verifies shipping-option metadata for fulfillment type, allowed/rejected product fulfillment modes, pickup-window requirements, fresh-product blocking, and that no parcel shipping option is attached to the fresh-local shipping profile.

The seed also creates or reuses a publishable Store API key, links it to the storefront sales channel, and prints the public `pk_...` value. Copy that value into `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` in the storefront env when you want `medusa-hybrid` to return Medusa products instead of the fallback catalog.

## Fulfillment Configuration

The provisional pickup locations and windows are maintained in `packages/shared/src/pickup.ts`. Update that file when the owner confirms final farm pickup hours, Lexington Farmers Market schedule, Natural Bridge/local market details, cutoff times, and local delivery rules.

The Medusa seed turns those pickup locations into development shipping options in `apps/backend/src/scripts/medusa-seed-data.ts`. Parcel options are currently limited to:

- `shelf-stable-parcel` on the shelf-stable shipping profile
- `supplement-parcel` on the supplement shipping profile

Fresh-local products use pickup, market pickup, local delivery, or preorder options. Do not add a parcel option to the `fresh-local` profile without explicit owner approval and a documented cold-chain plan.

Native Medusa protection is now handled with two pieces:

- Seeded shipping-option rules require `mrmf_cart_fulfillment_scope` to match the option's fulfillment profile, such as `fresh-local` or `shelf-stable-shipping`.
- A backend workflow hook in `apps/backend/src/workflows/hooks/mrmf-shipping-options-context.ts` derives that scope from cart line metadata or variant metadata before Medusa lists Store API shipping options.

The storefront still applies the shared safe-option filter in `packages/shared/src/shipping-options.ts`. Treat that as required defense in depth: invalid selections remain blocked before staged checkout can proceed even if raw Medusa behavior changes.

## Storefront

Start the storefront:

```bash
corepack pnpm --filter @mrmf/storefront dev
```

The storefront uses:

```bash
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_COMMERCE_ADAPTER=medusa-hybrid
NEXT_PUBLIC_CART_ADAPTER=medusa-hybrid
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=
NEXT_PUBLIC_MEDUSA_REGION_NAME=Maury River Local Development Region
```

Adapter modes:

- `medusa-hybrid`: try the Medusa Store API first, then fall back to shared seed data if the API is unavailable.
- `medusa`: require the Medusa Store API and fail loudly if it is unavailable.
- `shared-seed`: use the shared seed catalog only.

Product listing pages, category pages, product detail pages, the staged cart, staged checkout, and availability form all read through the storefront adapter. The fallback exists so the site can still build in CI and on machines where Medusa is not running.

The cart persists locally in the browser and supports add, quantity change, remove, subtotal, fulfillment labels, fresh/local-only warnings, and mixed-cart restrictions. With `NEXT_PUBLIC_CART_ADAPTER=medusa-hybrid`, it also attempts to mirror the staged cart into a Medusa Store API cart when products came from Medusa and include variant IDs. It uses the seeded region named by `NEXT_PUBLIC_MEDUSA_REGION_NAME`, stores the Medusa cart ID in browser storage, updates Medusa line quantities, removes stale Medusa lines, and exposes only shipping/pickup options that pass the shared fulfillment rules and seeded shipping-option safety metadata.

Checkout collects customer contact information, explicit fulfillment method, pickup window where applicable, order summary, and policy acknowledgement. It shows only methods valid for the current cart: farm pickup, farmers-market pickup, local delivery, local preorder, parcel shipping for eligible shelf-stable or supplement products, and chef/wholesale coordination. When a Medusa cart is active, the selected method is written to `/store/carts/:id/shipping-methods` with metadata describing the staged checkout selection. When Medusa is offline, the same selection is stored locally as a staged fallback. Checkout validates the same shared rules as the cart but does not submit a live order or collect live payment yet. The checkout payment step is explicitly staged/test-only even when the Medusa cart bridge is active.

Store API smoke: run this after the backend is restarted on the current code and seed has completed:

```bash
corepack pnpm --filter @mrmf/backend shipping:smoke
```

The script prints the raw Medusa shipping options and app-filtered safe options for fresh-only, shelf-stable-only, and mixed carts. Fresh-only raw options should not include parcel methods once the native hook and seeded rules are active. If raw Medusa still returns broad options, do not proceed to launch; the storefront filter should still block invalid options, and the remaining native gap should stay in the backlog. Shelf-stable-only smoke may skip Store API cart creation while the seed keeps shelf-stable launch products as `coming-soon` with zero stock.

Availability behavior:

- `coming-soon`: visible for education and launch planning, but not cartable.
- `sold-out`: visible with sold-out messaging, but not cartable.
- `seasonal`: cartable with harvest-dependent availability messaging.
- `preorder`: cartable only when the product uses an explicit preorder fulfillment mode.
- zero stock: review before launch; seeded zero-stock coming-soon and sold-out products are blocked by availability status.

Cart recovery stores the Medusa cart ID and selected fulfillment method in browser storage. If the Medusa cart is stale, deleted, expired, or unavailable, the adapter clears the stale cart ID and keeps the customer-visible staged line items where practical. The next sync creates a new Medusa cart when the Store API is available.

Cart adapter modes:

- `medusa-hybrid`: keep the browser cart as fallback and sync to Medusa when possible.
- `medusa`: require Medusa cart sync and throw if the Store API, region, publishable key, or variant IDs are unavailable.
- `staged`: keep the browser-persisted cart only.

## Quick Verification

1. Start Postgres and Redis.
2. Run `corepack pnpm --filter @mrmf/backend db:migrate`.
3. Run `corepack pnpm --filter @mrmf/backend seed`.
4. Run `corepack pnpm --filter @mrmf/backend seed:verify`.
5. Start Medusa with `corepack pnpm --filter @mrmf/backend dev`, or restart it if it was already running before code changes.
6. Run `corepack pnpm --filter @mrmf/backend shipping:smoke`.
7. Start the storefront with `corepack pnpm --filter @mrmf/storefront dev`.
8. Visit `http://localhost:3000/shop` and confirm the catalog source line says `medusa` when the Store API is reachable or `shared-seed via medusa-hybrid` when it has fallen back.
9. Add Blue Oyster Mushrooms to the cart and confirm `/cart` reports a Medusa-backed cart when Medusa products and the publishable key are active.
10. Visit `/checkout`, choose a pickup method, and confirm the page reports that the fulfillment method was saved to the Medusa cart while payment remains staged.
11. Add Fresh Lion's Mane and Mushroom Salt to the cart, then confirm `/cart` shows the mixed-cart warning and does not expose parcel shipping as a safe option. Mushroom Salt is intentionally seeded as coming soon with zero provisional stock until launch availability is confirmed, so this mixed-cart check may require temporarily using another available shelf-stable fixture in development.
12. Visit `/checkout` and confirm mixed carts are blocked until the local and shippable items are split.

## Troubleshooting

- `Bind for 0.0.0.0:5432 failed`: set `POSTGRES_HOST_PORT=5433`, restart Compose, and update `DATABASE_URL` in both env files.
- `Missing "DATABASE_URL" inside the .env file`: copy the root `.env` to `apps/backend/.env` before running Medusa CLI database commands.
- Storefront falls back to shared seed data: start the Medusa backend, confirm `NEXT_PUBLIC_MEDUSA_BACKEND_URL`, and set `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` to the public key printed by the seed.
- Cart bridge remains staged-only: confirm `NEXT_PUBLIC_CART_ADAPTER=medusa-hybrid`, confirm the product catalog source is `medusa`, and confirm products have Medusa variant IDs from the Store API.
- Cart bridge reports missing region: rerun the seed and confirm `NEXT_PUBLIC_MEDUSA_REGION_NAME=Maury River Local Development Region`.
- Missing publishable key: run `corepack pnpm --filter @mrmf/backend seed`, copy the printed public `pk_...` key, and set `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` in the storefront env.
- Cart bridge reports a Store API status error: confirm Medusa is running on `http://localhost:9000`, CORS includes the storefront origin, and the publishable key has not been revoked.
- Cart bridge reports that a sales channel is not associated with a stock location for a variant: rerun `seed` and `seed:verify`. Managed products must have inventory items, inventory levels, and variant inventory links before Store API carts can add them.
- Cart bridge exposes no safe shipping options: mixed carts intentionally return no safe Medusa options; split fresh/local-only items from shippable shelf-stable items. For fresh-only carts, rerun seed and restart Medusa if pickup/local options are missing.
- Raw Store API shows parcel options for a fresh cart: rerun `seed`, restart Medusa so the workflow hook is loaded, and run `shipping:smoke`. The seeded native rules should filter fresh-only raw Store API options. If not, keep checkout staged and rely on the storefront safe-option filter while investigating the native Medusa rule context.
- Cart shipping method save fails: confirm `seed:verify` passes, the cart source is Medusa-backed, the selected option appears in the safe options list, and the option metadata has `fulfillment_type`.
- Stale Medusa cart IDs: refresh the page after the adapter clears the stale ID. If line items came from older product data, remove and re-add them.
- `seed:verify` reports missing region or shipping options: rerun `db:migrate`, rerun `seed`, then rerun `seed:verify`. The seed records are keyed by stable names.
- Checkout shows fulfillment options as unavailable: remove and re-add the cart items so local browser cart state matches the current product adapter data.
- Products with zero stock: confirm whether the product should be `available`, `seasonal`, `preorder`, `coming-soon`, or `sold-out` in `packages/shared/src/products.ts`, then rerun the seed.
- Coming-soon or preorder confusion: coming-soon products are blocked from cart; preorder products must use a preorder-capable fulfillment mode before checkout can continue.
- Medusa peer dependency warnings during install are currently upstream/non-blocking for this phase.

## Payment And Email Placeholders

Stripe is not live. Keep these empty or development-only until checkout is explicitly approved:

```bash
STRIPE_API_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

Email/CRM integration is not configured. Forms validate server-side and can later route through an environment-selected provider:

```bash
EMAIL_PROVIDER=console
EMAIL_FROM=farm@example.com
```

## Known Dependency Warnings

`pnpm install` may report Medusa peer dependency warnings involving the bundled Medusa admin React tree. They are upstream/non-blocking for the current backend seed and storefront work. Keep them documented rather than churning Medusa versions during this phase.
