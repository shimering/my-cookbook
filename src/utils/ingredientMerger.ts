import type { Ingredient, GroceryCategory, GroceryItem } from '../types';
import { addQuantities, formatQuantity, parseQuantity, scaleQuantity } from './fractionParser';


/**
 * Standardize common culinary units for accurate matching.
 */
export function normalizeUnit(rawUnit: string): string {
  const u = rawUnit.trim().toLowerCase();
  if (!u) return '';

  const unitMap: Record<string, string> = {
    c: 'cup',
    cup: 'cup',
    cups: 'cup',
    tbsp: 'tbsp',
    tablespoon: 'tbsp',
    tablespoons: 'tbsp',
    tbs: 'tbsp',
    tsp: 'tsp',
    teaspoon: 'tsp',
    teaspoons: 'tsp',
    g: 'g',
    gram: 'g',
    grams: 'g',
    kg: 'kg',
    kilogram: 'kg',
    kilograms: 'kg',
    oz: 'oz',
    ounce: 'oz',
    ounces: 'oz',
    lb: 'lb',
    pound: 'lb',
    pounds: 'lb',
    lbs: 'lb',
    ml: 'ml',
    milliliter: 'ml',
    milliliters: 'ml',
    l: 'L',
    liter: 'L',
    liters: 'L',
    pinch: 'pinch',
    pinches: 'pinch',
    clove: 'clove',
    cloves: 'clove',
    slice: 'slice',
    slices: 'slice',
    can: 'can',
    cans: 'can',
    piece: '',
    pieces: '',
    pc: '',
    pcs: '',
  };

  return unitMap[u] || u;
}

/**
 * Cleans ingredient names by removing leading/trailing punctuation, lowercasing,
 * and normalizing plurals or common variants.
 */
export function normalizeIngredientName(rawName: string): string {
  let name = rawName.trim().toLowerCase();
  // Strip extraneous parentheticals like "(melted)", "(diced)", "(softened)"
  name = name.replace(/\s*\([^)]*\)/g, '');
  // Strip culinary state modifiers like "warm", "cold", "melted", "softened"
  name = name.replace(/\b(warm|cold|hot|melted|softened|room temperature|lukewarm|fresh|diced|chopped|minced|sliced|grated)\b/g, '');
  name = name.replace(/[,;.]/g, '').replace(/\s+/g, ' ').trim();

  // Basic plural handling for common items
  if (name.endsWith('ies') && !name.endsWith('berries')) {
    name = name.slice(0, -3) + 'y';
  } else if (name.endsWith('es') && (name.endsWith('tomatoes') || name.endsWith('potatoes'))) {
    name = name.slice(0, -2);
  } else if (name.endsWith('s') && !name.endsWith('ss') && !name.endsWith('couscous') && !name.endsWith('oats')) {
    name = name.slice(0, -1);
  }

  return name;
}

/**
 * Categorizes an ingredient name into grocery store aisle categories.
 */
export function categorizeIngredient(rawName: string): GroceryCategory {
  const name = rawName.toLowerCase();

  // Dairy & Eggs
  const dairyKeywords = [
    'milk', 'butter', 'cream', 'egg', 'cheese', 'cheddar', 'mozzarella', 'parmesan',
    'ricotta', 'yogurt', 'buttermilk', 'sour cream', 'mascarpone', 'ghee', 'half and half'
  ];
  if (dairyKeywords.some(k => name.includes(k))) return 'Dairy & Eggs';

  // Meat & Seafood
  const meatKeywords = [
    'chicken', 'beef', 'pork', 'turkey', 'salmon', 'tuna', 'shrimp', 'fish', 'bacon',
    'sausage', 'steak', 'ham', 'lamb', 'cod', 'prawn', 'crab', 'prosciutto', 'pancetta'
  ];
  if (meatKeywords.some(k => name.includes(k))) return 'Meat & Seafood';

  // Produce
  const produceKeywords = [
    'apple', 'banana', 'berry', 'berries', 'strawberry', 'blueberry', 'raspberry',
    'lemon', 'lime', 'orange', 'onion', 'garlic', 'tomato', 'potato', 'spinach',
    'lettuce', 'kale', 'carrot', 'celery', 'bell pepper', 'pepper', 'cucumber',
    'avocado', 'mushroom', 'broccoli', 'cauliflower', 'zucchini', 'herb', 'basil',
    'parsley', 'cilantro', 'mint', 'rosemary', 'thyme', 'ginger', 'scallion', 'chive'
  ];
  if (produceKeywords.some(k => name.includes(k))) return 'Produce';

  // Spices & Seasonings
  const spiceKeywords = [
    'cinnamon', 'salt', 'pepper', 'black pepper', 'paprika', 'cumin', 'oregano',
    'nutmeg', 'cardamom', 'clove', 'chili powder', 'cayenne', 'vanilla', 'curry powder',
    'turmeric', 'coriander', 'bay leaf', 'allspice', 'seasoning'
  ];
  if (spiceKeywords.some(k => name.includes(k))) return 'Spices & Seasonings';

  // Bakery
  const bakeryKeywords = [
    'bread', 'bun', 'buns', 'tortilla', 'roll', 'bagel', 'pita', 'croissant',
    'crust', 'baguette', 'muffin'
  ];
  if (bakeryKeywords.some(k => name.includes(k))) return 'Bakery';

  // Pantry
  const pantryKeywords = [
    'flour', 'sugar', 'yeast', 'baking powder', 'baking soda', 'chocolate', 'cocoa',
    'oil', 'olive oil', 'vegetable oil', 'pasta', 'spaghetti', 'penne', 'noodles',
    'rice', 'quinoa', 'oats', 'honey', 'maple syrup', 'vinegar', 'soy sauce',
    'broth', 'stock', 'beans', 'lentil', 'canned', 'sauce', 'mayo', 'mustard',
    'ketchup', 'walnut', 'almond', 'pecan', 'peanut', 'cashew', 'chia'
  ];
  if (pantryKeywords.some(k => name.includes(k))) return 'Pantry';

  return 'Household & Other';
}

export interface IngredientInputItem {
  ingredient: Ingredient;
  recipeTitle?: string;
  servingMultiplier?: number;
}

/**
 * Merges a list of ingredients from multiple recipes into a consolidated grocery list.
 * Automatically adds quantities with matching normalized units, preserves unique items,
 * and classifies them into grocery aisles.
 */
export function mergeIngredients(items: IngredientInputItem[]): GroceryItem[] {
  // Key format: `${normalizedName}__${normalizedUnit}`
  const map = new Map<string, {
    displayName: string;
    unit: string;
    amount: number;
    category: GroceryCategory;
    recipeSources: Set<string>;
  }>();

  for (const { ingredient, recipeTitle, servingMultiplier = 1 } of items) {
    if (!ingredient.name) continue;

    const normName = normalizeIngredientName(ingredient.name);
    const normUnit = normalizeUnit(ingredient.unit || '');
    const key = `${normName}__${normUnit}`;

    // Compute scaled amount
    const rawAmt = parseQuantity(ingredient.amount || ingredient.displayFraction || 0);
    const scaled = scaleQuantity(rawAmt, servingMultiplier);

    if (map.has(key)) {
      const existing = map.get(key)!;
      const combined = addQuantities(existing.amount, scaled.amount);
      existing.amount = combined.amount;
      if (recipeTitle) existing.recipeSources.add(recipeTitle);
    } else {
      const category = categorizeIngredient(ingredient.name);
      const sources = new Set<string>();
      if (recipeTitle) sources.add(recipeTitle);

      map.set(key, {
        displayName: ingredient.name.trim(),
        unit: normUnit,
        amount: scaled.amount,
        category,
        recipeSources: sources,
      });
    }
  }

  // Convert map to GroceryItem array
  const result: GroceryItem[] = [];
  let index = 0;

  for (const [_, val] of map.entries()) {
    const displayQty = val.amount > 0 ? formatQuantity(val.amount) : '';
    result.push({
      id: `grocery-${Date.now()}-${index++}`,
      name: val.displayName,
      amount: val.amount,
      unit: val.unit,
      displayQuantity: displayQty,
      category: val.category,
      checked: false,
      isManual: false,
      recipeSources: Array.from(val.recipeSources),
    });
  }

  // Sort by category and then by name
  return result.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.name.localeCompare(b.name);
  });
}
