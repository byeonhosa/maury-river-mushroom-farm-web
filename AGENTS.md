# AGENTS.md — The Maury River Mushroom Farm Website Rebuild

## Project mission

Build a professional ecommerce and educational website for The Maury River Mushroom Farm LLC using open-source tools. The site will replace the current GoDaddy site and eventually deploy to a DigitalOcean droplet.

The website must function as:
1. A premium local-food ecommerce site.
2. A customer education hub for gourmet and functional mushrooms.
3. A restaurant/wholesale lead-generation tool.
4. A future customer-facing layer for the farm’s internal production-tracking system.

## Required architecture

- Monorepo
- Frontend: Next.js with TypeScript
- Styling: Tailwind CSS
- Commerce backend: Medusa
- Database: PostgreSQL
- Package manager: pnpm unless there is a strong reason not to use it
- Deployment target: Docker Compose on a DigitalOcean droplet
- Payments: Stripe integration points using environment variables
- Email: abstracted provider using environment variables
- Image storage: local/dev now, S3-compatible storage later
- Testing: meaningful tests required before PR completion

## Business rules

The farm sells or plans to sell:
- Fresh gourmet mushrooms
- Dried mushrooms
- Mushroom salts and seasonings
- Lion’s mane capsules
- Mushroom powders
- Subscription/CSA-style boxes
- Restaurant/wholesale products
- Possibly grow kits later

Fresh mushrooms are perishable. By default:
- Fresh mushrooms are pickup/local-delivery only.
- Shelf-stable products may be shippable.
- Fresh mushroom shipping must not be enabled unless explicitly approved.

## Brand rules

Use the branding guide and logo files in `docs/brand` and `assets/brand-source`.

Brand colors:
- Mahogany Brown: `#642d10`
- Burnt Orange: `#8b4324`
- Ebony Green: `#59644a`
- Ivory Orange: `#f1cd94`

Contrast rules:
- Use Ivory Orange text/logo on Mahogany Brown, Burnt Orange, or Ebony Green backgrounds.
- Use Mahogany Brown text/logo on Ivory Orange backgrounds.
- Do not pair Burnt Orange, Mahogany Brown, or Ebony Green with text colors other than Ivory Orange.
- Do not use text colors other than Mahogany Brown on Ivory Orange backgrounds.

Logo rules:
- Do not place the logo in an added container.
- Do not stretch, squish, rotate, tilt, crop, or recolor the logo.
- Do not resize the mushroom graphic separately from the main logo.
- Do not recombine separate logo elements unless using an official complete logo asset.

## Logo/vector asset rules

The repository currently contains PNG logo and brandmark files, but not official SVG/vector exports.

Codex may generate temporary SVG versions from the PNG logo and brandmark files for website development, but must follow these rules:

1. Preserve the original PNG files unchanged.
2. Store generated SVGs in `assets/brand-generated-svg/`.
3. Name generated files clearly, ending with `.generated.svg`.
4. Do not treat generated SVGs as official master brand files.
5. Do not delete or overwrite original PNG files.
6. Do not auto-convert repeating pattern backgrounds unless technically necessary.
7. Compare generated SVGs visually against the source PNGs and document visible issues.
8. If official SVGs are later provided by the designer, replace generated SVGs with official files.

Preferred use:
- Use SVGs for header logo, footer logo, brandmark, favicon source, and scalable UI usage.
- Use PNGs for pattern backgrounds unless a clean vector pattern is later provided.

Create or update `docs/brand/generated-svg-review.md` when temporary SVGs are generated.

## Font licensing and substitute fonts

The brand guide specifies:
- Heading type: Rafaella Regular
- Sub-heading typeface: Kohinoor Devanagari Light
- Body text: Athelas Regular

Do not embed or commit these commercial/proprietary font files unless the owner later provides confirmed webfont licenses.

For the initial website implementation, use open-source substitute fonts that preserve the visual direction.

Preferred interim stack:
- Display / heading font: Cormorant Garamond
- Subheading / navigation / eyebrow text: Raleway
- Body font: Libre Baskerville

Acceptable alternates:
- Display / heading: Fraunces, Playfair Display, Cormorant Garamond
- Subheading / navigation: Raleway, Noto Sans Display, Inter
- Body: Libre Baskerville, Merriweather, Literata

Implementation rules:
1. Use open-source web fonts only.
2. Do not commit unlicensed commercial font files.
3. Use `next/font/google` or another performance-conscious loading method.
4. Document the chosen substitute fonts in `docs/brand/typography.md`.
5. Make clear that these are license-safe substitutes, not official brand-guide fonts.
6. If licensed webfont files are later obtained, replace the substitute font stack deliberately and document the change.

## Content rules

The site must teach customers:
- What each mushroom tastes like
- How to cook it
- How to store it
- What it pairs with
- What products are available
- How pickup, delivery, market pickup, or shipping works

Do not use generic ecommerce template copy.

## Supplement and health-claim rules

Do not make disease-treatment claims.
Do not say any product cures, treats, prevents, or mitigates disease.
Use cautious structure/function language only.

Include this disclaimer wherever supplement claims appear:

“These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.”

Flag any health-benefit copy for legal/business review.

## Engineering rules

- Do not commit secrets.
- Do not hard-code API keys.
- Use `.env.example`.
- Add or update tests with substantive changes.
- Run lint/typecheck/tests/build before declaring work complete.
- Prefer small, reviewable PRs.
- Explain architectural decisions in the PR summary.
- Update README when setup, scripts, architecture, or deployment changes.
- Use Docker Compose for local development and production-like deployment.
- Use seed data for development.

## Review guidelines

Codex reviewers should flag:
- Broken checkout assumptions
- Fresh products accidentally marked shippable
- Missing policy pages
- Missing supplement disclaimers
- Unsubstantiated health claims
- Hard-coded secrets
- Security-sensitive forms without validation
- Accessibility problems
- Mobile layout problems
- Missing tests for business logic
