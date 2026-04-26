import {
  activeNotificationDuplicateKey,
  buildNotificationPreviewBatch,
  createNotificationEmailDraft,
  getProductNotificationCta,
  getSpeciesBySlug,
  getSpeciesNotificationCta,
  getWeeklyAvailabilityNotificationCta,
  medusaProductToCommerceProduct,
  notificationSchemaStatements,
  notificationSignupSchema,
  type NotificationRequest
} from "../src";
import { describe, expect, it } from "vitest";

function request(overrides: Partial<NotificationRequest> = {}): NotificationRequest {
  return {
    id: "notif_1",
    email: "customer@example.com",
    emailNormalized: "customer@example.com",
    targetType: "product",
    targetSlug: "mushroom-salt",
    targetLabel: "Mushroom Salt",
    notificationType: "coming-soon-update",
    sourcePage: "/shop/mushroom-salt",
    availabilityState: "coming-soon",
    consentAt: "2026-04-26T12:00:00.000Z",
    status: "active",
    unsubscribeToken: "token_123",
    createdAt: "2026-04-26T12:00:00.000Z",
    updatedAt: "2026-04-26T12:00:00.000Z",
    ...overrides
  };
}

describe("availability notification model", () => {
  it("validates consent-based signup payloads and duplicate keys", () => {
    const parsed = notificationSignupSchema.parse({
      email: "Customer@Example.com ",
      targetType: "product",
      targetSlug: "mushroom-salt",
      targetLabel: "Mushroom Salt",
      notificationType: "coming-soon-update",
      sourcePage: "/shop/mushroom-salt",
      availabilityState: "coming-soon",
      consent: true
    });

    expect(activeNotificationDuplicateKey(parsed)).toBe(
      "customer@example.com:product:mushroom-salt:coming-soon-update"
    );
    expect(
      notificationSignupSchema.safeParse({
        ...parsed,
        consent: false
      }).success
    ).toBe(false);
    expect(
      notificationSignupSchema.safeParse({
        ...parsed,
        email: "not-an-email"
      }).success
    ).toBe(false);
  });

  it("shows product notify-me CTAs for sold-out, coming-soon, seasonal, preorder, and low-stock states", () => {
    const comingSoon = medusaProductToCommerceProduct({
      id: "prod_mushroom_salt",
      handle: "mushroom-salt"
    });
    const soldOut = medusaProductToCommerceProduct({
      id: "prod_blue",
      handle: "blue-oyster-mushrooms",
      metadata: { availability_state: "sold-out" }
    });
    const seasonal = medusaProductToCommerceProduct({
      id: "prod_lions_mane",
      handle: "fresh-lions-mane"
    });
    const preorder = medusaProductToCommerceProduct({
      id: "prod_mixed_box",
      handle: "mixed-gourmet-mushroom-box"
    });
    const lowStock = medusaProductToCommerceProduct({
      id: "prod_white",
      handle: "white-oyster-mushrooms"
    });

    expect(getProductNotificationCta(comingSoon)?.notificationType).toBe(
      "coming-soon-update"
    );
    expect(getProductNotificationCta(soldOut)?.notificationType).toBe("back-in-stock");
    expect(getProductNotificationCta(seasonal)?.notificationType).toBe(
      "seasonal-availability"
    );
    expect(getProductNotificationCta(preorder)?.notificationType).toBe("preorder-open");
    expect(getProductNotificationCta(lowStock)?.notificationType).toBe("weekly-availability");
  });

  it("does not expose public notification signup for hidden or inquiry-routed products", () => {
    const hidden = medusaProductToCommerceProduct({
      id: "prod_hidden",
      handle: "blue-oyster-mushrooms",
      metadata: {
        availability_state: "hidden",
        public_visibility: "hidden"
      }
    });
    const wholesale = medusaProductToCommerceProduct({
      id: "prod_chef",
      handle: "chefs-weekly-mushroom-mix"
    });

    expect(getProductNotificationCta(hidden)).toBeUndefined();
    expect(getProductNotificationCta(wholesale)).toBeUndefined();
  });

  it("supports species and weekly availability notification CTAs", () => {
    const enoki = getSpeciesBySlug("enoki");

    expect(enoki).toBeDefined();
    expect(getSpeciesNotificationCta(enoki!)?.notificationType).toBe(
      "coming-soon-update"
    );
    expect(getWeeklyAvailabilityNotificationCta("/shop")).toMatchObject({
      targetType: "weekly-list",
      targetSlug: "weekly-fresh-availability",
      notificationType: "weekly-availability"
    });
  });

  it("generates conservative email drafts with unsubscribe placeholders and no disease claims", () => {
    const draft = createNotificationEmailDraft(request(), {
      targetUrl: "http://localhost:3000/shop/mushroom-salt",
      unsubscribeUrl: "http://localhost:3000/notifications/unsubscribe/token_123"
    });

    expect(draft.subject).toContain("Mushroom Salt");
    expect(draft.bodyText).toContain("/notifications/unsubscribe/token_123");
    expect(draft.bodyText.toLowerCase()).not.toContain("cure");
    expect(draft.bodyText.toLowerCase()).not.toContain("treat");
    expect(draft.bodyText.toLowerCase()).not.toContain("prevent disease");
  });

  it("previews active matching notification batches without including unsubscribed requests", () => {
    const previews = buildNotificationPreviewBatch(
      [
        request(),
        request({
          id: "notif_2",
          email: "old@example.com",
          emailNormalized: "old@example.com",
          status: "unsubscribed"
        }),
        request({
          id: "notif_3",
          targetSlug: "fresh-lions-mane",
          notificationType: "seasonal-availability",
          availabilityState: "seasonal"
        })
      ],
      {
        targetType: "product",
        targetSlug: "mushroom-salt",
        availabilityState: "coming-soon"
      }
    );

    expect(previews).toHaveLength(1);
    expect(previews[0]?.request.email).toBe("customer@example.com");
  });

  it("documents a durable Postgres schema with active duplicate protection", () => {
    const sql = notificationSchemaStatements.join("\n");

    expect(sql).toContain("mrmf_notification_requests");
    expect(sql).toContain("email_normalized");
    expect(sql).toContain("where status = 'active'");
    expect(sql).toContain("unsubscribe_token");
  });
});
