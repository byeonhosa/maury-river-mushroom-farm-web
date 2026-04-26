"use client";

import type { NotificationCta } from "@mrmf/shared";
import { Bell, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface NotificationSignupFormProps {
  cta: NotificationCta;
  compact?: boolean;
}

interface NotificationResponse {
  ok?: boolean;
  outcome?: "created" | "duplicate-updated";
  message?: string;
  error?: string;
}

export function NotificationSignupForm({
  cta,
  compact = false
}: NotificationSignupFormProps) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function submit(formData: FormData) {
    setStatus("submitting");
    setMessage("Joining the availability list...");

    const payload = {
      email: String(formData.get("email") ?? ""),
      name: String(formData.get("name") ?? "") || undefined,
      targetType: cta.targetType,
      targetSlug: cta.targetSlug,
      targetLabel: cta.targetLabel,
      notificationType: cta.notificationType,
      sourcePage: cta.sourcePage,
      availabilityState: cta.availabilityState,
      consent: formData.get("consent") === "on",
      notes: String(formData.get("notes") ?? "") || undefined,
      website: String(formData.get("website") ?? "")
    };
    const response = await fetch("/api/notifications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = (await response.json()) as NotificationResponse;

    if (!response.ok || !data.ok) {
      setStatus("error");
      setMessage(data.error ?? "Availability signup failed.");
      return;
    }

    setStatus("success");
    setMessage(data.message ?? "You're on the list.");
  }

  return (
    <form
      className={`text-brand-mahogany ${
        compact
          ? "p-0"
          : "mrmf-card p-5"
      }`}
      onSubmit={(event) => {
        event.preventDefault();
        void submit(new FormData(event.currentTarget));
      }}
    >
      <div className="flex items-start gap-3">
        {status === "success" ? (
          <CheckCircle2 className="mt-1 h-5 w-5 text-brand-mahogany" aria-hidden="true" />
        ) : (
          <Bell className="mt-1 h-5 w-5 text-brand-mahogany" aria-hidden="true" />
        )}
        <div>
          <h2 className={compact ? "font-heading text-2xl" : "font-heading text-3xl"}>
            {cta.headline}
          </h2>
          <p className="mt-2 text-sm leading-7">{cta.description}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2 font-subheading text-xs font-bold uppercase tracking-[0.12em]">
          Email
          <input
            name="email"
            type="email"
            required
            className="mrmf-input font-body text-sm normal-case tracking-normal"
          />
        </label>
        <label className="grid gap-2 font-subheading text-xs font-bold uppercase tracking-[0.12em]">
          Name
          <input
            name="name"
            className="mrmf-input font-body text-sm normal-case tracking-normal"
          />
        </label>
      </div>

      <label className="mt-3 hidden">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>

      <label className="mt-4 flex items-start gap-3 text-sm leading-7">
        <input name="consent" type="checkbox" required className="mt-1" />
        <span>
          Email me about this availability request. I understand future availability emails should
          include an unsubscribe option.
        </span>
      </label>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mrmf-button-primary mt-4"
      >
        <Bell className="h-4 w-4" aria-hidden="true" />
        {status === "submitting" ? "Joining list" : "Notify me"}
      </button>

      {message ? (
        <p
          className={`mt-3 text-sm leading-7 ${
            status === "error" ? "text-brand-burnt" : "text-brand-mahogany"
          }`}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
