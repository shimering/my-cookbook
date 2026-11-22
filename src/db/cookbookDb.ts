import Dexie, { type Table } from 'dexie';
import type { Recipe, PlannedMeal, GroceryItem } from '../types';

export class CookbookDatabase extends Dexie {
  recipes!: Table<Recipe, string>;
  mealPlans!: Table<PlannedMeal, string>;
  groceryItems!: Table<GroceryItem, string>;

  constructor() {
    super('MyCookbookDB');
    this.version(1).stores({
      recipes: 'id, title, isFavorite, createdAt, updatedAt, *categories',
      mealPlans: 'id, date, slot, recipeId',
      groceryItems: 'id, name, category, checked, isManual',
    });
  }
}

export const db = new CookbookDatabase();

// Default seed recipes matching the Strawberry Milk & Butter mockups
export const SEED_RECIPES: Recipe[] = [
  {
    id: 'recipe-cinnamon-rolls',
    title: 'Cinnamon Rolls',
    description: 'Soft, pillowy bakery-style cinnamon rolls with warm brown sugar filling and velvety cream cheese glaze.',
    heroImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=80',
    prepTimeMinutes: 30,
    cookTimeMinutes: 25,
    servings: 8,
    categories: ['Desserts', 'Breakfast'],
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ingredients: [
      { id: 'cr-1', name: 'All-Purpose Flour', amount: 3, unit: 'cup', displayFraction: '3', section: 'For the Dough' },
      { id: 'cr-2', name: 'Active Dry Yeast', amount: 2.25, unit: 'tsp', displayFraction: '2 1/4', section: 'For the Dough' },
      { id: 'cr-3', name: 'Warm Whole Milk', amount: 1, unit: 'cup', displayFraction: '1', section: 'For the Dough' },
      { id: 'cr-4', name: 'Granulated Sugar', amount: 0.33, unit: 'cup', displayFraction: '1/3', section: 'For the Dough' },
      { id: 'cr-5', name: 'Unsalted Butter', amount: 0.33, unit: 'cup', displayFraction: '1/3', section: 'For the Dough' },
      { id: 'cr-6', name: 'Egg', amount: 1, unit: '', displayFraction: '1', section: 'For the Dough' },
      { id: 'cr-7', name: 'Salt', amount: 0.5, unit: 'tsp', displayFraction: '1/2', section: 'For the Dough' },
      { id: 'cr-8', name: 'Butter (softened)', amount: 0.33, unit: 'cup', displayFraction: '1/3', section: 'For the Filling' },
      { id: 'cr-9', name: 'Brown Sugar', amount: 0.75, unit: 'cup', displayFraction: '3/4', section: 'For the Filling' },
      { id: 'cr-10', name: 'Ground Cinnamon', amount: 2, unit: 'tbsp', displayFraction: '2', section: 'For the Filling' },
      { id: 'cr-11', name: 'Cream Cheese', amount: 4, unit: 'oz', displayFraction: '4', section: 'For the Glaze' },
      { id: 'cr-12', name: 'Powdered Sugar', amount: 1, unit: 'cup', displayFraction: '1', section: 'For the Glaze' },
      { id: 'cr-13', name: 'Vanilla Extract', amount: 1, unit: 'tsp', displayFraction: '1', section: 'For the Glaze' },
    ],
    steps: [
      { id: 'crs-1', stepNumber: 1, instruction: 'Warm the milk and whisk in yeast with a pinch of sugar. Let bloom for 5 minutes until frothy.' },
      { id: 'crs-2', stepNumber: 2, instruction: 'In a stand mixer or bowl, combine milk mixture, butter, sugar, egg, salt, and flour until a smooth, supple dough forms.' },
      { id: 'crs-3', stepNumber: 3, instruction: 'Cover dough with a damp tea towel and let rise in a warm spot for 1 hour until doubled in size.' },
      { id: 'crs-4', stepNumber: 4, instruction: 'Roll dough into a 12x18 inch rectangle. Spread softened butter evenly, then sprinkle generously with brown sugar and cinnamon.' },
      { id: 'crs-5', stepNumber: 5, instruction: 'Roll up tightly from the long edge, slice into 8 even rolls with unflavored dental floss or a serrated knife, and arrange in a greased baking pan.' },
      { id: 'crs-6', stepNumber: 6, instruction: 'Bake at 350°F (175°C) for 22-25 minutes until lightly golden. Beat glaze ingredients together and slather over warm rolls.' },
    ],
  },
  {
    id: 'recipe-berry-pancakes',
    title: 'Berry Pancakes',
    description: 'Fluffy golden buttermilk pancakes stacked high and topped with sweet summer berries and warm maple syrup.',
    heroImage: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=1000&q=80',
    prepTimeMinutes: 15,
    cookTimeMinutes: 15,
    servings: 4,
    categories: ['Breakfast', 'Quick Meals'],
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ingredients: [
      { id: 'bp-1', name: 'All-Purpose Flour', amount: 2, unit: 'cup', displayFraction: '2', section: 'For the Batter' },
      { id: 'bp-2', name: 'Granulated Sugar', amount: 2, unit: 'tbsp', displayFraction: '2', section: 'For the Batter' },
      { id: 'bp-3', name: 'Baking Powder', amount: 2, unit: 'tsp', displayFraction: '2', section: 'For the Batter' },
      { id: 'bp-4', name: 'Salt', amount: 0.5, unit: 'tsp', displayFraction: '1/2', section: 'For the Batter' },
      { id: 'bp-5', name: 'Whole Milk', amount: 1.5, unit: 'cup', displayFraction: '1 1/2', section: 'For the Batter' },
      { id: 'bp-6', name: 'Eggs', amount: 2, unit: '', displayFraction: '2', section: 'For the Batter' },
      { id: 'bp-7', name: 'Melted Butter', amount: 3, unit: 'tbsp', displayFraction: '3', section: 'For the Batter' },
      { id: 'bp-8', name: 'Fresh Strawberries', amount: 1, unit: 'cup', displayFraction: '1', section: 'Toppings' },
      { id: 'bp-9', name: 'Blueberries', amount: 0.5, unit: 'cup', displayFraction: '1/2', section: 'Toppings' },
      { id: 'bp-10', name: 'Maple Syrup', amount: 0.25, unit: 'cup', displayFraction: '1/4', section: 'Toppings' },
    ],
    steps: [
      { id: 'bps-1', stepNumber: 1, instruction: 'Whisk dry ingredients (flour, sugar, baking powder, and salt) together in a mixing bowl.' },
      { id: 'bps-2', stepNumber: 2, instruction: 'Whisk wet ingredients (milk, eggs, melted butter) separately, then fold gently into the flour mixture until just combined.' },
      { id: 'bps-3', stepNumber: 3, instruction: 'Heat a buttered skillet or griddle over medium heat. Ladle 1/4 cup batter for each pancake.' },
      { id: 'bps-4', stepNumber: 4, instruction: 'Cook until surface bubbles pop and edges look set (about 2-3 mins). Flip and cook 1-2 minutes more until golden.' },
      { id: 'bps-5', stepNumber: 5, instruction: 'Stack high on plates, garnish with fresh strawberries, blueberries, and drizzle generously with pure maple syrup.' },
    ],
  },
  {
    id: 'recipe-garlic-pasta',
    title: 'Garlic Pasta',
    description: 'Classic comforting spaghetti aglio e olio tossed with golden toasted garlic slices, fragrant parsley, and parmigiano.',
    heroImage: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1000&q=80',
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    servings: 2,
    categories: ['Quick Meals', 'Dinner'],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ingredients: [
      { id: 'gp-1', name: 'Spaghetti Pasta', amount: 8, unit: 'oz', displayFraction: '8' },
      { id: 'gp-2', name: 'Garlic Cloves', amount: 6, unit: 'clove', displayFraction: '6' },
      { id: 'gp-3', name: 'Extra Virgin Olive Oil', amount: 0.33, unit: 'cup', displayFraction: '1/3' },
      { id: 'gp-4', name: 'Red Pepper Flakes', amount: 0.5, unit: 'tsp', displayFraction: '1/2' },
      { id: 'gp-5', name: 'Fresh Parsley', amount: 0.25, unit: 'cup', displayFraction: '1/4' },
      { id: 'gp-6', name: 'Parmesan Cheese', amount: 0.5, unit: 'cup', displayFraction: '1/2' },
      { id: 'gp-7', name: 'Salt', amount: 1, unit: 'tsp', displayFraction: '1' },
    ],
    steps: [
      { id: 'gps-1', stepNumber: 1, instruction: 'Bring a pot of generously salted water to a rolling boil. Add spaghetti and cook until al dente.' },
      { id: 'gps-2', stepNumber: 2, instruction: 'Meanwhile, in a wide skillet, heat olive oil and thinly sliced garlic over medium-low heat until garlic turns a delicate pale golden color.' },
      { id: 'gps-3', stepNumber: 3, instruction: 'Add red pepper flakes and 1/3 cup of starchy pasta water to halt the garlic from over-browning.' },
      { id: 'gps-4', stepNumber: 4, instruction: 'Transfer cooked pasta straight into the garlic oil skillet. Toss vigorously over heat until an emulsified glossy sauce clings to the noodles.' },
      { id: 'gps-5', stepNumber: 5, instruction: 'Remove from heat, toss in finely chopped parsley and freshly grated parmesan, and serve immediately.' },
    ],
  },
];

/**
 * Initializes database with seed recipes if empty.
 */
export async function initializeDatabase(): Promise<void> {
  const count = await db.recipes.count();
  if (count === 0) {
    await db.recipes.bulkAdd(SEED_RECIPES);
  }
}
