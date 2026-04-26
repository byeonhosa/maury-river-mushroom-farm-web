import Link from "next/link";

import { unsubscribeNotificationRequest } from "../../../../lib/notification-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function NotificationUnsubscribePage({
  params
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  let message =
    "This notification request could not be found. It may already be unsubscribed or expired.";

  try {
    const request = await unsubscribeNotificationRequest(token);

    if (request) {
      message = `You have been unsubscribed from ${request.targetLabel} availability notifications.`;
    }
  } catch (error) {
    message =
      error instanceof Error
        ? error.message
        : "Availability notification unsubscribe failed.";
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="mrmf-eyebrow">
        Availability notifications
      </p>
      <h1 className="mt-3 font-heading text-5xl leading-tight">
        Notification preferences updated
      </h1>
      <p className="mt-5 text-sm leading-7">{message}</p>
      <Link
        href="/shop"
        className="mt-6 inline-flex bg-brand-mahogany px-5 py-3 font-subheading text-sm font-bold uppercase tracking-[0.1em] text-brand-ivory"
      >
        Return to shop
      </Link>
    </section>
  );
}
