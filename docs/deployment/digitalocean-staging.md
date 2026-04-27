# DigitalOcean IP-Based Staging

Phase 6 deploys an owner-review staging site by public IP only. The existing GoDaddy
site remains live. Do not change DNS, configure `themauryrivermushroomfarm.com`, or
touch GoDaddy as part of this staging workflow.

## Droplet

- Droplet: `ubuntu-mrmf-staging-firewall`
- Public IPv4: `167.99.59.42`
- Region: `default-nyc3`
- Size: 2 vCPU / 4 GB RAM / 80 GB SSD
- SSH user: `root`
- Firewall: `mrmf-staging-firewall`
- Firewall rules: port 22 from owner IP only, port 80 from all, port 443 closed
- Tags: `mrmf`, `staging`, `web`

Staging URL:

```text
http://167.99.59.42
```

IP-only staging is expected to be HTTP-only. Add HTTPS only after a staging domain is
approved.

## Repository Files

- `docker-compose.staging.yml`: staging stack.
- `.env.staging.example`: safe placeholder environment file.
- `docker/node.Dockerfile`: shared Node image for Medusa and Next.js.
- `deploy/nginx/staging.conf`: Nginx reverse proxy on port 80.

The reverse proxy exposes the storefront and the Medusa Store API path at `/store/*`.
It does not publish Postgres or Redis ports.

## First-Time Server Setup

SSH:

```bash
ssh root@167.99.59.42
```

Baseline inspection:

```bash
cat /etc/os-release
df -h
free -h
nproc
lscpu | head -30
ss -tulpn
command -v docker || true
docker --version || true
docker compose version || true
ufw status || true
```

Install Docker Engine and the Docker Compose plugin using Docker's official Ubuntu apt
repository instructions. As `root`:

```bash
apt-get update
apt-get install -y ca-certificates curl
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
. /etc/os-release
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${UBUNTU_CODENAME:-$VERSION_CODENAME} stable" > /etc/apt/sources.list.d/docker.list
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable --now docker
docker --version
docker compose version
docker run --rm hello-world
```

## Deployment Directory

```bash
mkdir -p /opt/mrmf-website-staging
cd /opt/mrmf-website-staging
```

Clone or update the private repository with a secure owner-approved method. Do not paste
GitHub tokens or SSH private keys into chat or commit them to the repo.

If the repository is already cloned:

```bash
cd /opt/mrmf-website-staging
git fetch origin
git checkout codex/digitalocean-staging
git pull --ff-only origin codex/digitalocean-staging
git rev-parse --short HEAD
```

If private GitHub access blocks cloning, use one of these safe options:

1. Add a read-only deploy key to the private GitHub repo.
2. Use GitHub CLI on the server after owner-controlled authentication.
3. Upload a release archive through a secure owner-controlled channel.
4. Configure a separate CI/CD deploy path later.

## Environment File

Create `/opt/mrmf-website-staging/.env.staging` from `.env.staging.example`.

Generate server-local secrets:

```bash
POSTGRES_PASSWORD_VALUE="$(openssl rand -base64 32 | tr -d '\n')"
JWT_SECRET_VALUE="$(openssl rand -hex 32)"
COOKIE_SECRET_VALUE="$(openssl rand -hex 32)"
```

Required safety values:

```bash
CHECKOUT_MODE=staging
ENABLE_TEST_PAYMENTS=false
ENABLE_LIVE_PAYMENTS=false
EMAIL_PROVIDER=console
TAX_MODE=placeholder
MEDUSA_ADMIN_DISABLED=true
NEXT_PUBLIC_SITE_URL=http://167.99.59.42
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://167.99.59.42
MEDUSA_STORE_CORS=http://167.99.59.42
MEDUSA_ADMIN_CORS=http://167.99.59.42
MEDUSA_AUTH_CORS=http://167.99.59.42
NOTIFICATION_BASE_URL=http://167.99.59.42
```

Leave Stripe test keys empty unless an owner-approved test-payment task provides test
credentials. Never add live Stripe keys to this staging file.

## Build, Migrate, Seed, And Start

Use the modern Docker Compose plugin:

```bash
cd /opt/mrmf-website-staging
set -a
. ./.env.staging
set +a
COMPOSE="docker compose --env-file .env.staging -f docker-compose.staging.yml"
```

Start infrastructure:

```bash
$COMPOSE build backend
$COMPOSE up -d postgres redis
$COMPOSE run --rm backend corepack pnpm --filter @mrmf/backend db:migrate
$COMPOSE run --rm backend corepack pnpm --filter @mrmf/backend seed
$COMPOSE run --rm backend corepack pnpm --filter @mrmf/backend seed:verify
$COMPOSE up -d backend
```

After seed, set the public Store API key in `.env.staging`. The seed prints a `pk_...`
value. You can also inspect the database:

```bash
$COMPOSE exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "select token from api_key where type = 'publishable' order by created_at desc limit 1;"
```

Then build and start the storefront plus reverse proxy:

```bash
$COMPOSE build storefront reverse-proxy
$COMPOSE up -d storefront reverse-proxy
$COMPOSE ps
```

## Verification Commands

Backend and commerce checks:

```bash
$COMPOSE run --rm backend corepack pnpm --filter @mrmf/backend seed:verify
$COMPOSE run --rm backend corepack pnpm --filter @mrmf/backend shipping:smoke
$COMPOSE run --rm backend corepack pnpm --filter @mrmf/backend checkout:smoke
$COMPOSE run --rm backend corepack pnpm --filter @mrmf/backend notifications:preview
curl -I http://127.0.0.1/health
curl -I http://167.99.59.42/
```

Route smoke checklist:

```bash
for path in \
  / \
  /shop \
  /shop/fresh-lions-mane \
  /cart \
  /checkout \
  /mushrooms \
  /mushrooms/lion-s-mane \
  /recipes-cooking/lions-mane-crab-cake-style-patties \
  /our-farm \
  /markets-pickup \
  /restaurants-wholesale \
  /privacy-policy \
  /terms-and-conditions \
  /shipping-pickup-policy \
  /refund-policy
do
  curl -fsS -o /dev/null -w "%{http_code} %{url_effective}\n" "http://167.99.59.42${path}"
done
```

Manual browser checks:

- Homepage renders at `http://167.99.59.42`.
- Shop and Fresh Lion's Mane product pages load.
- Cart and checkout load.
- Checkout states that it is staging/test-only.
- A fresh-only cart does not expose parcel shipping.
- Notify-me forms do not send real production email.

## Logs And Operations

```bash
$COMPOSE ps
$COMPOSE logs --tail=100 backend
$COMPOSE logs --tail=100 storefront
$COMPOSE logs --tail=100 reverse-proxy
$COMPOSE restart backend storefront reverse-proxy
$COMPOSE stop
$COMPOSE up -d
```

## Backups And Restore

Create a backup directory on the server:

```bash
mkdir -p /opt/mrmf-website-staging/backups
chmod 700 /opt/mrmf-website-staging/backups
```

Manual Postgres backup:

```bash
BACKUP_FILE="/backups/mrmf-staging-$(date +%Y%m%d-%H%M%S).dump"
$COMPOSE exec -T postgres pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc > "/opt/mrmf-website-staging/backups/$(basename "$BACKUP_FILE")"
```

Manual restore into the staging database:

```bash
$COMPOSE stop backend storefront reverse-proxy
cat /opt/mrmf-website-staging/backups/mrmf-staging-YYYYMMDD-HHMMSS.dump | \
  $COMPOSE exec -T postgres pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists
$COMPOSE up -d backend storefront reverse-proxy
```

Do not commit backups to Git. Before production, prefer managed Postgres or automated
encrypted backups with a tested restore plan.

## Security Notes

- Only port 80 should be publicly reachable for staging web traffic.
- Postgres and Redis are internal Docker services and should not have host `ports`.
- Medusa Admin is disabled in staging because there is no production auth hardening yet.
- Live payments are disabled with `ENABLE_LIVE_PAYMENTS=false`.
- Email uses `EMAIL_PROVIDER=console`; no production email provider secrets are present.
- IP-only staging is temporary and HTTP-only.

## Known Limitations

- Staging is not production launch.
- No DNS or HTTPS is configured.
- Live Stripe, Medusa paid order completion, final tax behavior, and production email
  remain launch blockers.
- Internal development admin routes are disabled in production-mode staging.
- The storefront may need a rebuild after changing public `NEXT_PUBLIC_*` values.
