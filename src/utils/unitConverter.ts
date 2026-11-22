import { formatQuantity, parseQuantity } from './fractionParser';
import type { Ingredient } from '../types';

export type UnitSystem = 'us' | 'metric';

export interface ConvertedIngredient {
  amount: number;
  unit: string;
  displayQuantity: string;
}

const STORAGE_KEY = 'cookbook_unit_preference';

/**
 * Retrieves the user's preferred unit system from localStorage, defaulting to 'us'.
 */
export function getStoredUnitSystem(): UnitSystem {
  if (typeof window === 'undefined') return 'us';
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    if (val === 'metric' || val === 'us') {
      return val;
    }
  } catch {
    // Fallback if localStorage is inaccessible
  }
  return 'us';
}

/**
 * Saves the user's preferred unit system to localStorage.
 */
export function setStoredUnitSystem(system: UnitSystem): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, system);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Standard ingredient densities (grams per 1 US Cup).
 * Used for precise baking and cooking conversions from volume (cups, tbsp, tsp) to mass (grams).
 */
interface IngredientDensity {
  gramsPerCup: number;
  isLiquid?: boolean;
}

const DENSITY_DATABASE: { keywords: string[]; density: IngredientDensity }[] = [
  // Flours & Starches
  { keywords: ['almond flour', 'almond meal'], density: { gramsPerCup: 112 } },
  { keywords: ['coconut flour'], density: { gramsPerCup: 128 } },
  { keywords: ['whole wheat flour'], density: { gramsPerCup: 130 } },
  { keywords: ['bread flour'], density: { gramsPerCup: 130 } },
  { keywords: ['cake flour'], density: { gramsPerCup: 115 } },
  { keywords: ['cornstarch', 'corn starch', 'corn flour'], density: { gramsPerCup: 128 } },
  { keywords: ['flour', 'all-purpose', 'ap flour', 'white flour'], density: { gramsPerCup: 125 } },

  // Sugars & Sweeteners
  { keywords: ['powdered sugar', 'confectioner', 'icing sugar'], density: { gramsPerCup: 120 } },
  { keywords: ['brown sugar', 'muscovado', 'turbinado'], density: { gramsPerCup: 215 } },
  { keywords: ['granulated sugar', 'white sugar', 'cane sugar', 'sugar'], density: { gramsPerCup: 200 } },
  { keywords: ['honey', 'molasses', 'agave', 'corn syrup', 'maple syrup'], density: { gramsPerCup: 320, isLiquid: true } },

  // Dairy & Fats
  { keywords: ['butter', 'margarine', 'ghee'], density: { gramsPerCup: 227 } }, // 1 stick = 1/2 cup = 113.5g
  { keywords: ['cream cheese'], density: { gramsPerCup: 225 } },
  { keywords: ['sour cream', 'yogurt', 'greek yogurt'], density: { gramsPerCup: 240 } },
  { keywords: ['peanut butter', 'almond butter', 'nutella'], density: { gramsPerCup: 250 } },
  { keywords: ['heavy cream', 'whipping cream', 'half and half'], density: { gramsPerCup: 240, isLiquid: true } },
  { keywords: ['buttermilk'], density: { gramsPerCup: 245, isLiquid: true } },
  { keywords: ['milk', 'whole milk', 'skim milk', 'oat milk', 'almond milk', 'soy milk'], density: { gramsPerCup: 240, isLiquid: true } },
  { keywords: ['oil', 'olive oil', 'vegetable oil', 'canola oil', 'coconut oil', 'sesame oil'], density: { gramsPerCup: 218, isLiquid: true } },

  // Water & Broths
  { keywords: ['water', 'broth', 'stock', 'wine', 'vinegar', 'juice', 'coffee', 'tea'], density: { gramsPerCup: 240, isLiquid: true } },

  // Seasonings & Leaveners
  { keywords: ['kosher salt', 'sea salt', 'table salt', 'salt'], density: { gramsPerCup: 288 } }, // 1 tsp = ~6g
  { keywords: ['baking powder'], density: { gramsPerCup: 192 } }, // 1 tsp = 4g, 1 tbsp = 12g
  { keywords: ['baking soda', 'bicarbonate'], density: { gramsPerCup: 240 } }, // 1 tsp = 5g
  { keywords: ['active dry yeast', 'instant yeast', 'yeast'], density: { gramsPerCup: 150 } }, // 2.25 tsp = 7g
  { keywords: ['cocoa powder', 'cacao powder'], density: { gramsPerCup: 100 } },
  {
    keywords: [
      'cinnamon',
      'nutmeg',
      'paprika',
      'cumin',
      'oregano',
      'chili powder',
      'pepper flakes',
      'black pepper',
      'garlic powder',
      'onion powder',
    ],
    density: { gramsPerCup: 128 }, // 1 tsp = ~2.7g
  },
  { keywords: ['vanilla extract', 'extract'], density: { gramsPerCup: 240, isLiquid: true } },

  // Baking Extras & Produce
  { keywords: ['chocolate chips', 'chocolate chunks', 'cacao nibs'], density: { gramsPerCup: 175 } },
  { keywords: ['rolled oats', 'quick oats', 'oats'], density: { gramsPerCup: 90 } },
  { keywords: ['strawberries', 'blueberries', 'raspberries', 'berries', 'blackberries'], density: { gramsPerCup: 150 } },
  { keywords: ['walnuts', 'pecans', 'almonds', 'peanuts', 'cashews', 'nuts'], density: { gramsPerCup: 120 } },
  { keywords: ['parmesan cheese', 'cheddar cheese', 'mozzarella cheese', 'cheese', 'parmigiano'], density: { gramsPerCup: 100 } },
  { keywords: ['spaghetti', 'pasta', 'noodles', 'penne', 'macaroni'], density: { gramsPerCup: 100 } },
  { keywords: ['rice', 'jasmine rice', 'basmati rice'], density: { gramsPerCup: 190 } },
  { keywords: ['breadcrumbs', 'panko'], density: { gramsPerCup: 110 } },
];

/**
 * Finds density information for a given ingredient name.
 */
function findDensity(ingredientName: string): IngredientDensity {
  const normalized = ingredientName.toLowerCase().trim();

  for (const entry of DENSITY_DATABASE) {
    for (const keyword of entry.keywords) {
      if (normalized.includes(keyword)) {
        return entry.density;
      }
    }
  }

  // Fallback heuristic: check if common liquid words are in name
  const isLiquid = /water|milk|juice|oil|vinegar|broth|stock|sauce|wine|extract|syrup|cream/.test(normalized);
  return {
    gramsPerCup: isLiquid ? 240 : 135,
    isLiquid,
  };
}

/**
 * Standardizes unit names to canonical keys.
 */
function normalizeUnit(unit: string): string {
  const u = unit.toLowerCase().trim().replace(/\.$/, '');
  switch (u) {
    case 'c':
    case 'cup':
    case 'cups':
      return 'cup';
    case 'tbsp':
    case 'tbs':
    case 'tablespoon':
    case 'tablespoons':
      return 'tbsp';
    case 'tsp':
    case 'teaspoon':
    case 'teaspoons':
      return 'tsp';
    case 'oz':
    case 'ounce':
    case 'ounces':
      return 'oz';
    case 'fl oz':
    case 'fluid ounce':
    case 'fluid ounces':
      return 'fl oz';
    case 'lb':
    case 'lbs':
    case 'pound':
    case 'pounds':
      return 'lb';
    case 'pt':
    case 'pint':
    case 'pints':
      return 'pt';
    case 'qt':
    case 'quart':
    case 'quarts':
      return 'qt';
    case 'g':
    case 'gram':
    case 'grams':
      return 'g';
    case 'kg':
    case 'kilogram':
    case 'kilograms':
      return 'kg';
    case 'ml':
    case 'milliliter':
    case 'milliliters':
      return 'ml';
    case 'l':
    case 'liter':
    case 'liters':
      return 'l';
    default:
      return u;
  }
}

/**
 * Checks if a unit is already metric.
 */
export function isMetricUnit(unit: string): boolean {
  const norm = normalizeUnit(unit);
  return norm === 'g' || norm === 'kg' || norm === 'ml' || norm === 'l';
}

/**
 * Checks if a unit is US customary volume or weight.
 */
export function isUsUnit(unit: string): boolean {
  const norm = normalizeUnit(unit);
  return ['cup', 'tbsp', 'tsp', 'oz', 'fl oz', 'lb', 'pt', 'qt'].includes(norm);
}

/**
 * Formats a metric quantity cleanly (avoids awkward decimals like 240.1873g).
 */
function formatMetricQuantity(val: number, unit: string): { amount: number; display: string } {
  if (unit === 'kg' || unit === 'l') {
    const rounded = Math.round(val * 10) / 10;
    return {
      amount: rounded,
      display: rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1),
    };
  }

  // Grams and Milliliters
  if (val >= 100) {
    // Round to nearest 5 for clean kitchen scaling (e.g. 227g -> 225g or 230g)
    const rounded = Math.round(val / 5) * 5;
    return {
      amount: rounded,
      display: rounded.toString(),
    };
  }

  if (val >= 10) {
    const rounded = Math.round(val);
    return {
      amount: rounded,
      display: rounded.toString(),
    };
  }

  if (val >= 1) {
    const rounded = Math.round(val * 10) / 10;
    return {
      amount: rounded,
      display: rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1),
    };
  }

  const rounded = Math.round(val * 10) / 10 || 0.5;
  return {
    amount: rounded,
    display: rounded.toString(),
  };
}

/**
 * Converts an ingredient from US Customary to Metric (Grams & Milliliters).
 */
function convertUsToMetric(
  name: string,
  baseAmount: number,
  normUnit: string
): { amount: number; unit: string; display: string } {
  const density = findDensity(name);

  // 1. Weight Units
  if (normUnit === 'oz') {
    // 1 oz = 28.3495 grams
    const grams = baseAmount * 28.35;
    const fmt = formatMetricQuantity(grams, 'g');
    return { amount: fmt.amount, unit: 'g', display: fmt.display };
  }

  if (normUnit === 'lb') {
    // 1 lb = 453.592 grams
    const grams = baseAmount * 453.6;
    if (grams >= 1000) {
      const kg = grams / 1000;
      const fmt = formatMetricQuantity(kg, 'kg');
      return { amount: fmt.amount, unit: 'kg', display: fmt.display };
    }
    const fmt = formatMetricQuantity(grams, 'g');
    return { amount: fmt.amount, unit: 'g', display: fmt.display };
  }

  // 2. Volume Units (Cups & Spoons)
  let cupsEquivalent = 0;
  if (normUnit === 'cup') {
    cupsEquivalent = baseAmount;
  } else if (normUnit === 'tbsp') {
    cupsEquivalent = baseAmount / 16;
  } else if (normUnit === 'tsp') {
    cupsEquivalent = baseAmount / 48;
  } else if (normUnit === 'fl oz') {
    cupsEquivalent = baseAmount / 8;
  } else if (normUnit === 'pt') {
    cupsEquivalent = baseAmount * 2;
  } else if (normUnit === 'qt') {
    cupsEquivalent = baseAmount * 4;
  }

  // Liquid conversion preference (e.g. milk, water, broth -> ml)
  if (density.isLiquid) {
    // 1 US cup = 240 ml
    const ml = cupsEquivalent * 240;
    if (ml >= 1000) {
      const liters = ml / 1000;
      const fmt = formatMetricQuantity(liters, 'l');
      return { amount: fmt.amount, unit: 'l', display: fmt.display };
    }
    const fmt = formatMetricQuantity(ml, 'ml');
    return { amount: fmt.amount, unit: 'ml', display: fmt.display };
  }

  // Dry baking ingredient conversion (cups/spoons -> grams!)
  const grams = cupsEquivalent * density.gramsPerCup;
  if (grams >= 1500) {
    const kg = grams / 1000;
    const fmt = formatMetricQuantity(kg, 'kg');
    return { amount: fmt.amount, unit: 'kg', display: fmt.display };
  }
  const fmt = formatMetricQuantity(grams, 'g');
  return { amount: fmt.amount, unit: 'g', display: fmt.display };
}

/**
 * Converts an ingredient from Metric (Grams & Milliliters) to US Customary (Cups & Spoons).
 */
function convertMetricToUs(
  name: string,
  baseAmount: number,
  normUnit: string
): { amount: number; unit: string; display: string } {
  const density = findDensity(name);

  // Volume: ml / l to cups / spoons
  if (normUnit === 'ml' || normUnit === 'l') {
    const totalMl = normUnit === 'l' ? baseAmount * 1000 : baseAmount;

    // Small amounts (<= 15ml) -> teaspoons or tablespoons
    if (totalMl <= 5) {
      const tsp = totalMl / 5;
      return { amount: tsp, unit: 'tsp', display: formatQuantity(tsp) };
    }
    if (totalMl <= 45) {
      const tbsp = totalMl / 15;
      return { amount: tbsp, unit: 'tbsp', display: formatQuantity(tbsp) };
    }

    // 1 US cup = 240 ml
    const cups = totalMl / 240;
    return { amount: cups, unit: 'cup', display: formatQuantity(cups) };
  }

  // Mass: g / kg to cups / spoons / oz / lb
  const totalGrams = normUnit === 'kg' ? baseAmount * 1000 : baseAmount;

  // If pasta or meat, standard US is oz/lbs
  if (/pasta|spaghetti|macaroni|meat|chicken|beef|pork|fish|steak/.test(name.toLowerCase())) {
    if (totalGrams >= 450) {
      const lbs = totalGrams / 453.6;
      return { amount: lbs, unit: 'lb', display: formatQuantity(lbs) };
    }
    const oz = totalGrams / 28.35;
    return { amount: oz, unit: 'oz', display: formatQuantity(oz) };
  }

  // Convert grams to cups using density
  const cups = totalGrams / density.gramsPerCup;

  if (cups < 0.0625) {
    // Less than 1 tbsp -> teaspoons
    const tsp = cups * 48;
    return { amount: tsp, unit: 'tsp', display: formatQuantity(tsp) };
  }

  if (cups < 0.25) {
    // Less than 1/4 cup -> tablespoons
    const tbsp = cups * 16;
    return { amount: tbsp, unit: 'tbsp', display: formatQuantity(tbsp) };
  }

  return { amount: cups, unit: 'cup', display: formatQuantity(cups) };
}

/**
 * Main conversion engine: converts an ingredient to the target unit system,
 * adjusting for the active servings multiplier.
 */
export function convertIngredient(
  ingredient: Ingredient,
  targetSystem: UnitSystem,
  servingsMultiplier: number = 1
): ConvertedIngredient {
  const multiplier = servingsMultiplier > 0 ? servingsMultiplier : 1;
  const rawAmount = (ingredient.amount || parseQuantity(ingredient.displayFraction).valueOf() || 1) * multiplier;
  const normUnit = normalizeUnit(ingredient.unit || '');

  // Count / non-convertible items (e.g. 2 eggs, 6 cloves garlic, 1 pinch)
  if (!normUnit || /^(clove|cloves|piece|pieces|slice|slices|pinch|pinches|dash|can|cans|sprig|sprigs|leaf|leaves|stalk|stalks|head|heads|pkg|package|packages)$/.test(normUnit)) {
    const scaledDisplay = formatQuantity(rawAmount);
    return {
      amount: rawAmount,
      unit: ingredient.unit,
      displayQuantity: scaledDisplay || rawAmount.toString(),
    };
  }

  // Target = US Customary
  if (targetSystem === 'us') {
    // If already US, just scale
    if (isUsUnit(normUnit)) {
      const scaled = rawAmount;
      return {
        amount: scaled,
        unit: ingredient.unit,
        displayQuantity: formatQuantity(scaled),
      };
    }

    // Convert Metric -> US
    if (isMetricUnit(normUnit)) {
      const converted = convertMetricToUs(ingredient.name, rawAmount, normUnit);
      return {
        amount: converted.amount,
        unit: converted.unit,
        displayQuantity: converted.display,
      };
    }

    // Unknown unit: scale as-is
    return {
      amount: rawAmount,
      unit: ingredient.unit,
      displayQuantity: formatQuantity(rawAmount),
    };
  }

  // Target = Metric (Grams & Milliliters)
  if (targetSystem === 'metric') {
    // If already Metric, just scale
    if (isMetricUnit(normUnit)) {
      const fmt = formatMetricQuantity(rawAmount, normUnit);
      return {
        amount: fmt.amount,
        unit: normUnit,
        displayQuantity: fmt.display,
      };
    }

    // Convert US -> Metric
    if (isUsUnit(normUnit)) {
      const converted = convertUsToMetric(ingredient.name, rawAmount, normUnit);
      return {
        amount: converted.amount,
        unit: converted.unit,
        displayQuantity: converted.display,
      };
    }

    // Unknown unit: scale as-is
    return {
      amount: rawAmount,
      unit: ingredient.unit,
      displayQuantity: formatQuantity(rawAmount),
    };
  }

  return {
    amount: rawAmount,
    unit: ingredient.unit,
    displayQuantity: formatQuantity(rawAmount),
  };
}
