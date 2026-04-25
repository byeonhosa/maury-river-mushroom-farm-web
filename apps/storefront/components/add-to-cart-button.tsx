"use client";

import { ShoppingBasket } from "lucide-react";
import { useState } from "react";

import { addCartItem, notifyCartUpdated } from "../lib/cart-storage";

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
  const disabled = Boolean(disabledReason);

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
