import crypto from "node:crypto";
import pg from "pg";

import {
  testCheckoutRecordSchemaStatements,
  testCheckoutRecordTableName,
  type CheckoutEmailDrafts,
  type CheckoutFulfillmentInput,
  type CheckoutModeConfig,
  type CheckoutPaymentStatus,
  type CheckoutContactInput,
  type CheckoutTaxEstimate,
  type CommerceCartSummary,
  type TestCheckoutRecordSummary
} from "@mrmf/shared";

const { Pool } = pg;

declare global {
  var __mrmfCheckoutPool: pg.Pool | undefined;
}

interface TestCheckoutRecordRow {
  id: string;
  checkout_mode: CheckoutModeConfig["effectiveMode"];
  payment_status: CheckoutPaymentStatus;
  cart_source: "staged" | "medusa";
  medusa_cart_id: string | null;
  customer_email: string;
  customer_name: string;
  cart_json: {
    subtotal: number;
    lines: Array<unknown>;
  };
  fulfillment_json: CheckoutFulfillmentInput;
  tax_json: CheckoutTaxEstimate;
  created_at: Date | string;
}

export interface CreateTestCheckoutRecordInput {
  checkoutMode: CheckoutModeConfig;
  paymentStatus: CheckoutPaymentStatus;
  contact: CheckoutContactInput;
  fulfillment: CheckoutFulfillmentInput;
  cart: CommerceCartSummary;
  tax: CheckoutTaxEstimate;
  emailDrafts: CheckoutEmailDrafts;
  cartSource: "staged" | "medusa";
  medusaCartId?: string;
  policyAccepted: boolean;
}

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for test checkout record storage.");
  }

  return databaseUrl;
}

export function getCheckoutPool() {
  globalThis.__mrmfCheckoutPool ??= new Pool({
    connectionString: getDatabaseUrl(),
    max: 4
  });

  return globalThis.__mrmfCheckoutPool;
}

export async function ensureTestCheckoutSchema(pool = getCheckoutPool()) {
  for (const statement of testCheckoutRecordSchemaStatements) {
    await pool.query(statement);
  }
}

function toIsoString(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function toRecordSummary(row: TestCheckoutRecordRow): TestCheckoutRecordSummary {
  return {
    id: row.id,
    checkoutMode: row.checkout_mode,
    paymentStatus: row.payment_status,
    cartSource: row.cart_source,
    medusaCartId: row.medusa_cart_id ?? undefined,
    customerEmail: row.customer_email,
    customerName: row.customer_name,
    subtotal: row.cart_json.subtotal,
    estimatedTax: row.tax_json.estimatedTax,
    totalDueInTest: row.cart_json.subtotal + row.tax_json.estimatedTax,
    fulfillmentType: row.fulfillment_json.type,
    lineCount: row.cart_json.lines.length,
    createdAt: toIsoString(row.created_at)
  };
}

export async function createTestCheckoutRecord(input: CreateTestCheckoutRecordInput) {
  const pool = getCheckoutPool();
  await ensureTestCheckoutSchema(pool);

  const now = new Date();
  const id = `testchk_${crypto.randomUUID()}`;
  const cartJson = {
    subtotal: input.cart.subtotal,
    fulfillmentType: input.cart.fulfillmentType,
    warnings: input.cart.warnings,
    restrictions: input.cart.restrictions,
    lines: input.cart.lines.map((line) => ({
      productSlug: line.product.slug,
      productName: line.product.name,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      subtotal: line.subtotal,
      fulfillmentMode: line.fulfillmentMode,
      fulfillmentLabel: line.fulfillmentLabel,
      inventoryStatus: line.product.inventoryStatus,
      availabilityState: line.product.availability.state ?? line.product.inventoryStatus
    }))
  };

  const result = await pool.query<TestCheckoutRecordRow>(
    `
      insert into ${testCheckoutRecordTableName} (
        id,
        checkout_mode,
        payment_status,
        cart_source,
        medusa_cart_id,
        customer_email,
        customer_name,
        customer_phone,
        contact_json,
        fulfillment_json,
        cart_json,
        tax_json,
        email_preview_json,
        policy_accepted,
        created_at,
        updated_at
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb, $11::jsonb, $12::jsonb, $13::jsonb, $14, $15, $15)
      returning *
    `,
    [
      id,
      input.checkoutMode.effectiveMode,
      input.paymentStatus,
      input.cartSource,
      input.medusaCartId ?? null,
      input.contact.email.trim(),
      input.contact.name.trim(),
      input.contact.phone.trim(),
      JSON.stringify(input.contact),
      JSON.stringify(input.fulfillment),
      JSON.stringify(cartJson),
      JSON.stringify(input.tax),
      JSON.stringify(input.emailDrafts),
      input.policyAccepted,
      now
    ]
  );

  return toRecordSummary(result.rows[0]!);
}

export async function getTestCheckoutRecord(recordId: string) {
  const pool = getCheckoutPool();
  await ensureTestCheckoutSchema(pool);

  const result = await pool.query<TestCheckoutRecordRow>(
    `
      select *
      from ${testCheckoutRecordTableName}
      where id = $1
      limit 1
    `,
    [recordId]
  );

  return result.rows[0] ? toRecordSummary(result.rows[0]) : undefined;
}
