import { loadEnv } from "@medusajs/framework/utils";
import {
  buildCheckoutEmailDrafts,
  calculateCheckoutTaxEstimate,
  resolveCheckoutModeConfig,
  type TestCheckoutRecordSummary
} from "@mrmf/shared";
import path from "node:path";

const repositoryRoot = path.resolve(__dirname, "../../../..");

loadEnv(process.env.NODE_ENV ?? "development", repositoryRoot);

export function runCheckoutModeSmoke() {
  const checkoutMode = resolveCheckoutModeConfig(process.env);
  const tax = calculateCheckoutTaxEstimate({
    subtotal: 1400
  });
  const record: TestCheckoutRecordSummary = {
    id: "testchk_preview",
    checkoutMode: checkoutMode.effectiveMode,
    paymentStatus: checkoutMode.paymentStatus,
    cartSource: "staged",
    customerEmail: "customer@example.com",
    customerName: "Test Customer",
    subtotal: 1400,
    estimatedTax: tax.estimatedTax,
    totalDueInTest: 1400 + tax.estimatedTax,
    fulfillmentType: "farm-pickup",
    lineCount: 1,
    createdAt: new Date().toISOString()
  };
  const drafts = buildCheckoutEmailDrafts({ record, tax, checkoutMode });

  console.log("Checkout mode smoke");
  console.log(JSON.stringify(checkoutMode, null, 2));
  console.log("Tax scaffold");
  console.log(JSON.stringify(tax, null, 2));
  console.log("Customer email draft");
  console.log(`Subject: ${drafts.customer.subject}`);
  console.log(drafts.customer.bodyText);

  if (checkoutMode.livePaymentsEnabled) {
    throw new Error("Live payments must remain disabled in Phase 5.");
  }

  if (checkoutMode.requestedMode === "live-payment-enabled") {
    throw new Error("Live payment mode was requested and correctly blocked.");
  }
}

if (require.main === module) {
  runCheckoutModeSmoke();
}
