import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CartPage from "../app/cart/page";

describe("CartPage", () => {
  it("renders line items, subtotals, and mixed-cart fulfillment restrictions", async () => {
    render(await CartPage());

    expect(screen.getByRole("heading", { name: "Fresh Lion's Mane" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Mushroom Salt" })).toBeInTheDocument();
    expect(screen.getAllByText("$26.00")[0]).toBeInTheDocument();
    expect(
      screen.getByText(
        "Mixed carts must separate local pickup or delivery items from shipped shelf-stable items before live checkout."
      )
    ).toBeInTheDocument();
  });
});
