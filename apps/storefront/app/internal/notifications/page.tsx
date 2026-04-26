import {
  buildNotificationPreviewBatch,
  notificationStatuses,
  notificationTargetTypes,
  type NotificationRequest,
  type NotificationStatus,
  type NotificationTargetType
} from "@mrmf/shared";
import Link from "next/link";
import { notFound } from "next/navigation";

import { isDevAvailabilityAdminEnabled } from "../../../lib/dev-availability-store";
import { listNotificationRequests } from "../../../lib/notification-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function parseStatus(value: string | undefined): NotificationStatus | undefined {
  return notificationStatuses.includes(value as NotificationStatus)
    ? (value as NotificationStatus)
    : undefined;
}

function parseTargetType(value: string | undefined): NotificationTargetType | undefined {
  return notificationTargetTypes.includes(value as NotificationTargetType)
    ? (value as NotificationTargetType)
    : undefined;
}

export default async function InternalNotificationsPage({
  searchParams
}: {
  searchParams: Promise<{
    status?: string;
    targetType?: string;
    targetSlug?: string;
  }>;
}) {
  if (!isDevAvailabilityAdminEnabled()) {
    notFound();
  }

  const params = await searchParams;
  const status = parseStatus(params.status);
  const targetType = parseTargetType(params.targetType);
  const targetSlug = params.targetSlug?.trim() || undefined;
  let requests: NotificationRequest[] = [];
  let error = "";

  try {
    requests = await listNotificationRequests({
      status,
      targetType,
      targetSlug,
      limit: 200
    });
  } catch (caught) {
    error =
      caught instanceof Error
        ? caught.message
        : "Notification requests could not be loaded.";
  }

  const activePreview = buildNotificationPreviewBatch(requests, {
    targetType,
    targetSlug
  });

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="mrmf-eyebrow">
        Internal development admin
      </p>
      <h1 className="mt-3 font-heading text-5xl leading-tight">
        Availability notification requests
      </h1>
      <p className="mt-4 max-w-3xl text-sm leading-7">
        This development-only view reads the Postgres notification table, previews matching
        notification drafts, and keeps real email sending disabled until a production provider,
        unsubscribe handling, and owner approval are ready.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link href="/internal/availability" className="underline">
          Availability manager
        </Link>
        <Link href="/internal/notifications" className="underline">
          Clear filters
        </Link>
      </div>

      <form className="mrmf-card mt-8 grid gap-4 p-5 sm:grid-cols-3">
        <label className="grid gap-2 font-subheading text-xs font-bold uppercase tracking-[0.12em]">
          Status
          <select
            name="status"
            defaultValue={status ?? ""}
            className="mrmf-input font-body text-sm normal-case tracking-normal"
          >
            <option value="">all</option>
            {notificationStatuses.map((candidate) => (
              <option key={candidate} value={candidate}>
                {candidate}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 font-subheading text-xs font-bold uppercase tracking-[0.12em]">
          Target type
          <select
            name="targetType"
            defaultValue={targetType ?? ""}
            className="mrmf-input font-body text-sm normal-case tracking-normal"
          >
            <option value="">all</option>
            {notificationTargetTypes.map((candidate) => (
              <option key={candidate} value={candidate}>
                {candidate}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 font-subheading text-xs font-bold uppercase tracking-[0.12em]">
          Target slug
          <input
            name="targetSlug"
            defaultValue={targetSlug ?? ""}
            className="mrmf-input font-body text-sm normal-case tracking-normal"
          />
        </label>
        <button
          type="submit"
          className="mrmf-button-primary sm:col-span-3 sm:justify-self-start"
        >
          Filter requests
        </button>
      </form>

      {error ? (
        <p className="mrmf-card mt-6 border-brand-burnt p-4 text-sm leading-7">
          {error}
        </p>
      ) : null}

      <div className="mrmf-card mt-8 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-brand-mahogany/20 bg-brand-parchment font-subheading text-xs font-extrabold uppercase tracking-[0.12em] text-brand-mahogany">
            <tr>
              <th className="p-3">Email</th>
              <th className="p-3">Target</th>
              <th className="p-3">Type</th>
              <th className="p-3">State</th>
              <th className="p-3">Status</th>
              <th className="p-3">Requested</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td className="p-4" colSpan={6}>
                  No notification requests match these filters.
                </td>
              </tr>
            ) : (
              requests.map((request) => (
                <tr key={request.id} className="border-b border-brand-mahogany/10 last:border-b-0">
                  <td className="p-3">{request.email}</td>
                  <td className="p-3">
                    <span className="block font-heading text-xl">{request.targetLabel}</span>
                    <span className="font-subheading text-xs uppercase tracking-[0.1em]">
                      {request.targetType} / {request.targetSlug}
                    </span>
                  </td>
                  <td className="p-3">{request.notificationType}</td>
                  <td className="p-3">{request.availabilityState ?? "not captured"}</td>
                  <td className="p-3">{request.status}</td>
                  <td className="p-3">{new Date(request.createdAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <section className="mrmf-card mt-8 p-5">
        <h2 className="font-heading text-4xl">Notification preview</h2>
        <p className="mt-3 text-sm leading-7">
          {activePreview.length} active request
          {activePreview.length === 1 ? "" : "s"} would be included by the current filters. Drafts
          are preview-only and must be approved before any real email provider is enabled.
        </p>
      </section>
    </section>
  );
}
