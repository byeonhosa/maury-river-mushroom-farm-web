import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { NotificationSignupForm } from "../components/notification-signup-form";

const cta = {
  targetType: "product" as const,
  targetSlug: "mushroom-salt",
  targetLabel: "Mushroom Salt",
  notificationType: "coming-soon-update" as const,
  availabilityState: "coming-soon" as const,
  headline: "Tell me when Mushroom Salt launches",
  description: "Get a careful launch update once packaging and stock details are confirmed.",
  sourcePage: "/shop/mushroom-salt"
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("NotificationSignupForm", () => {
  it("posts a consent-based availability notification signup", async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      expect(JSON.parse(String(init?.body))).toMatchObject({
        email: "customer@example.com",
        targetType: "product",
        targetSlug: "mushroom-salt",
        notificationType: "coming-soon-update",
        consent: true
      });

      return new Response(
        JSON.stringify({
          ok: true,
          outcome: "created",
          message: "You're on the list."
        }),
        { status: 200 }
      );
    }) as unknown as typeof fetch;

    vi.stubGlobal("fetch", fetchMock);
    render(<NotificationSignupForm cta={cta} />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "customer@example.com" }
    });
    fireEvent.click(screen.getByLabelText(/Email me about this availability request/));
    fireEvent.click(screen.getByRole("button", { name: /notify me/i }));

    await waitFor(() => {
      expect(screen.getByText("You're on the list.")).toBeInTheDocument();
    });
  });
});
