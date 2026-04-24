import type { SpeciesPage } from "./types";

export const speciesPages: SpeciesPage[] = [
  {
    name: "Lion's Mane",
    slug: "lion-s-mane",
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
    name: "Blue Oyster",
    slug: "blue-oyster",
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
    name: "Golden Oyster",
    slug: "golden-oyster",
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
    name: "Pink Oyster",
    slug: "pink-oyster",
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
    name: "White Oyster",
    slug: "white-oyster",
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
  }
];

export function getSpeciesBySlug(slug: string) {
  return speciesPages.find((species) => species.slug === slug);
}
