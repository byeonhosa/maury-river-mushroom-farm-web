import Image from "next/image";
import { PageHero } from "../../components/page-hero";

export default function OurFarmPage() {
  return (
    <>
      <PageHero eyebrow="Our Farm" title="A farm story built around freshness, clarity, and trust.">
        <p>
          This page will grow with owner-provided story, photography, growing practices, market details,
          and the production-tracking connection planned for a later phase.
        </p>
      </PageHero>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <div className="space-y-6 text-base leading-8">
          <p>
            The rebuild positions The Maury River Mushroom Farm as a premium local-food producer and
            a practical educator. Customers should understand what is fresh, how to cook it, how to store it,
            and how to buy it without confusion.
          </p>
          <p>
            The website is also being structured for the future: restaurant leads, recurring boxes,
            shelf-stable ecommerce, and a possible customer-facing view into production availability.
          </p>
        </div>
        <div className="relative min-h-[320px] overflow-hidden bg-brand-ebony p-8 text-brand-ivory">
          <Image src="/brand/MRMF_Pattern_Ivory_png.png" alt="" fill className="object-cover opacity-20" />
          <div className="relative">
            <p className="font-heading text-4xl leading-tight">Farm photography belongs here next.</p>
            <p className="mt-4 text-sm leading-7">
              The repo includes `assets/farm-photos` for future original photography.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
