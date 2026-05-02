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
          tasting menus, zero-proof pairings, and recurring orders.
        </p>
      </PageHero>
      <section className="mrmf-shell grid gap-8 py-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5">
          {[
            [
              "Weekly availability",
              "Share what is harvest-ready, what is nearly ready, and what should stay off the menu this week.",
            ],
            [
              "Chef's mix",
              "Offer variety boxes that let kitchens work with the best of the current crop without promising unavailable species.",
            ],
            [
              "Clear handling",
              "Send storage, shelf-life, and pickup or delivery notes so restaurants can protect quality.",
            ],
            [
              "Future production layer",
              "The site can eventually expose customer-facing availability from internal grow tracking after the bridge is ready.",
            ],
          ].map(([title, body]) => (
            <div
              key={title}
              className="mrmf-card p-5"
            >
              <h2 className="font-heading text-3xl">{title}</h2>
              <p className="mt-2 text-sm leading-7">{body}</p>
            </div>
          ))}
        </div>
        <div className="mrmf-card p-6">
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
            Tell the farm what your kitchen needs, how much volume is realistic, and when you
            need it. Server-side validation is active; final email/CRM integration is intentionally deferred.
          </p>
          <div className="mt-6">
            <WholesaleInquiryForm />
          </div>
        </div>
      </section>
    </>
  );
}
