import { afterEach, describe, expect, it, vi } from "vitest";

import {
  fetchMedusaStoreProducts,
  getProductCatalog,
  resetProductCatalogCacheForTests
} from "../lib/products";

const originalAdapter = process.env.NEXT_PUBLIC_COMMERCE_ADAPTER;
const originalServerBackendUrl = process.env.MEDUSA_STORE_API_URL;
const originalPublicBackendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL;
const originalPublishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;
const originalTimeout = process.env.MEDUSA_STORE_API_TIMEOUT_MS;

function restoreEnv(name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}

afterEach(() => {
  restoreEnv("NEXT_PUBLIC_COMMERCE_ADAPTER", originalAdapter);
  restoreEnv("MEDUSA_STORE_API_URL", originalServerBackendUrl);
  restoreEnv("NEXT_PUBLIC_MEDUSA_BACKEND_URL", originalPublicBackendUrl);
  restoreEnv("NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY", originalPublishableKey);
  restoreEnv("MEDUSA_STORE_API_TIMEOUT_MS", originalTimeout);
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
              variants: [{ id: "variant_fresh_lions_mane" }],
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
      variantId: "variant_fresh_lions_mane",
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

  it("prefers a server-only Store API URL for Docker builds", async () => {
    process.env.NEXT_PUBLIC_COMMERCE_ADAPTER = "medusa";
    process.env.MEDUSA_STORE_API_URL = "http://backend:9000";
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL = "http://167.99.59.42";
    resetProductCatalogCacheForTests();

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      expect(String(input)).toContain("http://backend:9000/store/products");

      return new Response(JSON.stringify({ products: [] }), { status: 200 });
    });

    vi.stubGlobal("fetch", fetchMock);

    const catalog = await getProductCatalog();

    expect(catalog.source).toBe("medusa");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does not permanently cache a transient shared-seed fallback", async () => {
    process.env.NEXT_PUBLIC_COMMERCE_ADAPTER = "medusa-hybrid";
    process.env.MEDUSA_STORE_API_URL = "http://backend:9000";
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY = "pk_test_storefront";
    resetProductCatalogCacheForTests();

    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error("Medusa warming up"))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            products: [
              {
                id: "prod_fresh_lions_mane",
                handle: "fresh-lions-mane",
                title: "Fresh Lion's Mane",
                variants: [{ id: "variant_fresh_lions_mane" }]
              }
            ]
          }),
          { status: 200 }
        )
      );

    vi.stubGlobal("fetch", fetchMock);

    const fallbackCatalog = await getProductCatalog();

    expect(fallbackCatalog.source).toBe("shared-seed");
    expect(fallbackCatalog.products[0]?.variantId).toBeUndefined();

    const recoveredCatalog = await getProductCatalog();

    expect(recoveredCatalog.source).toBe("medusa");
    expect(recoveredCatalog.products.find((product) => product.slug === "fresh-lions-mane"))
      .toMatchObject({
        source: "medusa",
        variantId: "variant_fresh_lions_mane"
      });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
