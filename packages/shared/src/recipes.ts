import type { Recipe } from "./types";

export const recipes: Recipe[] = [
  {
    title: "Lion's Mane \"Crab Cake\" Style Patties",
    slug: "lions-mane-crab-cake-style-patties",
    summary:
      "Shredded lion's mane, herbs, and a crisp skillet crust make a satisfying local mushroom centerpiece.",
    mushroomFocus: ["lion-s-mane"],
    prepTime: "20 minutes",
    cookTime: "12 minutes",
    servings: "4 patties",
    ingredients: [
      "8 oz fresh lion's mane, torn into strands",
      "1 egg or preferred binder",
      "1/3 cup breadcrumbs",
      "1 tablespoon mayonnaise or yogurt",
      "1 teaspoon Dijon mustard",
      "1 teaspoon lemon juice",
      "1 teaspoon seafood-style seasoning",
      "Oil or butter for pan-frying"
    ],
    steps: [
      "Dry-saute the torn lion's mane until excess moisture cooks off, then cool slightly.",
      "Mix with binder, breadcrumbs, seasoning, mustard, and lemon.",
      "Shape into patties and chill for 10 minutes if time allows.",
      "Pan-fry until both sides are deeply golden and the centers are hot."
    ],
    storageNote:
      "Cooked patties reheat best in a skillet or toaster oven so the crust returns.",
    relatedProducts: ["fresh-lions-mane", "mixed-gourmet-mushroom-box"]
  },
  {
    title: "Crispy Oyster Mushroom Tacos",
    slug: "crispy-oyster-mushroom-tacos",
    summary:
      "High-heat oyster mushrooms tucked into warm tortillas with lime, cabbage, and a creamy sauce.",
    mushroomFocus: ["blue-oyster", "golden-oyster", "pink-oyster", "white-oyster"],
    prepTime: "15 minutes",
    cookTime: "15 minutes",
    servings: "6 tacos",
    ingredients: [
      "12 oz oyster mushrooms, torn into bite-size pieces",
      "1 tablespoon oil",
      "1 teaspoon smoked paprika",
      "1/2 teaspoon cumin",
      "Salt to taste",
      "Corn tortillas",
      "Shredded cabbage",
      "Lime wedges",
      "Crema, yogurt sauce, or salsa"
    ],
    steps: [
      "Heat a wide skillet until hot and add oil.",
      "Add mushrooms in a single layer and cook undisturbed until browned.",
      "Season with smoked paprika, cumin, and salt, then toss until crisp-tender.",
      "Serve in warm tortillas with cabbage, lime, and sauce."
    ],
    storageNote:
      "Cooked oyster mushrooms are best eaten right away, but leftovers can be reheated in a hot skillet.",
    relatedProducts: [
      "blue-oyster-mushrooms",
      "golden-oyster-mushrooms",
      "pink-oyster-mushrooms",
      "white-oyster-mushrooms",
      "mixed-gourmet-mushroom-box"
    ]
  },
  {
    title: "Mushroom Salt Roasted Potatoes",
    slug: "mushroom-salt-roasted-potatoes",
    summary:
      "Crispy potatoes finished with mushroom salt for a simple savory side.",
    mushroomFocus: [],
    prepTime: "10 minutes",
    cookTime: "35 minutes",
    servings: "4 servings",
    ingredients: [
      "1.5 lb potatoes, cut into bite-size pieces",
      "2 tablespoons olive oil",
      "1 teaspoon mushroom salt, plus more to finish",
      "Black pepper",
      "Chopped parsley or chives"
    ],
    steps: [
      "Heat oven to 425 F.",
      "Toss potatoes with olive oil, mushroom salt, and pepper.",
      "Roast on a sheet pan until crisp and browned, turning once.",
      "Finish with herbs and a final pinch of mushroom salt."
    ],
    storageNote:
      "Reheat leftovers in a hot oven or skillet to restore crisp edges.",
    relatedProducts: ["mushroom-salt"]
  }
];

export function getRecipeBySlug(slug: string) {
  return recipes.find((recipe) => recipe.slug === slug);
}
