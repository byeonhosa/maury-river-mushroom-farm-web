import type { Recipe } from "./types";

export const recipes: Recipe[] = [
  {
    title: "Lion's Mane \"Crab Cake\" Style Patties",
    slug: "lions-mane-crab-cake-style-patties",
    summary:
      "Shredded lion's mane, herbs, lemon, and a crisp skillet crust make a satisfying local mushroom centerpiece for sandwiches, salads, or a simple supper plate.",
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
      "2 tablespoons chopped parsley or chives",
      "Oil or butter for pan-frying"
    ],
    steps: [
      "Dry-saute the torn lion's mane in a wide skillet until excess moisture cooks off, then cool slightly.",
      "Mix with binder, breadcrumbs, seasoning, mustard, and lemon.",
      "Shape into patties and chill for 10 minutes if time allows.",
      "Pan-fry until both sides are deeply golden and the centers are hot.",
      "Serve with slaw, lemon, and sparkling apple cider or unsweetened iced tea."
    ],
    storageNote:
      "Cooked patties reheat best in a skillet or toaster oven so the crust returns. Refrigerate leftovers and use within 2 days.",
    relatedProducts: ["fresh-lions-mane", "mixed-gourmet-mushroom-box"]
  },
  {
    title: "Crispy Oyster Mushroom Tacos",
    slug: "crispy-oyster-mushroom-tacos",
    summary:
      "High-heat oyster mushrooms tucked into warm tortillas with lime, cabbage, and a creamy sauce. This is the easiest place to start with blue, pink, golden, or white oysters.",
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
      "Serve in warm tortillas with cabbage, lime, and sauce.",
      "Pair with lime seltzer, hibiscus tea, or a cold agua fresca."
    ],
    storageNote:
      "Cooked oyster mushrooms are best eaten right away, but leftovers can be reheated in a hot skillet before going back into tacos, rice bowls, or eggs.",
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
      "Crispy potatoes finished with mushroom salt for a simple savory side that works with eggs, roast chicken, grilled vegetables, or a market supper.",
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
      "Finish with herbs and a final pinch of mushroom salt.",
      "Serve with lemon water, ginger tea, or a tart shrub-style soda."
    ],
    storageNote:
      "Reheat leftovers in a hot oven or skillet to restore crisp edges.",
    relatedProducts: ["mushroom-salt"]
  },
  {
    title: "Garlic Blue Oyster Mushroom Stir-Fry",
    slug: "garlic-blue-oyster-mushroom-stir-fry",
    summary:
      "A fast skillet dinner that browns oyster mushrooms first, then finishes them with garlic, greens, and a light soy-ginger glaze. Draft recipe for owner testing.",
    mushroomFocus: ["blue-oyster", "white-oyster"],
    prepTime: "15 minutes",
    cookTime: "12 minutes",
    servings: "2 to 3 servings",
    ingredients: [
      "12 oz blue or white oyster mushrooms, torn into wide strips",
      "1 tablespoon neutral oil",
      "2 garlic cloves, thinly sliced",
      "1 teaspoon grated ginger",
      "2 cups chopped greens or snap peas",
      "1 tablespoon soy sauce or tamari",
      "1 teaspoon rice vinegar",
      "Cooked rice or noodles"
    ],
    steps: [
      "Heat a wide skillet or wok until very hot.",
      "Add oil and mushrooms, then cook without stirring until browned on one side.",
      "Add garlic, ginger, and greens; toss until fragrant and just tender.",
      "Finish with soy sauce and rice vinegar, then serve over rice or noodles.",
      "Pair with green tea, cucumber water, or ginger seltzer."
    ],
    storageNote:
      "Store leftovers separately from rice or noodles and reheat quickly in a hot pan. Recipe should be tested with the farm's final harvest size before launch.",
    relatedProducts: ["blue-oyster-mushrooms", "white-oyster-mushrooms"]
  },
  {
    title: "Golden Oyster Mushroom Soup",
    slug: "golden-oyster-mushroom-soup",
    summary:
      "A gentle soup for delicate golden oysters with white beans, onion, herbs, and a clean broth. Draft recipe for seasonal harvest testing.",
    mushroomFocus: ["golden-oyster"],
    prepTime: "15 minutes",
    cookTime: "25 minutes",
    servings: "4 bowls",
    ingredients: [
      "8 oz golden oyster mushrooms, separated into small clusters",
      "1 tablespoon olive oil or butter",
      "1 small onion, diced",
      "1 celery rib, diced",
      "3 cups vegetable or chicken broth",
      "1 cup cooked white beans",
      "1 teaspoon thyme leaves",
      "Lemon juice, salt, and pepper to finish"
    ],
    steps: [
      "Cook onion and celery in oil or butter until soft.",
      "Add broth, beans, and thyme, then simmer for 15 minutes.",
      "Add golden oysters during the final few minutes so the caps stay tender.",
      "Season with lemon, salt, and pepper.",
      "Serve with crusty bread and unsweetened iced tea or sparkling water."
    ],
    storageNote:
      "Refrigerate soup up to 3 days. Golden oysters are delicate, so add a fresh handful when reheating if texture matters. Recipe needs owner testing before publication.",
    relatedProducts: ["golden-oyster-mushrooms"]
  },
  {
    title: "Pink Oyster Rice Bowls",
    slug: "pink-oyster-rice-bowls",
    summary:
      "Crisp-edged pink oysters over rice with quick pickles, greens, and a lime finish. Draft recipe for short-season pink oyster harvests.",
    mushroomFocus: ["pink-oyster"],
    prepTime: "20 minutes",
    cookTime: "12 minutes",
    servings: "2 bowls",
    ingredients: [
      "8 oz pink oyster mushrooms, torn into bite-size pieces",
      "1 tablespoon oil",
      "1/2 teaspoon smoked paprika",
      "Cooked rice",
      "Quick-pickled cucumber or radish",
      "Greens, herbs, or shredded cabbage",
      "Lime wedges",
      "Yogurt sauce, tahini sauce, or salsa"
    ],
    steps: [
      "Heat a wide skillet and brown the pink oysters in oil until crisp at the edges.",
      "Season with smoked paprika and salt.",
      "Build bowls with rice, greens, pickles, and the hot mushrooms.",
      "Finish with lime and sauce.",
      "Serve with mint tea, lime seltzer, or a lightly sweetened lemonade."
    ],
    storageNote:
      "Pink oysters are best cooked soon after harvest. Leftover cooked mushrooms can top eggs or toast the next day. Recipe needs owner testing before publication.",
    relatedProducts: ["pink-oyster-mushrooms"]
  },
  {
    title: "Lion's Mane Steak Bites",
    slug: "lions-mane-steak-bites",
    summary:
      "Thick pieces of lion's mane pressed and seared until browned, then finished with garlic butter and herbs. Draft recipe for customers who want a simple main dish.",
    mushroomFocus: ["lion-s-mane"],
    prepTime: "10 minutes",
    cookTime: "15 minutes",
    servings: "2 servings",
    ingredients: [
      "8 oz fresh lion's mane, cut into thick slabs or large nuggets",
      "1 tablespoon oil",
      "1 tablespoon butter",
      "1 garlic clove, smashed",
      "Thyme or parsley",
      "Salt and black pepper",
      "Lemon wedge"
    ],
    steps: [
      "Heat a heavy skillet over medium-high heat.",
      "Add oil and lion's mane, then press gently with a spatula until moisture releases and the underside browns.",
      "Flip, season, and brown the second side.",
      "Add butter, garlic, and herbs, then baste for the final minute.",
      "Finish with lemon and serve with potatoes, salad, or beans."
    ],
    storageNote:
      "Best served immediately. Leftovers can be sliced into sandwiches or warmed gently in a skillet. Recipe needs owner testing before publication.",
    relatedProducts: ["fresh-lions-mane", "mixed-gourmet-mushroom-box"]
  }
];

export function getRecipeBySlug(slug: string) {
  return recipes.find((recipe) => recipe.slug === slug);
}
