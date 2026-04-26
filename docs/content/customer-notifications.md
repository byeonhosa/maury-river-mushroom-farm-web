# Customer Notifications Model

Phase 3 adds the foundation for notify-me, back-in-stock, seasonal interest,
preorder interest, and weekly fresh availability signups.

## Request Model

Notification requests are stored in PostgreSQL in
`mrmf_notification_requests`. Each request captures only the minimum customer
data needed for the availability workflow:

- email address and optional name;
- target type and slug: product, species, category, weekly list, seasonal list,
  preorder list, or wholesale inquiry;
- notification type: back in stock, coming soon update, preorder open,
  seasonal availability, weekly availability, or wholesale follow-up;
- source page and availability state at signup time;
- consent timestamp;
- status: active, ready-to-send, notified, unsubscribed, bounced, or suppressed;
- optional note and unsubscribe token;
- created/updated timestamps.

Duplicate active signups for the same email, target, and notification type are
updated instead of creating unlimited rows.

## Where CTAs Appear

- Product detail pages show notify-me forms for sold-out, coming-soon,
  seasonal, preorder, and low-stock products when the product is public and not
  routed to wholesale/inquiry instead.
- Species pages show interest forms for planned, seasonal, research, or
  otherwise unavailable mushrooms.
- The mushroom catalog, shop, homepage, and markets/pickup page include the
  weekly fresh availability signup.
- Cart and checkout show compact notify-me forms when stale local cart state
  contains a product that is no longer cartable.

Hidden products do not expose public signups. Wholesale-only and inquiry-only
products continue to route to inquiry paths rather than ordinary checkout.

## Persistence And Local Setup

Run the schema setup after PostgreSQL is available:

```bash
corepack pnpm --filter @mrmf/backend notifications:schema
```

The storefront API route `/api/notifications` writes validated requests to the
same Postgres database using `DATABASE_URL`. This keeps signups durable across
server restarts in the intended production architecture. The current API is a
server-side storefront facade; a future authenticated Medusa Admin or internal
production app can own the workflow before launch.

## Validation And Abuse Protection

The signup API validates:

- email format;
- consent checkbox;
- target type and target slug;
- notification type;
- known product, species, category, or list target;
- honeypot field;
- active duplicate requests.

A conservative in-process rate-limit scaffold protects local/dev usage. Before
production, replace or augment it with a durable rate limiter at the app, proxy,
or email-provider boundary.

## Trigger Preview

No real customer emails are sent in Phase 3. Preview matching active requests
with:

```bash
corepack pnpm --filter @mrmf/backend notifications:preview
```

Optional filters:

```bash
NOTIFICATION_PREVIEW_TARGET_TYPE=product
NOTIFICATION_PREVIEW_TARGET_SLUG=mushroom-salt
NOTIFICATION_PREVIEW_AVAILABILITY_STATE=available
corepack pnpm --filter @mrmf/backend notifications:preview
```

The preview prints draft messages only. `EMAIL_PROVIDER=console` remains the
safe development default and logs previews rather than sending real email.

## Email And Unsubscribe

The backend includes a simple email provider abstraction with a console provider
only. Future production providers may include Resend, Postmark, SendGrid, or a
CRM/email platform, but no provider secrets belong in Git.

Draft templates exist for:

- back in stock;
- coming soon update;
- preorder now open;
- seasonal availability;
- weekly availability;
- wholesale follow-up.

Templates include an unsubscribe link concept. A local unsubscribe route exists
at `/notifications/unsubscribe/[token]` and marks matching requests as
unsubscribed in Postgres. Production email sending still requires final privacy
policy review, unsubscribe testing, suppression handling, and owner approval.

## Availability Admin Integration

The development-only admin view is:

```text
http://localhost:3000/internal/notifications
```

It lists stored requests, filters by status/target, and previews how many active
requests match the current filters. `/internal/availability` links to this view.
Both internal routes are disabled in production unless a future authenticated
admin workflow replaces the development scaffold.

## Privacy And Legal Cautions

- Do not collect sensitive customer data for notifications.
- Do not send real marketing emails until unsubscribe and suppression handling
  have been production-reviewed.
- Update the privacy policy before launch to cover notification signups,
  email-provider processing, retention, and unsubscribe rights.
- Notification copy must not make disease-treatment claims or imply medical
  benefits.

## Future Hooks

The model is ready for later integration with:

- product availability changes from the production-tracking app;
- harvest batch availability events;
- expected return dates;
- owner-approved weekly availability emails;
- AI Marketing Studio draft generation and campaign calendars;
- social campaign planning after human review.
