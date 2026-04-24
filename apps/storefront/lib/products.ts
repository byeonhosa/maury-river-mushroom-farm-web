import {
  getCommerceProductBySlug,
  listCommerceProducts,
  listCommerceProductsByCategory,
  productCategories,
  type ProductCategory
} from "@mrmf/shared";

export const commerceAdapter = {
  source: process.env.NEXT_PUBLIC_COMMERCE_ADAPTER ?? "shared-seed",
  medusaBackendUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"
};

export function listProducts() {
  return listCommerceProducts();
}

export function listProductsByCategory(category: ProductCategory) {
  return listCommerceProductsByCategory(category);
}

export function getProduct(slug: string) {
  return getCommerceProductBySlug(slug);
}

export function listCategorySummaries() {
  return productCategories;
}
