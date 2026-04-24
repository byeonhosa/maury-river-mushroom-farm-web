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

Redis is present for Medusa-compatible local infrastructure:

```bash
REDIS_URL=redis://localhost:6379
```

## Medusa Backend

Start the backend:

```bash
corepack pnpm --filter @mrmf/backend dev
```

Run the seed:

```bash
corepack pnpm --filter @mrmf/backend seed
```

Preview the seed plan without writing product records or booting Medusa:

```bash
corepack pnpm --filter @mrmf/backend seed:plan
```

The seed creates product categories, collections, shipping profiles, a storefront sales channel, and the initial 10 products. Product metadata preserves mushroom-specific fields for flavor, texture, cooking, storage, shelf life, fulfillment, related recipes, related species pages, supplement disclaimer, inventory status, and visibility status.

## Storefront

Start the storefront:

```bash
corepack pnpm --filter @mrmf/storefront dev
```

The storefront uses:

```bash
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_COMMERCE_ADAPTER=shared-seed
```

The current adapter is intentionally transitional. It reads the shared catalog now and keeps a Medusa-compatible UI shape so a later batch can replace the read side with the Medusa Store API.

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
