# PostgreSQL Backup Notes

PostgreSQL backups should be tested before the site accepts real orders.

## Local backup rehearsal

```bash
docker compose exec postgres pg_dump -U postgres -d mrmf > backups/mrmf-local.sql
```

## Restore rehearsal

```bash
docker compose exec -T postgres psql -U postgres -d mrmf < backups/mrmf-local.sql
```

## Production expectations

- Schedule automated daily backups.
- Keep at least one off-droplet backup copy.
- Test restores after major schema or Medusa upgrades.
- Document who can access production backups.
