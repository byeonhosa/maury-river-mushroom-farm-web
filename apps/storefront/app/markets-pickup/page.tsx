import { AvailabilityInquiryForm } from "../../components/forms";
import { PageHero } from "../../components/page-hero";

export default function MarketsPickupPage() {
  return (
    <>
      <PageHero eyebrow="Markets & pickup" title="Fresh harvest pickup should feel predictable.">
        <p>
          Pickup windows, market dates, and delivery routes will be finalized before launch. The scaffold
          already distinguishes local fresh fulfillment from shelf-stable shipping.
        </p>
      </PageHero>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="space-y-5">
          {[
            ["Farm pickup", "Customers reserve or purchase during announced windows and receive clear pickup timing."],
            ["Farmers-market pickup", "Market pickup can be tied to scheduled market days and preorder cutoffs."],
            ["Local delivery", "Delivery should be route-based and capacity-aware, not an open-ended promise."],
            ["Shelf-stable shipping", "Dried, seasoning, and supplement products can use shipping once packaging and policies are ready."]
          ].map(([title, body]) => (
            <div key={title} className="border border-brand-mahogany/20 bg-brand-ivory p-5">
              <h2 className="font-heading text-3xl">{title}</h2>
              <p className="mt-2 text-sm leading-7">{body}</p>
            </div>
          ))}
        </div>
        <div className="border border-brand-mahogany/20 bg-brand-ivory p-6 shadow-soft">
          <h2 className="font-heading text-4xl">Ask about availability</h2>
          <p className="mt-3 text-sm leading-7">
            This form validates on the server and can later connect to email or CRM routing.
          </p>
          <div className="mt-6">
            <AvailabilityInquiryForm />
          </div>
        </div>
      </section>
    </>
  );
}
