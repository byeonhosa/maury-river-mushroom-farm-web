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

The seed creates product categories, collections, shipping profiles, a local development region, a manual fulfillment stock location, one fulfillment set, one US development service zone, provisional pickup/local-delivery/preorder shipping options, safe parcel shipping options for shelf-stable and supplement products, a storefront sales channel, and the initial 10 products. It is idempotent: repeated runs update existing seeded products rather than creating duplicates and reuse seeded region/shipping records by name. Product metadata preserves mushroom-specific fields for species, product format, flavor, texture, cooking, storage, shelf life, fulfillment, related recipes, related species pages, supplement disclaimer, inventory status, and visibility status.

`seed:verify` connects to PostgreSQL through `DATABASE_URL` and checks that the expected products, categories, collections, variants, prices, metadata, shipping profile links, region, service zone, and shipping options exist in the database. It also verifies that no parcel shipping option is attached to the fresh-local shipping profile.

The seed also creates or reuses a publishable Store API key, links it to the storefront sales channel, and prints the public `pk_...` value. Copy that value into `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` in the storefront env when you want `medusa-hybrid` to return Medusa products instead of the fallback catalog.

## Fulfillment Configuration

The provisional pickup locations and windows are maintained in `packages/shared/src/pickup.ts`. Update that file when the owner confirms final farm pickup hours, Lexington Farmers Market schedule, Natural Bridge/local market details, cutoff times, and local delivery rules.

The Medusa seed turns those pickup locations into development shipping options in `apps/backend/src/scripts/medusa-seed-data.ts`. Parcel options are currently limited to:

- `shelf-stable-parcel` on the shelf-stable shipping profile
- `supplement-parcel` on the supplement shipping profile

Fresh-local products use pickup, market pickup, local delivery, or preorder options. Do not add a parcel option to the `fresh-local` profile without explicit owner approval and a documented cold-chain plan.

## Storefront

Start the storefront:

```bash
corepack pnpm --filter @mrmf/storefront dev
```

The storefront uses:

```bash
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_COMMERCE_ADAPTER=medusa-hybrid
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=
```

Adapter modes:

- `medusa-hybrid`: try the Medusa Store API first, then fall back to shared seed data if the API is unavailable.
- `medusa`: require the Medusa Store API and fail loudly if it is unavailable.
- `shared-seed`: use the shared seed catalog only.

Product listing pages, category pages, product detail pages, the staged cart, staged checkout, and availability form all read through the storefront adapter. The fallback exists so the site can still build in CI and on machines where Medusa is not running.

The cart persists locally in the browser and supports add, quantity change, remove, subtotal, fulfillment labels, fresh/local-only warnings, and mixed-cart restrictions. Checkout collects customer contact information, fulfillment choice, pickup window where applicable, order summary, and policy acknowledgement. It validates the same shared rules as the cart but does not submit a live order or collect live payment yet.

## Quick Verification

1. Start Postgres and Redis.
2. Run `corepack pnpm --filter @mrmf/backend db:migrate`.
3. Run `corepack pnpm --filter @mrmf/backend seed`.
4. Run `corepack pnpm --filter @mrmf/backend seed:verify`.
5. Start Medusa with `corepack pnpm --filter @mrmf/backend dev`.
6. Start the storefront with `corepack pnpm --filter @mrmf/storefront dev`.
7. Visit `http://localhost:3000/shop` and confirm the catalog source line says `medusa` when the Store API is reachable or `shared-seed via medusa-hybrid` when it has fallen back.
8. Add Fresh Lion's Mane and Mushroom Salt to the cart, then confirm `/cart` shows the mixed-cart warning.
9. Visit `/checkout` and confirm mixed carts are blocked until the local and shippable items are split.

## Troubleshooting

- `Bind for 0.0.0.0:5432 failed`: set `POSTGRES_HOST_PORT=5433`, restart Compose, and update `DATABASE_URL` in both env files.
- `Missing "DATABASE_URL" inside the .env file`: copy the root `.env` to `apps/backend/.env` before running Medusa CLI database commands.
- Storefront falls back to shared seed data: start the Medusa backend, confirm `NEXT_PUBLIC_MEDUSA_BACKEND_URL`, and set `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` to the public key printed by the seed.
- `seed:verify` reports missing region or shipping options: rerun `db:migrate`, rerun `seed`, then rerun `seed:verify`. The seed records are keyed by stable names.
- Checkout shows fulfillment options as unavailable: remove and re-add the cart items so local browser cart state matches the current product adapter data.
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
