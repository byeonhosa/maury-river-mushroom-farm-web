import type { ProductCategory } from "@mrmf/shared";

import { buildSeedPlan } from "./medusa-seed-data";

const categoryIdByKey: Record<ProductCategory, string | undefined> = {
  "fresh-mushrooms": "pcat_fresh",
  "dried-mushrooms": "pcat_dried",
  "salts-seasonings": "pcat_salts",
  supplements: "pcat_supplements",
  subscriptions: "pcat_subscriptions",
  "restaurant-wholesale": "pcat_wholesale",
  "grow-kits": undefined
};

const plan = buildSeedPlan({
  categoryIdByKey,
  collectionIdByKey: {
    "fresh-local-harvest": "pcol_fresh",
    "shelf-stable-pantry": "pcol_pantry",
    "functional-mushroom-products": "pcol_functional",
    "subscription-boxes": "pcol_subscriptions",
    "restaurant-wholesale": "pcol_wholesale"
  },
  shippingProfileIdByKey: {
    "fresh-local": "sp_fresh",
    "shelf-stable-shipping": "sp_pantry",
    "supplement-shipping": "sp_supplements",
    "subscription-preorder": "sp_subscriptions",
    "wholesale-preorder": "sp_wholesale"
  },
  salesChannelId: "sc_storefront"
});

console.log(
  `Seed plan OK: ${plan.categories.length} categories, ${plan.collections.length} collections, ${plan.shippingProfiles.length} shipping profiles, ${plan.products.length} products.`
);
