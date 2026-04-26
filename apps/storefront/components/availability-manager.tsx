"use client";

import { availabilityStates, type AvailabilityState } from "@mrmf/shared";
import { Save } from "lucide-react";
import { useMemo, useState } from "react";

import type { AvailabilityAdminRecord } from "../lib/dev-availability-store";

export function AvailabilityManager({
  initialRecords
}: {
  initialRecords: AvailabilityAdminRecord[];
}) {
  const [records, setRecords] = useState(initialRecords);
  const products = records.filter((record) => record.targetType === "product");
  const species = records.filter((record) => record.targetType === "species");
  const [selectedSlug, setSelectedSlug] = useState(products[0]?.slug ?? "");
  const selected = useMemo(
    () => products.find((record) => record.slug === selectedSlug) ?? products[0],
    [products, selectedSlug]
  );
  const [message, setMessage] = useState("");

  async function updateSelected(formData: FormData) {
    if (!selected) {
      return;
    }

    setMessage("Saving development override...");

    const quantityValue = String(formData.get("availableQuantity") ?? "").trim();
    const payload = {
      targetType: "product",
      targetSlug: selected.slug,
      state: formData.get("state") as AvailabilityState,
      publicVisibility: formData.get("publicVisibility"),
      cartable: formData.get("cartable") === "on",
      availableQuantity: quantityValue.length > 0 ? Number(quantityValue) : null,
      stockNote: String(formData.get("stockNote") ?? "").trim() || null,
      expectedAvailabilityDate:
        String(formData.get("expectedAvailabilityDate") ?? "").trim() || null,
      pickupAvailabilityNote:
        String(formData.get("pickupAvailabilityNote") ?? "").trim() || null,
      publicMessage: String(formData.get("publicMessage") ?? "").trim() || null,
      notifyMeEnabled: formData.get("notifyMeEnabled") === "on",
      wholesaleOnly: formData.get("wholesaleOnly") === "on",
      inquiryOnly: formData.get("inquiryOnly") === "on"
    };
    const response = await fetch("/api/internal/availability", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = (await response.json()) as {
      records?: AvailabilityAdminRecord[];
      error?: string;
    };

    if (!response.ok || !data.records) {
      setMessage(data.error ?? "Availability update failed.");
      return;
    }

    setRecords(data.records);
    setMessage("Development override saved for this running storefront process.");
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="border border-brand-mahogany/20 bg-brand-ivory p-5">
        <h2 className="font-heading text-4xl">Current products</h2>
        <div className="mt-5 space-y-3">
          {products.map((product) => (
            <button
              key={product.slug}
              type="button"
              className={`block w-full border p-4 text-left ${
                product.slug === selected?.slug
                  ? "border-brand-mahogany bg-white"
                  : "border-brand-mahogany/20 bg-brand-ivory"
              }`}
              onClick={() => setSelectedSlug(product.slug)}
            >
              <span className="block font-heading text-2xl">{product.name}</span>
              <span className="mt-2 block font-subheading text-xs font-bold uppercase tracking-[0.12em] text-brand-ebony">
                {product.state} / cartable {product.cartable ? "yes" : "no"} / {product.source}
              </span>
              {product.stockNote ? (
                <span className="mt-2 block text-xs leading-6">{product.stockNote}</span>
              ) : null}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        {selected ? (
          <form
            className="border border-brand-mahogany/20 bg-brand-ivory p-5"
            onSubmit={(event) => {
              event.preventDefault();
              void updateSelected(new FormData(event.currentTarget));
            }}
          >
            <h2 className="font-heading text-4xl">{selected.name}</h2>
            <p className="mt-2 font-subheading text-xs font-bold uppercase tracking-[0.12em] text-brand-ebony">
              Development-only availability override
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 font-subheading text-xs font-bold uppercase tracking-[0.12em]">
                State
                <select
                  key={`${selected.slug}-state-${selected.state}`}
                  name="state"
                  defaultValue={selected.state}
                  className="border border-brand-mahogany/30 bg-white px-3 py-3 font-body text-sm normal-case tracking-normal"
                >
                  {availabilityStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 font-subheading text-xs font-bold uppercase tracking-[0.12em]">
                Public visibility
                <select
                  key={`${selected.slug}-visibility-${selected.publicVisibility}`}
                  name="publicVisibility"
                  defaultValue={selected.publicVisibility ?? "shop"}
                  className="border border-brand-mahogany/30 bg-white px-3 py-3 font-body text-sm normal-case tracking-normal"
                >
                  <option value="shop">shop</option>
                  <option value="catalog">catalog</option>
                  <option value="hidden">hidden</option>
                </select>
              </label>
              <label className="grid gap-2 font-subheading text-xs font-bold uppercase tracking-[0.12em]">
                Available quantity
                <input
                  key={`${selected.slug}-quantity-${selected.availableQuantity ?? ""}`}
                  name="availableQuantity"
                  type="number"
                  min={0}
                  defaultValue={selected.availableQuantity ?? ""}
                  className="border border-brand-mahogany/30 bg-white px-3 py-3 font-body text-sm normal-case tracking-normal"
                />
              </label>
              <label className="grid gap-2 font-subheading text-xs font-bold uppercase tracking-[0.12em]">
                Expected date
                <input
                  key={`${selected.slug}-date-${selected.expectedAvailabilityDate ?? ""}`}
                  name="expectedAvailabilityDate"
                  defaultValue={selected.expectedAvailabilityDate ?? ""}
                  className="border border-brand-mahogany/30 bg-white px-3 py-3 font-body text-sm normal-case tracking-normal"
                />
              </label>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ["cartable", "Cartable", selected.cartable],
                ["notifyMeEnabled", "Notify-me later", selected.notifyMeEnabled],
                ["wholesaleOnly", "Wholesale only", selected.wholesaleOnly],
                ["inquiryOnly", "Inquiry only", selected.inquiryOnly]
              ].map(([name, label, checked]) => (
                <label key={String(name)} className="flex items-center gap-3 text-sm leading-7">
                  <input name={String(name)} type="checkbox" defaultChecked={Boolean(checked)} />
                  {label}
                </label>
              ))}
            </div>
            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 font-subheading text-xs font-bold uppercase tracking-[0.12em]">
                Public message
                <textarea
                  key={`${selected.slug}-message-${selected.publicMessage ?? ""}`}
                  name="publicMessage"
                  defaultValue={selected.publicMessage ?? ""}
                  className="min-h-20 border border-brand-mahogany/30 bg-white px-3 py-3 font-body text-sm normal-case tracking-normal"
                />
              </label>
              <label className="grid gap-2 font-subheading text-xs font-bold uppercase tracking-[0.12em]">
                Stock note
                <textarea
                  key={`${selected.slug}-stock-${selected.stockNote ?? ""}`}
                  name="stockNote"
                  defaultValue={selected.stockNote ?? ""}
                  className="min-h-20 border border-brand-mahogany/30 bg-white px-3 py-3 font-body text-sm normal-case tracking-normal"
                />
              </label>
              <label className="grid gap-2 font-subheading text-xs font-bold uppercase tracking-[0.12em]">
                Pickup or delivery note
                <textarea
                  key={`${selected.slug}-pickup-${selected.pickupAvailabilityNote ?? ""}`}
                  name="pickupAvailabilityNote"
                  defaultValue={selected.pickupAvailabilityNote ?? ""}
                  className="min-h-20 border border-brand-mahogany/30 bg-white px-3 py-3 font-body text-sm normal-case tracking-normal"
                />
              </label>
            </div>
            <button
              type="submit"
              className="mt-5 inline-flex items-center gap-2 bg-brand-mahogany px-5 py-3 font-subheading text-sm font-bold uppercase tracking-[0.1em] text-brand-ivory"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              Save development override
            </button>
            {message ? <p className="mt-3 text-sm leading-7">{message}</p> : null}
          </form>
        ) : null}

        <section className="border border-brand-mahogany/20 bg-brand-ivory p-5">
          <h2 className="font-heading text-4xl">Species master catalog</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {species.map((item) => (
              <div key={item.slug} className="border border-brand-mahogany/20 bg-white p-3">
                <p className="font-heading text-2xl">
                  {item.code} / {item.name}
                </p>
                <p className="mt-1 font-subheading text-xs font-bold uppercase tracking-[0.12em] text-brand-ebony">
                  {item.state} / {item.source}
                </p>
              </div>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
