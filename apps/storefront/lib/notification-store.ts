import crypto from "node:crypto";
import pg from "pg";

import {
  activeNotificationDuplicateKey,
  notificationRequestTableName,
  notificationSchemaStatements,
  normalizeNotificationEmail,
  type NotificationRequest,
  type NotificationSignupInput,
  type NotificationStatus,
  type NotificationTargetType,
  type NotificationType
} from "@mrmf/shared";

const { Pool } = pg;

interface NotificationRequestRow {
  id: string;
  email: string;
  email_normalized: string;
  name: string | null;
  target_type: NotificationTargetType;
  target_slug: string;
  target_label: string;
  notification_type: NotificationType;
  source_page: string;
  availability_state: NotificationRequest["availabilityState"] | null;
  consent_at: Date | string;
  status: NotificationStatus;
  notes: string | null;
  unsubscribe_token: string;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface NotificationUpsertResult {
  request: NotificationRequest;
  outcome: "created" | "duplicate-updated";
}

export interface NotificationListFilters {
  status?: NotificationStatus;
  targetType?: NotificationTargetType;
  targetSlug?: string;
  limit?: number;
}

declare global {
  var __mrmfNotificationPool: pg.Pool | undefined;
  var __mrmfNotificationRateLimit:
    | Map<string, { count: number; expiresAt: number }>
    | undefined;
}

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for availability notification storage.");
  }

  return databaseUrl;
}

export function getNotificationPool() {
  globalThis.__mrmfNotificationPool ??= new Pool({
    connectionString: getDatabaseUrl(),
    max: 4
  });

  return globalThis.__mrmfNotificationPool;
}

function toIsoString(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function toNotificationRequest(row: NotificationRequestRow): NotificationRequest {
  return {
    id: row.id,
    email: row.email,
    emailNormalized: row.email_normalized,
    name: row.name ?? undefined,
    targetType: row.target_type,
    targetSlug: row.target_slug,
    targetLabel: row.target_label,
    notificationType: row.notification_type,
    sourcePage: row.source_page,
    availabilityState: row.availability_state ?? undefined,
    consentAt: toIsoString(row.consent_at),
    status: row.status,
    notes: row.notes ?? undefined,
    unsubscribeToken: row.unsubscribe_token,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at)
  };
}

export async function ensureNotificationSchema(pool = getNotificationPool()) {
  for (const statement of notificationSchemaStatements) {
    await pool.query(statement);
  }
}

export function checkNotificationRateLimit(
  key: string,
  now = Date.now(),
  limit = Number(process.env.NOTIFICATION_RATE_LIMIT_MAX ?? 5),
  windowMs = Number(process.env.NOTIFICATION_RATE_LIMIT_WINDOW_SECONDS ?? 900) * 1000
) {
  globalThis.__mrmfNotificationRateLimit ??= new Map();

  const store = globalThis.__mrmfNotificationRateLimit;
  const existing = store.get(key);

  if (!existing || existing.expiresAt <= now) {
    store.set(key, { count: 1, expiresAt: now + windowMs });

    return { allowed: true, remaining: Math.max(0, limit - 1) };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  existing.count += 1;
  store.set(key, existing);

  return { allowed: true, remaining: Math.max(0, limit - existing.count) };
}

export async function upsertNotificationRequest(
  input: NotificationSignupInput
): Promise<NotificationUpsertResult> {
  const pool = getNotificationPool();
  await ensureNotificationSchema(pool);

  const emailNormalized = normalizeNotificationEmail(input.email);
  const now = new Date();
  const client = await pool.connect();

  try {
    await client.query("begin");

    const duplicateResult = await client.query<NotificationRequestRow>(
      `
        select *
        from ${notificationRequestTableName}
        where email_normalized = $1
          and target_type = $2
          and target_slug = $3
          and notification_type = $4
          and status = 'active'
        limit 1
      `,
      [emailNormalized, input.targetType, input.targetSlug, input.notificationType]
    );

    const duplicate = duplicateResult.rows[0];

    if (duplicate) {
      const updatedResult = await client.query<NotificationRequestRow>(
        `
          update ${notificationRequestTableName}
          set
            email = $1,
            name = $2,
            target_label = $3,
            source_page = $4,
            availability_state = $5,
            notes = $6,
            updated_at = $7
          where id = $8
          returning *
        `,
        [
          input.email.trim(),
          input.name?.trim() || null,
          input.targetLabel,
          input.sourcePage,
          input.availabilityState ?? null,
          input.notes?.trim() || null,
          now,
          duplicate.id
        ]
      );

      await client.query("commit");

      return {
        request: toNotificationRequest(updatedResult.rows[0]!),
        outcome: "duplicate-updated"
      };
    }

    const insertResult = await client.query<NotificationRequestRow>(
      `
        insert into ${notificationRequestTableName} (
          id,
          email,
          email_normalized,
          name,
          target_type,
          target_slug,
          target_label,
          notification_type,
          source_page,
          availability_state,
          consent_at,
          status,
          notes,
          unsubscribe_token,
          created_at,
          updated_at
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'active', $12, $13, $14, $14)
        returning *
      `,
      [
        crypto.randomUUID(),
        input.email.trim(),
        emailNormalized,
        input.name?.trim() || null,
        input.targetType,
        input.targetSlug,
        input.targetLabel,
        input.notificationType,
        input.sourcePage,
        input.availabilityState ?? null,
        now,
        input.notes?.trim() || null,
        crypto.randomUUID(),
        now
      ]
    );

    await client.query("commit");

    return {
      request: toNotificationRequest(insertResult.rows[0]!),
      outcome: "created"
    };
  } catch (error) {
    await client.query("rollback");

    throw error;
  } finally {
    client.release();
  }
}

export async function listNotificationRequests({
  status,
  targetType,
  targetSlug,
  limit = 100
}: NotificationListFilters = {}) {
  const pool = getNotificationPool();
  await ensureNotificationSchema(pool);

  const values: unknown[] = [];
  const clauses: string[] = [];

  if (status) {
    values.push(status);
    clauses.push(`status = $${values.length}`);
  }

  if (targetType) {
    values.push(targetType);
    clauses.push(`target_type = $${values.length}`);
  }

  if (targetSlug) {
    values.push(targetSlug);
    clauses.push(`target_slug = $${values.length}`);
  }

  values.push(Math.max(1, Math.min(500, limit)));

  const result = await pool.query<NotificationRequestRow>(
    `
      select *
      from ${notificationRequestTableName}
      ${clauses.length ? `where ${clauses.join(" and ")}` : ""}
      order by created_at desc
      limit $${values.length}
    `,
    values
  );

  return result.rows.map(toNotificationRequest);
}

export async function unsubscribeNotificationRequest(token: string) {
  const pool = getNotificationPool();
  await ensureNotificationSchema(pool);

  const result = await pool.query<NotificationRequestRow>(
    `
      update ${notificationRequestTableName}
      set status = 'unsubscribed',
          updated_at = now()
      where unsubscribe_token = $1
        and status <> 'unsubscribed'
      returning *
    `,
    [token]
  );

  return result.rows[0] ? toNotificationRequest(result.rows[0]) : undefined;
}

export function buildDuplicateKeyForSignup(input: NotificationSignupInput) {
  return activeNotificationDuplicateKey(input);
}
