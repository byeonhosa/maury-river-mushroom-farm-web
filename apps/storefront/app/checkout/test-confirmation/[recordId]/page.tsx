import { CheckCircle2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHero } from "../../../../components/page-hero";
import { formatCurrency } from "../../../../lib/format";
import { getTestCheckoutRecord } from "../../../../lib/checkout-record-store";

export const dynamic = "force-dynamic";

export default async function TestCheckoutConfirmationPage({
  params
}: {
  params: Promise<{ recordId: string }>;
}) {
  const { recordId } = await params;
  const record = await getTestCheckoutRecord(recordId).catch(() => undefined);

  if (!record) {
    notFound();
  }

  return (
    <>
      <PageHero eyebrow="Test checkout" title="Test checkout record created.">
        <p>
          This confirmation is for development and owner review only. No card was charged, no
          production order was placed, and the farm still needs final payment, tax, policy, and
          fulfillment approval before launch.
        </p>
      </PageHero>
      <section className="mrmf-shell grid gap-6 py-12 lg:grid-cols-[1fr_0.75fr]">
        <div className="mrmf-card p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-1 h-5 w-5 text-brand-ebony" aria-hidden="true" />
            <div>
              <p className="mrmf-eyebrow">Record</p>
              <h2 className="font-heading text-4xl">{record.id}</h2>
            </div>
          </div>
          <dl className="mt-6 grid gap-4 text-sm leading-7 sm:grid-cols-2">
            <div>
              <dt className="font-subheading text-xs font-extrabold uppercase tracking-[0.14em]">
                Customer
              </dt>
              <dd>{record.customerName}</dd>
            </div>
            <div>
              <dt className="font-subheading text-xs font-extrabold uppercase tracking-[0.14em]">
                Email
              </dt>
              <dd>{record.customerEmail}</dd>
            </div>
            <div>
              <dt className="font-subheading text-xs font-extrabold uppercase tracking-[0.14em]">
                Cart source
              </dt>
              <dd>{record.cartSource}</dd>
            </div>
            <div>
              <dt className="font-subheading text-xs font-extrabold uppercase tracking-[0.14em]">
                Fulfillment
              </dt>
              <dd>{record.fulfillmentType ?? "Needs review"}</dd>
            </div>
            <div>
              <dt className="font-subheading text-xs font-extrabold uppercase tracking-[0.14em]">
                Subtotal
              </dt>
              <dd>{formatCurrency(record.subtotal)}</dd>
            </div>
            <div>
              <dt className="font-subheading text-xs font-extrabold uppercase tracking-[0.14em]">
                Tax placeholder
              </dt>
              <dd>{formatCurrency(record.estimatedTax)}</dd>
            </div>
          </dl>
        </div>
        <aside className="mrmf-card border-brand-burnt p-6">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-1 h-5 w-5 text-brand-burnt" aria-hidden="true" />
            <div>
              <p className="mrmf-eyebrow">Safety status</p>
              <h2 className="font-heading text-4xl">Not a live order</h2>
            </div>
          </div>
          <p className="mt-4 text-sm leading-7">
            Payment status: {record.paymentStatus}. This page is safe for local and staging tests;
            it must not be treated as a production order confirmation.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/shop" className="mrmf-button-primary">
              Back to shop
            </Link>
            <Link href="/checkout" className="mrmf-button-secondary">
              Checkout
            </Link>
          </div>
        </aside>
      </section>
    </>
  );
}
