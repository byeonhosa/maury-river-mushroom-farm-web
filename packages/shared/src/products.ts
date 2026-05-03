import { shouldShowProductInShop } from "./availability";
import type { Product, ProductCategory } from "./types";

export const SUPPLEMENT_DISCLAIMER =
  "These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.";

export const productCategories: Array<{
  slug: ProductCategory;
  title: string;
  description: string;
}> = [
  {
    slug: "fresh-mushrooms",
    title: "Fresh Mushrooms",
    description:
      "Harvest-driven gourmet mushrooms for farm pickup, market pickup, local delivery, and preorder. Fresh products stay local by default.",
  },
  {
    slug: "dried-mushrooms",
    title: "Dried Mushrooms",
    description:
      "Shelf-stable mushrooms for broths, sauces, risotto, ramen, and pantry cooking when fresh harvests are between windows.",
  },
  {
    slug: "salts-seasonings",
    title: "Mushroom Salts & Seasonings",
    description:
      "Savory mushroom-powered finishing salts and seasoning blends for potatoes, eggs, vegetables, popcorn, and soups.",
  },
  {
    slug: "supplements",
    title: "Functional Mushroom Supplements",
    description:
      "Carefully labeled mushroom capsules and powders with cautious language, supplement disclaimers, and legal/business review before launch.",
  },
  {
    slug: "subscriptions",
    title: "CSA-Style Boxes",
    description:
      "CSA-style fresh mushroom boxes built around weekly harvest availability, pickup windows, and preorder communication.",
  },
  {
    slug: "restaurant-wholesale",
    title: "Restaurant & Wholesale",
    description:
      "Chef-focused fresh mushrooms, weekly mixes, harvest planning, and direct wholesale inquiries.",
  },
];

export const products: Product[] = [
  {
    name: "Fresh Lion's Mane",
    slug: "fresh-lions-mane",
    category: "fresh-mushrooms",
    species: ["lion-s-mane"],
    productFormat: "fresh",
    price: 14,
    unitSize: "8 oz clamshell",
    shortDescription:
      "Tender, snow-white lion's mane for seared steaks, pull-apart patties, and lemony skillet dinners.",
    longDescription:
      "Fresh lion's mane is harvested in small batches for customers who want a centerpiece mushroom for searing, shredding, and crisping. Tear it by hand for patties, cut it into slabs for steak-style bites, or brown it simply with butter and herbs. It is fresh produce and should stay cold until cooking.",
    flavorProfile:
      "Mild, savory, lightly sweet, and reminiscent of crab or scallop when browned.",
    texture: "Tender and shreddable with crisp edges when pan-seared.",
    cookingMethods: ["sear", "shred", "pan-fry", "roast"],
    pairings: [
      "butter",
      "garlic",
      "lemon",
      "parsley",
      "Old Bay-style seasoning",
      "potatoes",
      "sparkling apple cider",
    ],
    storageInstructions:
      "Keep refrigerated in a breathable paper bag or vented container. Avoid sealed plastic once opened.",
    shelfLife: "Best within 5-7 days of harvest.",
    fulfillment: [
      "farm-pickup",
      "farmers-market-pickup",
      "local-delivery",
      "local-preorder",
    ],
    shippable: false,
    inventoryStatus: "seasonal",
    availability: {
      cartable: true,
      availableQuantity: 24,
      stockNote: "Small harvest batches; quantity should be confirmed before launch.",
      pickupAvailabilityNote:
        "Fresh lion's mane is local pickup, market pickup, local delivery, or preorder only.",
      publicMessage:
        "Seasonal harvest item. Add to the staged cart now, and the farm will confirm the pickup or delivery window before launch."
    },
    images: [
      {
        src: "/images/products/lions-mane-mushrooms-01.webp",
        alt: "Fresh lion's mane mushrooms in market baskets",
      },
    ],
    relatedRecipes: [
      "lions-mane-crab-cake-style-patties",
      "lions-mane-steak-bites",
    ],
    relatedSpeciesPage: ["lion-s-mane"],
    visibilityStatus: "published",
  },
  {
    name: "Blue Oyster Mushrooms",
    slug: "blue-oyster-mushrooms",
    category: "fresh-mushrooms",
    species: ["blue-oyster"],
    productFormat: "fresh",
    price: 10,
    unitSize: "8 oz clamshell",
    shortDescription:
      "Cool-toned oyster mushrooms that brown quickly for tacos, stir-fries, eggs, pasta, and rice bowls.",
    longDescription:
      "Blue oyster mushrooms are a weeknight favorite: fast to cook, generous in the pan, and excellent for browning over high heat. They are the most flexible fresh oyster for customers who are learning how to cook specialty mushrooms.",
    flavorProfile: "Savory, earthy, and slightly nutty after browning.",
    texture: "Velvety caps with tender stems that crisp well at the edges.",
    cookingMethods: ["saute", "roast", "stir-fry", "grill"],
    pairings: [
      "thyme",
      "soy sauce",
      "cream",
      "eggs",
      "polenta",
      "ginger",
      "green tea",
    ],
    storageInstructions:
      "Refrigerate in a breathable bag and cook promptly for best texture.",
    shelfLife: "Best within 5-7 days of harvest.",
    fulfillment: [
      "farm-pickup",
      "farmers-market-pickup",
      "local-delivery",
      "local-preorder",
    ],
    shippable: false,
    inventoryStatus: "available",
    availability: {
      availableQuantity: 50,
      stockNote: "Baseline launch fixture; confirm real harvest quantity before taking orders.",
      pickupAvailabilityNote: "Fresh blue oysters are local-only and should stay cold after pickup."
    },
    images: [
      {
        src: "/product-placeholders/blue-oyster.svg",
        alt: "Blue oyster mushroom cluster",
      },
    ],
    relatedRecipes: [
      "crispy-oyster-mushroom-tacos",
      "garlic-blue-oyster-mushroom-stir-fry",
    ],
    relatedSpeciesPage: ["blue-oyster"],
    visibilityStatus: "published",
  },
  {
    name: "Golden Oyster Mushrooms",
    slug: "golden-oyster-mushrooms",
    category: "fresh-mushrooms",
    species: ["golden-oyster"],
    productFormat: "fresh",
    price: 11,
    unitSize: "8 oz clamshell",
    shortDescription:
      "Bright golden oysters with delicate caps for soup, quick sautes, egg dishes, and gentle stir-fries.",
    longDescription:
      "Golden oysters bring color and a gentle savory note to soups, egg dishes, stir-fries, and composed plates. Their tender caps cook quickly, so add them near the end of broths or give them a fast saute with simple aromatics.",
    flavorProfile: "Light, nutty, and gently savory.",
    texture: "Delicate caps with crispable edges.",
    cookingMethods: ["saute", "stir-fry", "roast"],
    pairings: [
      "eggs",
      "green onion",
      "ginger",
      "rice",
      "white beans",
      "miso",
      "sparkling water with lemon",
    ],
    storageInstructions:
      "Keep cold in a breathable container and handle gently to protect the caps.",
    shelfLife: "Best within 3-5 days of harvest.",
    fulfillment: [
      "farm-pickup",
      "farmers-market-pickup",
      "local-delivery",
      "local-preorder",
    ],
    shippable: false,
    inventoryStatus: "seasonal",
    availability: {
      cartable: true,
      availableQuantity: 18,
      stockNote: "Seasonal fixture quantity; confirm before launch.",
      publicMessage:
        "Seasonal harvest item. Availability depends on current fruiting and may need pickup-window confirmation."
    },
    images: [
      {
        src: "/product-placeholders/golden-oyster.svg",
        alt: "Golden oyster mushroom cluster",
      },
    ],
    relatedRecipes: [
      "crispy-oyster-mushroom-tacos",
      "golden-oyster-mushroom-soup",
    ],
    relatedSpeciesPage: ["golden-oyster"],
    visibilityStatus: "published",
  },
  {
    name: "Pink Oyster Mushrooms",
    slug: "pink-oyster-mushrooms",
    category: "fresh-mushrooms",
    species: ["pink-oyster"],
    productFormat: "fresh",
    price: 11,
    unitSize: "8 oz clamshell",
    shortDescription:
      "Vivid pink oysters for crisp-edged tacos, rice bowls, roasted vegetables, and short-season market cooking.",
    longDescription:
      "Pink oysters are best cooked soon after harvest. Their color softens with heat, but their savory aroma and crisp-tender texture make them a striking seasonal mushroom for customers who want something bright and quick.",
    flavorProfile: "Savory, slightly smoky, and richer when browned.",
    texture: "Meaty for an oyster mushroom with crisp edges after searing.",
    cookingMethods: ["sear", "roast", "saute"],
    pairings: [
      "smoked paprika",
      "corn tortillas",
      "lime",
      "beans",
      "chiles",
      "cilantro",
      "hibiscus tea",
    ],
    storageInstructions:
      "Refrigerate and cook quickly. Pink oysters have a shorter fresh shelf life than blue oysters.",
    shelfLife: "Best within 2-4 days of harvest.",
    fulfillment: [
      "farm-pickup",
      "farmers-market-pickup",
      "local-delivery",
      "local-preorder",
    ],
    shippable: false,
    inventoryStatus: "seasonal",
    availability: {
      cartable: true,
      availableQuantity: 12,
      stockNote: "Short shelf-life seasonal fixture; confirm before launch.",
      publicMessage:
        "Seasonal and best cooked quickly. Availability depends on the current pink oyster harvest."
    },
    images: [
      {
        src: "/images/products/pink-oyster-mushrooms-02.webp",
        alt: "Pink oyster mushrooms held after harvest",
      },
    ],
    relatedRecipes: [
      "crispy-oyster-mushroom-tacos",
      "pink-oyster-rice-bowls",
    ],
    relatedSpeciesPage: ["pink-oyster"],
    visibilityStatus: "published",
  },
  {
    name: "White Oyster Mushrooms",
    slug: "white-oyster-mushrooms",
    category: "fresh-mushrooms",
    species: ["white-oyster"],
    productFormat: "fresh",
    price: 10,
    unitSize: "8 oz clamshell",
    shortDescription:
      "Clean, versatile oysters for roasting, sauteing, brothy noodles, creamy pasta, and everyday skillet meals.",
    longDescription:
      "White oysters are a flexible kitchen staple with a mild flavor that takes on herbs, garlic, sauces, and high-heat browning beautifully. They are a good first specialty mushroom for customers who want familiar flavor with better texture.",
    flavorProfile: "Mild, savory, and adaptable.",
    texture: "Tender caps with pleasant chew.",
    cookingMethods: ["saute", "roast", "simmer", "stir-fry"],
    pairings: [
      "garlic",
      "cream",
      "miso",
      "pasta",
      "rosemary",
      "rice",
      "ginger tea",
    ],
    storageInstructions:
      "Keep refrigerated in breathable packaging and cook while caps are firm.",
    shelfLife: "Best within 5-7 days of harvest.",
    fulfillment: [
      "farm-pickup",
      "farmers-market-pickup",
      "local-delivery",
      "local-preorder",
    ],
    shippable: false,
    inventoryStatus: "low-stock",
    availability: {
      availableQuantity: 8,
      stockNote: "Low-stock launch fixture; confirm real harvest count before opening checkout.",
      publicMessage:
        "Low stock for the current ordering window. Fresh white oysters remain local-only."
    },
    images: [
      {
        src: "/images/products/white-oyster-mushrooms-01.webp",
        alt: "White oyster mushroom cluster",
      },
    ],
    relatedRecipes: [
      "crispy-oyster-mushroom-tacos",
      "garlic-blue-oyster-mushroom-stir-fry",
    ],
    relatedSpeciesPage: ["white-oyster"],
    visibilityStatus: "published",
  },
  {
    name: "Mixed Gourmet Mushroom Box",
    slug: "mixed-gourmet-mushroom-box",
    category: "fresh-mushrooms",
    species: [
      "lion-s-mane",
      "blue-oyster",
      "golden-oyster",
      "pink-oyster",
      "white-oyster",
    ],
    productFormat: "fresh",
    price: 22,
    unitSize: "1 lb harvest box",
    shortDescription:
      "A rotating fresh box for customers who want variety, cooking ideas, and the best of the current harvest.",
    longDescription:
      "The mixed gourmet box changes with harvest conditions and is designed for customers who want variety, cooking inspiration, and a clear snapshot of what is fresh this week. It may include lion's mane, oyster varieties, or other confirmed harvest items depending on the grow room.",
    flavorProfile:
      "Varies by harvest; usually a mix of mild, savory, nutty, and seafood-like notes.",
    texture: "A mix of tender, meaty, and crispable mushrooms.",
    cookingMethods: ["saute", "roast", "sear"],
    pairings: [
      "butter",
      "olive oil",
      "fresh herbs",
      "eggs",
      "rice",
      "pasta",
      "lemon seltzer",
    ],
    storageInstructions:
      "Keep refrigerated and separate delicate varieties if storing longer than two days.",
    shelfLife: "Best within 3-7 days depending on the mix.",
    fulfillment: [
      "farm-pickup",
      "farmers-market-pickup",
      "local-delivery",
      "local-preorder",
    ],
    shippable: false,
    inventoryStatus: "preorder",
    availability: {
      availableQuantity: 12,
      stockNote: "Preorder fixture; exact mix depends on the harvest.",
      pickupAvailabilityNote: "The farm will confirm pickup or delivery timing before fulfillment.",
      publicMessage:
        "Preorder a rotating harvest box; final varieties and pickup timing are confirmed by the farm."
    },
    images: [
      {
        src: "/images/products/mixed-gourmet-mushrooms-01.webp",
        alt: "Mixed gourmet mushrooms arranged for a harvest box",
      },
    ],
    relatedRecipes: [
      "crispy-oyster-mushroom-tacos",
      "lions-mane-crab-cake-style-patties",
      "lions-mane-steak-bites",
      "pink-oyster-rice-bowls",
    ],
    relatedSpeciesPage: [
      "lion-s-mane",
      "blue-oyster",
      "golden-oyster",
      "pink-oyster",
      "white-oyster",
    ],
    visibilityStatus: "published",
  },
  {
    name: "Lion's Mane Capsules",
    slug: "lions-mane-capsules",
    category: "supplements",
    species: ["lion-s-mane"],
    productFormat: "capsule",
    price: 28,
    unitSize: "60 capsules",
    shortDescription:
      "A coming-soon lion's mane capsule concept for customers interested in a simple functional mushroom routine.",
    longDescription:
      "A shelf-stable lion's mane capsule product scaffolded for careful labeling, conservative structure/function language, and legal/business review before launch. This listing is informational until packaging, supplement facts, disclaimers, and final approval are complete.",
    flavorProfile: "Neutral capsule format.",
    texture: "Capsule.",
    cookingMethods: [],
    pairings: [
      "daily routine",
      "coffee or tea ritual",
      "breakfast prep area",
    ],
    storageInstructions:
      "Store tightly closed in a cool, dry place away from direct sunlight.",
    shelfLife: "Use by the date printed on final packaging.",
    fulfillment: ["shipping", "farm-pickup", "farmers-market-pickup"],
    shippable: true,
    inventoryStatus: "coming-soon",
    availability: {
      availableQuantity: 0,
      notifyMeEnabled: true,
      stockNote: "Packaging, labeling, and legal review must be completed before launch.",
      publicMessage:
        "Coming soon after supplement labeling, policy language, and legal/business review are complete."
    },
    images: [
      {
        src: "/product-placeholders/lions-mane-capsules.svg",
        alt: "Lion's mane capsule bottle",
      },
    ],
    relatedRecipes: [],
    relatedSpeciesPage: ["lion-s-mane"],
    supplementDisclaimer: SUPPLEMENT_DISCLAIMER,
    visibilityStatus: "published",
  },
  {
    name: "Mushroom Salt",
    slug: "mushroom-salt",
    category: "salts-seasonings",
    species: ["blue-oyster", "white-oyster"],
    productFormat: "seasoning",
    price: 12,
    unitSize: "3 oz jar",
    shortDescription:
      "A coming-soon savory finishing salt for potatoes, eggs, popcorn, soups, grilled vegetables, and weeknight cooking.",
    longDescription:
      "Mushroom salt is a shelf-stable pantry product designed to bring mushroom depth to everyday cooking without needing a fresh harvest on hand. Use it as a finishing pinch or as the savory base for roasted vegetables, potatoes, eggs, and soups.",
    flavorProfile: "Savory, mineral, roasted, and gently earthy.",
    texture: "Fine-to-medium finishing salt.",
    cookingMethods: ["finish", "season", "roast"],
    pairings: [
      "potatoes",
      "eggs",
      "popcorn",
      "roasted vegetables",
      "beans",
      "tomato juice",
    ],
    storageInstructions: "Store sealed in a cool, dry pantry.",
    shelfLife: "Best within 12 months of packing.",
    fulfillment: ["shipping", "farm-pickup", "farmers-market-pickup"],
    shippable: true,
    inventoryStatus: "coming-soon",
    availability: {
      availableQuantity: 0,
      notifyMeEnabled: true,
      stockNote: "Final recipe, packaging, and launch stock need confirmation.",
      publicMessage:
        "Coming soon as a shelf-stable pantry product once final packaging and launch stock are confirmed."
    },
    images: [
      {
        src: "/product-placeholders/mushroom-salt.svg",
        alt: "Jar of mushroom salt",
      },
    ],
    relatedRecipes: ["mushroom-salt-roasted-potatoes"],
    relatedSpeciesPage: ["blue-oyster", "white-oyster"],
    visibilityStatus: "published",
  },
  {
    name: "Dried Oyster Mushrooms",
    slug: "dried-oyster-mushrooms",
    category: "dried-mushrooms",
    species: ["blue-oyster", "white-oyster"],
    productFormat: "dried",
    price: 16,
    unitSize: "1.5 oz bag",
    shortDescription:
      "Coming-soon dried oyster mushrooms for broths, sauces, risotto, ramen, beans, and pantry meals.",
    longDescription:
      "Dried oyster mushrooms concentrate the savory aroma of the fresh harvest and make it easy to keep local mushrooms in the pantry. Rehydrate them for soups and sauces, or grind small pieces into seasoning once final packaging is approved.",
    flavorProfile: "Deeply savory, brothy, and gently earthy.",
    texture: "Chewy after rehydration; crisp if ground into seasoning.",
    cookingMethods: ["rehydrate", "simmer", "grind", "braise"],
    pairings: [
      "broth",
      "rice",
      "noodles",
      "cream sauces",
      "beans",
      "miso",
      "ginger tea",
    ],
    storageInstructions:
      "Store sealed in a cool, dry pantry. Keep away from moisture.",
    shelfLife: "Best within 12 months of drying.",
    fulfillment: ["shipping", "farm-pickup", "farmers-market-pickup"],
    shippable: true,
    inventoryStatus: "coming-soon",
    availability: {
      availableQuantity: 0,
      notifyMeEnabled: true,
      stockNote: "Drying, packaging, and launch stock need confirmation.",
      publicMessage:
        "Coming soon as a shippable shelf-stable product after packaging and launch inventory are confirmed."
    },
    images: [
      {
        src: "/product-placeholders/dried-oyster.svg",
        alt: "Bag of dried oyster mushrooms",
      },
    ],
    relatedRecipes: [],
    relatedSpeciesPage: ["blue-oyster", "white-oyster"],
    visibilityStatus: "published",
  },
  {
    name: "Chef's Weekly Mushroom Mix",
    slug: "chefs-weekly-mushroom-mix",
    category: "restaurant-wholesale",
    species: [
      "lion-s-mane",
      "blue-oyster",
      "golden-oyster",
      "pink-oyster",
      "white-oyster",
    ],
    productFormat: "wholesale",
    price: 0,
    unitSize: "Custom weekly order",
    shortDescription:
      "A restaurant-focused weekly harvest mix built around chef needs, menu timing, and realistic farm availability.",
    longDescription:
      "Chef's Weekly Mushroom Mix is a wholesale inquiry product for restaurants that need reliable communication, fresh harvest windows, and variety based on what is fruiting well. It is not an ordinary checkout product; chefs should inquire so the farm can match volume, timing, and handling notes to the week.",
    flavorProfile: "Varies by weekly harvest and chef request.",
    texture: "Custom mix of tender, meaty, and crispable mushrooms.",
    cookingMethods: ["chef-preferred"],
    pairings: [
      "seasonal menus",
      "specials",
      "tasting menus",
      "vegetable plates",
      "chef-prepared zero-proof pairings",
    ],
    storageInstructions:
      "Keep refrigerated. Restaurants receive harvest and handling notes with each order.",
    shelfLife: "Best within 3-7 days depending on included varieties.",
    fulfillment: ["restaurant-delivery", "farm-pickup", "local-preorder"],
    shippable: false,
    inventoryStatus: "wholesale-only",
    availability: {
      wholesaleOnly: true,
      availableQuantity: 0,
      stockNote: "Wholesale availability is quote-based and changes with the weekly harvest.",
      publicMessage:
        "Restaurant and wholesale availability is handled by inquiry so the farm can match the weekly harvest to chef needs."
    },
    images: [
      {
        src: "/images/products/mixed-gourmet-mushrooms-01.webp",
        alt: "Mixed gourmet mushrooms for a chef's weekly order",
      },
    ],
    relatedRecipes: [],
    relatedSpeciesPage: [
      "lion-s-mane",
      "blue-oyster",
      "golden-oyster",
      "pink-oyster",
      "white-oyster",
    ],
    visibilityStatus: "published",
  },
];

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getProductsByCategory(category: ProductCategory) {
  return products.filter(
    (product) =>
      product.category === category && shouldShowProductInShop(product),
  );
}
