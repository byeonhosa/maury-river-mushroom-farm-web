# PostgreSQL Backup Notes

PostgreSQL backups must be automated, rotated, and restore-tested before the
site accepts real orders. Staging now implements that pattern; production
should clone it (or use managed Postgres) at cutover.

## Staging: automated daily backups (live since 2026-06-11)

- Script: `deploy/scripts/staging-pg-backup.sh` (repo-managed; lands on the
  droplet via `git pull`). It runs `pg_dump -Fc` through
  `docker compose exec -T postgres`, writes to
  `/opt/mrmf-website-staging/backups/mrmf-staging-YYYYMMDD-HHMMSS.dump`
  (mode 600, directory 700), refuses to rotate if the new dump is
  implausibly small (<10 KB), then deletes dumps older than 14 days.
- Schedule: root crontab on the droplet, daily 03:17 UTC (≈23:17 EST):

  ```cron
  17 3 * * * /opt/mrmf-website-staging/deploy/scripts/staging-pg-backup.sh >> /var/log/mrmf-pg-backup.log 2>&1
  ```

- The script does NOT shell-source `.env.staging` (it contains unquoted
  multi-word values that break `set -e`); it greps `POSTGRES_USER` /
  `POSTGRES_DB` and lets `docker compose --env-file` parse the rest.
- Logs: `/var/log/mrmf-pg-backup.log` (one `backup ok: <size> <file>` line
  per day; investigate any WARNING).

## Restore drill (tested 2026-06-11)

Procedure, exactly as verified against dump `mrmf-staging-20260612-020601.dump`:

```bash
cd /opt/mrmf-website-staging
PU="$(grep -E '^POSTGRES_USER=' .env.staging | tail -1 | cut -d= -f2-)"
PD="$(grep -E '^POSTGRES_DB=' .env.staging | tail -1 | cut -d= -f2-)"
C="docker compose --env-file .env.staging -f docker-compose.staging.yml"
NEWEST=$(ls -t backups/mrmf-staging-*.dump | head -1)

$C exec -T postgres psql -U "$PU" -d postgres -qc "CREATE DATABASE mrmf_restore_drill" </dev/null
cat "$NEWEST" | $C exec -T postgres pg_restore -U "$PU" -d mrmf_restore_drill --no-owner --exit-on-error

# verify: table count + spot row counts must match the live DB
Q="select 'tables: '||count(*) from information_schema.tables where table_schema='public'
   union all select 'product: '||count(*) from product
   union all select 'product_variant: '||count(*) from product_variant
   union all select 'shipping_option: '||count(*) from shipping_option
   union all select 'mrmf_notification_requests: '||count(*) from mrmf_notification_requests"
$C exec -T postgres psql -U "$PU" -d "$PD" -tAc "$Q" </dev/null
$C exec -T postgres psql -U "$PU" -d mrmf_restore_drill -tAc "$Q" </dev/null

$C exec -T postgres psql -U "$PU" -d postgres -qc "DROP DATABASE mrmf_restore_drill" </dev/null
```

2026-06-11 drill result: PASS — 137 tables and identical row counts
(product 10, product_variant 10, shipping_option 9, api_key 2,
mrmf_notification_requests 2) in source and restored databases.

Gotcha: when scripting over `ssh bash -s`, append `</dev/null` to every
`docker compose exec -T` that is not the restore itself, or the exec will
swallow the rest of your script from stdin.

Full restore into the live staging database (only when actually recovering):

```bash
$C stop backend storefront reverse-proxy
cat backups/mrmf-staging-YYYYMMDD-HHMMSS.dump | \
  $C exec -T postgres pg_restore -U "$PU" -d "$PD" --clean --if-exists --no-owner
$C up -d backend storefront reverse-proxy
```

## Off-droplet copy — DECISION OPEN (owner)

The daily dumps live on the same droplet they protect. Two candidate second
copies, not yet implemented (owner to pick):

1. **Nightly pull to John's PC** — free, no new credentials; a Windows
   Scheduled Task scp's the newest dump (`scp root@167.99.59.42:/opt/mrmf-website-staging/backups/$(latest) C:\Backups\mrmf-staging\`).
   Runs only while the PC is on; fine for staging-grade data.
2. **DigitalOcean Spaces push** — ~$5/mo; droplet uploads after each dump via
   `rclone`/`s3cmd`; works unattended but requires John to create a Space +
   access keys in the DO console first.

Either way, production-grade backups at launch should add encryption and a
documented retention policy, or move to managed Postgres.

## Local development rehearsal

```bash
docker compose exec postgres pg_dump -U postgres -d mrmf > backups/mrmf-local.sql
docker compose exec -T postgres psql -U postgres -d mrmf < backups/mrmf-local.sql
```

## Production expectations (unchanged)

- Automated daily backups with rotation (pattern above).
- At least one off-droplet copy.
- Restore drill after major schema or Medusa upgrades.
- Documented access control for backup artifacts.
