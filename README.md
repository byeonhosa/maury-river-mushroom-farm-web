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

The seed prints a local publishable Store API key beginning with `pk_`. Copy that public key into `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` in `.env` when you want the storefront to read products directly from the local Medusa Store API.

To check the seed payload shape without writing commerce records or booting Medusa:

```bash
corepack pnpm --filter @mrmf/backend seed:plan
```

The storefront product adapter is now hybrid by default with `NEXT_PUBLIC_COMMERCE_ADAPTER=medusa-hybrid`. It reads the Medusa Store API when `NEXT_PUBLIC_MEDUSA_BACKEND_URL` is available and falls back to the shared seed catalog during local development or static builds when Medusa is offline. Use `NEXT_PUBLIC_COMMERCE_ADAPTER=medusa` to require Medusa reads, or `shared-seed` for a fully offline storefront.

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
