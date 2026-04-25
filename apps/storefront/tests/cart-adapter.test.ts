import { medusaProductToCommerceProduct } from "@mrmf/shared";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildMedusaCartLinePayloads,
  filterSafeShippingOptions,
  selectCartShippingMethod,
  syncHybridCart
} from "../lib/cart-adapter";
import { cartStorageKey, medusaCartStorageKey } from "../lib/cart-storage";

afterEach(() => {
  window.localStorage.clear();
  vi.unstubAllGlobals();
});

const fresh = medusaProductToCommerceProduct({
  id: "prod_fresh_lions_mane",
  handle: "fresh-lions-mane",
  variants: [{ id: "variant_fresh_lions_mane" }]
});

const salt = medusaProductToCommerceProduct({
  id: "prod_mushroom_salt",
  handle: "mushroom-salt",
  variants: [{ id: "variant_mushroom_salt" }],
  metadata: {
    inventory_status: "available"
  }
});

const comingSoonSalt = medusaProductToCommerceProduct({
  id: "prod_mushroom_salt",
  handle: "mushroom-salt",
  variants: [{ id: "variant_mushroom_salt" }]
});

function jsonResponse(data: unknown) {
  return new Response(JSON.stringify(data), { status: 200 });
}

describe("Medusa cart adapter", () => {
  it("maps storefront products to Medusa variant payloads", () => {
    const payloads = buildMedusaCartLinePayloads([fresh, salt], [
      { productSlug: "fresh-lions-mane", quantity: 1 },
      { productSlug: "mushroom-salt", quantity: 2 }
    ]);

    expect(payloads).toEqual([
      {
        variant_id: "variant_fresh_lions_mane",
        quantity: 1,
        metadata: expect.objectContaining({
          mrmf_managed: true,
          mrmf_slug: "fresh-lions-mane",
          fulfillment_mode: "fresh-local",
          shippable: false
        })
      },
      {
        variant_id: "variant_mushroom_salt",
        quantity: 2,
        metadata: expect.objectContaining({
          mrmf_managed: true,
          mrmf_slug: "mushroom-salt",
          fulfillment_mode: "shelf-stable-shipping",
          shippable: true
        })
      }
    ]);
  });

  it("blocks coming-soon products from Medusa cart payloads", () => {
    expect(() =>
      buildMedusaCartLinePayloads([comingSoonSalt], [
        { productSlug: "mushroom-salt", quantity: 1 }
      ])
    ).toThrow("Mushroom Salt is coming soon");
  });

  it("creates a Medusa cart with the seeded region and local line metadata", async () => {
    window.localStorage.setItem(
      cartStorageKey,
      JSON.stringify([{ productSlug: "mushroom-salt", quantity: 2 }])
    );

    const fetchImpl = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString();

      if (url.endsWith("/store/regions")) {
        return jsonResponse({
          regions: [
            {
              id: "reg_mrmf",
              name: "Maury River Local Development Region",
              currency_code: "usd"
            }
          ]
        });
      }

      if (url.endsWith("/store/carts") && init?.method === "POST") {
        expect(JSON.parse(String(init.body))).toMatchObject({
          region_id: "reg_mrmf",
          items: [
            {
              variant_id: "variant_mushroom_salt",
              quantity: 2,
              metadata: {
                mrmf_managed: true,
                mrmf_slug: "mushroom-salt"
              }
            }
          ],
          metadata: {
            checkout_status: "staged-payment-disabled"
          }
        });

        return jsonResponse({
          cart: {
            id: "cart_123",
            region_id: "reg_mrmf",
            items: [
              {
                id: "line_salt",
                variant_id: "variant_mushroom_salt",
                quantity: 2,
                metadata: { mrmf_managed: true, mrmf_slug: "mushroom-salt" }
              }
            ]
          }
        });
      }

      if (url.includes("/store/shipping-options?cart_id=cart_123")) {
        return jsonResponse({
          shipping_options: [
            {
              id: "so_shelf",
              name: "Shelf-stable parcel shipping",
              data: { fulfillment_type: "shipping", is_parcel: true }
            }
          ]
        });
      }

      throw new Error(`Unexpected request: ${url}`);
    }) as unknown as typeof fetch;

    const result = await syncHybridCart([salt], {
      mode: "medusa-hybrid",
      backendUrl: "http://medusa.test",
      publishableKey: "pk_test",
      fetchImpl,
      storage: window.localStorage,
      timeoutMs: 100
    });

    expect(result.source).toBe("medusa");
    expect(result.medusaCartId).toBe("cart_123");
    expect(result.safeShippingOptions.map((option) => option.id)).toEqual(["so_shelf"]);
    expect(window.localStorage.getItem(medusaCartStorageKey)).toBe("cart_123");
  });

  it("updates quantities and removes stale managed Medusa lines", async () => {
    window.localStorage.setItem(medusaCartStorageKey, "cart_123");
    window.localStorage.setItem(
      cartStorageKey,
      JSON.stringify([{ productSlug: "mushroom-salt", quantity: 3 }])
    );

    const calls: string[] = [];
    const fetchImpl = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString();
      calls.push(`${init?.method ?? "GET"} ${new URL(url).pathname}`);

      if (url.endsWith("/store/carts/cart_123") && !init?.method) {
        return jsonResponse({
          cart: {
            id: "cart_123",
            items: [
              {
                id: "line_salt",
                variant_id: "variant_mushroom_salt",
                quantity: 1,
                metadata: { mrmf_managed: true, mrmf_slug: "mushroom-salt" }
              },
              {
                id: "line_old",
                variant_id: "variant_old",
                quantity: 1,
                metadata: { mrmf_managed: true, mrmf_slug: "fresh-lions-mane" }
              }
            ]
          }
        });
      }

      if (url.endsWith("/store/carts/cart_123/line-items/line_salt")) {
        expect(init?.method).toBe("POST");
        expect(JSON.parse(String(init?.body))).toMatchObject({ quantity: 3 });
        return jsonResponse({ cart: { id: "cart_123", items: [] } });
      }

      if (url.endsWith("/store/carts/cart_123/line-items/line_old")) {
        expect(init?.method).toBe("DELETE");
        return jsonResponse({ parent: { id: "cart_123", items: [] } });
      }

      if (url.includes("/store/shipping-options?cart_id=cart_123")) {
        return jsonResponse({ shipping_options: [] });
      }

      throw new Error(`Unexpected request: ${url}`);
    }) as unknown as typeof fetch;

    const result = await syncHybridCart([fresh, salt], {
      mode: "medusa-hybrid",
      backendUrl: "http://medusa.test",
      publishableKey: "pk_test",
      fetchImpl,
      storage: window.localStorage,
      timeoutMs: 100
    });

    expect(result.source).toBe("medusa");
    expect(calls).toContain("POST /store/carts/cart_123/line-items/line_salt");
    expect(calls).toContain("DELETE /store/carts/cart_123/line-items/line_old");
  });

  it("falls back to staged cart state when Medusa is unavailable in hybrid mode", async () => {
    window.localStorage.setItem(
      cartStorageKey,
      JSON.stringify([{ productSlug: "mushroom-salt", quantity: 1 }])
    );

    const result = await syncHybridCart([salt], {
      mode: "medusa-hybrid",
      backendUrl: "http://medusa.test",
      publishableKey: "",
      fetchImpl: vi.fn() as unknown as typeof fetch,
      storage: window.localStorage,
      timeoutMs: 100
    });

    expect(result.source).toBe("staged");
    expect(result.items).toEqual([{ productSlug: "mushroom-salt", quantity: 1 }]);
    expect(result.error).toContain("NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY");
  });

  it("filters parcel shipping out of fresh and mixed carts", () => {
    const shippingOptions = [
      {
        id: "so_pickup",
        name: "Farm pickup",
        data: { fulfillment_type: "farm-pickup" as const, is_parcel: false }
      },
      {
        id: "so_parcel",
        name: "Shelf-stable parcel shipping",
        data: { fulfillment_type: "shipping" as const, is_parcel: true }
      }
    ];

    expect(
      filterSafeShippingOptions(
        [fresh],
        [{ productSlug: "fresh-lions-mane", quantity: 1 }],
        shippingOptions
      ).map((option) => option.id)
    ).toEqual(["so_pickup"]);

    expect(
      filterSafeShippingOptions(
        [fresh, salt],
        [
          { productSlug: "fresh-lions-mane", quantity: 1 },
          { productSlug: "mushroom-salt", quantity: 1 }
        ],
        shippingOptions
      )
    ).toEqual([]);
  });

  it("writes a selected safe shipping method back to a Medusa cart", async () => {
    window.localStorage.setItem(
      cartStorageKey,
      JSON.stringify([{ productSlug: "mushroom-salt", quantity: 1 }])
    );
    window.localStorage.setItem(medusaCartStorageKey, "cart_123");

    const fetchImpl = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString();

      if (url.endsWith("/store/carts/cart_123") && !init?.method) {
        return jsonResponse({
          cart: {
            id: "cart_123",
            items: [
              {
                id: "line_salt",
                variant_id: "variant_mushroom_salt",
                quantity: 1,
                metadata: { mrmf_managed: true, mrmf_slug: "mushroom-salt" }
              }
            ]
          }
        });
      }

      if (url.includes("/store/shipping-options?cart_id=cart_123")) {
        return jsonResponse({
          shipping_options: [
            {
              id: "so_shelf",
              name: "Shelf-stable parcel shipping",
              data: {
                fulfillment_type: "shipping",
                is_parcel: true,
                allowed_fulfillment_modes: ["shelf-stable-shipping"]
              }
            }
          ]
        });
      }

      if (url.endsWith("/store/carts/cart_123/shipping-methods")) {
        expect(init?.method).toBe("POST");
        expect(JSON.parse(String(init?.body))).toMatchObject({
          option_id: "so_shelf",
          data: {
            fulfillment_type: "shipping",
            mrmf_selected_fulfillment_type: "shipping",
            shipping_address_note: "123 Pantry Lane"
          }
        });

        return jsonResponse({
          cart: {
            id: "cart_123",
            shipping_methods: [
              {
                id: "sm_123",
                shipping_option_id: "so_shelf"
              }
            ]
          }
        });
      }

      throw new Error(`Unexpected request: ${url}`);
    }) as unknown as typeof fetch;

    const result = await selectCartShippingMethod({
      products: [salt],
      selection: {
        type: "shipping",
        shippingOptionId: "so_shelf",
        shippingAddress: "123 Pantry Lane"
      },
      options: {
        mode: "medusa-hybrid",
        backendUrl: "http://medusa.test",
        publishableKey: "pk_test",
        fetchImpl,
        storage: window.localStorage,
        timeoutMs: 100
      }
    });

    expect(result.source).toBe("medusa");
    expect(result.medusaCartId).toBe("cart_123");
    expect(result.selection).toMatchObject({
      source: "medusa",
      shippingOptionName: "Shelf-stable parcel shipping"
    });
  });

  it("recovers from a stale Medusa cart id without losing staged lines", async () => {
    window.localStorage.setItem(
      cartStorageKey,
      JSON.stringify([{ productSlug: "mushroom-salt", quantity: 1 }])
    );
    window.localStorage.setItem(medusaCartStorageKey, "cart_stale");

    const fetchImpl = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString();

      if (url.endsWith("/store/carts/cart_stale") && !init?.method) {
        return new Response(JSON.stringify({ message: "not found" }), { status: 404 });
      }

      if (url.endsWith("/store/regions")) {
        return jsonResponse({
          regions: [
            {
              id: "reg_mrmf",
              name: "Maury River Local Development Region",
              currency_code: "usd"
            }
          ]
        });
      }

      if (url.endsWith("/store/carts") && init?.method === "POST") {
        return jsonResponse({
          cart: {
            id: "cart_recovered",
            items: [
              {
                id: "line_salt",
                variant_id: "variant_mushroom_salt",
                quantity: 1,
                metadata: { mrmf_managed: true, mrmf_slug: "mushroom-salt" }
              }
            ]
          }
        });
      }

      if (url.includes("/store/shipping-options?cart_id=cart_recovered")) {
        return jsonResponse({ shipping_options: [] });
      }

      throw new Error(`Unexpected request: ${url}`);
    }) as unknown as typeof fetch;

    const result = await syncHybridCart([salt], {
      mode: "medusa-hybrid",
      backendUrl: "http://medusa.test",
      publishableKey: "pk_test",
      fetchImpl,
      storage: window.localStorage,
      timeoutMs: 100
    });

    expect(result.source).toBe("medusa");
    expect(result.medusaCartId).toBe("cart_recovered");
    expect(result.recoveredFromCartId).toBe("cart_stale");
    expect(result.items).toEqual([{ productSlug: "mushroom-salt", quantity: 1 }]);
    expect(window.localStorage.getItem(medusaCartStorageKey)).toBe("cart_recovered");
  });
});
