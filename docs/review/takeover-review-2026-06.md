# Takeover Review — June 2026

Date: 2026-06-11
Reviewer: Claude Code (session takeover from the April–May 2026 Codex build effort)
Scope: read-only assessment of (1) the repo, (2) the DigitalOcean staging droplet,
(3) the live GoDaddy site, and (4) the gaps between them. No deployments, DNS
changes, or GoDaddy modifications were made. The only changes from this session
are documentation (this report and a backlog status update).

## Executive summary

The rebuild is in better shape than expected and staging is **not** stale: the
running staging build is content-identical to `main` HEAD (`8b76360`), so the
post-QA fixes (hero contrast, favicon metadata, Medusa cart path) and the catalog
content pass are all live. Local `corepack pnpm check` passes end-to-end,
including the build step the prior review skipped. The Medusa-backed cart path
works against staging with no parcel-option leakage for fresh products.

The live GoDaddy site is a real, transacting store — not informational. It sells
ten products by card today (flat $7.00 fresh pricing, $15.00 supplements), which
makes price confirmation a launch decision, not a guess. Its biggest liabilities
are things the rebuild already does better: the privacy policy literally says
"Privacy Policy coming soon," the terms page is unedited GoDaddy template text,
the Lion's Mane description makes an unqualified "brain-health benefits" claim,
and the supplements page has no FDA disclaimer.

The single most dangerous migration dependency is confirmed: **email for
`john@themauryrivermushroomfarm.com` is Microsoft 365 resold through GoDaddy**,
and its DNS authentication is broken today (SPF omits Outlook, DKIM was never
configured, DMARC is `p=none`). The migration plan below treats email continuity
as a first-class workstream, and the SPF/DKIM fix is worth doing even before any
migration.

Top gaps found: no automated/tested database backups on staging (one manual dump
from April 27), staging is crawlable by search engines (no robots.txt/noindex;
bingbot observed), and the live site's real-world catalog (4-oz units, flat $7,
king blue oyster, chestnut, $15 supplements) diverges substantially from the
seeded catalog (8-oz clamshells, $10–$14, no king blue/chestnut products, $28
capsules). Every discrepancy is tabled below for owner confirmation.

## Track 1 — Codebase verification

Verified on Windows 11 local checkout, 2026-06-11, `main` @ `8b76360`.

| Check | Result |
|---|---|
| `corepack pnpm install --frozen-lockfile` | Pass (exit 0) |
| `corepack pnpm check` (lint + typecheck + test + build) | Pass (exit 0) |
| Tests | 67 passed: 38 `packages/shared`, 12 `apps/backend`, 17 `apps/storefront` |
| Storefront build | Compiled in ~25 s, 50/50 static pages generated, all routes present |

- No dependency issues block work. The known Medusa peer-dependency warnings
  remain upstream/non-blocking as documented in the backlog.
- The build step — which the 2026-06-11 independent review could not run — passes
  locally. Build output route inventory matches the deployed staging site.

### Branch flags

- **`claude/adhd-app-planning-ZdpNx`** exists on the remote (`6f4628d`). It adds
  exactly one file, `docs/adhd-app-plan.md` (212 lines) — an unrelated ADHD app
  planning document whose own header says it was parked on a branch because the
  working tree happened to be this monorepo. Per vault conventions this content
  belongs in the vault, not a product repo. **Owner decision required** before
  moving the doc and deleting the branch (asked at session end).
- Fifteen stale local `codex/*` branches remain from merged PRs (their remote
  counterparts are deleted). Safe housekeeping candidate for a future session.

## Track 2 — Droplet / staging audit

Audited via SSH (`root@167.99.59.42`, existing `id_ed25519` key) on 2026-06-11.

### Inventory

| Item | Value |
|---|---|
| Droplet | `ubuntu-mrmf-staging-firewall`, Ubuntu 24.04.3 LTS, 2 vCPU / 4 GB / 80 GB |
| Uptime | 45 days (since ~Apr 27 setup); load ~0.09; 13 GB disk used (16%); ~1.9 GB RAM available; no swap |
| Containers | `reverse-proxy` (nginx:1.27-alpine, :80 public), `storefront`, `backend` (healthy), `postgres:16-alpine`, `redis:7-alpine` — Postgres/Redis publish no host ports |
| Other tenants | None — droplet is dedicated to MRMF staging |

### Deployed commit — staging is current

- Droplet checkout: `8b76360` = current `main` HEAD.
- Running images were built 2026-05-02 23:06 UTC from `6103516` (the
  catalog-content branch tip). `git diff 6103516 8b76360` is **empty** — the
  merge introduced no tree change — so the running build is content-identical
  to `main` HEAD. A later `git pull` (May 3 04:59 UTC) moved the checkout to the
  merge commit without a rebuild, which is why image timestamps predate the
  checkout; no drift results.
- Therefore all post-May-3 concerns are already live: hero overlay contrast fix
  (PR #13), favicon metadata fix (PR #13), Medusa cart-path hardening (PR #14),
  catalog content pass (PR #15). **No redeploy needed.**

### Smoke results (run 2026-06-11)

- **Cart smoke** (from local, per README staging command): `ok: true`,
  `source: "medusa"`, real variant + cart created for `fresh-lions-mane`. Raw
  Store API options = app-filtered safe options = farm pickup, Lexington
  Farmers Market pickup, Natural Bridge local market pickup, fresh local
  delivery, fresh preorder coordination. **No parcel option leaks for a
  fresh-only cart** — the native shipping rules + context hook work on staging.
  This closes QA P1 #2 in observed behavior, not just in code.
- **Route smoke**: 19/19 key routes return HTTP 200 (`/`, shop, product, cart,
  checkout, mushrooms, recipes, farm, markets, wholesale, contact,
  subscriptions, supplements, all four policy pages). `/favicon.ico` returns
  404 — expected: PR #13 used Next metadata icon links to the brand PNG rather
  than a literal favicon.ico; browsers use the link tags. Cosmetic only.
- **Checkout safety env** (`.env.staging` flags verified on droplet):
  `CHECKOUT_MODE=staging`, `ENABLE_TEST_PAYMENTS=false`,
  `ENABLE_LIVE_PAYMENTS=false`, `EMAIL_PROVIDER=console`,
  `TAX_MODE=placeholder`, `MEDUSA_ADMIN_DISABLED=true`.

### Backups — high-priority gap

- Exactly **one** manual Postgres dump exists: `mrmf-staging-20260427-024406.dump`
  (413 KB, Apr 27) — it predates the May 2–3 redeploy content.
- **No cron job, no systemd timer, no automation, and no restore has ever been
  tested.** `docs/deployment/postgresql-backups.md` describes expectations only.
- Stakes today are low (seed/test data), but notification signups land in this
  Postgres, and this droplet pattern is the template for production. Automated
  daily dumps + at least one off-droplet copy + a documented restore drill
  should precede any production cutover (already a cross-cutting backlog item;
  now confirmed unstarted on the droplet).

### Logs

- Backend: clean; only the known non-production "Local Event Bus" warning.
- Storefront: ~8,400 `Failed to find Server Action "x"` errors (May 3 → Jun 11,
  ~215/day). Timestamps correlate with junk bot POSTs in the nginx log (action
  ID literally `"x"`); the app handles them safely. Benign noise, but worth a
  basic nginx rate limit before production.
- Nginx: normal internet background radiation — TLS probes against port 80
  (400s), `/.env` scans (404 — nothing served), `POST /formaction` probes.

### Security posture

- Externally reachable: ports 22 and 80 only. Direct probes to 9000 (Medusa)
  and 5432 (Postgres) from outside: filtered. Medusa admin `/app`: 404
  (disabled). `/health`: 200.
- `ufw` is inactive; protection relies on the DigitalOcean cloud firewall
  (`mrmf-staging-firewall`, per deployment doc: 22 from owner IP, 80 from all).
  Observed behavior is consistent, but **the DO firewall rules should be
  re-verified in the DO console** (not possible from the droplet itself).
- HTTP-only by design for IP staging; TLS arrives with the production domain.
- **Gap: staging is indexable.** No `robots.txt` (404s to the Next 404 page)
  and no `noindex` meta/header on real pages; bingbot was observed crawling.
  A spot check found no staging URLs in Google yet. Recommended quick fix at
  the nginx layer (disallow-all robots.txt + `X-Robots-Tag: noindex`) — small
  config change + container restart, **not done this session** (review-only).

## Track 3 — Live GoDaddy site review

Crawled read-only 2026-06-11 (static fetch + headless-Edge rendered DOM; the
GoDaddy store module is client-rendered).

### Page inventory

| URL | What it is |
|---|---|
| `/` | Single-page site: hero, About/Our Story, photo gallery, contact form, social links, subscribe |
| `/shop` | GoDaddy Online Store (OLS) module — the real store UI; deep links route via `/shop?olsPage=…` |
| `/privacy-policy` | **Placeholder: "Privacy Policy coming soon"** |
| `/terms-and-conditions` | **Unedited GoDaddy template instructions**, including placeholder Return & Refund copy |
| `/m/login`, `/m/reset`, `/m/create`, `/m/create-account` | GoDaddy membership/account pages (sign-in, orders, account) |
| `/ols/products`, `/ols/products/<slug>` ×10, `/ols/categories/<slug>` ×6 | In sitemap; when fetched directly they serve the homepage shell — store content only renders through `/shop` |
| `/sw.js` | **Service worker registered for all visitors** (migration implication below) |
| `sitemap.xml` | Index → `sitemap.website.xml` (8 URLs) + `sitemap.ols.xml` (17 URLs) |
| `robots.txt` | `User-agent: * / Disallow: /404` |

### Commerce functionality — it is a real store

A customer **can buy by card today**: every product page has Buy Now / Add to
Cart (GoDaddy Payments checkout), and the site has customer accounts with order
history. Notably, all ten product URLs are purchasable when visited directly,
including products absent from the default shop grid (only ~5 appear there).

Full live catalog (rendered 2026-06-11):

| Live product | Price | Sizes/variants | Description (verbatim where present) |
|---|---|---|---|
| FM Lion's Mane Mushroom 4 oz. | $7.00 | 4 oz / 8 oz | "4 oz. of fresh Lion's Mane mushroom, known for its exceptionally delicious taste and brain-health benefits." |
| FM Golden Oyster Mushroom 4 oz. | $7.00 | 4 oz / 8 oz | "Fresh golden oyster mushrooms, perfect for culinary use." |
| FM Blue Oyster Mushroom 4oz (slug: `oyster-mushroom`) | $7.00 | 4_oz / 8_oz | — |
| FM Pink Oyster Mushrooms 4 oz. | $7.00 | 4 oz / 8 oz | — |
| FM King Blue Oyster Mushroom | $7.00 | 4 oz / 8 oz | — |
| FM Chestnut Mushrooms 4oz. | $7.00 | single size | "Freshly harvested wild mushrooms, perfect for gourmet cooking." |
| Chestnut Mushrooms 4 oz. (duplicate listing, second slug) | $7.00 | single size | same as above |
| FM White Oyster Mushrooms 4 oz. | $7.00 | single size | "Freshly grown white oyster mushrooms, perfect for culinary use." |
| LM Supplements | $15.00 | 100 / 30 capsules selectors | **No FDA disclaimer anywhere on the page** |
| BR Umami Garlic Salt | $7.00 | single size | — |

The 8-oz price is not displayed without interactive variant selection and is
**unconfirmed** ("From $7.00" cards imply 4 oz is the base).

Compliance notes on the live store (do **not** port this copy):

- "brain-health benefits" on a food product, with no disclaimer.
- Site tagline and About copy repeatedly say "medicinal mushrooms" — language
  the rebuild deliberately avoids in favor of cautious functional framing.
- Supplements sold with no FDA disclaimer.
- Duplicate chestnut listings; "wild" describes cultivated chestnuts.
- Privacy/terms placeholders on a transacting store that sets GA cookies,
  runs reCAPTCHA, and collects a marketing list.

### Content inventory (homepage)

- **Header banner (verbatim, sic):** "Find us at the Lexington Farmers Market
  every wednesday and the Natural Bridge Farm" — appears unfinished/truncated
  on the live site itself. Exact market names/days need owner confirmation.
- **About/Our Story (verbatim):** "The Maury River Mushroom Farm LLC is a
  family-run farm nestled in the Shenandoah Valley and dedicated to cultivating
  exceptional gourmet and medicinal mushrooms. We grow with purpose: to nourish
  our community with healthy, sustainable food, craft innovative value-added
  mushroom products, and inspire a legacy of perseverance and prosperity for
  future generations." / "We sell our fresh mushrooms at farmers markets,
  through subscription services, and directly to local restaurants. Our unique,
  mushroom-based products are also available for purchase online. Everything we
  do is rooted in care—for quality, for the environment, and for the people we
  serve."
- **Contact:** form (Name, Email*, file attachments; reCAPTCHA-protected;
  submissions land in GoDaddy) + address "2568 Walnut Ave, Buena Vista, VA
  24416" + phone (540) 784-5051 + email john@themauryrivermushroomfarm.com.
- **Social:** Facebook profile id 61574433703417; Instagram
  @mauryrivermushrooms.
- **Subscribe:** email signup into GoDaddy's marketing list ("We believe your
  privacy is important and will not share your information without your
  approval.").
- **Photography:** three real farm photos (`IMG_0490.jpg` hero, `IMG_0505.jpg`,
  `IMG_6343.jpg`), two iStock images (`iStock-1783422553`, `iStock-2161301056` —
  the latter is also the OG/social image), one vecteezy oyster cutout, plus the
  horizontal logo PNG. Gallery has a "Chestnut" caption.
- **Analytics:** Google Analytics `G-BF2FDR6KMM`; cookie-consent banner.

### SEO surface

- Title: "The Maury River Mushroom Farm LLC" (same on all rendered pages —
  store pages do not get unique titles in static HTML).
- Meta/OG: og:description "Explore our farm for fresh gourmet and medicinal
  mushrooms!"; twitter:description "Farm-Fresh Gourmet & Medicinal Mushrooms";
  og:image = the iStock hero on GoDaddy's CDN.
- JSON-LD: a single LocalBusiness block (name, address, geo
  37.7393127,-79.3482938) — no Product schema.
- Google index spot check: only the homepage and `/terms-and-conditions`
  surfaced. **Organic footprint is minimal — 301 fidelity matters for the
  domain, not for rankings.**
- Canonicalization: `www` 301s to apex; `http` 307s to `https`. Canonical host
  is the bare apex over HTTPS.

### Email and DNS (the GoDaddy-exit critical path)

| Record | Value (2026-06-11) | Implication |
|---|---|---|
| NS | `ns41/ns42.domaincontrol.com` | DNS is hosted at GoDaddy |
| SOA | `dns.jomax.net` | GoDaddy |
| A (apex) | `13.248.243.5`, `76.223.105.230` | GoDaddy Website Builder anycast IPs |
| `www` | CNAME → apex | preserve at migration |
| MX | `0 themauryrivermushroomfarm-com.mail.protection.outlook.com` | **Email is Microsoft 365 resold via GoDaddy** |
| TXT | `NETORG18472464.onmicrosoft.com` | M365 tenant marker (GoDaddy-managed tenant) |
| SPF | `v=spf1 include:spf.em.secureserver.net include:secureserver.net -all` | **Broken for M365**: no `include:spf.protection.outlook.com`, with hard-fail `-all` — outbound mail from the M365 mailbox likely fails SPF *today* |
| DKIM | `selector1/selector2._domainkey` → NXDOMAIN | **M365 DKIM never configured** |
| DMARC | `v=DMARC1; p=none; rua=mailto:dmarc_rua@onsecureserver.net` | Monitor-only |
| Autodiscover | CNAME → `autodiscover.outlook.com` | Outlook client config |

The farm's working email (`john@…`) rides this setup, so the migration **must**
recreate the full mail record set at the new DNS host before cutover. Separately
— and independent of any migration — SPF should gain
`include:spf.protection.outlook.com` and DKIM should be enabled in the M365
admin, or outbound deliverability will keep degrading as receivers tighten
enforcement. (Touches GoDaddy DNS, so explicitly **not done** this session.)

## Track 4 — Gap analysis and migration readiness

### Content parity — live page/section → rebuild

| Live (GoDaddy) | Rebuild equivalent | Status |
|---|---|---|
| Homepage hero + welcome | `/` | ✓ (rebuild richer) |
| About / Our Story section | `/our-farm` | ✓ — but rebuild copy is its own draft; owner should pick/blend voice (live verbatim copy preserved above) |
| Photo gallery | no dedicated gallery | Gap (minor) — rebuild distributes imagery; decide if a gallery is wanted |
| Market banner (Lexington Wed / Natural Bridge) | `/markets-pickup` | ✓ structurally; **rebuild intentionally has no final windows** — owner must confirm exact markets/days |
| Contact form (+file attach, reCAPTCHA) | `/contact` | ✓ page exists; rebuild form mechanics differ — verify before launch (no file-attach, no captcha currently) |
| Subscribe (GoDaddy marketing list) | notify-me / weekly availability signups | ✓ different mechanics; **export the GoDaddy subscriber list before exit** |
| Shop grid | `/shop` | ✓ |
| Product: Lion's Mane | `/shop/fresh-lions-mane` | ✓ (price/size differ — below) |
| Product: Golden / Pink / Blue / White Oyster | `/shop/golden-…`, `/shop/pink-…`, `/shop/blue-…`, `/shop/white-oyster-mushrooms` | ✓ (price/size differ) |
| Product: King Blue Oyster | **MISSING as product** (species page `/mushrooms/king-blue` exists) | Gap |
| Product: Chestnut (×2 live listings) | **MISSING as product** (species page `/mushrooms/chestnut` exists) | Gap |
| Product: LM Supplements ($15, 30/100 caps) | `/shop/lions-mane-capsules` ($28, 60 caps, coming-soon) | Mismatch — owner decision |
| Product: BR Umami Garlic Salt | `/shop/mushroom-salt` ($12, 3 oz, coming-soon) | Name/format mismatch — owner decision |
| Customer accounts + order history (`/m/*`) | **No equivalent** (rebuild has no customer accounts) | Gap — accept loss at migration or note for later phase; GoDaddy order history must be exported |
| Privacy "coming soon" | `/privacy-policy` (real draft) | Rebuild ahead |
| Terms template text | `/terms-and-conditions` (real draft) | Rebuild ahead |
| — | `/refund-policy`, `/shipping-pickup-policy` | Rebuild-only (live has placeholder text inside terms) |
| — | 16 species education pages, 7 recipes, dried/salts/supplements/subscriptions categories, `/restaurants-wholesale`, availability states, notify-me | Rebuild-only — no live counterpart |
| OLS categories: fresh-mushrooms-retail / fresh-mushrooms-wholesale / value-added-products | `/fresh-mushrooms`, `/restaurants-wholesale`, `/mushroom-salts-seasonings` | ✓ conceptually |
| OLS categories: merchandise / education-consulting / mushroom-production | **No equivalent** | Appear unused live (no visible products); owner: drop or treat as future offerings |

### Data parity — live prices are the best real-world evidence

Live sells **4-oz units at a flat $7.00**; the seed catalog sells **8-oz
clamshells at differentiated prices**. Flagged for confirmation, not silently
adopted in either direction:

| Product | Live (today) | Seed catalog | Note |
|---|---|---|---|
| Lion's Mane | $7.00 / 4 oz (8 oz option, price unseen) | $14 / 8 oz | Consistent iff 8 oz = $14; rebuild lacks a 4-oz size |
| Blue Oyster | $7.00 / 4 oz | $10 / 8 oz | Mismatch ($14/8-oz-equivalent live) |
| Golden Oyster | $7.00 / 4 oz | $11 / 8 oz | Mismatch |
| Pink Oyster | $7.00 / 4 oz | $11 / 8 oz | Mismatch |
| White Oyster | $7.00 / 4 oz (single size) | $10 / 8 oz (low-stock) | Mismatch |
| King Blue Oyster | $7.00 / 4 oz | — | Missing product in rebuild |
| Chestnut | $7.00 / 4 oz (duplicate listings) | — | Missing product in rebuild |
| LM Supplements | $15.00 (30/100 caps variants) | Lion's Mane Capsules $28 / 60 (coming-soon) | Price & pack-size decision needed |
| Umami Garlic Salt | $7.00 | Mushroom Salt $12 / 3 oz (coming-soon) | Different product identity — confirm lineup |
| Mixed Gourmet Box / Chef's Weekly Mix / Dried Oysters | — | $22 preorder / quote-based / $16 coming-soon | Rebuild-only — confirm before launch |

Open data questions for the owner: 8-oz price(s) today; whether flat-$7
pricing is current strategy or stale; 4-oz vs 8-oz launch packaging; whether
king blue + chestnut should become seeded products (species pages already
exist); supplement price/pack size; final salt product identity.

### URL / redirect map (proposed 301s at the new edge)

Minimal indexed footprint (home + terms), but map everything in the sitemaps:

| GoDaddy URL | → Rebuild target |
|---|---|
| `/` | `/` |
| `/shop` | `/shop` |
| `/privacy-policy` | `/privacy-policy` |
| `/terms-and-conditions` | `/terms-and-conditions` |
| `/ols/products` | `/shop` |
| `/ols/products/-fm-lions-mane-mushroom-4-oz` | `/shop/fresh-lions-mane` |
| `/ols/products/fm-golden-oyster-mushroom-4-oz` | `/shop/golden-oyster-mushrooms` |
| `/ols/products/oyster-mushroom` | `/shop/blue-oyster-mushrooms` |
| `/ols/products/fm-pink-oyster-mushrooms-4-oz` | `/shop/pink-oyster-mushrooms` |
| `/ols/products/fm-white-oyster-mushrooms-4-oz` | `/shop/white-oyster-mushrooms` |
| `/ols/products/fm-kng-bl-ystr-mshrm` | `/mushrooms/king-blue` (until a product exists) |
| `/ols/products/-fm-chestnut-mushrooms-4oz` and `/ols/products/chestnut-mushrooms-4-oz` | `/mushrooms/chestnut` (until a product exists) |
| `/ols/products/lm-spplmnts` | `/shop/lions-mane-capsules` |
| `/ols/products/br-umami-garlic-salt-96ff` | `/shop/mushroom-salt` |
| `/ols/categories/fresh-mushrooms-retail` | `/fresh-mushrooms` |
| `/ols/categories/fresh-mushrooms-wholesale` | `/restaurants-wholesale` |
| `/ols/categories/value-added-products` | `/mushroom-salts-seasonings` |
| `/ols/categories/merchandise` | `/shop` |
| `/ols/categories/education-consulting` | `/mushrooms` |
| `/ols/categories/mushroom-production` | `/our-farm` |
| `/m/login`, `/m/reset`, `/m/create`, `/m/create-account` | `/` (no accounts in rebuild; 410 acceptable) |
| `www.*` | 301 to apex (preserve current canonicalization) |
| `/sw.js` | **Serve a kill-switch service worker** (unregister + clear caches), not a 404 — repeat visitors carry GoDaddy's SW and can otherwise see stale content |

### Launch-blocker list (consolidated)

From the backlog cross-cutting items plus this review's findings:

1. **Prices / units / stock / pickup windows / market schedule confirmation**
   (live site evidence now tabled above; final say is the owner's).
2. **Photography** — both sites lack real product photos; live has 3 real farm
   photos + stock. Originals (`IMG_0490/0505/6343.jpg`) should be collected
   from GoDaddy before exit.
3. **Official designer SVGs** (generated wrappers are rasters, not masters).
4. **Legal review** — policies, refund/shipping language, supplement
   structure/function language + FDA disclaimer placement. (Live site's
   placeholder policies and unqualified claims make this *more* urgent if any
   live copy is reused.)
5. **Authenticated availability admin** — current admin is dev-only,
   process-local; must become authenticated/persistent (Medusa Admin path) or
   wait for production-tracking integration.
6. **Checkout completion** — Phase 5 scaffold intentionally creates no real
   Medusa orders/Stripe charges; production Stripe (test→live), webhooks, tax
   decision, receipts, refund flow remain to be built and approved.
7. **Production email provider** + notification unsubscribe/suppression +
   privacy updates (currently console-only by design).
8. **Backups** — automated, off-droplet, restore-tested (gap confirmed on
   staging; pattern must exist before production).
9. **HTTPS/domain/host** — production hosting decision, TLS via the planned
   reverse proxy, staging robots/noindex fix.
10. **Email continuity** (M365-via-GoDaddy) + SPF/DKIM/DMARC repair.
11. **GoDaddy data export** — subscriber list, order history, customer list,
    photo originals, any form submissions worth keeping.
12. **Cutover mechanics** — 301 map (above), kill-switch `/sw.js`, GA
    continuity (`G-BF2FDR6KMM` or successor), Search Console verification.
13. Fresh-mushroom shipping stays disabled (verified enforced through native
    Medusa rules + app filter on staging).

### Mushroom-app (Phase 7 dependency) — status check only

Per the vault product context (updated 2026-06-10): **deployed** to its own
droplet (`138.197.88.81`, Ubuntu 24.04.3, Dockerized FastAPI + Next.js +
Postgres 16, push-to-main CI/CD), but **pre-production**: production DB is
empty (validation loop not yet run), no usable external access path (DO
firewall + baked IP API base), no working backups, `restart=no`, no auth/TLS.
As a Phase 7 read-only data source it exists but is not ready; integration
remains correctly out of scope until its own P0s clear. (Direct SSH inspection
was intentionally not performed — outside this session's authorization.)

### Migration sequence proposal (for approval — nothing here is executed)

Pre-migration, independent of cutover:

1. **Fix email auth now** (GoDaddy DNS edits, owner-approved): add
   `include:spf.protection.outlook.com` to SPF; enable DKIM for the domain in
   M365 admin and publish the two selector CNAMEs; keep DMARC `p=none` until
   reports are clean. Benefits the farm immediately.
2. **Staging robots/noindex** (one nginx change + restart, owner-approved).
3. **Staging backup automation** (cron dump + off-droplet copy + restore
   drill) — also rehearses the production pattern.
4. **GoDaddy exports** (subscribers, orders, customers, photo originals).

Then, in order:

5. **Decide production topology**: recommend a dedicated production droplet
   (same Compose pattern, hardened) — keep staging as staging; later add
   `staging.<domain>` host + TLS. Alternative (cheaper): promote the existing
   droplet and rebuild staging — not recommended while iterating.
6. **Decide DNS home**: recommend moving DNS hosting to a registrar-neutral
   provider (DigitalOcean DNS or Cloudflare) while **leaving the domain
   registered at GoDaddy through cutover** (no registrar transfer during the
   move; transfer later if desired). Alternative: keep GoDaddy DNS and only
   repoint A records — fewer moving parts, still GoDaddy-dependent.
7. **Stand up production**: Compose stack, secrets, migrations/seed,
   automated backups, monitoring; verify checkout (Stripe test then a real
   $-small live test order), email provider, admin path.
8. **Pre-cutover DNS prep**: recreate the **complete** record set at the new
   DNS host before switching NS — MX, autodiscover, SPF (fixed), DKIM
   selectors, DMARC, TXT tenant record, `www` CNAME. Drop TTLs to 300s 24–48 h
   ahead. If rehoming DNS: move NS first as its own step, verify mail flow is
   undisturbed for a day, then repoint web records.
9. **Cutover**: point apex A/AAAA (+`www`) at production; issue TLS
   (Let's Encrypt via the reverse proxy at first request, or DNS-01
   pre-issued); confirm 301 map, kill-switch `/sw.js`, checkout, contact
   forms, email send/receive; watch logs and DMARC reports.
10. **Rollback plan**: GoDaddy site and builder subscription stay active and
    unmodified until stability is proven — rollback is restoring the previous
    A records (fast at TTL 300). Do not cancel the GoDaddy website product for
    several weeks; treat M365 email billing as a separate decision entirely.
11. **Post-cutover**: Search Console (verify, submit sitemap, watch 404s/
    coverage), GA continuity check, monitor server-action/bot noise rate
    limits, then schedule the GoDaddy website-builder cancellation.

## Reminders carried out of this review

- Owner decisions queued: ADHD branch disposition; pricing/packaging table;
  king blue + chestnut products; supplement price/pack; production host; DNS
  home; M365 billing path; GoDaddy export access.
- Suggested next implementation batch (post-approval): staging robots fix,
  backup automation, email-auth DNS fixes, then the launch-blocker sequence.
