#!/usr/bin/env bash
# Daily staging Postgres backup with 14-day rotation.
# Installed on the droplet via root crontab (see docs/deployment/postgresql-backups.md):
#   0 3 * * * /opt/mrmf-website-staging/deploy/scripts/staging-pg-backup.sh >> /var/log/mrmf-pg-backup.log 2>&1
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

# Do not shell-source .env.staging: it contains unquoted multi-word values
# (e.g. MEDUSA_SEED_SALES_CHANNEL_NAME=Maury River Storefront) that break
# under `set -e`. Extract just the two values pg_dump needs; docker compose
# parses the env file properly on its own via --env-file.
POSTGRES_USER="$(grep -E '^POSTGRES_USER=' .env.staging | tail -1 | cut -d= -f2- || true)"
POSTGRES_DB="$(grep -E '^POSTGRES_DB=' .env.staging | tail -1 | cut -d= -f2- || true)"

COMPOSE="docker compose --env-file .env.staging -f docker-compose.staging.yml"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="$REPO_ROOT/backups"
BACKUP_FILE="$BACKUP_DIR/mrmf-staging-$STAMP.dump"

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

$COMPOSE exec -T postgres pg_dump \
  -U "${POSTGRES_USER:-mrmf}" \
  -d "${POSTGRES_DB:-mrmf_staging}" \
  -Fc > "$BACKUP_FILE"
chmod 600 "$BACKUP_FILE"

# Refuse to rotate if today's dump looks implausibly small (empty DB or a
# silent pg_dump failure shouldn't age out the good copies).
MIN_BYTES=10240
ACTUAL_BYTES=$(stat -c%s "$BACKUP_FILE")
if [ "$ACTUAL_BYTES" -lt "$MIN_BYTES" ]; then
  echo "WARNING: $BACKUP_FILE is only ${ACTUAL_BYTES} bytes; skipping rotation." >&2
  exit 1
fi

find "$BACKUP_DIR" -name 'mrmf-staging-*.dump' -mtime +14 -delete

echo "backup ok: $(ls -lh "$BACKUP_FILE" | awk '{print $5, $9}') ($(date -u +%FT%TZ))"
