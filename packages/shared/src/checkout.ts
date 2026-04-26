import { z } from "zod";

import type { CommerceCartSummary } from "./cart";
import { canShipCommerceProduct } from "./commerce";
import type { CheckoutTaxEstimate } from "./tax";
import { validatePickupSelection } from "./pickup";
import type { FulfillmentType } from "./types";

export const checkoutModes = [
  "development",
  "staging",
  "production-disabled",
  "test-payment-enabled",
  "live-payment-enabled"
] as const;

export type CheckoutMode = (typeof checkoutModes)[number];

export type CheckoutPaymentStatus =
  | "staged-not-paid"
  | "stripe-test-ready"
  | "stripe-test-env-missing"
  | "live-disabled";

export const checkoutContactSchema = z.object({
  name: z.string().trim().min(2, "Enter the customer's name."),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z.string().trim().min(7, "Enter a phone number for pickup or order questions."),
  notes: z.string().trim().max(1000, "Keep notes under 1000 characters.").optional()
});

export const checkoutFulfillmentSchema = z.object({
  type: z
    .enum([
      "farm-pickup",
      "farmers-market-pickup",
      "local-delivery",
      "local-preorder",
      "shipping",
      "restaurant-delivery"
    ])
    .optional(),
  pickupLocationSlug: z.string().trim().max(160).optional(),
  pickupWindowLabel: z.string().trim().max(180).optional(),
  localDeliveryNotes: z.string().trim().max(800).optional(),
  shippingAddress: z.string().trim().max(1000).optional(),
  preorderNotes: z.string().trim().max(800).optional()
});

export const checkoutCompletionInputSchema = z.object({
  cartItems: z
    .array(
      z.object({
        productSlug: z.string().trim().min(1).max(160),
        quantity: z.number().int().min(1).max(99)
      })
    )
    .min(1, "Add products before starting checkout."),
  contact: checkoutContactSchema,
  fulfillment: checkoutFulfillmentSchema,
  policyAccepted: z.literal(true, {
    errorMap: () => ({
      message: "Acknowledge the shipping, pickup, and refund policies before checkout."
    })
  }),
  medusaCartId: z.string().trim().max(160).optional(),
  cartSource: z.enum(["staged", "medusa"]).optional()
});

export interface CheckoutContactInput {
  name: string;
  email: string;
  phone: string;
  notes?: string;
}

export interface CheckoutFulfillmentInput {
  type?: FulfillmentType;
  pickupLocationSlug?: string;
  pickupWindowLabel?: string;
  localDeliveryNotes?: string;
  shippingAddress?: string;
  preorderNotes?: string;
}

export interface CheckoutValidationInput {
  cart: CommerceCartSummary;
  contact: CheckoutContactInput;
  fulfillment: CheckoutFulfillmentInput;
  policyAccepted: boolean;
}

export interface CheckoutValidationResult {
  canProceed: boolean;
  errors: string[];
  warnings: string[];
  supportedFulfillmentTypes: FulfillmentType[];
}

export type CheckoutCompletionInput = z.infer<typeof checkoutCompletionInputSchema>;

export interface CheckoutModeConfig {
  requestedMode: CheckoutMode;
  effectiveMode: Exclude<CheckoutMode, "live-payment-enabled">;
  displayLabel: string;
  customerMessage: string;
  allowTestCheckoutRecords: boolean;
  testPaymentsRequested: boolean;
  testPaymentsEnabled: boolean;
  livePaymentsEnabled: false;
  paymentStatus: CheckoutPaymentStatus;
  stripePublishableKeyReady: boolean;
  stripeSecretKeyReady: boolean;
  errors: string[];
  warnings: string[];
}

export interface CheckoutModeEnv {
  NODE_ENV?: string;
  CHECKOUT_MODE?: string;
  ENABLE_TEST_PAYMENTS?: string;
  ENABLE_LIVE_PAYMENTS?: string;
  STRIPE_SECRET_KEY_TEST?: string;
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST?: string;
}

export interface TestCheckoutRecordSummary {
  id: string;
  checkoutMode: CheckoutModeConfig["effectiveMode"];
  paymentStatus: CheckoutPaymentStatus;
  cartSource: "staged" | "medusa";
  medusaCartId?: string;
  customerEmail: string;
  customerName: string;
  subtotal: number;
  estimatedTax: number;
  totalDueInTest: number;
  fulfillmentType?: FulfillmentType;
  lineCount: number;
  createdAt: string;
}

export interface CheckoutEmailDrafts {
  customer: {
    subject: string;
    bodyText: string;
  };
  admin: {
    subject: string;
    bodyText: string;
  };
}

export const testCheckoutRecordTableName = "mrmf_test_checkout_records";

export const testCheckoutRecordSchemaStatements = [
  `
    create table if not exists ${testCheckoutRecordTableName} (
      id text primary key,
      checkout_mode text not null,
      payment_status text not null,
      cart_source text not null,
      medusa_cart_id text,
      customer_email text not null,
      customer_name text not null,
      customer_phone text not null,
      contact_json jsonb not null,
      fulfillment_json jsonb not null,
      cart_json jsonb not null,
      tax_json jsonb not null,
      email_preview_json jsonb not null,
      policy_accepted boolean not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `,
  `
    create index if not exists mrmf_test_checkout_records_created_idx
      on ${testCheckoutRecordTableName} (created_at desc)
  `,
  `
    create index if not exists mrmf_test_checkout_records_customer_idx
      on ${testCheckoutRecordTableName} (customer_email, created_at desc)
  `
] as const;

const pickupFulfillmentTypes: FulfillmentType[] = [
  "farm-pickup",
  "farmers-market-pickup"
];

function unique<TValue>(values: TValue[]) {
  return [...new Set(values)];
}

function booleanEnv(value: string | undefined) {
  return value === "true";
}

function normalizeCheckoutMode(value: string | undefined, nodeEnv = "development"): CheckoutMode {
  if (checkoutModes.includes(value as CheckoutMode)) {
    return value as CheckoutMode;
  }

  return nodeEnv === "production" ? "production-disabled" : "development";
}

function isStripeTestSecretKey(value: string | undefined) {
  return typeof value === "string" && value.startsWith("sk_test_");
}

function isStripeTestPublishableKey(value: string | undefined) {
  return typeof value === "string" && value.startsWith("pk_test_");
}

export function resolveCheckoutModeConfig(env: CheckoutModeEnv = {}): CheckoutModeConfig {
  const requestedMode = normalizeCheckoutMode(env.CHECKOUT_MODE, env.NODE_ENV);
  const errors: string[] = [];
  const warnings: string[] = [];
  const liveRequested =
    requestedMode === "live-payment-enabled" || booleanEnv(env.ENABLE_LIVE_PAYMENTS);
  const testPaymentsRequested =
    requestedMode === "test-payment-enabled" || booleanEnv(env.ENABLE_TEST_PAYMENTS);
  const stripeSecretKeyReady = isStripeTestSecretKey(env.STRIPE_SECRET_KEY_TEST);
  const stripePublishableKeyReady = isStripeTestPublishableKey(
    env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST
  );
  let effectiveMode: CheckoutModeConfig["effectiveMode"] =
    requestedMode === "live-payment-enabled" ? "production-disabled" : requestedMode;

  if (liveRequested) {
    effectiveMode = "production-disabled";
    errors.push(
      "Live Stripe payments are intentionally disabled in this build. A future owner-approved launch task must enable them deliberately."
    );
  }

  if (testPaymentsRequested && (!stripeSecretKeyReady || !stripePublishableKeyReady)) {
    errors.push(
      "Stripe test payments were requested, but STRIPE_SECRET_KEY_TEST and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST must both use test-mode key prefixes."
    );
  }

  if (effectiveMode === "production-disabled") {
    warnings.push("Checkout cannot create paid orders while production checkout is disabled.");
  }

  if (effectiveMode === "development" || effectiveMode === "staging") {
    warnings.push("Checkout creates test records only. No card is charged and no Medusa order is completed.");
  }

  const testPaymentsEnabled =
    !liveRequested && testPaymentsRequested && stripeSecretKeyReady && stripePublishableKeyReady;
  const paymentStatus: CheckoutPaymentStatus = liveRequested
    ? "live-disabled"
    : testPaymentsRequested
      ? testPaymentsEnabled
        ? "stripe-test-ready"
        : "stripe-test-env-missing"
      : "staged-not-paid";

  const displayLabel = testPaymentsEnabled
    ? "Stripe test payment mode"
    : effectiveMode === "production-disabled"
      ? "Production checkout disabled"
      : effectiveMode === "staging"
        ? "Staging checkout"
        : "Development checkout";
  const customerMessage = testPaymentsEnabled
    ? "Stripe test keys are configured for a future test-payment handoff, but this phase still records a clearly marked test checkout instead of completing a live order."
    : effectiveMode === "production-disabled"
      ? "Production checkout is disabled. This site is not accepting paid online orders yet."
      : "This checkout records a local test checkout for review. No card is charged and no paid order is created.";

  return {
    requestedMode,
    effectiveMode,
    displayLabel,
    customerMessage,
    allowTestCheckoutRecords: effectiveMode !== "production-disabled" && !liveRequested,
    testPaymentsRequested,
    testPaymentsEnabled,
    livePaymentsEnabled: false,
    paymentStatus,
    stripePublishableKeyReady,
    stripeSecretKeyReady,
    errors: unique(errors),
    warnings: unique(warnings)
  };
}

export function getCartSupportedFulfillmentTypes(cart: CommerceCartSummary): FulfillmentType[] {
  if (cart.lines.length === 0) {
    return [];
  }

  const fulfillmentTypes = unique(
    cart.lines.flatMap((line) => line.product.fulfillment)
  );

  return fulfillmentTypes.filter((fulfillmentType) =>
    cart.lines.every((line) => line.product.fulfillment.includes(fulfillmentType))
  );
}

export function requiresPickupDetails(fulfillmentType?: FulfillmentType) {
  return Boolean(
    fulfillmentType && pickupFulfillmentTypes.includes(fulfillmentType)
  );
}

export function validateCheckout({
  cart,
  contact,
  fulfillment,
  policyAccepted
}: CheckoutValidationInput): CheckoutValidationResult {
  const errors: string[] = [];
  const supportedFulfillmentTypes = getCartSupportedFulfillmentTypes(cart);
  const selectedFulfillmentType = fulfillment.type;

  if (cart.lines.length === 0) {
    errors.push("Add products before starting checkout.");
  }

  const contactResult = checkoutContactSchema.safeParse(contact);

  if (!contactResult.success) {
    errors.push(...contactResult.error.issues.map((issue) => issue.message));
  }

  if (!selectedFulfillmentType) {
    errors.push("Select a fulfillment option for this order.");
  } else if (!supportedFulfillmentTypes.includes(selectedFulfillmentType)) {
    errors.push("The selected fulfillment option is not available for every item in the cart.");
  }

  if (selectedFulfillmentType === "shipping") {
    const localOnlyLines = cart.lines.filter((line) => !canShipCommerceProduct(line.product));

    if (localOnlyLines.length > 0) {
      errors.push(
        "Fresh and local-only products cannot use parcel shipping. Choose pickup, local delivery, or split the order."
      );
    }

    if (!fulfillment.shippingAddress?.trim()) {
      errors.push("Enter a shipping address for parcel shipping.");
    }
  }

  if (requiresPickupDetails(selectedFulfillmentType)) {
    const pickupResult = validatePickupSelection({
      locationSlug: fulfillment.pickupLocationSlug ?? "",
      windowLabel: fulfillment.pickupWindowLabel ?? "",
      allowedFulfillmentTypes: supportedFulfillmentTypes
    });

    if (!pickupResult.valid) {
      errors.push(pickupResult.message);
    }
  }

  if (selectedFulfillmentType === "local-delivery" && !fulfillment.localDeliveryNotes?.trim()) {
    errors.push("Add local delivery notes before checkout can proceed.");
  }

  if (selectedFulfillmentType === "local-preorder" && !fulfillment.preorderNotes?.trim()) {
    errors.push("Add preorder timing notes before checkout can proceed.");
  }

  if (selectedFulfillmentType === "restaurant-delivery") {
    errors.push("Restaurant and wholesale products require an inquiry or quote before checkout.");
  }

  if (cart.fulfillmentType === "mixed") {
    errors.push(
      "Mixed carts must be split into local pickup or delivery items and shippable shelf-stable items before checkout."
    );
  }

  errors.push(...cart.restrictions);

  if (!policyAccepted) {
    errors.push("Acknowledge the shipping, pickup, and refund policies before checkout.");
  }

  return {
    canProceed: errors.length === 0,
    errors: unique(errors),
    warnings: cart.warnings,
    supportedFulfillmentTypes
  };
}

export function canShowCheckoutConfirmation(config: CheckoutModeConfig) {
  return config.allowTestCheckoutRecords && !config.livePaymentsEnabled;
}

export function buildCheckoutEmailDrafts({
  record,
  tax,
  checkoutMode
}: {
  record: TestCheckoutRecordSummary;
  tax: CheckoutTaxEstimate;
  checkoutMode: CheckoutModeConfig;
}): CheckoutEmailDrafts {
  const modeLine =
    checkoutMode.paymentStatus === "stripe-test-ready"
      ? "Stripe test-mode configuration is present, but this confirmation remains a test checkout record."
      : "No online card payment was collected for this test checkout record.";
  const fulfillmentLine = record.fulfillmentType
    ? `Fulfillment selected: ${record.fulfillmentType}.`
    : "Fulfillment still needs review.";
  const summaryLines = [
    `Test checkout record: ${record.id}`,
    `Customer: ${record.customerName} <${record.customerEmail}>`,
    `Cart source: ${record.cartSource}`,
    `Subtotal: ${record.subtotal}`,
    `Tax placeholder: ${record.estimatedTax}`,
    `Total shown in test: ${record.totalDueInTest}`,
    fulfillmentLine,
    tax.note,
    modeLine,
    "The farm must review pickup, delivery, payment, tax, and policy details before treating this as a real order."
  ].join("\n");

  return {
    customer: {
      subject: "Your Maury River Mushroom Farm test checkout record",
      bodyText: `Hi ${record.customerName},\n\nThis is a test checkout confirmation for The Maury River Mushroom Farm website rebuild. It is not a paid order and no card has been charged.\n\n${summaryLines}\n\nA real launch checkout will require approved payment, tax, fulfillment, refund, and email settings before production use.`
    },
    admin: {
      subject: `Test checkout received: ${record.id}`,
      bodyText: `A staged/test checkout record was created for owner review.\n\n${summaryLines}\n\nDo not fulfill this as a paid production order.`
    }
  };
}
