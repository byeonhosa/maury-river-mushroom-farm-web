import {
  getProductBySlug,
  getSpeciesBySlug,
  isKnownNotificationCategory,
  notificationSignupSchema
} from "@mrmf/shared";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  buildDuplicateKeyForSignup,
  checkNotificationRateLimit,
  upsertNotificationRequest
} from "../../../lib/notification-store";

export const runtime = "nodejs";

function getClientKey(request: Request, email?: string) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const ip = forwardedFor || realIp || "local";

  return `${ip}:${email?.toLowerCase() ?? "unknown"}`;
}

function validateTarget(input: {
  targetType: string;
  targetSlug: string;
  notificationType: string;
}) {
  if (input.targetType === "product") {
    return getProductBySlug(input.targetSlug)
      ? undefined
      : `Unknown product notification target: ${input.targetSlug}.`;
  }

  if (input.targetType === "species") {
    return getSpeciesBySlug(input.targetSlug)
      ? undefined
      : `Unknown mushroom species notification target: ${input.targetSlug}.`;
  }

  if (input.targetType === "category") {
    return isKnownNotificationCategory(input.targetSlug)
      ? undefined
      : `Unknown product category notification target: ${input.targetSlug}.`;
  }

  if (input.targetType === "weekly-list") {
    return input.notificationType === "weekly-availability" &&
      input.targetSlug === "weekly-fresh-availability"
      ? undefined
      : "Weekly availability signups must target the weekly fresh availability list.";
  }

  if (input.targetType === "seasonal-list") {
    return input.notificationType === "seasonal-availability"
      ? undefined
      : "Seasonal interest signups must use seasonal availability notifications.";
  }

  if (input.targetType === "preorder-list") {
    return input.notificationType === "preorder-open"
      ? undefined
      : "Preorder interest signups must use preorder notifications.";
  }

  if (input.targetType === "wholesale-inquiry") {
    return input.notificationType === "wholesale-follow-up"
      ? undefined
      : "Wholesale interest signups must use wholesale follow-up notifications.";
  }

  return "Unsupported notification target.";
}

export async function POST(request: Request) {
  try {
    const parsed = notificationSignupSchema.parse(await request.json());

    if (parsed.website?.trim()) {
      return NextResponse.json({
        ok: true,
        message: "Thanks. If this request is valid, it will be reviewed."
      });
    }

    const targetError = validateTarget(parsed);

    if (targetError) {
      return NextResponse.json({ error: targetError }, { status: 400 });
    }

    const rateLimit = checkNotificationRateLimit(
      `${getClientKey(request, parsed.email)}:${buildDuplicateKeyForSignup(parsed)}`
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error:
            "Too many availability requests were submitted in a short time. Try again later."
        },
        { status: 429 }
      );
    }

    const result = await upsertNotificationRequest(parsed);

    return NextResponse.json({
      ok: true,
      outcome: result.outcome,
      message:
        result.outcome === "duplicate-updated"
          ? "You're already on this availability list, so we refreshed your request."
          : "You're on the list. The farm will review availability before any real email goes out.",
      request: {
        id: result.request.id,
        targetLabel: result.request.targetLabel,
        notificationType: result.request.notificationType,
        status: result.request.status
      }
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues.map((issue) => issue.message).join(" ") },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Availability notification signup failed."
      },
      { status: 500 }
    );
  }
}
