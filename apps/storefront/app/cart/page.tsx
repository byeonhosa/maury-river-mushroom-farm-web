import { CartClient } from "../../components/cart-client";
import { PageHero } from "../../components/page-hero";
import { listProducts } from "../../lib/products";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const products = await listProducts();

  return (
    <>
      <PageHero eyebrow="Cart" title="Review mushrooms by fulfillment path.">
        <p>
          The cart prices each line, keeps product fulfillment metadata attached, and warns when
          fresh local-only items need pickup, delivery, preorder, or a split order.
        </p>
      </PageHero>
      <CartClient products={products} />
    </>
  );
}
