import type { CartLineInput } from "@mrmf/shared";

export const cartShellItems: CartLineInput[] = [
  { productSlug: "fresh-lions-mane", quantity: 1 },
  { productSlug: "mushroom-salt", quantity: 1 }
];

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(amount);
}
