# Test Checkout And Payments

Phase 5 adds safe checkout-completion scaffolding. It does not enable live
payments, live Stripe, production email sending, or real paid orders.

## Checkout modes

`CHECKOUT_MODE` supports:

- `development`: default outside production. Allows local test checkout records.
- `staging`: allows staging test checkout records for owner review.
- `production-disabled`: blocks checkout record creation and paid order completion.
- `test-payment-enabled`: future Stripe test handoff mode. Requires explicit test
  keys and still creates only marked test checkout records in this phase.
- `live-payment-enabled`: reserved for a future owner-approved launch task. This
  build treats live requests as disabled.

Safety flags:

```bash
CHECKOUT_MODE=development
ENABLE_TEST_PAYMENTS=false
ENABLE_LIVE_PAYMENTS=false
STRIPE_SECRET_KEY_TEST=
STRIPE_WEBHOOK_SECRET_TEST=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST=
TAX_MODE=placeholder
EMAIL_PROVIDER=console
```

Only keys beginning with `sk_test_` and `pk_test_` are accepted for test-payment
readiness. Live key prefixes are rejected by the checkout-mode guardrails.

## Test checkout flow

The storefront checkout:

1. Reads the staged or Medusa-backed cart.
2. Validates customer contact details.
3. Validates fulfillment selection and policy acknowledgement.
4. Reuses the existing fresh/local-only, mixed-cart, and availability rules.
5. Calculates a placeholder tax line that requires review.
6. Posts to `/api/checkout/test-complete`.
7. Creates a clearly marked Postgres test checkout record.
8. Logs customer and farm/admin email drafts through the console email provider.
9. Links to `/checkout/test-confirmation/:recordId`.

The confirmation page is a test record only. It must not be treated as a paid
production order.

## Database table

Test checkout records are stored in `mrmf_test_checkout_records`. The storefront
API creates the table if needed when a test checkout is submitted. The table keeps
the minimum checkout data needed for owner review:

- checkout mode and payment status;
- staged or Medusa cart source;
- customer contact details;
- fulfillment selection;
- cart line summary;
- tax placeholder summary;
- generated email-preview text;
- policy acknowledgement.

Before production, this needs authenticated admin review, retention rules, privacy
policy coverage, and a real order/payment model decision.

## Email behavior

`EMAIL_PROVIDER=console` is the only supported provider in this phase. It logs
draft customer and farm/admin confirmation emails to the server console. It does
not send production email.

Do not configure live SMTP, Resend, Postmark, SendGrid, CRM, or other provider
credentials until unsubscribe, privacy, suppression, deliverability, and owner
approval work is complete.

## Tax behavior

`TAX_MODE=placeholder` displays a tax placeholder and stores a zero estimated tax
amount with a review warning. This is not a final tax position.

Final Virginia/local tax handling, product taxability, pickup/delivery/shipping
treatment, Stripe/Medusa tax configuration, and accounting export behavior must
be reviewed before launch.

## Local test steps

```bash
corepack pnpm install
docker compose up -d postgres redis
corepack pnpm --filter @mrmf/backend db:migrate
corepack pnpm --filter @mrmf/backend seed
corepack pnpm --filter @mrmf/backend seed:verify
corepack pnpm --filter @mrmf/backend checkout:smoke
corepack pnpm --filter @mrmf/backend dev
corepack pnpm --filter @mrmf/storefront dev
```

Then open `http://localhost:3000/checkout`, add a cart item, choose a valid
fulfillment method, acknowledge policies, and create a test checkout record.

Optional Stripe test readiness:

```bash
CHECKOUT_MODE=test-payment-enabled
ENABLE_TEST_PAYMENTS=true
STRIPE_SECRET_KEY_TEST=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST=pk_test_...
```

This does not charge a card in Phase 5; it only confirms the environment is
test-mode ready.

## Remaining launch blockers

- Medusa order completion remains disabled.
- Stripe Checkout Session or Medusa payment-provider wiring still needs a future
  owner-approved implementation.
- Webhook handling is not live.
- Production email sending is not configured.
- Tax/legal/accounting review is incomplete.
- Real paid order confirmation, refunds, receipts, and accounting exports are
  future work.
