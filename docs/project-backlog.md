# Project Backlog

Concise open issues and follow-up work for the website rebuild.

- Replace generated SVG logo wrappers with official designer-provided vector files when available; current SVGs are development-only and not true vector masters.
- Replace placeholder product and farm imagery with real approved photography.
- Confirm final pickup locations, pickup windows, preorder cutoffs, local delivery rules, and market schedules; current values are provisional seed/config data.
- Confirm final prices, unit sizes, inventory statuses, launch availability, and Medusa stock quantities for every product.
- Move storefront from hybrid Medusa/fallback reads to required Medusa reads once production Store API keys and checkout settings are finalized.
- Promote the hybrid staged/Medusa cart bridge to required Medusa carts once payment, tax, and final shipping/pickup settings are approved.
- Add final Medusa shipping method selection to checkout after pickup windows, delivery rules, parcel rates, and tax settings are confirmed.
- Revisit provisional Medusa service zone and shipping option pricing after final pickup, local delivery, and parcel shipping policies are approved.
- Review Medusa peer dependency warnings; current warnings are upstream/non-blocking for this phase.
- Obtain legal review for privacy, terms, refund, and shipping/pickup policies.
- Obtain legal/business review for supplement and functional mushroom language.
- Configure production Stripe keys and webhook handling only after checkout approval.
- Configure production email or CRM routing for contact, newsletter, wholesale, and availability forms.
- Plan DigitalOcean deployment, backups, monitoring, and rollback process.
- Plan GoDaddy/DNS migration separately; no DNS changes have been made.
