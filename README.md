# The Maury River Mushroom Farm Website Rebuild

Professional ecommerce and educational website rebuild for The Maury River Mushroom Farm LLC.

The current public site remains live on GoDaddy. This repository is the replacement build and must not be deployed until the owner approves launch.

## Architecture

- Monorepo managed by `pnpm`
- `apps/storefront`: Next.js, TypeScript, Tailwind CSS
- `apps/backend`: Medusa backend scaffold
- `packages/shared`: canonical product data, content data, form schemas, and business rules
- PostgreSQL and Redis for local/prod-like infrastructure via Docker Compose
- Stripe, email, and S3-compatible storage integration points through environment variables

## Local setup

```bash
corepack prepare pnpm@9.15.4 --activate
corepack pnpm install
cp .env.example .env
cp .env apps/backend/.env
docker compose up -d postgres redis
```

PowerShell:

```powershell
corepack prepare pnpm@9.15.4 --activate
corepack pnpm install
Copy-Item .env.example .env
Copy-Item .env apps\backend\.env
docker compose up -d postgres redis
```

If another local PostgreSQL service already uses port `5432`, set `POSTGRES_HOST_PORT=5433` and update both `.env` and `apps/backend/.env` so `DATABASE_URL=postgres://postgres:postgres@localhost:5433/mrmf`.

Storefront: `http://localhost:3000`

Medusa backend: `http://localhost:9000`

Start each service in its own terminal when working on commerce data:

```bash
docker compose up -d postgres redis
corepack pnpm --filter @mrmf/backend dev
corepack pnpm --filter @mrmf/storefront dev
```

Run the Medusa seed after Postgres is up and the backend dependencies are installed:

```bash
corepack pnpm --filter @mrmf/backend db:migrate
corepack pnpm --filter @mrmf/backend seed
corepack pnpm --filter @mrmf/backend seed:verify
```

The seed creates the initial product catalog plus a local development region, manual fulfillment location, pickup/local-delivery/preorder options, parcel shipping options for eligible shelf-stable and supplement products, inventory items, stock levels, and product variant inventory links for managed products. Shipping options carry metadata for fulfillment type, allowed and rejected product fulfillment modes, pickup-window requirements, and whether the method blocks fresh products. Repeated seed runs refresh this metadata and the seed-managed native shipping-option rules on existing shipping options. No parcel shipping option is attached to the fresh-local shipping profile. The backend also registers a Store API shipping-options context hook so Medusa can evaluate the seeded `mrmf_cart_fulfillment_scope` rule for fresh-only, shelf-stable-only, and restricted mixed carts. The storefront still filters options with the shared app-level rules as defense in depth. The seed also prints a local publishable Store API key beginning with `pk_`. Copy that public key into `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` in `.env` when you want the storefront to read products directly from the local Medusa Store API.

To check the seed payload shape without writing commerce records or booting Medusa:

```bash
corepack pnpm --filter @mrmf/backend seed:plan
```

To inspect raw Store API shipping options versus the app-filtered safe options after the backend is running and seeded:

```bash
corepack pnpm --filter @mrmf/backend shipping:smoke
```

The smoke script reports fresh-only, shelf-stable-only, and mixed-cart scenarios. Current shelf-stable launch products are intentionally seeded as `coming-soon` with zero stock, so the shelf-stable Store API cart case may report that cart creation is skipped until an available shelf-stable fixture or launch inventory is configured.

The storefront product adapter is now hybrid by default with `NEXT_PUBLIC_COMMERCE_ADAPTER=medusa-hybrid`. It reads the Medusa Store API when `NEXT_PUBLIC_MEDUSA_BACKEND_URL` and `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` are configured, and falls back to the shared seed catalog during local development or static builds when Medusa is offline. Use `NEXT_PUBLIC_COMMERCE_ADAPTER=medusa` to require Medusa reads, or `shared-seed` for a fully offline storefront.

The storefront cart uses `NEXT_PUBLIC_CART_ADAPTER=medusa-hybrid` by default. It persists a staged browser cart first, then mirrors it to a Medusa Store API cart when Medusa-backed products include variant IDs and the publishable key is configured. If Medusa is offline or the key is missing, the cart remains staged-only. It supports add, quantity change, remove, subtotal, fresh/local-only warnings, mixed-cart restrictions, safe shipping option filtering, selected fulfillment-method persistence, and checkout validation. In checkout, valid Medusa shipping or pickup options are shown for the current cart and the selected method is written back to the Medusa cart when practical. Live payment and final Medusa cart completion remain disabled until Stripe, policies, and launch fulfillment settings are approved.

Product availability states are enforced before cart sync. `coming-soon` and `sold-out` products are visible but blocked from cart and checkout. `seasonal` products may be carted only with harvest availability messaging. `preorder` products are cartable only when their fulfillment mode is explicitly preorder-capable.

## Checks

```bash
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
```

Or run all checks:

```bash
corepack pnpm check
```

## Troubleshooting

If the local storefront starts throwing a missing module error from `apps/storefront/.next/server/vendor-chunks`, stop the dev server and delete the generated Next.js cache before restarting:

```powershell
Remove-Item -Recurse -Force apps\storefront\.next
corepack pnpm install
corepack pnpm --filter @mrmf/storefront dev
```

This is a local build-cache issue, not a source dependency change, when `corepack pnpm check` passes after the cleanup.

If `seed:verify` reports missing regions or shipping options, rerun the seed after migrations:

```powershell
corepack pnpm --filter @mrmf/backend db:migrate
corepack pnpm --filter @mrmf/backend seed
corepack pnpm --filter @mrmf/backend seed:verify
```

If checkout shows every fulfillment option as unavailable, confirm the cart products are still in the current product adapter source and refresh the cart by removing and re-adding the items.

If the cart bridge says the staged browser cart is active, confirm the backend is running, `NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000`, `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` is set to the public `pk_...` value printed by the seed, and `NEXT_PUBLIC_CART_ADAPTER=medusa-hybrid`. Products must be read from Medusa for the cart bridge to have Medusa variant IDs.

If Medusa cart creation reports that a sales channel is not associated with a stock location for a variant, rerun `corepack pnpm --filter @mrmf/backend seed` and `corepack pnpm --filter @mrmf/backend seed:verify`. Managed seeded variants need inventory items, inventory levels, and variant inventory links before the Store API can add them to a cart.

If checkout cannot save a fulfillment method to Medusa, confirm `seed:verify` passes and that the selected cart has at least one safe shipping option. Missing shipping options usually mean migrations or seed did not finish, the publishable key is missing, or the cart mixes local fresh products with shippable shelf-stable products.

If raw Store API shipping options look unsafe, rerun `corepack pnpm --filter @mrmf/backend seed`, restart the Medusa backend so the shipping-options context hook is loaded, then run `corepack pnpm --filter @mrmf/backend shipping:smoke`. The raw Store API should no longer return parcel options for fresh-only carts once seed-managed rules and the hook are active. If raw Medusa behavior is still broad, checkout remains protected by the shared app-level safe-option filter.

If a saved Medusa cart becomes stale, deleted, or unavailable, the storefront clears the stale Medusa cart ID and keeps the staged browser line items where practical. Remove and re-add items if a local browser cart was created against older product data.

If a product appears but cannot be added to the cart, check its inventory status. `coming-soon` and `sold-out` products are intentionally blocked, zero-stock products should be reviewed before launch, and preorder products need an explicit preorder fulfillment mode.

## Business rules

Fresh mushrooms are perishable and are local-only by default. They may support farm pickup, farmers-market pickup, local delivery, or local preorder. Shelf-stable products may support shipping. Fresh mushroom shipping must not be enabled unless explicitly approved.

## Brand

Brand source assets live in `assets/brand-source` and must be preserved. Temporary generated SVG wrappers live in `assets/brand-generated-svg` and are documented in `docs/brand/generated-svg-review.md`.

Official brand fonts are documented in `docs/brand/typography.md`, but the initial website uses license-safe open-source substitutes:

- Cormorant Garamond for headings
- Raleway for navigation, subheadings, and eyebrow text
- Libre Baskerville for body copy

## Deployment

Deployment is intentionally deferred. Notes for the future DigitalOcean Docker Compose deployment live in `docs/deployment`.

Detailed local commerce setup notes live in `docs/deployment/local-commerce-setup.md`.
