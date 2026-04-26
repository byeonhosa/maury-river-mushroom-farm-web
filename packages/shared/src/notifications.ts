import { z } from "zod";

import { availabilityStates } from "./availability";
import { getCommerceProductAvailability, type CommerceProduct } from "./commerce";
import { productCategories } from "./products";
import type {
  AvailabilityState,
  ProductCategory,
  SpeciesPage
} from "./types";

export const notificationTargetTypes = [
  "product",
  "species",
  "category",
  "weekly-list",
  "seasonal-list",
  "preorder-list",
  "wholesale-inquiry"
] as const;

export type NotificationTargetType = (typeof notificationTargetTypes)[number];

export const notificationTypes = [
  "back-in-stock",
  "coming-soon-update",
  "preorder-open",
  "seasonal-availability",
  "weekly-availability",
  "wholesale-follow-up"
] as const;

export type NotificationType = (typeof notificationTypes)[number];

export const notificationStatuses = [
  "active",
  "ready-to-send",
  "notified",
  "unsubscribed",
  "bounced",
  "suppressed"
] as const;

export type NotificationStatus = (typeof notificationStatuses)[number];

export const notificationRequestTableName = "mrmf_notification_requests";

export const notificationSchemaStatements = [
  `
    create table if not exists ${notificationRequestTableName} (
      id text primary key,
      email text not null,
      email_normalized text not null,
      name text,
      target_type text not null,
      target_slug text not null,
      target_label text not null,
      notification_type text not null,
      source_page text not null,
      availability_state text,
      consent_at timestamptz not null,
      status text not null default 'active',
      notes text,
      unsubscribe_token text not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `,
  `
    create unique index if not exists mrmf_notification_requests_active_unique_idx
      on ${notificationRequestTableName} (
        email_normalized,
        target_type,
        target_slug,
        notification_type
      )
      where status = 'active'
  `,
  `
    create unique index if not exists mrmf_notification_requests_unsubscribe_token_idx
      on ${notificationRequestTableName} (unsubscribe_token)
  `,
  `
    create index if not exists mrmf_notification_requests_target_idx
      on ${notificationRequestTableName} (target_type, target_slug, notification_type, status)
  `,
  `
    create index if not exists mrmf_notification_requests_status_idx
      on ${notificationRequestTableName} (status, created_at desc)
  `
] as const;

export interface NotificationRequest {
  id: string;
  email: string;
  emailNormalized: string;
  name?: string;
  targetType: NotificationTargetType;
  targetSlug: string;
  targetLabel: string;
  notificationType: NotificationType;
  sourcePage: string;
  availabilityState?: AvailabilityState;
  consentAt: string;
  status: NotificationStatus;
  notes?: string;
  unsubscribeToken: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationCta {
  targetType: NotificationTargetType;
  targetSlug: string;
  targetLabel: string;
  notificationType: NotificationType;
  availabilityState?: AvailabilityState;
  headline: string;
  description: string;
  sourcePage: string;
}

export interface NotificationEmailDraft {
  subject: string;
  previewText: string;
  bodyText: string;
}

const categorySlugs = productCategories.map((category) => category.slug) as [
  ProductCategory,
  ...ProductCategory[]
];

export const notificationSignupSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  name: z.string().trim().max(120, "Keep the name under 120 characters.").optional(),
  targetType: z.enum(notificationTargetTypes),
  targetSlug: z.string().trim().min(1, "Choose what you want updates about.").max(160),
  targetLabel: z.string().trim().min(1, "Choose what you want updates about.").max(180),
  notificationType: z.enum(notificationTypes),
  sourcePage: z.string().trim().min(1).max(240),
  availabilityState: z.enum(availabilityStates).optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Consent is required before joining an availability list." })
  }),
  notes: z.string().trim().max(500, "Keep notes under 500 characters.").optional(),
  website: z.string().trim().max(200).optional()
});

export type NotificationSignupInput = z.infer<typeof notificationSignupSchema>;

export function normalizeNotificationEmail(email: string) {
  return email.trim().toLowerCase();
}

export function activeNotificationDuplicateKey(input: Pick<
  NotificationSignupInput,
  "email" | "targetType" | "targetSlug" | "notificationType"
>) {
  return [
    normalizeNotificationEmail(input.email),
    input.targetType,
    input.targetSlug,
    input.notificationType
  ].join(":");
}

function productCtaForState(
  product: Pick<
    CommerceProduct,
    "name" | "slug" | "inventoryStatus" | "fulfillment" | "category" | "price" | "availability" | "metadata"
  >,
  sourcePage: string
): NotificationCta | undefined {
  const availability = getCommerceProductAvailability(product);

  if (
    availability.state === "hidden" ||
    availability.publicVisibility === "hidden" ||
    availability.showWholesaleCta ||
    availability.state === "inquiry-only"
  ) {
    return undefined;
  }

  if (availability.state === "sold-out") {
    return {
      targetType: "product",
      targetSlug: product.slug,
      targetLabel: product.name,
      notificationType: "back-in-stock",
      availabilityState: availability.state,
      headline: `Notify me when ${product.name} is available`,
      description:
        "Join this product's availability list and the farm can follow up when the next harvest or launch stock is ready.",
      sourcePage
    };
  }

  if (availability.state === "coming-soon") {
    return {
      targetType: "product",
      targetSlug: product.slug,
      targetLabel: product.name,
      notificationType: "coming-soon-update",
      availabilityState: availability.state,
      headline: `Tell me when ${product.name} launches`,
      description:
        "Get a careful launch update once packaging, stock, pickup, or shipping details are confirmed.",
      sourcePage
    };
  }

  if (availability.state === "seasonal") {
    return {
      targetType: "product",
      targetSlug: product.slug,
      targetLabel: product.name,
      notificationType: "seasonal-availability",
      availabilityState: availability.state,
      headline: `Notify me about ${product.name} harvest windows`,
      description:
        "Seasonal harvests move with the grow room. Join the list for updates when this item is ready.",
      sourcePage
    };
  }

  if (availability.state === "preorder") {
    return {
      targetType: "product",
      targetSlug: product.slug,
      targetLabel: product.name,
      notificationType: "preorder-open",
      availabilityState: availability.state,
      headline: `Send me ${product.name} preorder updates`,
      description:
        "Get preorder timing notes before the farm finalizes pickup or delivery windows.",
      sourcePage
    };
  }

  if (availability.state === "low-stock") {
    return {
      targetType: "product",
      targetSlug: product.slug,
      targetLabel: product.name,
      notificationType: "weekly-availability",
      availabilityState: availability.state,
      headline: `Join weekly updates for ${product.name}`,
      description:
        "Low-stock harvest items can move quickly. Join the weekly availability list for the next update.",
      sourcePage
    };
  }

  return undefined;
}

export function getProductNotificationCta(
  product: Pick<
    CommerceProduct,
    "name" | "slug" | "inventoryStatus" | "fulfillment" | "category" | "price" | "availability" | "metadata"
  >,
  sourcePage = `/shop/${product.slug}`
) {
  return productCtaForState(product, sourcePage);
}

export function getSpeciesNotificationCta(
  species: Pick<SpeciesPage, "name" | "slug" | "availabilityState" | "catalogStatus">,
  sourcePage = `/mushrooms/${species.slug}`
): NotificationCta | undefined {
  if (species.availabilityState === "hidden") {
    return undefined;
  }

  if (species.availabilityState === "available" && species.catalogStatus === "active") {
    return undefined;
  }

  const notificationType: NotificationType =
    species.availabilityState === "sold-out"
      ? "back-in-stock"
      : species.availabilityState === "preorder"
        ? "preorder-open"
        : species.availabilityState === "seasonal"
          ? "seasonal-availability"
          : species.availabilityState === "low-stock"
            ? "weekly-availability"
            : "coming-soon-update";

  return {
    targetType: "species",
    targetSlug: species.slug,
    targetLabel: species.name,
    notificationType,
    availabilityState: species.availabilityState,
    headline:
      notificationType === "seasonal-availability"
        ? `Notify me when ${species.name} is in season`
        : `Notify me when ${species.name} is available`,
    description:
      "Join the species interest list for customer-safe availability updates without making this catalog item cartable.",
    sourcePage
  };
}

export function getWeeklyAvailabilityNotificationCta(
  sourcePage: string
): NotificationCta {
  return {
    targetType: "weekly-list",
    targetSlug: "weekly-fresh-availability",
    targetLabel: "Weekly fresh mushroom availability",
    notificationType: "weekly-availability",
    headline: "Join the weekly fresh mushroom availability list",
    description:
      "Get harvest notes, market pickup updates, and product-launch news after the farm confirms each week's availability.",
    sourcePage
  };
}

export function isKnownNotificationCategory(slug: string): slug is ProductCategory {
  return categorySlugs.includes(slug as ProductCategory);
}

export function createNotificationEmailDraft(
  request: Pick<
    NotificationRequest,
    "targetLabel" | "notificationType" | "unsubscribeToken" | "name"
  >,
  options: {
    targetUrl?: string;
    unsubscribeUrl?: string;
  } = {}
): NotificationEmailDraft {
  const greeting = request.name ? `Hi ${request.name},` : "Hi,";
  const targetUrl = options.targetUrl ?? "{{target_url}}";
  const unsubscribeUrl =
    options.unsubscribeUrl ?? `{{unsubscribe_url:${request.unsubscribeToken}}}`;

  const drafts: Record<NotificationType, NotificationEmailDraft> = {
    "back-in-stock": {
      subject: `${request.targetLabel} availability update`,
      previewText: `${request.targetLabel} is ready for an availability follow-up from The Maury River Mushroom Farm.`,
      bodyText: `${greeting}\n\n${request.targetLabel} has a new availability update from The Maury River Mushroom Farm. Check the product page for current pickup, delivery, preorder, or shipping details before planning your order:\n\n${targetUrl}\n\nIf this update is not relevant anymore, unsubscribe here: ${unsubscribeUrl}`
    },
    "coming-soon-update": {
      subject: `${request.targetLabel} is moving closer`,
      previewText: `A careful launch update for ${request.targetLabel}.`,
      bodyText: `${greeting}\n\nThanks for asking about ${request.targetLabel}. The farm has a new coming-soon update. We will only share confirmed launch, pickup, packaging, or availability details:\n\n${targetUrl}\n\nUnsubscribe from this notification here: ${unsubscribeUrl}`
    },
    "preorder-open": {
      subject: `${request.targetLabel} preorder update`,
      previewText: `Preorder coordination details for ${request.targetLabel}.`,
      bodyText: `${greeting}\n\n${request.targetLabel} has a preorder update. Review the page for current harvest timing and fulfillment notes before making plans:\n\n${targetUrl}\n\nUnsubscribe from this notification here: ${unsubscribeUrl}`
    },
    "seasonal-availability": {
      subject: `${request.targetLabel} seasonal availability`,
      previewText: `A seasonal harvest update for ${request.targetLabel}.`,
      bodyText: `${greeting}\n\n${request.targetLabel} has a seasonal availability update. Harvests can change quickly, so check the page for the latest local pickup, market pickup, or preorder details:\n\n${targetUrl}\n\nUnsubscribe from this notification here: ${unsubscribeUrl}`
    },
    "weekly-availability": {
      subject: "Fresh mushroom availability this week",
      previewText: "The Maury River Mushroom Farm weekly availability note.",
      bodyText: `${greeting}\n\nHere is the weekly availability update scaffold for The Maury River Mushroom Farm. The owner should review current harvest, pickup, market, and product notes before any real email is sent:\n\n${targetUrl}\n\nUnsubscribe from weekly availability updates here: ${unsubscribeUrl}`
    },
    "wholesale-follow-up": {
      subject: `${request.targetLabel} wholesale follow-up`,
      previewText: `Chef and wholesale availability follow-up for ${request.targetLabel}.`,
      bodyText: `${greeting}\n\nThanks for your interest in ${request.targetLabel}. The farm can follow up with current harvest, quote, and fulfillment details after human review:\n\n${targetUrl}\n\nUnsubscribe from this notification here: ${unsubscribeUrl}`
    }
  };

  return drafts[request.notificationType];
}

export function getNotificationTypesForAvailabilityState(
  state: AvailabilityState
): NotificationType[] {
  if (state === "available" || state === "low-stock") {
    return ["back-in-stock", "weekly-availability", "seasonal-availability"];
  }

  if (state === "preorder") {
    return ["preorder-open", "seasonal-availability"];
  }

  if (state === "seasonal") {
    return ["seasonal-availability"];
  }

  if (state === "coming-soon") {
    return ["coming-soon-update"];
  }

  return [];
}

export function buildNotificationPreviewBatch(
  requests: NotificationRequest[],
  event: {
    targetType?: NotificationTargetType;
    targetSlug?: string;
    availabilityState?: AvailabilityState;
  }
) {
  const allowedTypes = event.availabilityState
    ? getNotificationTypesForAvailabilityState(event.availabilityState)
    : notificationTypes;

  return requests
    .filter((request) => request.status === "active")
    .filter((request) =>
      event.targetType ? request.targetType === event.targetType : true
    )
    .filter((request) =>
      event.targetSlug ? request.targetSlug === event.targetSlug : true
    )
    .filter((request) => allowedTypes.includes(request.notificationType))
    .map((request) => ({
      request,
      draft: createNotificationEmailDraft(request)
    }));
}
