import type { CommerceProduct } from "@mrmf/shared";
import { ProductCard } from "./product-card";

export function ProductGrid({ products }: { products: CommerceProduct[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  );
}
