import type { SpeciesPage } from "./types";

// Species lineup approved by the owner (Decisions D15/D16, 2026-06-11):
//   Year-round staples: Blue Oyster, Lion's Mane, Shiitake, Chestnut
//   Rotating/seasonal:  Pink Oyster, White Oyster, King Trumpet, Black King
//                       Oyster, Pioppino, Maitake, Beech, Nameko, Golden Enoki,
//                       White Enoki, Cordyceps
//   Functional-future:  Reishi, Turkey Tail (education only; display pieces)
//   Wholesale-only:     Golden Oyster
// King Blue and Elm Oyster were retired from this lineup; King Blue is distinct
// from Black King Oyster and is not a rename.
export const speciesPages: SpeciesPage[] = [
  // --- Year-round staples ---------------------------------------------------
  {
    code: "BO",
    name: "Blue Oyster",
    slug: "blue-oyster",
    catalogStatus: "active",
    availabilityState: "available",
    availabilityTier: "year-round",
    overview:
      "Blue oysters are the farm's year-round workhorse: productive, versatile, and one of the easiest specialty mushrooms for first-time customers to cook well. Cool-toned caps brown quickly and carry a reliable savory flavor.",
    flavor: "Earthy, savory, and nutty after browning.",
    texture: "Tender caps with edges that crisp beautifully under high heat.",
    cookingTips: [
      "Cook in a wide pan so steam can escape and the edges crisp.",
      "Brown before salting heavily.",
      "Use in tacos, grain bowls, pasta, omelets, and soups."
    ],
    storage: "Refrigerate in a breathable bag and use while caps remain firm and aromatic.",
    pairsWith: ["thyme", "soy sauce", "cream", "eggs", "polenta", "onions", "ginger", "green tea"]
  },
  {
    code: "LM",
    name: "Lion's Mane",
    slug: "lion-s-mane",
    catalogStatus: "active",
    availabilityState: "available",
    availabilityTier: "year-round",
    overview:
      "Lion's mane grows in cascading white clusters and is a year-round favorite for seared steaks, pull-apart patties, and gentle skillet cooking. Its seafood-like character makes it the farm's most-requested centerpiece mushroom.",
    flavor: "Mild, savory, lightly sweet, and reminiscent of crab or scallop when browned.",
    texture: "Tender, pull-apart strands with crisp edges after a hard sear.",
    cookingTips: [
      "Tear into pieces by hand instead of slicing whenever possible.",
      "Press gently in the pan to drive off moisture before adding butter.",
      "Use in patties, steaks, pasta, or simple browned mushroom plates."
    ],
    storage:
      "Keep refrigerated in breathable packaging and cook within about one week of harvest.",
    pairsWith: [
      "lemon",
      "garlic",
      "parsley",
      "butter",
      "eggs",
      "crab-cake style seasoning",
      "potatoes",
      "sparkling apple cider"
    ],
    functionalNote:
      "Lion's mane has been studied for its culinary compounds and is a popular functional mushroom. The farm keeps any functional language cautious and educational; it is offered here as a fresh cooking mushroom.",
    requiresLegalReview: true
  },
  {
    code: "STK",
    name: "Shiitake",
    slug: "shiitake",
    catalogStatus: "active",
    availabilityState: "available",
    availabilityTier: "year-round",
    overview:
      "Shiitake is a year-round staple for customers who want a deeply savory mushroom for broths, noodles, rice, and vegetable dishes. Meaty caps deliver one of the most recognizable umami flavors in the kitchen.",
    flavor: "Rich, savory, and brothy when cooked.",
    texture: "Tender caps with firmer stems that are best reserved for stock.",
    cookingTips: [
      "Remove the tough stems before quick cooking and save them for broth.",
      "Use caps in stir-fries, soups, rice dishes, and noodle bowls.",
      "Give caps room in the pan so they brown rather than steam."
    ],
    storage: "Keep refrigerated in breathable packaging and use while caps are firm.",
    pairsWith: ["soy sauce", "ginger", "rice", "noodles", "broth", "garlic", "green tea"]
  },
  {
    code: "CNT",
    name: "Chestnut",
    slug: "chestnut",
    catalogStatus: "active",
    availabilityState: "available",
    availabilityTier: "year-round",
    overview:
      "Chestnut mushrooms are a year-round staple with firm caps and a nutty, savory depth. They shine in breakfast dishes, on toast, in soups, and across chef menus.",
    flavor: "Nutty, savory, and earthy after browning.",
    texture: "Firm caps with a pleasant bite that holds up to high heat.",
    cookingTips: [
      "Trim the base and cook clusters in a wide pan.",
      "Use in omelets, on toast, in soups, and with roasted vegetables.",
      "Let moisture cook off before seasoning heavily."
    ],
    storage: "Keep refrigerated in breathable packaging and use while clusters are firm.",
    pairsWith: ["eggs", "toast", "thyme", "cream", "onions", "coffee or black tea"]
  },
  // --- In rotation now ------------------------------------------------------
  {
    code: "PO",
    name: "Pink Oyster",
    slug: "pink-oyster",
    catalogStatus: "active",
    availabilityState: "available",
    availabilityTier: "in-rotation-now",
    overview:
      "Pink oysters are vivid, fast-growing fresh mushrooms that bring seasonal color and a richer savory note. They have a short fresh window, so they are best cooked soon after pickup.",
    flavor: "Savory, slightly smoky, and deeper when browned.",
    texture: "Meaty caps and stems that crisp well.",
    cookingTips: [
      "Cook soon after harvest because pink oysters have a shorter shelf life.",
      "Use high heat for tacos, bowls, and roasted vegetable plates.",
      "Expect the bright pink color to soften after cooking."
    ],
    storage: "Keep refrigerated and cook within a few days for best aroma and texture.",
    pairsWith: ["lime", "corn tortillas", "smoked paprika", "beans", "chiles", "cilantro", "hibiscus tea"]
  },
  {
    code: "WO",
    name: "White Oyster",
    slug: "white-oyster",
    catalogStatus: "active",
    availabilityState: "available",
    availabilityTier: "in-rotation-now",
    overview:
      "White oysters are a mild, adaptable fresh kitchen mushroom for everyday cooking. They work well in familiar dishes where customers want specialty texture without an unfamiliar flavor.",
    flavor: "Clean, mild, savory, and friendly to many sauces and cuisines.",
    texture: "Tender with a pleasant chew.",
    cookingTips: [
      "Start with a dry pan or a little oil to encourage browning.",
      "Use in creamy pasta, ramen, rice bowls, and roasted sides.",
      "Save clean trimmings for broth."
    ],
    storage: "Store refrigerated in breathable packaging and use while the clusters are firm.",
    pairsWith: ["garlic", "cream", "miso", "pasta", "rosemary", "rice", "ginger tea"]
  },
  // --- Returning (rotating, not in the current harvest) ---------------------
  {
    code: "KT",
    name: "King Trumpet",
    slug: "king-trumpet",
    catalogStatus: "active",
    availabilityState: "seasonal",
    availabilityTier: "returning",
    overview:
      "King trumpet is a thick-stemmed culinary mushroom built for slicing, scoring, and hard searing. It rotates through the farm's harvest and returns regularly as a meaty, scallop-like centerpiece.",
    flavor: "Mild, savory, and lightly nutty after browning.",
    texture: "Dense, meaty stems with a firm, satisfying bite.",
    cookingTips: [
      "Slice into rounds or lengthwise planks.",
      "Score larger pieces before searing.",
      "Cook until the cut faces are deeply browned."
    ],
    storage: "Keep refrigerated in breathable packaging and use while stems are firm.",
    pairsWith: ["miso", "butter", "garlic", "thyme", "noodles", "black tea"]
  },
  {
    code: "BKO",
    name: "Black King Oyster",
    slug: "black-king-oyster",
    catalogStatus: "active",
    availabilityState: "seasonal",
    availabilityTier: "returning",
    overview:
      "Black king oyster is a dark-capped oyster-style mushroom with a firmer bite and deeper color than the everyday oysters. It rotates through the harvest as a striking, meaty option for searing and grilling. It is a distinct mushroom, not the same as the retired king blue.",
    flavor: "Robust, savory, and earthy with a deeper finish than pale oysters.",
    texture: "Firm, meaty caps that hold their shape over high heat.",
    cookingTips: [
      "Sear hard so the caps brown and firm up.",
      "Slice thick for grilling or roasting.",
      "Pair with bold aromatics that match the deeper flavor."
    ],
    storage: "Keep refrigerated in breathable packaging and use while caps are firm.",
    pairsWith: ["garlic", "black pepper", "soy sauce", "rosemary", "grains", "red miso"]
  },
  {
    code: "PP",
    name: "Pioppino",
    slug: "pioppino",
    catalogStatus: "active",
    availabilityState: "seasonal",
    availabilityTier: "returning",
    overview:
      "Pioppino is a specialty fresh mushroom with small brown caps and slender crisp stems. It rotates through the harvest for chefs and home cooks who love it in pasta, risotto, and brothy dishes.",
    flavor: "Savory, nutty, and lightly peppery.",
    texture: "Small caps and firm stems that hold their shape in sautés.",
    cookingTips: [
      "Cook whole or in small clusters.",
      "Use in pasta, risotto, and brothy dishes.",
      "Brown lightly before adding liquid."
    ],
    storage: "Keep refrigerated and cook promptly while clusters are firm.",
    pairsWith: ["risotto", "parsley", "shallot", "broth", "pasta", "lemon water"]
  },
  {
    code: "MTK",
    name: "Maitake",
    slug: "maitake",
    catalogStatus: "active",
    availabilityState: "seasonal",
    availabilityTier: "returning",
    overview:
      "Maitake, also called hen-of-the-woods, is a frilled specialty mushroom that rotates through the harvest. Torn into petals and roasted hard, it becomes deeply savory with crisp edges.",
    flavor: "Deeply savory and aromatic after roasting or searing.",
    texture: "Frilly edges that crisp well with tender inner pieces.",
    cookingTips: [
      "Tear into petals and roast or sear hard.",
      "Give the pan enough space for the edges to crisp.",
      "Finish with herbs, lemon, or a little butter."
    ],
    storage: "Keep refrigerated in breathable packaging and use while the cluster is firm.",
    pairsWith: ["rosemary", "butter", "lemon", "potatoes", "beans", "sparkling apple cider"],
    functionalNote:
      "Maitake is a popular functional mushroom that has been studied for its culinary compounds. The farm offers it here as a fresh cooking mushroom and keeps any functional language cautious and educational.",
    requiresLegalReview: true
  },
  {
    code: "BCH",
    name: "Beech",
    slug: "beech",
    catalogStatus: "active",
    availabilityState: "seasonal",
    availabilityTier: "returning",
    overview:
      "Beech mushrooms (brown and white) grow in tidy clusters of small, button-topped caps. They rotate through the harvest and are prized for a firm bite and a nutty flavor that develops with thorough cooking.",
    flavor: "Nutty and savory once fully cooked; bitter if undercooked, so cook them through.",
    texture: "Small firm caps with a crisp-tender, slightly crunchy bite.",
    cookingTips: [
      "Separate clusters and cook fully to develop the nutty flavor.",
      "Sauté or roast until lightly browned.",
      "Add to stir-fries, soups, and noodle bowls."
    ],
    storage: "Keep refrigerated in breathable packaging and use while caps are firm.",
    pairsWith: ["butter", "garlic", "soy sauce", "noodles", "spinach", "green tea"]
  },
  {
    code: "NMK",
    name: "Nameko",
    slug: "nameko",
    catalogStatus: "active",
    availabilityState: "seasonal",
    availabilityTier: "returning",
    overview:
      "Nameko is a small amber-capped mushroom with a signature glossy sheen. It rotates through the harvest and is a classic in miso soup, hot pots, and brothy noodle dishes, where its natural body enriches the broth.",
    flavor: "Mild, earthy, and gently savory.",
    texture: "Small caps with a slightly gelatinous, silky surface that thickens broth.",
    cookingTips: [
      "Add to miso soup, hot pot, and brothy noodle dishes.",
      "Rinse gently and cook briefly to keep the silky texture.",
      "Use as a finishing mushroom in soups and donburi."
    ],
    storage: "Keep refrigerated and use quickly while the caps are glossy and firm.",
    pairsWith: ["miso", "dashi", "tofu", "green onion", "soba", "green tea"]
  },
  {
    code: "GEN",
    name: "Golden Enoki",
    slug: "golden-enoki",
    catalogStatus: "active",
    availabilityState: "seasonal",
    availabilityTier: "returning",
    overview:
      "Golden enoki are warm-toned clusters of slender, long-stemmed mushrooms. A rotating specialty crop, they bring a gentle crunch and mild flavor to broths, noodle bowls, and quick sautés.",
    flavor: "Mild, clean, and lightly savory with a touch of sweetness.",
    texture: "Thin stems with a delicate snap when fresh.",
    cookingTips: [
      "Trim the cluster base and separate the strands.",
      "Add near the end of broths and noodle bowls.",
      "Sauté quickly so they keep their gentle crunch."
    ],
    storage: "Keep refrigerated and use while the strands are firm and crisp.",
    pairsWith: ["broth", "noodles", "soy sauce", "green onion", "miso", "green tea"]
  },
  {
    code: "WEN",
    name: "White Enoki",
    slug: "white-enoki",
    catalogStatus: "active",
    availabilityState: "seasonal",
    availabilityTier: "returning",
    overview:
      "White enoki are the familiar pale, delicate clusters of long thin mushrooms. A rotating specialty crop, they are gentle and quick-cooking, perfect for broths, hot pots, and light sautés.",
    flavor: "Mild, clean, and lightly savory.",
    texture: "Thin stems with a delicate snap when fresh.",
    cookingTips: [
      "Trim the base and pull the strands apart.",
      "Add to broths and hot pots near the end of cooking.",
      "Avoid overcooking delicate clusters."
    ],
    storage: "Keep refrigerated and use while the strands are firm and crisp.",
    pairsWith: ["broth", "noodles", "soy sauce", "green onion", "miso", "green tea"]
  },
  {
    code: "CDY",
    name: "Cordyceps",
    slug: "cordyceps",
    catalogStatus: "active",
    availabilityState: "seasonal",
    availabilityTier: "returning",
    overview:
      "Cultivated cordyceps (Cordyceps militaris) grow as vivid orange clusters. A rotating specialty crop, they bring bright color and a savory, faintly sweet note to broths, teas, and rice dishes.",
    flavor: "Savory and mildly sweet with an earthy finish.",
    texture: "Slender firm fingers that soften in liquid.",
    cookingTips: [
      "Steep into broths, stocks, and teas for color and savor.",
      "Add to rice and grain dishes near the end of cooking.",
      "Use small amounts as a finishing accent."
    ],
    storage: "Keep refrigerated and use promptly, or dry for longer storage.",
    pairsWith: ["broth", "rice", "ginger", "chicken or vegetable stock", "honey", "tea"],
    functionalNote:
      "Cordyceps is a popular functional mushroom that has been studied for its compounds. The farm offers it here as a culinary specialty and keeps any functional language cautious and educational.",
    requiresLegalReview: true
  },
  // --- Wholesale only -------------------------------------------------------
  {
    code: "GO",
    name: "Golden Oyster",
    slug: "golden-oyster",
    catalogStatus: "active",
    availabilityState: "wholesale-only",
    availabilityTier: "wholesale-only",
    overview:
      "Golden oysters bring bright color and a delicate, nutty flavor to fast-cooking dishes. The farm supplies golden oysters exclusively to professional kitchens and does not sell them to retail customers.",
    flavor: "Light, nutty, and gently savory.",
    texture: "Delicate caps that are best cooked quickly.",
    cookingTips: [
      "Use medium-high heat and avoid overcrowding the pan.",
      "Add near the end of soups and stir-fries.",
      "Pair with simple aromatics so the mushroom stays bright."
    ],
    storage: "Keep cold and cook quickly; the delicate caps are best within a few days.",
    pairsWith: ["ginger", "green onion", "rice", "eggs", "white beans", "miso", "lemon water"],
    functionalNote:
      "Stewardship note: because Pleurotus citrinopileatus can naturalize and is being watched as a potential invasive species in parts of North America, the farm supplies golden oysters only to professional kitchens that handle them carefully. They are kept out of retail for that reason. Restaurants can inquire for current availability."
  },
  // --- Functional-future (education only; display pieces) -------------------
  {
    code: "RSH",
    name: "Reishi",
    slug: "reishi",
    catalogStatus: "research",
    availabilityState: "coming-soon",
    availabilityTier: "functional-coming-later",
    overview:
      "Reishi is a woody, fan-shaped mushroom the farm grows for future functional products. It is not a fresh cooking mushroom; for now it appears as a display piece at the farm's market tables while product plans and review are completed.",
    flavor: "Bitter and woody; traditionally simmered into teas and broths rather than eaten as a vegetable.",
    texture: "Hard and woody; not a tender culinary mushroom.",
    cookingTips: [
      "Reishi is not sold as a fresh cooking product today.",
      "Traditional preparations simmer dried slices into teas or broths.",
      "Any functional preparation waits on owner-approved, reviewed product copy."
    ],
    storage: "As a future dried/functional product; fresh culinary storage does not apply.",
    pairsWith: ["future functional product", "educational content", "owner-approved labeling"],
    functionalNote:
      "Reishi is grown for future functional products and has been studied for its compounds. The farm shares cautious, educational information only and makes no health claims; functional copy and labeling require legal/business review before any product launches.",
    requiresLegalReview: true
  },
  {
    code: "TT",
    name: "Turkey Tail",
    slug: "turkey-tail",
    catalogStatus: "research",
    availabilityState: "coming-soon",
    availabilityTier: "functional-coming-later",
    overview:
      "Turkey tail is a colorful banded bracket mushroom the farm grows for future functional products. It is not a fresh cooking mushroom; for now it appears as a display piece at the farm's market tables while product plans and review are completed.",
    flavor: "Woody and astringent; traditionally simmered into teas rather than eaten as a vegetable.",
    texture: "Thin, leathery, and woody; not a tender culinary mushroom.",
    cookingTips: [
      "Turkey tail is not sold as a fresh cooking product today.",
      "Traditional preparations simmer it into teas or extracts.",
      "Any functional preparation waits on owner-approved, reviewed product copy."
    ],
    storage: "As a future dried/functional product; fresh culinary storage does not apply.",
    pairsWith: ["future functional product", "educational content", "owner-approved labeling"],
    functionalNote:
      "Turkey tail is grown for future functional products and has been studied for its compounds. The farm shares cautious, educational information only and makes no health claims; functional copy and labeling require legal/business review before any product launches.",
    requiresLegalReview: true
  }
];

export function getSpeciesBySlug(slug: string) {
  return speciesPages.find((species) => species.slug === slug);
}
