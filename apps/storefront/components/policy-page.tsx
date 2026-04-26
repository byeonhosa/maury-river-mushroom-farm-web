import { getPolicyBySlug } from "@mrmf/shared";
import { notFound } from "next/navigation";
import { PageHero } from "./page-hero";

export function PolicyPage({ slug }: { slug: string }) {
  const policy = getPolicyBySlug(slug);

  if (!policy) {
    notFound();
  }

  return (
    <>
      <PageHero eyebrow="Policy" title={policy.title}>
        <p>{policy.summary}</p>
      </PageHero>
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mrmf-card border-brand-burnt p-5 text-sm leading-7">
          <p className="font-subheading text-xs font-extrabold uppercase tracking-[0.14em] text-brand-mahogany">
            Requires legal review
          </p>
          <p className="mt-2">
            This is a serious placeholder for owner and legal review before launch. It is not final legal advice
            and should not be treated as production-ready policy language.
          </p>
        </div>
        <div className="mt-8 space-y-6 leading-8">
          <p>
            The final policy should address perishable products, pickup windows, shelf-stable shipping,
            supplement labeling, refund limits, customer data, email signup consent, and payment processor use.
          </p>
          <p>
            Fresh mushrooms are perishable and local-only by default. Shelf-stable products may become
            shippable after packaging, inventory, and checkout handling are approved.
          </p>
        </div>
      </section>
    </>
  );
}
