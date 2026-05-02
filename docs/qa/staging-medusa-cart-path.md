# Staging Medusa Cart Path Follow-Up

Date: 2026-05-02
Branch: `codex/staging-medusa-cart-path`
Staging URL: http://167.99.59.42

## Issue

The staging QA pass found that adding Fresh Lion's Mane to the cart still used the staged browser cart fallback. The fallback was safe, but it meant staging was not exercising the Medusa-backed cart path for a normal seeded, cartable product.

## Root cause

The live Store API did expose Fresh Lion's Mane with a Medusa product ID and variant ID, and a direct Store API cart could be created with that variant. The weak point was the storefront product data handed to the browser cart bridge: cart and checkout pages could be built with the shared seed fallback if Medusa was slow or unavailable during a build or first catalog read. Shared seed products intentionally do not have Medusa variant IDs, so the browser bridge correctly stayed in staged fallback mode.

## Fix

- Shop, product detail, cart, and checkout routes now render dynamically for commerce product reads.
- The storefront Medusa product fetch timeout was raised to 5 seconds by default.
- Transient hybrid fallback results are no longer cached for the lifetime of the server process, so the next request can recover to Medusa-backed product data.
- A Store API cart smoke script was added as `corepack pnpm --filter @mrmf/backend cart:smoke`.

## Verification steps

Local or staging shell with the public Store API key configured:

```bash
corepack pnpm --filter @mrmf/backend cart:smoke
```

From a local shell testing IP-based staging:

```bash
MRMF_STORE_API_BASE_URL=http://167.99.59.42 MRMF_CART_SMOKE_HANDLE=fresh-lions-mane corepack pnpm --filter @mrmf/backend cart:smoke
```

Browser check after staging rebuild:

1. Open http://167.99.59.42/shop/fresh-lions-mane.
2. Add Fresh Lion's Mane to the cart.
3. Open http://167.99.59.42/cart.
4. Confirm the cart bridge card says `Medusa-backed cart active`.
5. Open checkout and confirm payment remains staged/test-only and fresh products still do not expose parcel shipping.

## Safety notes

- The staged browser fallback remains in place for missing Medusa config, offline Medusa, stale carts, or missing variant IDs.
- Live payments remain disabled.
- No real email sending is enabled by this change.
- Fresh product parcel-shipping protections remain app-filtered and backend-seeded.
