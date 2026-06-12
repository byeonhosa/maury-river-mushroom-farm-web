"use client";

import { ShoppingBasket } from "lucide-react";
import { useState } from "react";

import { addCartItem, notifyCartUpdated } from "../lib/cart-storage";
import { informationalModeEnabled } from "../lib/site-mode";

export function AddToCartButton({
  productSlug,
  productName,
  disabledReason,
  className = ""
}: {
  productSlug: string;
  productName: string;
  disabledReason?: string;
  className?: string;
}) {
  const [label, setLabel] = useState("Add to cart");
  // Defense in depth: server components already omit this button in
  // informational mode, but never allow an add even if one is rendered.
  const informational = informationalModeEnabled();
  const disabled = informational || Boolean(disabledReason);

  return (
    <button
      type="button"
      className={className}
      aria-label={`Add ${productName} to cart`}
      disabled={disabled}
      title={disabledReason}
      onClick={() => {
        if (disabled) {
          return;
        }

        addCartItem(productSlug);
        notifyCartUpdated();
        setLabel("Added");
        window.setTimeout(() => setLabel("Add to cart"), 1400);
      }}
    >
      <ShoppingBasket className="h-4 w-4" aria-hidden="true" />
      {disabled ? "Unavailable" : label}
    </button>
  );
}
