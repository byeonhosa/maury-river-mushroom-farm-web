import { MapPin } from "lucide-react";

export function LocalFulfillmentCallout() {
  return (
    <aside className="mrmf-card border-l-4 border-l-brand-burnt p-5">
      <div className="flex gap-3">
        <MapPin className="mt-1 h-5 w-5 flex-none text-brand-mahogany" aria-hidden="true" />
        <div>
          <p className="font-subheading text-sm font-extrabold uppercase tracking-[0.12em] text-brand-mahogany">
            Fresh mushrooms are local-only
          </p>
          <p className="mt-2 text-sm leading-7">
            Fresh harvest items are not shippable by default. They are built for farm pickup,
            farmers-market pickup, local delivery, or preorder coordination.
          </p>
        </div>
      </div>
    </aside>
  );
}
