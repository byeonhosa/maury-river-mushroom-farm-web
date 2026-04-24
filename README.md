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
docker compose up -d postgres redis
corepack pnpm dev
```

Storefront: `http://localhost:3000`

Medusa backend: `http://localhost:9000`

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
