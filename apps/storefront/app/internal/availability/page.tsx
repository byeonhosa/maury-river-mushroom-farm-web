import { notFound } from "next/navigation";
import Link from "next/link";

import { AvailabilityManager } from "../../../components/availability-manager";
import {
  isDevAvailabilityAdminEnabled,
  listDevAvailabilityRecords
} from "../../../lib/dev-availability-store";

export const dynamic = "force-dynamic";

export default function InternalAvailabilityPage() {
  if (!isDevAvailabilityAdminEnabled()) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="font-subheading text-xs font-extrabold uppercase tracking-[0.16em] text-brand-ebony">
        Internal development admin
      </p>
      <h1 className="mt-3 font-heading text-5xl leading-tight">
        Availability manager foundation
      </h1>
      <p className="mt-4 max-w-3xl text-sm leading-7">
        This development-only route lists seeded products and species, then lets the running
        storefront process preview availability overrides. It is disabled in production and is a
        scaffold for a future authenticated Medusa Admin workflow.
      </p>
      <Link href="/internal/notifications" className="mt-4 inline-block underline">
        View availability notification requests
      </Link>
      <div className="mt-8">
        <AvailabilityManager initialRecords={listDevAvailabilityRecords()} />
      </div>
    </section>
  );
}
