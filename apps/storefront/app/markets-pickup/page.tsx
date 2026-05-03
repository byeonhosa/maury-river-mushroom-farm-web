import { getWeeklyAvailabilityNotificationCta, pickupLocations } from "@mrmf/shared";
import Image from "next/image";
import { AvailabilityInquiryForm } from "../../components/forms";
import { NotificationSignupForm } from "../../components/notification-signup-form";
import { PageHero } from "../../components/page-hero";

export default function MarketsPickupPage() {
  return (
    <>
      <PageHero
        eyebrow="Markets & pickup"
        title="Fresh harvest pickup should feel predictable."
      >
        <p>
          Fresh mushrooms should reach customers quickly, cold, and with clear expectations.
          Pickup windows, market dates, and delivery routes will be finalized before launch,
          while shelf-stable shipping remains separate.
        </p>
      </PageHero>
      <section className="mrmf-shell grid gap-8 py-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5">
          {pickupLocations.map((location) => (
            <div
              key={location.slug}
              className="mrmf-card p-5"
            >
              <h2 className="font-heading text-3xl">{location.name}</h2>
              <p className="mt-2 text-sm leading-7">{location.description}</p>
              <p className="mt-3 font-subheading text-xs font-extrabold uppercase tracking-[0.14em] text-brand-mahogany">
                {location.windows[0]?.label}: {location.windows[0]?.weekday},{" "}
                {location.windows[0]?.startTime}-{location.windows[0]?.endTime}
              </p>
              <p className="mt-2 text-xs leading-6">{location.addressNote}</p>
            </div>
          ))}
          <div className="mrmf-card p-5">
            <h2 className="font-heading text-3xl">Shelf-stable shipping</h2>
            <p className="mt-2 text-sm leading-7">
              Dried, seasoning, and approved supplement products can use shipping once
              packaging, policies, and inventory are ready. Fresh mushrooms remain local-only.
            </p>
          </div>
        </div>
        <div className="mrmf-card p-6">
          <div className="relative mb-6 h-64 overflow-hidden bg-brand-ebony">
            <Image
              src="/images/products/lions-mane-mushrooms-01.webp"
              alt="Market-ready lion's mane mushrooms packed in berry baskets"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 45vw, 100vw"
            />
          </div>
          <h2 className="font-heading text-4xl">Ask about availability</h2>
          <p className="mt-3 text-sm leading-7">
            Ask about the next harvest, pickup timing, local delivery, or a product that is
            coming soon. The form validates on the server and can later connect to email or CRM routing.
          </p>
          <div className="mt-6">
            <AvailabilityInquiryForm />
          </div>
          <div className="mt-6">
            <NotificationSignupForm
              cta={getWeeklyAvailabilityNotificationCta("/markets-pickup")}
              compact
            />
          </div>
        </div>
      </section>
    </>
  );
}
