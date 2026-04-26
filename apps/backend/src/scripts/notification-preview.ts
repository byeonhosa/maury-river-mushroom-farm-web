import { loadEnv } from "@medusajs/framework/utils";
import {
  buildNotificationPreviewBatch,
  createNotificationEmailDraft,
  notificationRequestTableName,
  type AvailabilityState,
  type NotificationRequest,
  type NotificationTargetType
} from "@mrmf/shared";
import path from "node:path";
import pg from "pg";

import { createEmailProvider } from "../lib/email-provider";
import { ensureNotificationSchema } from "./notification-schema";

const repositoryRoot = path.resolve(__dirname, "../../../..");

loadEnv(process.env.NODE_ENV ?? "development", repositoryRoot);

interface NotificationRequestRow {
  id: string;
  email: string;
  email_normalized: string;
  name: string | null;
  target_type: NotificationRequest["targetType"];
  target_slug: string;
  target_label: string;
  notification_type: NotificationRequest["notificationType"];
  source_page: string;
  availability_state: AvailabilityState | null;
  consent_at: Date | string;
  status: NotificationRequest["status"];
  notes: string | null;
  unsubscribe_token: string;
  created_at: Date | string;
  updated_at: Date | string;
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

async function listActiveRequests(client: pg.Client) {
  const result = await client.query<NotificationRequestRow>(
    `
      select *
      from ${notificationRequestTableName}
      where status = 'active'
      order by created_at desc
      limit 500
    `
  );

  return result.rows.map(toNotificationRequest);
}

function parseTargetType(value: string | undefined): NotificationTargetType | undefined {
  const allowed: NotificationTargetType[] = [
    "product",
    "species",
    "category",
    "weekly-list",
    "seasonal-list",
    "preorder-list",
    "wholesale-inquiry"
  ];

  return allowed.includes(value as NotificationTargetType)
    ? (value as NotificationTargetType)
    : undefined;
}

function parseAvailabilityState(value: string | undefined): AvailabilityState | undefined {
  const allowed: AvailabilityState[] = [
    "available",
    "low-stock",
    "sold-out",
    "coming-soon",
    "seasonal",
    "preorder",
    "hidden",
    "wholesale-only",
    "inquiry-only"
  ];

  return allowed.includes(value as AvailabilityState) ? (value as AvailabilityState) : undefined;
}

export async function runNotificationPreview() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to preview notification requests.");
  }

  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    await ensureNotificationSchema(client);

    const requests = await listActiveRequests(client);
    const targetType = parseTargetType(process.env.NOTIFICATION_PREVIEW_TARGET_TYPE);
    const targetSlug = process.env.NOTIFICATION_PREVIEW_TARGET_SLUG;
    const availabilityState = parseAvailabilityState(
      process.env.NOTIFICATION_PREVIEW_AVAILABILITY_STATE
    );
    const previews = buildNotificationPreviewBatch(requests, {
      targetType,
      targetSlug,
      availabilityState
    });

    console.log(
      `Notification preview: ${previews.length} active request(s) matched ${requests.length} stored active request(s).`
    );

    for (const { request } of previews) {
      const targetUrl = `${process.env.NOTIFICATION_BASE_URL ?? "http://localhost:3000"}${
        request.targetType === "product"
          ? `/shop/${request.targetSlug}`
          : request.targetType === "species"
            ? `/mushrooms/${request.targetSlug}`
            : "/shop"
      }`;
      const unsubscribeUrl = `${
        process.env.NOTIFICATION_BASE_URL ?? "http://localhost:3000"
      }/notifications/unsubscribe/${request.unsubscribeToken}`;
      const draft = createNotificationEmailDraft(request, { targetUrl, unsubscribeUrl });

      console.log(`\nTo: ${request.email}`);
      console.log(`Subject: ${draft.subject}`);
      console.log(draft.bodyText);

      if (process.env.NOTIFICATION_PREVIEW_SEND_CONSOLE === "true") {
        const provider = createEmailProvider("console");

        await provider.send({
          to: request.email,
          from: process.env.EMAIL_FROM ?? "farm@example.com",
          subject: draft.subject,
          text: draft.bodyText
        });
      }
    }
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  void runNotificationPreview();
}
