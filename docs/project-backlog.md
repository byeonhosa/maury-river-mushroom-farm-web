# Project Backlog

Working roadmap for The Maury River Mushroom Farm website rebuild. Keep this
document current as phases are completed, split, or deferred.

## Phase 0: Baseline cleanup and backlog update

- Goal: Confirm `main` is clean, current checks pass, local startup paths are known,
  and this roadmap is the active implementation sequence.
- Major tasks: Update this backlog, verify local Docker/Postgres/Medusa/storefront
  startup, run seed verification, smoke key routes, and document any local blockers.
- Done when: `main` has this roadmap committed, checks and route smoke are recorded,
  checkout remains staged/test-only, and no feature work has started.
- Suggested branch: `codex/phase-0-baseline-cleanup` for future doc-only cleanup; use
  direct `main` only for owner-approved baseline documentation commits.
- Dependencies or cautions: Do not begin Phase 1 hardening here. Do not commit `.env`,
  `.next`, logs, database files, or other generated local artifacts.

## Phase 1: Native shipping rules / fulfillment hardening

- Goal: Move as much fresh-product shipping protection as practical into Medusa
  data/configuration while preserving storefront safety filters.
- Major tasks: Review shipping profiles, fulfillment sets, service zones, shipping
  options, product metadata, cart option filtering, and mixed-cart behavior. Refine
  native Medusa rules so raw Store API options are safer for fresh carts, and keep a
  Store API smoke script that reports raw Medusa options versus app-filtered options.
- Done when: Fresh products cannot receive parcel shipping through seeded backend
  configuration, shelf-stable products still have parcel options, mixed carts are
  clearly blocked or split, Store API shipping smoke is documented, and tests cover
  the backend and storefront rules.
- Suggested branch: `codex/native-shipping-rules`
- Dependencies or cautions: Requires seeded Medusa/Postgres working locally. Fresh
  mushroom shipping still needs explicit owner approval and a cold-chain plan. Current
  shelf-stable products remain coming-soon/zero-stock until launch availability is
  confirmed, so shelf-stable Store API cart smoke may need a future available fixture.

## Phase 2: Inventory and availability admin foundation

- Goal: Give the owner an initial admin-friendly way to manage availability without
  editing code for every launch-window change.
- Major tasks: Define inventory/availability records, map Medusa inventory status to
  storefront availability, expand the master mushroom/species catalog, create admin
  or scriptable update flows, document how to change coming-soon, seasonal, preorder,
  sold-out, hidden, wholesale-only, inquiry-only, and stock quantities.
- Done when: The owner can update product availability and stock through a documented
  admin/script path, storefront messaging updates correctly, hidden products stay out
  of the public shop, unavailable products cannot be carted, and seed data remains
  idempotent.
- Suggested branch: `codex/inventory-availability-admin`
- Dependencies or cautions: Final prices, unit sizes, launch availability, and stock
  quantities still need confirmation. Avoid creating a custom admin surface that fights
  Medusa if Medusa admin can handle the needed workflow. The current dev-only
  availability manager is process-local and must become authenticated/persistent before
  production use.

## Phase 3: Notify-me / back-in-stock system

- Goal: Capture demand for sold-out, seasonal, coming-soon, and preorder products.
- Major tasks: Add notify-me forms, server-side validation, a durable storage model,
  development admin visibility, notification preview scripts, safe draft templates, spam
  protection scaffolding, and opt-in/unsubscribe foundations.
- Done when: Customers can request notifications from relevant product states, requests
  are stored in Postgres, duplicate handling is documented, previews can be generated
  without sending real email, and privacy/unsubscribe work is tracked for legal review.
- Suggested branch: `codex/notify-me-back-in-stock`
- Dependencies or cautions: Production email/CRM provider selection, durable rate
  limiting, suppression/bounce handling, privacy-policy updates, and owner approval are
  still required before sending real customer emails. Do not imply product availability
  dates that the farm has not confirmed.

## Phase 4: Visual design refresh

- Goal: Move the storefront from functional scaffold to a polished premium local-food
  experience while staying within the brand guide.
- Major tasks: Refine homepage composition, category pages, product detail layout,
  farm/market/restaurant pages, responsive spacing, image crops, card density, alt
  text, typography, focus states, and accessibility.
- Current implementation note: `codex/visual-refresh` rebalances the storefront toward
  a warm light canvas, centralizes card/button/input/badge primitives, brightens product
  and content cards, and keeps dark brand colors for deliberate emphasis instead of the
  default field.
- Done when: Key routes feel cohesive on mobile and desktop, real photos are used only
  where appropriate, no brand contrast rules are violated, and accessibility checks are
  addressed.
- Suggested branch: `codex/visual-refresh`
- Dependencies or cautions: Exact Blue Oyster, Golden Oyster, packaged product photos,
  official designer SVGs, final provenance, and owner-approved alt text remain needed.
  Generated SVGs are raster wrappers, not production vector masters. A formal designer
  and accessibility review should still happen before launch.

## Phase 5: Stripe test mode, tax, and order-email scaffolding

- Goal: Prepare checkout plumbing in safe test mode without enabling live payments or
  final paid orders.
- Major tasks: Configure Stripe test placeholders, tax assumptions, payment intent or
  Medusa payment provider scaffolding, staged order email templates, webhook skeletons,
  and policy acknowledgement flow.
- Current implementation note: `codex/stripe-test-checkout` adds explicit checkout
  modes, rejects live-payment requests, accepts only Stripe test-key prefixes for
  test readiness, creates Postgres-backed test checkout records, previews customer and
  farm/admin confirmation emails with the console provider, and keeps tax as a
  documented placeholder.
- Done when: Test-mode payment flow can be exercised without live credentials, order
  email scaffolding is documented, checkout still cannot create a real paid order, and
  secrets remain outside Git.
- Suggested branch: `codex/stripe-test-checkout`
- Dependencies or cautions: Requires final tax/shipping assumptions and legal review of
  checkout policies. Do not commit keys or enable live Stripe. The current scaffold
  does not create Medusa orders, Stripe Checkout Sessions, webhooks, refunds, or
  production receipts.

## Phase 6: DigitalOcean staging deployment

- Goal: Deploy a private staging environment on DigitalOcean for owner review.
- Major tasks: Finalize Docker Compose services, environment variable checklist,
  database migration/seed process, backups, logs, reverse proxy/TLS plan, health checks,
  and rollback notes.
- Current implementation note: `codex/digitalocean-staging` adds IP-only staging
  Compose files, a Node build image, Nginx port-80 reverse proxy, `.env.staging`
  example, and a DigitalOcean deployment runbook. Staging keeps Medusa/Postgres/Redis
  private to the Docker network except for the public Store API paths proxied through
  port 80.
- Done when: Staging runs storefront, Medusa, Postgres, and Redis from documented
  commands; backups are tested; and staging is not connected to production DNS.
- Suggested branch: `codex/digitalocean-staging`
- Dependencies or cautions: Do not touch GoDaddy or production DNS. Requires staging
  secrets and droplet access outside the repo. IP-only staging is HTTP-only until a
  domain-based staging host is approved.

## Phase 7: Production app integration architecture

- Goal: Design the bridge between the public website and the farm's future internal
  production-tracking system.
- Major tasks: Define integration boundaries, data ownership, API contracts, auth
  model, caching strategy, failure modes, audit logging, and what customer-facing data
  may be exposed.
- Done when: Architecture docs identify source systems, sync direction, security model,
  rollout stages, and implementation risks before code begins.
- Suggested branch: `codex/production-integration-architecture`
- Dependencies or cautions: Needs owner input on the internal production system. Avoid
  exposing sensitive production, customer, or operational data.

## Content completion pass: Product, species, and recipe content

- Goal: Make the current storefront read like a real specialty mushroom business
  while keeping production-app integration, live checkout, and final launch claims
  out of scope.
- Current implementation note: `codex/catalog-content-completion` improves product
  descriptions, species education, recipe instructions, category explanations,
  buying guidance, and internal product/species/recipe links. It also adds
  `docs/content/catalog-content-review.md` for owner/legal/design follow-up.
- Done when: Seeded products, master species, category pages, and recipes explain
  flavor, texture, cooking, storage, fulfillment, availability, and notify-me paths
  clearly without making unavailable items cartable or adding disease claims.
- Suggested branch: `codex/catalog-content-completion`
- Dependencies or cautions: Draft recipes still need owner testing. Final prices,
  pickup windows, launch stock, product photos, and supplement/legal review remain
  required before launch.

## Phase 8: FarmRaise/accounting export layer

- Goal: Prepare clean exports for accounting, grants, or farm operations workflows.
- Major tasks: Identify required fields, design order/customer/product export formats,
  map taxes, discounts, fulfillment methods, and refunds, and create manual export
  scripts or admin actions.
- Done when: A test export can be generated from seeded/test orders, field mapping is
  documented, and sensitive data handling is clear.
- Suggested branch: `codex/farmraise-accounting-export`
- Dependencies or cautions: Requires real order model decisions from Phase 5 and owner
  confirmation of FarmRaise/accounting requirements.

## Phase 9: AI Marketing Studio: drafts + campaign calendar

- Goal: Help the owner draft product, recipe, market, and education campaigns without
  auto-publishing.
- Major tasks: Define campaign content types, draft generation guardrails, review
  workflow, seasonal calendar, product availability inputs, and saved draft storage.
- Done when: The owner can generate and edit draft campaign ideas, nothing posts
  automatically, and supplement/health language is flagged for review.
- Suggested branch: `codex/ai-marketing-studio-drafts`
- Dependencies or cautions: Requires strong health-claim safeguards. Do not generate
  disease-treatment claims or imply FDA review beyond required disclaimers.

## Phase 10: Social account API integrations

- Goal: Connect approved social accounts for read/write-capable future workflows.
- Major tasks: Research platform APIs, auth flows, token storage, rate limits,
  permissions, webhook options, and account-specific policy constraints.
- Done when: Integration plan and test-mode connections are documented, tokens are held
  outside Git, and the app can safely identify connected accounts.
- Suggested branch: `codex/social-api-integrations`
- Dependencies or cautions: Requires owner-controlled social app credentials and
  platform approval. Respect API terms and avoid brittle scraping.

## Phase 11: Comment triage and social analytics

- Goal: Help the owner monitor comments, common questions, customer sentiment, and
  campaign performance.
- Major tasks: Pull comments/metrics where APIs permit, classify common topics, flag
  urgent or sensitive messages, summarize performance, and keep human review central.
- Done when: The owner can review triaged comments and basic analytics in a dashboard
  or report without automatic public replies.
- Suggested branch: `codex/comment-triage-analytics`
- Dependencies or cautions: Depends on Phase 10 account connections. Handle customer
  data carefully and avoid automated medical, legal, or refund advice.

## Phase 12: Limited auto-posting and safe auto-replies

- Goal: Add tightly controlled automation only after draft/review workflows are trusted.
- Major tasks: Build approval queues, allowlists, scheduling controls, kill switches,
  audit logs, safe reply templates, escalation rules, and platform-specific compliance
  checks.
- Done when: Auto-posting and replies are limited, reversible, logged, and require
  explicit owner-approved rules.
- Suggested branch: `codex/limited-auto-posting`
- Dependencies or cautions: Depends on Phases 9-11. Do not auto-reply to health,
  legal, refund, payment, or complaint topics without human review.

## Phase 13: Launch readiness and production migration

- Goal: Prepare the replacement site for owner-approved launch.
- Major tasks: Final content review, legal review, supplement language review,
  production Stripe/email/storage setup, staging signoff, backup restore test,
  performance/accessibility pass, DNS migration plan, and rollback plan.
- Done when: Owner approves launch checklist, production environment is ready, DNS plan
  is scheduled, GoDaddy migration steps are documented, and rollback is tested.
- Suggested branch: `codex/launch-readiness`
- Dependencies or cautions: Do not deploy, change DNS, or touch GoDaddy until the owner
  explicitly approves the production migration.

## Cross-cutting backlog

- Replace generated SVG logo wrappers with official designer-provided vector files.
- Complete missing product photography and confirm image usage rights.
- Complete owner review of the catalog content pass, especially recipe testing,
  final market/pickup language, wholesale expectations, and supplement wording.
- Confirm final pickup windows, delivery rules, preorder cutoffs, market schedules,
  prices, unit sizes, and stock quantities.
- Replace the development-only availability manager with an authenticated Medusa Admin
  extension or production-tracking integration before launch.
- Obtain legal review for privacy, terms, refund, shipping/pickup, supplement, and
  health-related language.
- Configure production email/CRM, Stripe, backups, monitoring, and deployment secrets
  outside Git.
- Replace Phase 5 test checkout records with owner-approved Medusa order completion,
  Stripe test/live payment provider wiring, webhook handling, final tax rules, refund
  flow, and production receipt emails before launch.
- Replace Phase 3 notification email preview scaffolding with approved production email
  provider, tested unsubscribe/suppression handling, privacy-policy updates, and durable
  rate limiting before launch.
- Review Medusa peer dependency warnings only when they block real work; current
  warnings are documented as upstream/non-blocking.
