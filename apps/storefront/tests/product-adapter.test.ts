import { afterEach, describe, expect, it, vi } from "vitest";

import {
  fetchMedusaStoreProducts,
  getProductCatalog,
  resetProductCatalogCacheForTests
} from "../lib/products";

const originalAdapter = process.env.NEXT_PUBLIC_COMMERCE_ADAPTER;

afterEach(() => {
  process.env.NEXT_PUBLIC_COMMERCE_ADAPTER = originalAdapter;
  resetProductCatalogCacheForTests();
  vi.unstubAllGlobals();
});

describe("storefront product adapter", () => {
  it("normalizes Medusa Store API products into the storefront contract", async () => {
    const fetchImpl = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          products: [
            {
              id: "prod_fresh_lions_mane",
              handle: "fresh-lions-mane",
              title: "Fresh Lion's Mane",
              metadata: {
                fulfillment: [
                  "farm-pickup",
                  "farmers-market-pickup",
                  "local-delivery",
                  "local-preorder",
                  "shipping"
                ],
                shippable: true
              }
            }
          ]
        }),
        { status: 200 }
      );
    }) as unknown as typeof fetch;

    const products = await fetchMedusaStoreProducts({
      backendUrl: "http://medusa.test",
      fetchImpl,
      timeoutMs: 100
    });

    expect(products).toHaveLength(1);
    expect(products[0]).toMatchObject({
      source: "medusa",
      slug: "fresh-lions-mane",
      shippable: false,
      fulfillmentMode: "fresh-local"
    });
  });

  it("falls back to shared seed products when hybrid Medusa reads are unavailable", async () => {
    process.env.NEXT_PUBLIC_COMMERCE_ADAPTER = "medusa-hybrid";
    resetProductCatalogCacheForTests();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("Medusa offline");
      })
    );

    const catalog = await getProductCatalog();

    expect(catalog.source).toBe("shared-seed");
    expect(catalog.mode).toBe("medusa-hybrid");
    expect(catalog.error).toBe("Medusa offline");
    expect(catalog.products).toHaveLength(10);
  });
});
