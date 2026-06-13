# Maury River Mushroom Farm Website — Claude Code Project Instructions

This file governs Claude Code sessions in this repo. It covers the
**engineering and workflow layer only**. The brand, business, legal, and
health-claim rules live in **`AGENTS.md`** (the original Codex governance doc),
which remains the source of truth — this file points to it and must not
restate it.

## Session Start (MANDATORY)
1. `git pull` on `main` to sync changes pushed from other sessions or the droplet.
2. Read this file and skim `AGENTS.md`.
3. Read the vault context: `C:\Knowledge\dryden-vault\improved-vault\10-Products\MRMF-Website\Current-Context.md`.

## Session End (MANDATORY)
1. Run `corepack pnpm check` and make sure it passes (lint, typecheck, test, build).
2. Commit with a descriptive message and `git push` (feature branch → PR; see Workflow).
3. Update the Obsidian vault (see the Vault section at the bottom).
4. Surface `git status` if anything is left uncommitted.

## Product
A premium local-food **ecommerce + education** site for The Maury River
Mushroom Farm LLC: it sells gourmet and functional mushrooms and pantry
products, teaches customers how to choose/cook/store each species, generates
restaurant/wholesale leads, and is designed to become a customer-facing layer
over the farm's internal production-tracking app later. It replaces the current
GoDaddy site, which stays live and untouched until launch is approved.

> **Handoff:** this repo was built by **Codex** (autonomous PRs, ~April–June
> 2026) under `AGENTS.md` and `docs/codex-prompts/`. As of **June 2026, Claude
> Code is the maintainer.** Codex's `AGENTS.md` is retained as the authoritative
> brand/business/legal rulebook; this `CLAUDE.md` adds the engineering workflow.

- **Repo:** https://github.com/byeonhosa/maury-river-mushroom-farm-web
- **Staging:** http://167.99.59.42 (IP-only HTTP, owner review)
- **Production (GoDaddy, untouched):** https://themauryrivermushroomfarm.com
- **Related repo:** `byeonhosa/mushroom-app` (internal production app; future Phase 7 integration target — separate repo, separate droplet)

## Source-of-truth pointers (read these, don't restate them)
- **`AGENTS.md` (root)** — brand colors, logo rules, fonts, content rules,
  supplement/health-claim language, and the fresh-mushroom local-only/
  no-shipping rule. **Do not duplicate any of this in code reviews or docs —
  cite `AGENTS.md`.**
- **`docs/content/inventory-availability-model.md`** — the availability model
  (states + the five customer-facing availability **tiers**) and species codes.
- **`docs/content/content-model.md`**, **`catalog-content-review.md`** — catalog/
  content structure and the owner/legal review queue.
- **`docs/content/customer-notifications.md`** — notify-me / back-in-stock model.
- **`docs/deployment/digitalocean-staging.md`** — the IP-only staging runbook
  (build/migrate/seed/start, the price re-seed gotcha, verification commands).
- **`docs/deployment/postgresql-backups.md`** — backup automation + the tested
  restore drill.
- **`docs/deployment/test-checkout-and-payments.md`** — Phase 5 test-checkout
  scaffolding and the payment-mode guards.
- **`docs/migration/redirect-map.md`** — proposed GoDaddy → rebuild 301 map.
- **`docs/legal/policy-review-notes.md`** — items awaiting legal review.
- **`docs/project-backlog.md`** — the phased roadmap and current status.
- **`docs/review/takeover-review-2026-06.md`** — the June 2026 takeover review.

## Tech Stack (verified from the repo)
- **pnpm monorepo**, `packageManager: pnpm@9.15.4`, driven through **corepack**.
  Workspaces: `apps/storefront`, `apps/backend`, `packages/shared`.
- **`apps/storefront`** — Next.js `^15.1.6` (App Router) + React `^19`,
  Tailwind `^3.4`, `zod ^3.24`, `lucide-react`. Reads commerce data from the
  Medusa Store API (hybrid adapter) with a shared-seed fallback.
- **`apps/backend`** — Medusa `^2.8.7` (`@medusajs/framework` + `@medusajs/medusa`),
  `pg`, `ts-node`, `vitest`. Custom seed + verification + smoke scripts under
  `apps/backend/src/scripts/`.
- **`packages/shared`** — canonical domain logic in TypeScript with **zod**
  schemas: products, species, recipes, pickup, availability, business rules,
  cart/checkout/commerce, notifications, policies, tax, brand, plus the
  `site-mode` (informational-mode) and `species-tiers` modules. Storefront and
  backend both import from here, so business rules stay in one place.
- **PostgreSQL** (Medusa data) and **Redis** in the Docker stack; Redis is wired
  to Medusa via `REDIS_URL` (`medusa-config.ts` → `projectConfig.redisUrl`).
  <!-- TODO: confirm which Medusa subsystems are Redis-backed vs in-memory —
  staging currently logs "Local Event Bus installed", i.e. the event bus is
  in-memory even though redisUrl is set. -->

## Workflow
- **PR-based, CI is the gate.** Branch off `main` (use a `claude/<topic>`
  branch), open a PR, wait for CI green, then squash-merge and delete the
  branch. Don't push to `main` directly and don't merge without the owner's
  go-ahead on anything non-trivial.
- **CI** (`.github/workflows/ci.yml`) runs on every PR and on push to `main`
  and `codex/**`: `pnpm install --frozen-lockfile` then `pnpm check` (lint +
  typecheck + test + build) on Ubuntu, Node 22, pnpm 9.15.4. A red check means
  do not merge. (PRs from `claude/**` branches get CI through the `pull_request`
  trigger; the `push` trigger doesn't list `claude/**`.)
  <!-- TODO: confirm whether to add `claude/**` to the CI push-branch triggers
  for parity with `codex/**`, now that Claude Code is the maintainer. -->
- **Staging deploy is manual** (no auto-deploy workflow — unlike the
  mushroom-app repo). After a merge, deploy by hand per
  `docs/deployment/digitalocean-staging.md`: `ssh root@167.99.59.42`, then in
  `/opt/mrmf-website-staging` run `git pull`, rebuild the relevant Compose
  services, and re-run migrate/seed/verify as needed. Verify from outside with
  the route + cart smokes.
  <!-- TODO: confirm whether to add an `ssh mrmf-staging` alias in
  ~/.ssh/config; today the droplet is reached as plain `ssh root@167.99.59.42`. -->
- **Current site state: informational mode.** Staging runs with
  `NEXT_PUBLIC_INFORMATIONAL_MODE=true` — the full catalog + availability tiers
  + notify-me render, but **all cart/checkout paths are disabled site-wide**
  (commerce code stays intact behind the flag). Online checkout returns in a
  later phase by flipping the flag off after Stripe/email/policy/tax + legal land.
- **DNS / GoDaddy are off-limits.** Do not touch the GoDaddy account, change DNS,
  or point production at staging. **Production cutover is NOT authorized** —
  treat any such step as owner-approval-required.

## Build & Test Commands (real, from package.json)
Run from the repo root via corepack. (`corepack pnpm <script>`.)

    # All workspaces
    corepack pnpm install --frozen-lockfile
    corepack pnpm check          # lint && typecheck && test && build (CI runs this)
    corepack pnpm lint           # eslint -r, --max-warnings=0
    corepack pnpm typecheck      # tsc --noEmit -r
    corepack pnpm test           # vitest run -r
    corepack pnpm build          # -r build
    corepack pnpm dev            # storefront + backend in parallel

    # Storefront only (apps/storefront) — http://localhost:3000
    corepack pnpm --filter @mrmf/storefront dev|build|typecheck|lint|test

    # Backend / Medusa (apps/backend) — http://localhost:9000
    corepack pnpm --filter @mrmf/backend dev          # medusa develop
    corepack pnpm --filter @mrmf/backend db:migrate    # medusa db:migrate
    corepack pnpm --filter @mrmf/backend seed          # seed catalog + commerce data
    corepack pnpm --filter @mrmf/backend seed:plan      # inspect seed payload, no DB writes
    corepack pnpm --filter @mrmf/backend seed:verify    # assert the DB matches the seed
    corepack pnpm --filter @mrmf/backend shipping:smoke # raw vs app-filtered shipping options
    corepack pnpm --filter @mrmf/backend cart:smoke     # Store API cart bridge (honors informational mode)
    corepack pnpm --filter @mrmf/backend checkout:smoke # checkout mode + tax/email draft
    corepack pnpm --filter @mrmf/backend notifications:schema|notifications:preview

Local infra (Postgres/Redis) and the full setup live in `README.md` and
`docs/deployment/local-commerce-setup.md`. **Seed gotcha:** re-seeding refreshes
metadata but not existing variant **prices** — a price change needs a fresh DB
on staging (see the staging runbook); for production, do a deliberate migration.

## Safety guardrails (cross-reference — full rules in AGENTS.md)
- **Fresh mushrooms are local-only and must never be made shippable** without an
  explicit, documented owner approval (`AGENTS.md`; enforced in
  `packages/shared/src/business-rules.ts`).
- **Live payments and production email stay disabled.** Checkout is test/staged
  only; `EMAIL_PROVIDER=console`. Live Stripe keys and a production email
  provider are launch tasks, not casual changes.
- **Supplement/functional copy needs the FDA disclaimer and legal review**, and
  uses "functional," never "medicinal" (`AGENTS.md`).
- **No secrets in git.** `.env` / `.env.*` are gitignored (only `.env.example`
  and `.env.staging.example` are committed). The droplet's real secrets live in
  `/opt/mrmf-website-staging/.env.staging`, never in the repo.

## Known State / Tech Debt
- **Informational-mode launch** is the intended initial public posture; checkout
  is dormant behind the flag.
- **Medusa Admin is disabled** in staging (`MEDUSA_ADMIN_DISABLED=true`); there's
  no production auth hardening yet. The dev-only availability admin
  (`/internal/availability`) is process-local and off in production.
- **Backups are staging-grade:** a daily `pg_dump` cron with 14-day rotation and
  a **tested restore drill** on the droplet (`docs/deployment/postgresql-backups.md`),
  plus an off-droplet OneDrive copy on the owner's PC. Production needs encrypted,
  retained, restore-tested backups (or managed Postgres).
- **Production launch blockers:** live Stripe + tax rules, production email/CRM,
  HTTPS + a real domain (staging is HTTP-only), tested production backups, legal
  review of policies/supplement language, official designer SVGs, and final
  photography. See `docs/project-backlog.md` and the takeover review.
- `packages/shared/package.json` `exports` map omits a few newer modules (e.g.
  `site-mode`, `species-tiers`, `shipping-options`, `types`); they resolve via
  the package root, so this is cosmetic.
  <!-- TODO: confirm whether to add the missing subpath exports for consistency. -->

## Conventions
- Use **pnpm via corepack** for everything; never introduce npm/yarn lockfiles.
  Never delete or regenerate `pnpm-lock.yaml` without owner approval.
- Keep PRs **small and reviewable**; explain non-obvious decisions in the PR body.
- **Business logic belongs in `packages/shared`** (with zod), imported by both
  apps — don't fork rules into the storefront or backend.
- When behavior changes, **update the relevant `docs/` file** in the same PR;
  when a new env var is introduced, add a placeholder to `.env.example` (and
  `.env.staging.example` if it affects staging) in the same commit.
- Match the surrounding code's style; run `corepack pnpm check` before declaring
  work done.
- Prefer a clearly-marked **"TODO: confirm"** over guessing when something is
  unclear.

## Obsidian Vault Update (MANDATORY — end of every session)

The vault is its own Git repo (`https://github.com/byeonhosa/dryden-vault`). For
the editing rules, structure, and commit-and-push workflow, the **vault's own
`CLAUDE.md` at `C:\Knowledge\dryden-vault\improved-vault\CLAUDE.md` is the source
of truth.** This section only names the MRMF-Website files to touch.

**File 1 — overwrite each session:**
`C:\Knowledge\dryden-vault\improved-vault\10-Products\MRMF-Website\Current-Context.md`
Follow the canonical template at
`C:\Knowledge\dryden-vault\improved-vault\50-Templates\Current-Context-Template.md`
(the template is the source of truth for required sections — don't enumerate
them here, to avoid drift).

**File 2 — new append-only file each session:**
`C:\Knowledge\dryden-vault\improved-vault\10-Products\MRMF-Website\Development-Status\MRMF-Website_Development_Status_[YYYYMMDD_HHMMSS].md`
(EST / America/New_York timestamp). Create the `Development-Status` directory if
it doesn't exist.

**Commit + push the vault** with a message of the form
`vault: MRMF-Website: <what changed and why>`. Pull first to avoid conflicts with
the Obsidian Git plugin. Committing directly is the durable path — the plugin's
auto-push is a safety net, not the workflow.
