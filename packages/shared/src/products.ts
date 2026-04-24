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
      "Harvest-driven gourmet mushrooms for pickup, market pickup, local delivery, and restaurant preorders."
  },
  {
    slug: "dried-mushrooms",
    title: "Dried Mushrooms",
    description:
      "Shelf-stable mushrooms for broths, sauces, risotto, ramen, and pantry cooking."
  },
  {
    slug: "salts-seasonings",
    title: "Mushroom Salts & Seasonings",
    description:
      "Savory mushroom-powered finishing salts and seasoning blends for everyday cooking."
  },
  {
    slug: "supplements",
    title: "Functional Mushroom Supplements",
    description:
      "Carefully labeled mushroom capsules and powders with cautious structure/function language."
  },
  {
    slug: "subscriptions",
    title: "CSA-Style Boxes",
    description:
      "Recurring fresh mushroom boxes built around weekly harvest availability."
  },
  {
    slug: "restaurant-wholesale",
    title: "Restaurant & Wholesale",
    description:
      "Chef-focused fresh mushrooms, weekly mixes, and direct wholesale inquiries."
  }
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
      "Tender, snow-white lion's mane with a delicate seafood-like bite.",
    longDescription:
      "Fresh lion's mane is harvested in small batches for customers who want a centerpiece mushroom for searing, shredding, and crisping. It is best handled like fresh produce and kept cold until cooking.",
    flavorProfile: "Mild, savory, lightly sweet, and reminiscent of crab or scallop when browned.",
    texture: "Tender and shreddable with crisp edges when pan-seared.",
    cookingMethods: ["sear", "shred", "pan-fry", "roast"],
    pairings: ["butter", "garlic", "lemon", "parsley", "Old Bay-style seasoning"],
    storageInstructions:
      "Keep refrigerated in a breathable paper bag or vented container. Avoid sealed plastic once opened.",
    shelfLife: "Best within 5-7 days of harvest.",
    fulfillment: ["farm-pickup", "farmers-market-pickup", "local-delivery", "local-preorder"],
    shippable: false,
    inventoryStatus: "seasonal",
    images: [
      {
        src: "/product-placeholders/fresh-lions-mane.svg",
        alt: "Fresh lion's mane mushroom cluster"
      }
    ],
    relatedRecipes: ["lions-mane-crab-cake-style-patties"],
    relatedSpeciesPage: ["lion-s-mane"],
    visibilityStatus: "published"
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
      "Cool-toned oyster mushrooms with a deep savory aroma and quick-cooking texture.",
    longDescription:
      "Blue oyster mushrooms are a weeknight favorite: fast to cook, generous in the pan, and excellent for browning hard over high heat.",
    flavorProfile: "Savory, earthy, and slightly nutty after browning.",
    texture: "Velvety caps with tender stems that crisp well at the edges.",
    cookingMethods: ["saute", "roast", "stir-fry", "grill"],
    pairings: ["thyme", "soy sauce", "cream", "eggs", "polenta"],
    storageInstructions:
      "Refrigerate in a breathable bag and cook promptly for best texture.",
    shelfLife: "Best within 5-7 days of harvest.",
    fulfillment: ["farm-pickup", "farmers-market-pickup", "local-delivery", "local-preorder"],
    shippable: false,
    inventoryStatus: "available",
    images: [
      {
        src: "/product-placeholders/blue-oyster.svg",
        alt: "Blue oyster mushroom cluster"
      }
    ],
    relatedRecipes: ["crispy-oyster-mushroom-tacos"],
    relatedSpeciesPage: ["blue-oyster"],
    visibilityStatus: "published"
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
      "Bright golden oyster mushrooms with a delicate, aromatic flavor.",
    longDescription:
      "Golden oysters bring color and a gentle savory note to soups, egg dishes, stir-fries, and composed plates. Their tender caps cook quickly.",
    flavorProfile: "Light, nutty, and gently savory.",
    texture: "Delicate caps with crispable edges.",
    cookingMethods: ["saute", "stir-fry", "roast"],
    pairings: ["eggs", "green onion", "ginger", "rice", "white beans"],
    storageInstructions:
      "Keep cold in a breathable container and handle gently to protect the caps.",
    shelfLife: "Best within 3-5 days of harvest.",
    fulfillment: ["farm-pickup", "farmers-market-pickup", "local-delivery", "local-preorder"],
    shippable: false,
    inventoryStatus: "seasonal",
    images: [
      {
        src: "/product-placeholders/golden-oyster.svg",
        alt: "Golden oyster mushroom cluster"
      }
    ],
    relatedRecipes: ["crispy-oyster-mushroom-tacos"],
    relatedSpeciesPage: ["golden-oyster"],
    visibilityStatus: "published"
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
      "Vivid pink oyster mushrooms with a bold color and meaty pan presence.",
    longDescription:
      "Pink oysters are best cooked soon after harvest. Their color softens with heat, but their savory aroma and crisp-tender texture make them a striking seasonal mushroom.",
    flavorProfile: "Savory, slightly smoky, and richer when browned.",
    texture: "Meaty for an oyster mushroom with crisp edges after searing.",
    cookingMethods: ["sear", "roast", "saute"],
    pairings: ["smoked paprika", "corn tortillas", "lime", "beans", "chiles"],
    storageInstructions:
      "Refrigerate and cook quickly. Pink oysters have a shorter fresh shelf life than blue oysters.",
    shelfLife: "Best within 2-4 days of harvest.",
    fulfillment: ["farm-pickup", "farmers-market-pickup", "local-delivery", "local-preorder"],
    shippable: false,
    inventoryStatus: "seasonal",
    images: [
      {
        src: "/product-placeholders/pink-oyster.svg",
        alt: "Pink oyster mushroom cluster"
      }
    ],
    relatedRecipes: ["crispy-oyster-mushroom-tacos"],
    relatedSpeciesPage: ["pink-oyster"],
    visibilityStatus: "published"
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
      "Clean, versatile oyster mushrooms for roasting, sauteing, soups, and pasta.",
    longDescription:
      "White oysters are a flexible kitchen staple with a mild flavor that takes on herbs, garlic, sauces, and high-heat browning beautifully.",
    flavorProfile: "Mild, savory, and adaptable.",
    texture: "Tender caps with pleasant chew.",
    cookingMethods: ["saute", "roast", "simmer", "stir-fry"],
    pairings: ["garlic", "cream", "miso", "pasta", "rosemary"],
    storageInstructions:
      "Keep refrigerated in breathable packaging and cook while caps are firm.",
    shelfLife: "Best within 5-7 days of harvest.",
    fulfillment: ["farm-pickup", "farmers-market-pickup", "local-delivery", "local-preorder"],
    shippable: false,
    inventoryStatus: "available",
    images: [
      {
        src: "/product-placeholders/white-oyster.svg",
        alt: "White oyster mushroom cluster"
      }
    ],
    relatedRecipes: ["crispy-oyster-mushroom-tacos"],
    relatedSpeciesPage: ["white-oyster"],
    visibilityStatus: "published"
  },
  {
    name: "Mixed Gourmet Mushroom Box",
    slug: "mixed-gourmet-mushroom-box",
    category: "fresh-mushrooms",
    species: ["lion-s-mane", "blue-oyster", "golden-oyster", "pink-oyster", "white-oyster"],
    productFormat: "fresh",
    price: 22,
    unitSize: "1 lb harvest box",
    shortDescription:
      "A rotating fresh box with the best mushrooms from the current harvest.",
    longDescription:
      "The mixed gourmet box changes with harvest conditions and is designed for customers who want variety, cooking inspiration, and a clear snapshot of what is fresh this week.",
    flavorProfile: "Varies by harvest; usually a mix of mild, savory, nutty, and seafood-like notes.",
    texture: "A mix of tender, meaty, and crispable mushrooms.",
    cookingMethods: ["saute", "roast", "sear"],
    pairings: ["butter", "olive oil", "fresh herbs", "eggs", "rice", "pasta"],
    storageInstructions:
      "Keep refrigerated and separate delicate varieties if storing longer than two days.",
    shelfLife: "Best within 3-7 days depending on the mix.",
    fulfillment: ["farm-pickup", "farmers-market-pickup", "local-delivery", "local-preorder"],
    shippable: false,
    inventoryStatus: "preorder",
    images: [
      {
        src: "/product-placeholders/mixed-box.svg",
        alt: "Mixed gourmet mushroom box"
      }
    ],
    relatedRecipes: ["crispy-oyster-mushroom-tacos", "lions-mane-crab-cake-style-patties"],
    relatedSpeciesPage: ["lion-s-mane", "blue-oyster", "golden-oyster", "pink-oyster", "white-oyster"],
    visibilityStatus: "published"
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
      "Lion's mane capsules for customers seeking a simple daily functional mushroom routine.",
    longDescription:
      "A shelf-stable lion's mane capsule product scaffolded for careful labeling, conservative structure/function language, and legal/business review before launch.",
    flavorProfile: "Neutral capsule format.",
    texture: "Capsule.",
    cookingMethods: [],
    pairings: ["daily routine", "coffee or tea ritual"],
    storageInstructions:
      "Store tightly closed in a cool, dry place away from direct sunlight.",
    shelfLife: "Use by the date printed on final packaging.",
    fulfillment: ["shipping", "farm-pickup", "farmers-market-pickup"],
    shippable: true,
    inventoryStatus: "coming-soon",
    images: [
      {
        src: "/product-placeholders/lions-mane-capsules.svg",
        alt: "Lion's mane capsule bottle"
      }
    ],
    relatedRecipes: [],
    relatedSpeciesPage: ["lion-s-mane"],
    supplementDisclaimer: SUPPLEMENT_DISCLAIMER,
    visibilityStatus: "published"
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
      "A savory finishing salt for potatoes, eggs, popcorn, soups, and grilled vegetables.",
    longDescription:
      "Mushroom salt is a shelf-stable pantry product designed to bring mushroom depth to everyday cooking without needing a fresh harvest on hand.",
    flavorProfile: "Savory, mineral, roasted, and gently earthy.",
    texture: "Fine-to-medium finishing salt.",
    cookingMethods: ["finish", "season", "roast"],
    pairings: ["potatoes", "eggs", "popcorn", "roasted vegetables", "steak"],
    storageInstructions:
      "Store sealed in a cool, dry pantry.",
    shelfLife: "Best within 12 months of packing.",
    fulfillment: ["shipping", "farm-pickup", "farmers-market-pickup"],
    shippable: true,
    inventoryStatus: "coming-soon",
    images: [
      {
        src: "/product-placeholders/mushroom-salt.svg",
        alt: "Jar of mushroom salt"
      }
    ],
    relatedRecipes: ["mushroom-salt-roasted-potatoes"],
    relatedSpeciesPage: ["blue-oyster", "white-oyster"],
    visibilityStatus: "published"
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
      "Shelf-stable dried oyster mushrooms for broths, sauces, risotto, and ramen.",
    longDescription:
      "Dried oyster mushrooms concentrate the savory aroma of the fresh harvest and make it easy to keep local mushrooms in the pantry.",
    flavorProfile: "Deeply savory, brothy, and gently earthy.",
    texture: "Chewy after rehydration; crisp if ground into seasoning.",
    cookingMethods: ["rehydrate", "simmer", "grind", "braise"],
    pairings: ["broth", "rice", "noodles", "cream sauces", "beans"],
    storageInstructions:
      "Store sealed in a cool, dry pantry. Keep away from moisture.",
    shelfLife: "Best within 12 months of drying.",
    fulfillment: ["shipping", "farm-pickup", "farmers-market-pickup"],
    shippable: true,
    inventoryStatus: "coming-soon",
    images: [
      {
        src: "/product-placeholders/dried-oyster.svg",
        alt: "Bag of dried oyster mushrooms"
      }
    ],
    relatedRecipes: [],
    relatedSpeciesPage: ["blue-oyster", "white-oyster"],
    visibilityStatus: "published"
  },
  {
    name: "Chef's Weekly Mushroom Mix",
    slug: "chefs-weekly-mushroom-mix",
    category: "restaurant-wholesale",
    species: ["lion-s-mane", "blue-oyster", "golden-oyster", "pink-oyster", "white-oyster"],
    productFormat: "wholesale",
    price: 0,
    unitSize: "Custom weekly order",
    shortDescription:
      "A restaurant-focused weekly mix built around harvest timing and chef needs.",
    longDescription:
      "Chef's Weekly Mushroom Mix is a wholesale inquiry product for restaurants that need reliable communication, fresh harvest windows, and variety based on what is fruiting well.",
    flavorProfile: "Varies by weekly harvest and chef request.",
    texture: "Custom mix of tender, meaty, and crispable mushrooms.",
    cookingMethods: ["chef-preferred"],
    pairings: ["seasonal menus", "specials", "tasting menus", "vegetable plates"],
    storageInstructions:
      "Keep refrigerated. Restaurants receive harvest and handling notes with each order.",
    shelfLife: "Best within 3-7 days depending on included varieties.",
    fulfillment: ["restaurant-delivery", "farm-pickup", "local-preorder"],
    shippable: false,
    inventoryStatus: "preorder",
    images: [
      {
        src: "/product-placeholders/chefs-mix.svg",
        alt: "Chef's weekly mushroom mix"
      }
    ],
    relatedRecipes: [],
    relatedSpeciesPage: ["lion-s-mane", "blue-oyster", "golden-oyster", "pink-oyster", "white-oyster"],
    visibilityStatus: "published"
  }
];

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getProductsByCategory(category: ProductCategory) {
  return products.filter(
    (product) => product.category === category && product.visibilityStatus === "published"
  );
}
