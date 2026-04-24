import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CategoryCardGrid } from "../components/category-card-grid";

describe("CategoryCardGrid", () => {
  it("renders the product categories customers need to scan", () => {
    render(<CategoryCardGrid />);

    expect(screen.getByTestId("category-grid")).toBeInTheDocument();
    const links = screen.getAllByRole("link");

    expect(links.find((link) => link.getAttribute("href") === "/fresh-mushrooms")).toHaveTextContent(
      "Fresh Mushrooms"
    );
    expect(
      links.find((link) => link.getAttribute("href") === "/mushroom-salts-seasonings")
    ).toHaveTextContent("Mushroom Salts & Seasonings");
    expect(
      links.find((link) => link.getAttribute("href") === "/restaurants-wholesale")
    ).toHaveTextContent("Restaurant & Wholesale");
  });
});
