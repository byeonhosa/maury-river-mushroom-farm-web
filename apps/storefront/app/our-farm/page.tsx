import Image from "next/image";
import { PageHero } from "../../components/page-hero";

export default function OurFarmPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Farm"
        title="A farm story built around freshness, clarity, and trust."
      >
        <p>
          The farm story should help customers trust what they are buying: small-batch harvests,
          clear handling, practical cooking education, and honest availability.
        </p>
      </PageHero>
      <section className="mrmf-shell grid gap-8 py-12 lg:grid-cols-[1fr_0.9fr]">
        <div className="mrmf-card space-y-6 p-6 text-base leading-8">
          <p>
            The rebuild positions The Maury River Mushroom Farm as a premium
            local-food producer and a practical educator. Customers should
            understand what is fresh, how to cook it, how to store it, and how
            to buy it without confusion.
          </p>
          <p>
            The website is also being structured for the future: restaurant
            leads, recurring boxes, shelf-stable ecommerce, and a possible
            customer-facing view into production availability.
          </p>
          <p>
            Before launch, this page still needs final owner story, farm photos,
            growing-practice notes, market details, and any claims reviewed for accuracy.
          </p>
        </div>
        <div className="relative min-h-[360px] overflow-hidden bg-brand-ebony p-8 text-brand-ivory shadow-card">
          <Image
            src="/images/farm/young-lions-mane-growing-blocks-01.webp"
            alt="Young lion's mane mushrooms growing from a cultivation block"
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 40vw, 100vw"
          />
          <div className="absolute inset-0 bg-brand-ebony/55" />
          <div className="relative">
            <p className="font-heading text-4xl leading-tight">
              Small-batch mushrooms with launch-ready story space.
            </p>
            <p className="mt-4 text-sm leading-7">
              The first real asset pass now includes grow-block photography.
              Final owner story, facilities notes, and captions should be
              reviewed before launch.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
