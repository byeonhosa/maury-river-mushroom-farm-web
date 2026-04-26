"use client";

import {
  getCartSupportedFulfillmentTypes,
  getPickupWindowsForLocation,
  canAddCommerceProductToCart,
  getCommerceProductAvailability,
  getProductNotificationCta,
  pickupLocations,
  requiresPickupDetails,
  summarizeCommerceCart,
  validateCheckout,
  type CartLineInput,
  type CommerceProduct,
  type FulfillmentType
} from "@mrmf/shared";
import { AlertTriangle, CreditCard, MapPin, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { readCartFulfillmentSelection, readCartItems } from "../lib/cart-storage";
import {
  resolveCartLines,
  selectCartShippingMethod,
  syncHybridCart,
  type MedusaShippingOptionLike,
  type CartBridgeResult
} from "../lib/cart-adapter";
import { formatCurrency } from "../lib/format";
import { NotificationSignupForm } from "./notification-signup-form";

const fulfillmentLabels: Record<FulfillmentType, string> = {
  "farm-pickup": "Farm pickup",
  "farmers-market-pickup": "Farmers-market pickup",
  "local-delivery": "Local delivery",
  "local-preorder": "Preorder coordination",
  shipping: "Parcel shipping",
  "restaurant-delivery": "Restaurant delivery"
};

const fulfillmentHelp: Record<FulfillmentType, string> = {
  "farm-pickup": "Reserve fresh harvest items for a farm pickup window.",
  "farmers-market-pickup": "Reserve items for a scheduled market pickup.",
  "local-delivery": "Request local delivery after route and address confirmation.",
  "local-preorder": "Coordinate harvest timing before a final pickup or delivery window.",
  shipping: "Ship eligible shelf-stable products only.",
  "restaurant-delivery": "Coordinate chef and wholesale delivery after quote review."
};

interface CheckoutMethodOption {
  id: string;
  label: string;
  description: string;
  fulfillmentType: FulfillmentType;
  shippingOptionId?: string;
  amount?: number | null;
  medusaOption?: MedusaShippingOptionLike;
}

function fallbackMethodOptions(supportedFulfillmentTypes: FulfillmentType[]): CheckoutMethodOption[] {
  return supportedFulfillmentTypes.reduce<CheckoutMethodOption[]>((options, fulfillmentType) => {
    if (fulfillmentType === "farm-pickup" || fulfillmentType === "farmers-market-pickup") {
      options.push(
        ...pickupLocations
        .filter((location) => location.fulfillmentType === fulfillmentType)
        .map((location) => ({
          id: location.slug,
          label: location.name,
          description: `${location.description} ${location.addressNote}`,
          fulfillmentType
        }))
      );

      return options;
    }

    options.push({
      id: fulfillmentType,
      label: fulfillmentLabels[fulfillmentType],
      description: fulfillmentHelp[fulfillmentType],
      fulfillmentType
    });

    return options;
  }, []);
}

function medusaMethodOptions(
  shippingOptions: MedusaShippingOptionLike[] = []
): CheckoutMethodOption[] {
  return shippingOptions.flatMap((option) => {
    const fulfillmentType = option.data?.fulfillment_type;

    if (!fulfillmentType) {
      return [];
    }

    return [
      {
        id: option.id,
        label: option.name,
        description:
          typeof option.data?.description === "string"
            ? option.data.description
            : fulfillmentHelp[fulfillmentType],
        fulfillmentType,
        shippingOptionId: option.id,
        amount: option.amount,
        medusaOption: option
      }
    ];
  });
}

export function CheckoutClient({ products }: { products: CommerceProduct[] }) {
  const [items, setItems] = useState<CartLineInput[]>([]);
  const [bridge, setBridge] = useState<CartBridgeResult>();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isWritingShippingMethod, setIsWritingShippingMethod] = useState(false);
  const [shippingMethodMessage, setShippingMethodMessage] = useState("");
  const [selectedMethodId, setSelectedMethodId] = useState("");
  const [contact, setContact] = useState({
    name: "",
    email: "",
    phone: "",
    notes: ""
  });
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType | undefined>();
  const [pickupLocationSlug, setPickupLocationSlug] = useState("");
  const [pickupWindowLabel, setPickupWindowLabel] = useState("");
  const [localDeliveryNotes, setLocalDeliveryNotes] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [preorderNotes, setPreorderNotes] = useState("");
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    const syncCart = async () => {
      setIsSyncing(true);
      const localItems = readCartItems();

      setItems(localItems);

      try {
        const result = await syncHybridCart(products);

        if (mounted) {
          setBridge(result);
          setItems(result.items);
          const storedSelection = result.selectedFulfillment ?? readCartFulfillmentSelection();

          if (storedSelection) {
            setFulfillmentType(storedSelection.type);
            setSelectedMethodId(storedSelection.shippingOptionId ?? storedSelection.pickupLocationSlug ?? storedSelection.type ?? "");
            setPickupLocationSlug(storedSelection.pickupLocationSlug ?? "");
            setPickupWindowLabel(storedSelection.pickupWindowLabel ?? "");
            setLocalDeliveryNotes(storedSelection.localDeliveryNotes ?? "");
            setShippingAddress(storedSelection.shippingAddress ?? "");
            setPreorderNotes(storedSelection.preorderNotes ?? "");
          }
        }
      } finally {
        if (mounted) {
          setIsSyncing(false);
        }
      }
    };

    void syncCart();
    window.addEventListener("storage", syncCart);
    window.addEventListener("mrmf-cart-updated", syncCart);

    return () => {
      mounted = false;
      window.removeEventListener("storage", syncCart);
      window.removeEventListener("mrmf-cart-updated", syncCart);
    };
  }, [products]);

  const cartLines = useMemo(() => resolveCartLines(products, items), [items, products]);
  const cart = useMemo(() => summarizeCommerceCart(cartLines), [cartLines]);
  const supportedFulfillmentTypes = useMemo(
    () => getCartSupportedFulfillmentTypes(cart),
    [cart]
  );
  const methodOptions = useMemo(() => {
    const medusaOptions = medusaMethodOptions(bridge?.safeShippingOptions);

    return medusaOptions.length > 0 ? medusaOptions : fallbackMethodOptions(supportedFulfillmentTypes);
  }, [bridge?.safeShippingOptions, supportedFulfillmentTypes]);

  useEffect(() => {
    if (methodOptions.length === 0) {
      setFulfillmentType(undefined);
      setSelectedMethodId("");
      return;
    }

    const selected = methodOptions.find((option) => option.id === selectedMethodId);
    const nextOption = selected ?? methodOptions[0];

    if (!selected || fulfillmentType !== nextOption.fulfillmentType) {
      setSelectedMethodId(nextOption.id);
      setFulfillmentType(nextOption.fulfillmentType);

      const pickupSlug =
        typeof nextOption.medusaOption?.data?.mrmf_seed_key === "string"
          ? nextOption.medusaOption.data.mrmf_seed_key
          : nextOption.id;
      const pickupLocation = pickupLocations.find((location) => location.slug === pickupSlug);

      if (pickupLocation) {
        setPickupLocationSlug(pickupLocation.slug);
        setPickupWindowLabel(pickupLocation.windows[0]?.label ?? "");
      }
    }
  }, [fulfillmentType, methodOptions, selectedMethodId]);

  useEffect(() => {
    if (!requiresPickupDetails(fulfillmentType)) {
      setPickupLocationSlug("");
      setPickupWindowLabel("");
      return;
    }

    const firstLocation = pickupLocations.find(
      (location) => location.fulfillmentType === fulfillmentType
    );

    if (firstLocation && !pickupLocationSlug) {
      setPickupLocationSlug(firstLocation.slug);
      setPickupWindowLabel(firstLocation.windows[0]?.label ?? "");
    }
  }, [fulfillmentType, pickupLocationSlug]);

  const validation = validateCheckout({
    cart,
    contact,
    fulfillment: {
      type: fulfillmentType,
      pickupLocationSlug,
      pickupWindowLabel,
      localDeliveryNotes,
      shippingAddress,
      preorderNotes
    },
    policyAccepted
  });

  const pickupWindows = pickupLocationSlug
    ? getPickupWindowsForLocation(pickupLocationSlug)
    : [];
  const selectedMethod = methodOptions.find((option) => option.id === selectedMethodId);

  useEffect(() => {
    let cancelled = false;

    if (!selectedMethod || !fulfillmentType) {
      setShippingMethodMessage("");
      return;
    }

    setIsWritingShippingMethod(true);

    void selectCartShippingMethod({
      products,
      selection: {
        type: fulfillmentType,
        shippingOptionId: selectedMethod.shippingOptionId,
        shippingOptionName: selectedMethod.label,
        pickupLocationSlug,
        pickupWindowLabel,
        localDeliveryNotes,
        shippingAddress,
        preorderNotes
      }
    })
      .then((result) => {
        if (cancelled) {
          return;
        }

        setShippingMethodMessage(
          result.source === "medusa"
            ? "Fulfillment method saved to the Medusa cart. Checkout is still staged."
            : result.error ?? "Fulfillment method is staged locally until Medusa is available."
        );
        setBridge((current) =>
          result.medusaCart
            ? {
                ...(current ?? {
                  mode: "medusa-hybrid" as const,
                  source: "medusa" as const,
                  items,
                  safeShippingOptions: []
                }),
                source: result.source,
                medusaCartId: result.medusaCartId,
                medusaCart: result.medusaCart
              }
            : current
        );
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setShippingMethodMessage(
            error instanceof Error
              ? error.message
              : "Fulfillment method could not be saved to the Medusa cart."
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsWritingShippingMethod(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    fulfillmentType,
    items,
    localDeliveryNotes,
    pickupLocationSlug,
    pickupWindowLabel,
    preorderNotes,
    products,
    selectedMethod,
    shippingAddress
  ]);

  return (
    <section className="mrmf-shell grid gap-8 py-12 lg:grid-cols-[1.1fr_0.9fr]">
      <form
        className="space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitMessage(
            validation.canProceed
              ? "Checkout is staged and ready for the next backend handoff. Live payment remains disabled."
              : "Resolve the checkout items marked below before this can become a live order."
          );
        }}
      >
        <div className="mrmf-card p-6">
          <h2 className="font-heading text-4xl">Customer information</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 font-subheading text-xs font-bold uppercase tracking-[0.12em]">
              Name
              <input
                className="mrmf-input font-body text-sm normal-case tracking-normal"
                value={contact.name}
                onChange={(event) => setContact({ ...contact, name: event.currentTarget.value })}
              />
            </label>
            <label className="grid gap-2 font-subheading text-xs font-bold uppercase tracking-[0.12em]">
              Email
              <input
                className="mrmf-input font-body text-sm normal-case tracking-normal"
                type="email"
                value={contact.email}
                onChange={(event) => setContact({ ...contact, email: event.currentTarget.value })}
              />
            </label>
            <label className="grid gap-2 font-subheading text-xs font-bold uppercase tracking-[0.12em]">
              Phone
              <input
                className="mrmf-input font-body text-sm normal-case tracking-normal"
                value={contact.phone}
                onChange={(event) => setContact({ ...contact, phone: event.currentTarget.value })}
              />
            </label>
            <label className="grid gap-2 font-subheading text-xs font-bold uppercase tracking-[0.12em] sm:col-span-2">
              Notes
              <textarea
                className="mrmf-input min-h-24 font-body text-sm normal-case tracking-normal"
                value={contact.notes}
                onChange={(event) => setContact({ ...contact, notes: event.currentTarget.value })}
              />
            </label>
          </div>
        </div>

        <div className="mrmf-card p-6">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-brand-mahogany" aria-hidden="true" />
            <h2 className="font-heading text-4xl">Fulfillment selection</h2>
          </div>
          {methodOptions.length > 0 ? (
            <div className="mt-5 grid gap-4">
              {methodOptions.map((option) => (
                <label
                  key={option.id}
                  className="block border border-brand-mahogany/20 bg-white p-4 transition hover:border-brand-mahogany"
                >
                  <span className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="fulfillment-method"
                      className="mt-1"
                      checked={selectedMethodId === option.id}
                      onChange={() => {
                        setSelectedMethodId(option.id);
                        setFulfillmentType(option.fulfillmentType);

                        const pickupSlug =
                          typeof option.medusaOption?.data?.mrmf_seed_key === "string"
                            ? option.medusaOption.data.mrmf_seed_key
                            : option.id;
                        const pickupLocation = pickupLocations.find(
                          (location) => location.slug === pickupSlug
                        );

                        if (pickupLocation) {
                          setPickupLocationSlug(pickupLocation.slug);
                          setPickupWindowLabel(pickupLocation.windows[0]?.label ?? "");
                        }
                      }}
                    />
                    <span>
                      <span className="block font-heading text-2xl">{option.label}</span>
                      <span className="mt-1 block text-sm leading-7">{option.description}</span>
                      {option.amount && option.amount > 0 ? (
                        <span className="mt-1 block font-subheading text-xs font-bold uppercase tracking-[0.12em] text-brand-mahogany">
                          {formatCurrency(option.amount)}
                        </span>
                      ) : null}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <p className="mt-5 border border-brand-burnt bg-white p-4 text-sm leading-7">
              This cart does not have a safe fulfillment method yet. Remove unavailable items or
              split local fresh products from shippable shelf-stable products.
            </p>
          )}

          {shippingMethodMessage ? (
            <p className="mt-4 text-sm leading-7">
              {isWritingShippingMethod ? "Saving fulfillment method... " : ""}
              {shippingMethodMessage}
            </p>
          ) : null}

          {requiresPickupDetails(fulfillmentType) ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 font-subheading text-xs font-bold uppercase tracking-[0.12em]">
                Pickup location
                <select
                  className="mrmf-input font-body text-sm normal-case tracking-normal"
                  value={pickupLocationSlug}
                  onChange={(event) => {
                    const nextLocation = pickupLocations.find(
                      (location) => location.slug === event.currentTarget.value
                    );

                    setPickupLocationSlug(event.currentTarget.value);
                    setPickupWindowLabel(nextLocation?.windows[0]?.label ?? "");
                  }}
                >
                  {pickupLocations
                    .filter((location) => location.fulfillmentType === fulfillmentType)
                    .map((location) => (
                      <option key={location.slug} value={location.slug}>
                        {location.name}
                      </option>
                    ))}
                </select>
              </label>
              <label className="grid gap-2 font-subheading text-xs font-bold uppercase tracking-[0.12em]">
                Pickup window
                <select
                  className="mrmf-input font-body text-sm normal-case tracking-normal"
                  value={pickupWindowLabel}
                  onChange={(event) => setPickupWindowLabel(event.currentTarget.value)}
                >
                  {pickupWindows.map((window) => (
                    <option key={window.label} value={window.label}>
                      {window.label}: {window.weekday}, {window.startTime}-{window.endTime}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : null}

          {fulfillmentType === "local-delivery" ? (
            <label className="mt-5 grid gap-2 font-subheading text-xs font-bold uppercase tracking-[0.12em]">
              Local delivery notes
              <textarea
                className="mrmf-input min-h-24 font-body text-sm normal-case tracking-normal"
                value={localDeliveryNotes}
                onChange={(event) => setLocalDeliveryNotes(event.currentTarget.value)}
              />
            </label>
          ) : null}

          {fulfillmentType === "shipping" ? (
            <label className="mt-5 grid gap-2 font-subheading text-xs font-bold uppercase tracking-[0.12em]">
              Shipping address
              <textarea
                className="mrmf-input min-h-24 font-body text-sm normal-case tracking-normal"
                value={shippingAddress}
                onChange={(event) => setShippingAddress(event.currentTarget.value)}
              />
            </label>
          ) : null}

          {fulfillmentType === "local-preorder" ? (
            <label className="mt-5 grid gap-2 font-subheading text-xs font-bold uppercase tracking-[0.12em]">
              Preorder timing notes
              <textarea
                className="mrmf-input min-h-24 font-body text-sm normal-case tracking-normal"
                value={preorderNotes}
                onChange={(event) => setPreorderNotes(event.currentTarget.value)}
              />
            </label>
          ) : null}
        </div>

        <div className="mrmf-card p-6">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-brand-mahogany" aria-hidden="true" />
            <h2 className="font-heading text-4xl">Payment</h2>
          </div>
          <p className="mt-3 text-sm leading-7">
            Online card payment is disabled in this staged checkout. Stripe placeholders are
            configured through environment variables only, with no live credentials committed.
            {bridge?.source === "medusa"
              ? " A Medusa cart has been prepared for validation, but order completion is still blocked."
              : " The staged browser cart remains the fallback while Medusa cart sync is unavailable."}
          </p>
          {bridge?.error ? <p className="mt-3 text-xs leading-6">{bridge.error}</p> : null}
        </div>

        <div className="mrmf-card border-brand-burnt p-5">
          <div className="flex items-center gap-2 font-subheading text-xs font-extrabold uppercase tracking-[0.14em] text-brand-mahogany">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Policy acknowledgement
          </div>
          <label className="mt-4 flex items-start gap-3 text-sm leading-7">
            <input
              type="checkbox"
              className="mt-1"
              checked={policyAccepted}
              onChange={(event) => setPolicyAccepted(event.currentTarget.checked)}
            />
            <span>
              I understand fresh products require confirmed pickup, market pickup, local delivery,
              or preorder coordination, and I have reviewed the{" "}
              <Link href="/shipping-pickup-policy" className="underline">
                shipping and pickup policy
              </Link>
              .
            </span>
          </label>
        </div>

        <div className="mrmf-card p-5">
          <div className="flex items-center gap-2 font-subheading text-xs font-extrabold uppercase tracking-[0.14em] text-brand-mahogany">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            Checkout validation
          </div>
          <ul className="mt-4 space-y-2 text-sm leading-7">
            {validation.errors.length > 0 ? (
              validation.errors.map((error) => <li key={error}>{error}</li>)
            ) : (
              <li>This staged checkout passes the current fulfillment checks.</li>
            )}
          </ul>
          <button
            type="submit"
            className="mrmf-button-primary mt-5 w-full"
          >
            Review staged order
          </button>
          {submitMessage ? <p className="mt-3 text-sm leading-7">{submitMessage}</p> : null}
        </div>
      </form>

      <aside className="mrmf-card p-6 lg:self-start">
        <h2 className="font-heading text-4xl">Order summary</h2>
        <div className="mt-5 space-y-4">
          {cart.lines.length === 0 ? (
            <p className="text-sm leading-7">Your cart is empty.</p>
          ) : (
            cart.lines.map((line) => (
              <div
                key={line.product.slug}
                className="flex justify-between gap-4 border-b border-brand-mahogany/20 pb-4"
              >
                <div>
                  <p className="font-heading text-2xl">{line.product.name}</p>
                  <p className="font-subheading text-xs font-bold uppercase tracking-[0.12em] text-brand-mahogany">
                    {line.quantity} x {line.fulfillmentLabel}
                  </p>
                  <p className="mt-1 text-xs leading-6">
                    {getCommerceProductAvailability(line.product).message}
                  </p>
                  {!canAddCommerceProductToCart(line.product) ? (
                    <div className="mt-3">
                      {(() => {
                        const cta = getProductNotificationCta(line.product, "/checkout");

                        return cta ? <NotificationSignupForm cta={cta} compact /> : null;
                      })()}
                    </div>
                  ) : null}
                </div>
                <p>{formatCurrency(line.subtotal)}</p>
              </div>
            ))
          )}
        </div>
        <div className="mt-5 flex items-center justify-between font-subheading text-sm font-extrabold uppercase tracking-[0.12em]">
          <span>Subtotal</span>
          <span>{formatCurrency(cart.subtotal)}</span>
        </div>
        <div className="mt-5 space-y-3 text-sm leading-7">
          {cart.warnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
        </div>
        <div className="mt-5 border-t border-brand-mahogany/20 pt-5">
          <p className="font-subheading text-xs font-extrabold uppercase tracking-[0.14em] text-brand-mahogany">
            Medusa cart bridge
          </p>
          <p className="mt-2 text-sm leading-7">
            {isSyncing
              ? "Checking Medusa cart availability..."
              : bridge?.source === "medusa"
                ? `Prepared cart ${bridge.medusaCartId}; payment remains disabled.`
                : "Using the staged browser cart fallback."}
          </p>
          {bridge?.safeShippingOptions.length ? (
            <ul className="mt-3 space-y-2 text-xs leading-6">
              {bridge.safeShippingOptions.map((option) => (
                <li key={option.id}>{option.name}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </aside>
    </section>
  );
}
