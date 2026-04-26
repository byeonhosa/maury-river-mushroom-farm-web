import {
  buildCheckoutEmailDrafts,
  calculateCheckoutTaxEstimate,
  checkoutCompletionInputSchema,
  canShowCheckoutConfirmation,
  createEmailProvider,
  resolveCheckoutModeConfig,
  summarizeCommerceCart,
  validateCheckout
} from "@mrmf/shared";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { createTestCheckoutRecord } from "../../../../lib/checkout-record-store";
import { getProductsForCart } from "../../../../lib/products";

export const runtime = "nodejs";

function getSiteUrl(request: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;

  if (configured) {
    return configured.replace(/\/$/, "");
  }

  const url = new URL(request.url);

  return `${url.protocol}//${url.host}`;
}

export async function POST(request: Request) {
  try {
    const input = checkoutCompletionInputSchema.parse(await request.json());
    const checkoutMode = resolveCheckoutModeConfig(process.env);

    if (!canShowCheckoutConfirmation(checkoutMode)) {
      return NextResponse.json(
        {
          error:
            checkoutMode.errors[0] ??
            "Checkout cannot create test records in the current mode.",
          checkoutMode
        },
        { status: 400 }
      );
    }

    const cartLines = await getProductsForCart(input.cartItems);
    const cart = summarizeCommerceCart(cartLines);
    const validation = validateCheckout({
      cart,
      contact: input.contact,
      fulfillment: input.fulfillment,
      policyAccepted: input.policyAccepted
    });

    if (!validation.canProceed) {
      return NextResponse.json(
        {
          error: "Checkout validation failed.",
          validation
        },
        { status: 400 }
      );
    }

    const tax = calculateCheckoutTaxEstimate(
      cart,
      process.env.TAX_MODE === "disabled" ? "disabled" : "placeholder"
    );
    const previewRecord = {
      id: "preview",
      checkoutMode: checkoutMode.effectiveMode,
      paymentStatus: checkoutMode.paymentStatus,
      cartSource: input.cartSource ?? "staged",
      medusaCartId: input.medusaCartId,
      customerEmail: input.contact.email,
      customerName: input.contact.name,
      subtotal: cart.subtotal,
      estimatedTax: tax.estimatedTax,
      totalDueInTest: cart.subtotal + tax.estimatedTax,
      fulfillmentType: input.fulfillment.type,
      lineCount: cart.lines.length,
      createdAt: new Date().toISOString()
    };
    const emailDrafts = buildCheckoutEmailDrafts({
      record: previewRecord,
      tax,
      checkoutMode
    });
    const record = await createTestCheckoutRecord({
      checkoutMode,
      paymentStatus: checkoutMode.paymentStatus,
      contact: input.contact,
      fulfillment: input.fulfillment,
      cart,
      tax,
      emailDrafts,
      cartSource: input.cartSource ?? "staged",
      medusaCartId: input.medusaCartId,
      policyAccepted: input.policyAccepted
    });
    const finalEmailDrafts = buildCheckoutEmailDrafts({
      record,
      tax,
      checkoutMode
    });
    let emailPreviewMessage = "Checkout email drafts were generated but not sent.";

    try {
      const provider = createEmailProvider(process.env.EMAIL_PROVIDER ?? "console");
      const from = process.env.EMAIL_FROM ?? "farm@example.com";

      await provider.send({
        to: input.contact.email,
        from,
        subject: finalEmailDrafts.customer.subject,
        text: finalEmailDrafts.customer.bodyText
      });
      await provider.send({
        to: from,
        from,
        subject: finalEmailDrafts.admin.subject,
        text: finalEmailDrafts.admin.bodyText
      });
      emailPreviewMessage = `${provider.name} email provider previewed the customer and farm/admin drafts.`;
    } catch (error) {
      emailPreviewMessage =
        error instanceof Error
          ? `Email preview was skipped safely: ${error.message}`
          : "Email preview was skipped safely.";
    }

    const confirmationUrl = `/checkout/test-confirmation/${record.id}`;

    return NextResponse.json({
      ok: true,
      record,
      checkoutMode,
      tax,
      emailPreviewMessage,
      confirmationUrl,
      confirmationAbsoluteUrl: `${getSiteUrl(request)}${confirmationUrl}`,
      message:
        "Test checkout record created. No card was charged, no live order was placed, and checkout remains owner-review only."
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
          error instanceof Error ? error.message : "Test checkout completion failed safely."
      },
      { status: 500 }
    );
  }
}
