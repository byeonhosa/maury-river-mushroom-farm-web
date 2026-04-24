import type { FulfillmentType, PickupLocation } from "./types";

export const pickupLocations: PickupLocation[] = [
  {
    name: "Farm pickup",
    slug: "farm-pickup",
    fulfillmentType: "farm-pickup",
    description:
      "Reserve fresh mushrooms for a confirmed pickup window at the farm once weekly harvest timing is known.",
    addressNote: "Farm address and parking instructions require owner confirmation before launch.",
    requiresFinalConfirmation: true,
    windows: [
      {
        label: "Provisional farm pickup",
        weekday: "Friday",
        startTime: "16:00",
        endTime: "18:00",
        cutoff: "Thursday at noon",
        requiresConfirmation: true
      }
    ]
  },
  {
    name: "Lexington Farmers Market pickup",
    slug: "lexington-farmers-market-pickup",
    fulfillmentType: "farmers-market-pickup",
    description:
      "Preorder for pickup at the Lexington farmers market when the farm is scheduled to attend.",
    addressNote: "Final market stall location and seasonal schedule require owner confirmation.",
    requiresFinalConfirmation: true,
    windows: [
      {
        label: "Provisional Lexington market pickup",
        weekday: "Saturday",
        startTime: "08:00",
        endTime: "12:00",
        cutoff: "Friday at noon",
        requiresConfirmation: true
      }
    ]
  },
  {
    name: "Natural Bridge local market pickup",
    slug: "natural-bridge-local-market-pickup",
    fulfillmentType: "farmers-market-pickup",
    description:
      "A provisional Natural Bridge area pickup option for future local market or route-based pickup.",
    addressNote: "Exact pickup point, market name, and dates require owner confirmation.",
    requiresFinalConfirmation: true,
    windows: [
      {
        label: "Provisional Natural Bridge area pickup",
        weekday: "Sunday",
        startTime: "10:00",
        endTime: "12:00",
        cutoff: "Friday at noon",
        requiresConfirmation: true
      }
    ]
  }
];

export function getPickupLocationBySlug(slug: string) {
  return pickupLocations.find((location) => location.slug === slug);
}

export function getPickupWindowsForLocation(slug: string) {
  return getPickupLocationBySlug(slug)?.windows ?? [];
}

export function validatePickupSelection({
  locationSlug,
  windowLabel,
  allowedFulfillmentTypes
}: {
  locationSlug: string;
  windowLabel: string;
  allowedFulfillmentTypes: FulfillmentType[];
}) {
  const location = getPickupLocationBySlug(locationSlug);

  if (!location) {
    return { valid: false, message: "Select a valid pickup location." };
  }

  if (!allowedFulfillmentTypes.includes(location.fulfillmentType)) {
    return {
      valid: false,
      message: "This pickup location is not available for the selected cart items."
    };
  }

  if (!location.windows.some((window) => window.label === windowLabel)) {
    return { valid: false, message: "Select a valid pickup window." };
  }

  return { valid: true, message: "Pickup selection is valid." };
}
