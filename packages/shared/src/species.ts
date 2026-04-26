import type { SpeciesPage } from "./types";

export const speciesPages: SpeciesPage[] = [
  {
    code: "LM",
    name: "Lion's Mane",
    slug: "lion-s-mane",
    catalogStatus: "active",
    availabilityState: "seasonal",
    overview:
      "Lion's mane grows in cascading white clusters and cooks into a tender, shreddable mushroom that can feel almost seafood-like when seared.",
    flavor: "Mild, savory, lightly sweet, and excellent with butter, lemon, and herbs.",
    texture: "Tender, pull-apart strands with crisp edges after hard searing.",
    cookingTips: [
      "Tear into pieces by hand instead of slicing whenever possible.",
      "Press gently in the pan to drive off moisture before adding butter.",
      "Use in patties, steaks, pasta, or simple browned mushroom plates."
    ],
    storage:
      "Keep refrigerated in breathable packaging and cook within about one week of harvest.",
    pairsWith: ["lemon", "garlic", "parsley", "butter", "eggs", "crab-cake style seasoning"],
    functionalNote:
      "Functional mushroom copy for lion's mane should stay cautious and be reviewed before publication.",
    requiresLegalReview: true
  },
  {
    code: "BO",
    name: "Blue Oyster",
    slug: "blue-oyster",
    catalogStatus: "active",
    availabilityState: "available",
    overview:
      "Blue oysters are productive, versatile mushrooms with cool-toned caps and a reliable savory flavor.",
    flavor: "Earthy, savory, and nutty after browning.",
    texture: "Tender caps with edges that crisp beautifully under high heat.",
    cookingTips: [
      "Cook in a wide pan so steam can escape.",
      "Brown before salting heavily.",
      "Use in tacos, grain bowls, pasta, omelets, and soups."
    ],
    storage:
      "Refrigerate in a breathable bag and use while caps remain firm and aromatic.",
    pairsWith: ["thyme", "soy sauce", "cream", "eggs", "polenta", "onions"]
  },
  {
    code: "GO",
    name: "Golden Oyster",
    slug: "golden-oyster",
    catalogStatus: "active",
    availabilityState: "seasonal",
    overview:
      "Golden oysters bring bright color and a delicate savory flavor to fast-cooking dishes.",
    flavor: "Light, nutty, and gently savory.",
    texture: "Delicate caps that are best cooked quickly.",
    cookingTips: [
      "Use medium-high heat and avoid overcrowding.",
      "Add near the end of soups and stir-fries.",
      "Pair with simple aromatics so the mushroom stays clear."
    ],
    storage:
      "Keep cold and use quickly; delicate caps are best within a few days of harvest.",
    pairsWith: ["ginger", "green onion", "rice", "eggs", "white beans", "miso"]
  },
  {
    code: "PO",
    name: "Pink Oyster",
    slug: "pink-oyster",
    catalogStatus: "active",
    availabilityState: "seasonal",
    overview:
      "Pink oysters are vivid, fast-growing mushrooms that bring seasonal color and a richer savory note.",
    flavor: "Savory, slightly smoky, and deeper when browned.",
    texture: "Meaty caps and stems that crisp well.",
    cookingTips: [
      "Cook soon after harvest because pink oysters have a shorter shelf life.",
      "Use high heat for tacos, bowls, and roasted vegetable plates.",
      "Expect the bright pink color to soften after cooking."
    ],
    storage:
      "Keep refrigerated and cook within a few days for best aroma and texture.",
    pairsWith: ["lime", "corn tortillas", "smoked paprika", "beans", "chiles", "cilantro"]
  },
  {
    code: "WO",
    name: "White Oyster",
    slug: "white-oyster",
    catalogStatus: "active",
    availabilityState: "low-stock",
    overview:
      "White oysters are a mild, adaptable kitchen mushroom for everyday cooking.",
    flavor: "Clean, mild, savory, and friendly to many sauces and cuisines.",
    texture: "Tender with a pleasant chew.",
    cookingTips: [
      "Start with a dry pan or a small amount of oil to encourage browning.",
      "Use in creamy pasta, ramen, rice bowls, and roasted sides.",
      "Save trimmings for broth if they are clean and fresh."
    ],
    storage:
      "Store refrigerated in breathable packaging and use while the clusters are firm.",
    pairsWith: ["garlic", "cream", "miso", "pasta", "rosemary", "rice"]
  },
  {
    code: "EO",
    name: "Elm Oyster",
    slug: "elm-oyster",
    catalogStatus: "planned",
    availabilityState: "coming-soon",
    overview:
      "Elm oyster is part of the farm's broader oyster-style catalog. Full product details will be finalized when this crop is scheduled.",
    flavor: "Generally mild and savory; final farm-specific notes are pending.",
    texture: "Tender caps with a firmer bite than some delicate oyster varieties.",
    cookingTips: [
      "Use high heat for browning once a harvest is available.",
      "Treat as a versatile oyster-style mushroom for pastas, bowls, and sautés.",
      "Confirm farm handling notes before launch."
    ],
    storage: "Storage guidance is pending final harvest and packaging decisions.",
    pairsWith: ["garlic", "thyme", "rice", "cream", "soy sauce"]
  },
  {
    code: "KB",
    name: "King Blue",
    slug: "king-blue",
    catalogStatus: "planned",
    availabilityState: "coming-soon",
    overview:
      "King blue is tracked in the master catalog so future harvests can be added without making the item purchasable by default.",
    flavor: "Savory notes are expected, with final tasting copy pending farm trials.",
    texture: "Expected to be denser than standard oyster clusters; final texture notes are pending.",
    cookingTips: [
      "Use as a searing mushroom once harvest details are confirmed.",
      "Slice larger stems for even browning.",
      "Keep launch copy conservative until the farm confirms product form."
    ],
    storage: "Storage guidance is pending final harvest and packaging decisions.",
    pairsWith: ["butter", "garlic", "herbs", "beans", "grains"]
  },
  {
    code: "KT",
    name: "King Trumpet",
    slug: "king-trumpet",
    catalogStatus: "planned",
    availabilityState: "coming-soon",
    overview:
      "King trumpet is a thick-stemmed culinary mushroom suited to slicing, scoring, and hard searing when available.",
    flavor: "Mild, savory, and lightly nutty after browning.",
    texture: "Dense, meaty stems with a firm bite.",
    cookingTips: [
      "Slice into rounds or lengthwise planks.",
      "Score larger pieces before searing.",
      "Cook until the cut faces are deeply browned."
    ],
    storage: "Keep refrigerated in breathable packaging once harvest details are finalized.",
    pairsWith: ["miso", "butter", "garlic", "thyme", "noodles"]
  },
  {
    code: "PP",
    name: "Pioppino",
    slug: "pioppino",
    catalogStatus: "planned",
    availabilityState: "coming-soon",
    overview:
      "Pioppino is tracked as a future specialty mushroom with small caps and slender stems.",
    flavor: "Savory, nutty, and lightly peppery notes are typical; farm-specific notes are pending.",
    texture: "Small caps and stems that hold shape well in sautés.",
    cookingTips: [
      "Cook whole or in small clusters.",
      "Use in pasta, risotto, and brothy dishes.",
      "Brown lightly before adding liquid."
    ],
    storage: "Keep refrigerated and cook promptly once fresh harvests are available.",
    pairsWith: ["risotto", "parsley", "shallot", "broth", "pasta"]
  },
  {
    code: "CNT",
    name: "Chestnut",
    slug: "chestnut",
    catalogStatus: "planned",
    availabilityState: "coming-soon",
    overview:
      "Chestnut mushrooms are included in the master catalog as a future fresh specialty crop.",
    flavor: "Nutty, savory, and earthy after browning.",
    texture: "Firm caps with a pleasant bite.",
    cookingTips: [
      "Trim the base and cook clusters in a wide pan.",
      "Use in omelets, toast, soups, and roasted vegetable dishes.",
      "Let moisture cook off before seasoning heavily."
    ],
    storage: "Keep refrigerated in breathable packaging once harvested.",
    pairsWith: ["eggs", "toast", "thyme", "cream", "onions"]
  },
  {
    code: "STK",
    name: "Shiitake",
    slug: "shiitake",
    catalogStatus: "planned",
    availabilityState: "coming-soon",
    overview:
      "Shiitake is tracked as a future culinary crop for customers who want a deeply savory mushroom.",
    flavor: "Rich, savory, and brothy when cooked.",
    texture: "Tender caps with firmer stems that may be reserved for stock.",
    cookingTips: [
      "Remove tough stems before quick cooking.",
      "Use caps in stir-fries, soups, rice dishes, and noodle bowls.",
      "Save clean stems for broth."
    ],
    storage: "Keep refrigerated in breathable packaging once harvests are available.",
    pairsWith: ["soy sauce", "ginger", "rice", "noodles", "broth"]
  },
  {
    code: "MTK",
    name: "Maitake",
    slug: "maitake",
    catalogStatus: "planned",
    availabilityState: "coming-soon",
    overview:
      "Maitake is a frilled specialty mushroom tracked for future culinary availability.",
    flavor: "Deeply savory and aromatic after roasting or searing.",
    texture: "Frilly edges that crisp well with tender inner pieces.",
    cookingTips: [
      "Tear into petals and roast or sear hard.",
      "Use enough space in the pan for edges to crisp.",
      "Finish with herbs, lemon, or a small amount of butter."
    ],
    storage: "Keep refrigerated in breathable packaging once harvests are available.",
    pairsWith: ["rosemary", "butter", "lemon", "potatoes", "beans"]
  },
  {
    code: "TT",
    name: "Turkey Tail",
    slug: "turkey-tail",
    catalogStatus: "research",
    availabilityState: "coming-soon",
    overview:
      "Turkey tail is tracked for possible future functional or educational content. It is not currently an ordinary checkout product.",
    flavor: "Product format and tasting notes are pending.",
    texture: "Typically not presented as a fresh cooking mushroom for customers.",
    cookingTips: [
      "Do not treat this as a ready-to-cook fresh product until the farm defines a final format.",
      "Any functional copy requires legal/business review.",
      "Use cautious educational language only."
    ],
    storage: "Storage guidance depends on the future product format.",
    pairsWith: ["educational content", "future product review"],
    functionalNote:
      "Functional mushroom copy for turkey tail requires legal/business review and must avoid disease-treatment claims.",
    requiresLegalReview: true
  },
  {
    code: "RSH",
    name: "Reishi",
    slug: "reishi",
    catalogStatus: "research",
    availabilityState: "coming-soon",
    overview:
      "Reishi is tracked for possible future functional mushroom education or product development, not current checkout.",
    flavor: "Bitter and woody notes are typical; final product format is pending.",
    texture: "Woody; not positioned here as a fresh culinary mushroom.",
    cookingTips: [
      "Do not list as a fresh cooking product without a final owner-approved format.",
      "Keep functional copy cautious and reviewed.",
      "Avoid disease-treatment or prevention language."
    ],
    storage: "Storage guidance depends on the future product format.",
    pairsWith: ["future product review", "educational content"],
    functionalNote:
      "Functional mushroom copy for reishi requires legal/business review and must avoid disease-treatment claims.",
    requiresLegalReview: true
  },
  {
    code: "CDY",
    name: "Cordyceps",
    slug: "cordyceps",
    catalogStatus: "research",
    availabilityState: "coming-soon",
    overview:
      "Cordyceps is tracked for possible future functional mushroom education or product development.",
    flavor: "Final product format and tasting notes are pending.",
    texture: "Final product format is pending.",
    cookingTips: [
      "Do not make this cartable until a final product format is approved.",
      "Use cautious educational copy only.",
      "Any structure/function language requires legal/business review."
    ],
    storage: "Storage guidance depends on the future product format.",
    pairsWith: ["future product review", "educational content"],
    functionalNote:
      "Functional mushroom copy for cordyceps requires legal/business review and must avoid disease-treatment claims.",
    requiresLegalReview: true
  },
  {
    code: "ENK",
    name: "Enoki",
    slug: "enoki",
    catalogStatus: "planned",
    availabilityState: "coming-soon",
    overview:
      "Enoki is tracked as a future delicate culinary mushroom. It is not currently available for checkout.",
    flavor: "Mild, clean, and lightly savory.",
    texture: "Thin stems with a delicate snap when handled fresh.",
    cookingTips: [
      "Use gently in broths, noodle bowls, and quick sautés.",
      "Avoid overcooking delicate clusters.",
      "Confirm final food-safety and packaging guidance before launch."
    ],
    storage: "Keep refrigerated and follow final farm handling notes once available.",
    pairsWith: ["broth", "noodles", "soy sauce", "green onion", "miso"]
  }
];

export function getSpeciesBySlug(slug: string) {
  return speciesPages.find((species) => species.slug === slug);
}
