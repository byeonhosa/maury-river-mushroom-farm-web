import Image from "next/image";
import { WholesaleInquiryForm } from "../../components/forms";
import { PageHero } from "../../components/page-hero";

export default function RestaurantsWholesalePage() {
  return (
    <>
      <PageHero
        eyebrow="For restaurants / wholesale"
        title="Fresh mushrooms for chefs and weekly menus."
      >
        <p>
          The wholesale flow is built around conversation: what is fruiting,
          what volume is realistic, and how the farm can support specials,
          tasting menus, and recurring orders.
        </p>
      </PageHero>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="space-y-5">
          {[
            [
              "Weekly availability",
              "Share what is harvest-ready before menu planning locks in.",
            ],
            [
              "Chef's mix",
              "Offer variety boxes that let kitchens work with the best of the current crop.",
            ],
            [
              "Clear handling",
              "Send storage and shelf-life notes so restaurants can protect quality.",
            ],
            [
              "Future production layer",
              "The site can eventually expose customer-facing availability from internal grow tracking.",
            ],
          ].map(([title, body]) => (
            <div
              key={title}
              className="border border-brand-mahogany/20 bg-brand-ivory p-5"
            >
              <h2 className="font-heading text-3xl">{title}</h2>
              <p className="mt-2 text-sm leading-7">{body}</p>
            </div>
          ))}
        </div>
        <div className="border border-brand-mahogany/20 bg-brand-ivory p-6 shadow-soft">
          <div className="relative mb-6 h-64 overflow-hidden bg-brand-ebony">
            <Image
              src="/images/products/mixed-gourmet-mushrooms-01.webp"
              alt="Assorted gourmet mushrooms suited for chef menu planning"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 45vw, 100vw"
            />
          </div>
          <h2 className="font-heading text-4xl">Wholesale inquiry</h2>
          <p className="mt-3 text-sm leading-7">
            Server-side validation is active; final email/CRM integration is
            intentionally deferred.
          </p>
          <div className="mt-6">
            <WholesaleInquiryForm />
          </div>
        </div>
      </section>
    </>
  );
}
