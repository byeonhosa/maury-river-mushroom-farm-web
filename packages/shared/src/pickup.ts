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
      "Preorder for pickup at the Lexington Farmers Market on Wednesday mornings when the farm is at the market.",
    addressNote: "Exact stall location and seasonal market dates are confirmed each season.",
    requiresFinalConfirmation: true,
    windows: [
      {
        label: "Lexington Farmers Market (Wednesday morning)",
        weekday: "Wednesday",
        startTime: "08:00",
        endTime: "12:00",
        cutoff: "Tuesday at noon",
        requiresConfirmation: true
      }
    ]
  },
  {
    name: "Staunton Farmers Market pickup",
    slug: "staunton-farmers-market-pickup",
    fulfillmentType: "farmers-market-pickup",
    description:
      "Preorder for pickup at the Staunton Farmers Market on Saturday mornings when the farm is at the market.",
    addressNote: "Exact stall location and seasonal market dates are confirmed each season.",
    requiresFinalConfirmation: true,
    windows: [
      {
        label: "Staunton Farmers Market (Saturday morning)",
        weekday: "Saturday",
        startTime: "07:00",
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
