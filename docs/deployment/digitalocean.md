# DigitalOcean Deployment Notes

Deployment is intentionally deferred. The current repo targets a future Docker Compose
deployment on a DigitalOcean droplet.

## Expected services

- Storefront: Next.js application
- Backend: Medusa application
- Database: PostgreSQL
- Cache/eventing: Redis if required by Medusa modules
- Reverse proxy: Caddy or Nginx with TLS

## Environment

Use `.env.example` as the template. Production secrets must be created on the droplet
or in a secret manager and must never be committed.

## Open items before deployment

- Choose final domain and reverse proxy configuration
- Configure Stripe keys and webhook endpoint
- Select email provider
- Decide whether product images stay local or move to S3-compatible object storage
- Run a production backup/restore rehearsal
