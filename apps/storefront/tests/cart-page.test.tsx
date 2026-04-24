import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import CartPage from "../app/cart/page";
import { cartStorageKey } from "../lib/cart-storage";

afterEach(() => {
  window.localStorage.clear();
});

describe("CartPage", () => {
  it("renders line items, subtotals, and mixed-cart fulfillment restrictions", async () => {
    window.localStorage.setItem(
      cartStorageKey,
      JSON.stringify([
        { productSlug: "fresh-lions-mane", quantity: 1 },
        { productSlug: "mushroom-salt", quantity: 1 }
      ])
    );

    render(await CartPage());

    expect(
      await screen.findByRole("heading", { name: "Fresh Lion's Mane" })
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Mushroom Salt" })).toBeInTheDocument();
    expect(screen.getAllByText("$26.00")[0]).toBeInTheDocument();
    expect(
      screen.getByText(
        "Mixed carts must separate local pickup or delivery items from shipped shelf-stable items before live checkout."
      )
    ).toBeInTheDocument();
  });
});
