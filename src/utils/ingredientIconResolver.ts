/**
 * Utility to map ingredient names and text lines to their matching stylized
 * R2/Cloudflare asset icons or culinary emojis.
 */

export interface IngredientIcon {
  key: string;
  url: string;
  fallbackUrl: string;
  label: string;
}

export interface ResolvedItemIcon {
  type: 'svg' | 'emoji' | 'image';
  value: string;
  url?: string;
  fallbackUrl?: string;
  label: string;
}

export const SVG_INGREDIENT_KEYS = [
  'baking-powder',
  'berries',
  'butter',
  'cheese',
  'chocolate',
  'cinnamon',
  'eggs',
  'flour',
  'garlic',
  'maple-syrup',
  'milk',
  'olive-oil',
  'pasta',
  'salt',
  'sugar',
  'vanilla',
] as const;

export type SvgIngredientKey = (typeof SVG_INGREDIENT_KEYS)[number];

const INGREDIENT_DICTIONARY: Record<string, string[]> = {
  flour: ['flour', 'all-purpose', 'wheat', 'bread flour', 'self-rising', 'maida'],
  sugar: ['sugar', 'granulated', 'brown sugar', 'cane sugar', 'powdered sugar', 'icing sugar', 'sweetener'],
  butter: ['butter', 'ghee', 'margarine'],
  eggs: ['egg', 'eggs', 'yolk', 'whites'],
  milk: ['milk', 'cream', 'buttermilk', 'half and half', 'condensed milk'],
  berries: ['berry', 'berries', 'blueberry', 'blueberries', 'strawberry', 'strawberries', 'raspberry', 'raspberries', 'blackberry', 'blackberries'],
  cinnamon: ['cinnamon', 'nutmeg', 'allspice', 'clove'],
  garlic: ['garlic'],
  pasta: ['pasta', 'spaghetti', 'fettuccine', 'penne', 'rigatoni', 'macaroni', 'noodle', 'noodles', 'linguine'],
  'maple-syrup': ['maple syrup', 'syrup', 'honey', 'agave', 'molasses'],
  salt: ['salt', 'kosher salt', 'sea salt'],
  'baking-powder': ['baking powder', 'baking soda', 'sodium bicarbonate', 'yeast'],
  vanilla: ['vanilla', 'vanilla extract', 'vanilla bean'],
  'olive-oil': ['olive oil', 'oil', 'vegetable oil', 'canola oil', 'sunflower oil', 'sesame oil'],
  chocolate: ['chocolate', 'cocoa', 'cacao', 'choc chip', 'chocolate chips'],
  cheese: ['cheese', 'parmesan', 'cheddar', 'mozzarella', 'feta', 'ricotta', 'pecorino', 'gouda'],
};

export interface IconPresetCategory {
  name: string;
  icons: Array<{ label: string; value: string; isSvg?: boolean }>;
}

export const POPULAR_ICON_PRESETS: IconPresetCategory[] = [
  {
    name: 'Produce',
    icons: [
      { label: 'Apple', value: '🍎' },
      { label: 'Banana', value: '🍌' },
      { label: 'Lemon', value: '🍋' },
      { label: 'Avocado', value: '🥑' },
      { label: 'Tomato', value: '🍅' },
      { label: 'Carrot', value: '🥕' },
      { label: 'Broccoli', value: '🥦' },
      { label: 'Greens', value: '🥬' },
      { label: 'Mushroom', value: '🍄' },
      { label: 'Onion', value: '🧅' },
      { label: 'Potato', value: '🥔' },
      { label: 'Pepper', value: '🫑' },
      { label: 'Cucumber', value: '🥒' },
      { label: 'Strawberry', value: '🍓' },
      { label: 'Blueberry', value: '🫐' },
      { label: 'Grapes', value: '🍇' },
      { label: 'Orange', value: '🍊' },
      { label: 'Corn', value: '🌽' },
      { label: 'Herbs', value: '🌿' },
    ],
  },
  {
    name: 'Dairy & Eggs',
    icons: [
      { label: 'Milk', value: '🥛' },
      { label: 'Cheese', value: '🧀' },
      { label: 'Egg', value: '🥚' },
      { label: 'Butter', value: '🧈' },
      { label: 'Yogurt', value: '🥣' },
    ],
  },
  {
    name: 'Meat & Seafood',
    icons: [
      { label: 'Meat', value: '🥩' },
      { label: 'Chicken', value: '🍗' },
      { label: 'Bacon', value: '🥓' },
      { label: 'Fish', value: '🐟' },
      { label: 'Shrimp', value: '🍤' },
    ],
  },
  {
    name: 'Bakery',
    icons: [
      { label: 'Bread', value: '🍞' },
      { label: 'Croissant', value: '🥐' },
      { label: 'Baguette', value: '🥖' },
      { label: 'Bagel', value: '🥯' },
      { label: 'Tortilla', value: '🫓' },
      { label: 'Cookie', value: '🍪' },
      { label: 'Pancake', value: '🥞' },
      { label: 'Cupcake', value: '🧁' },
    ],
  },
  {
    name: 'Pantry & Spices',
    icons: [
      { label: 'Rice', value: '🍚' },
      { label: 'Pasta', value: '🍝' },
      { label: 'Canned Goods', value: '🥫' },
      { label: 'Olive', value: '🫒' },
      { label: 'Honey', value: '🍯' },
      { label: 'Chocolate', value: '🍫' },
      { label: 'Nuts', value: '🥜' },
      { label: 'Salt', value: '🧂' },
      { label: 'Chili', value: '🌶️' },
      { label: 'Garlic', value: '🧄' },
    ],
  },
  {
    name: 'Beverages & Frozen',
    icons: [
      { label: 'Coffee', value: '☕' },
      { label: 'Tea', value: '🍵' },
      { label: 'Juice', value: '🧃' },
      { label: 'Soda', value: '🥤' },
      { label: 'Water', value: '💧' },
      { label: 'Ice', value: '🧊' },
      { label: 'Ice Cream', value: '🍨' },
    ],
  },
  {
    name: 'Household & Other',
    icons: [
      { label: 'Soap', value: '🧼' },
      { label: 'Paper Towel', value: '🧻' },
      { label: 'Trash Bag', value: '🗑️' },
      { label: 'Sponge', value: '🧽' },
      { label: 'Package', value: '📦' },
      { label: 'Cart', value: '🛒' },
    ],
  },
  {
    name: 'Vector SVG Assets',
    icons: [
      { label: 'Flour', value: 'svg:flour', isSvg: true },
      { label: 'Sugar', value: 'svg:sugar', isSvg: true },
      { label: 'Butter', value: 'svg:butter', isSvg: true },
      { label: 'Eggs', value: 'svg:eggs', isSvg: true },
      { label: 'Milk', value: 'svg:milk', isSvg: true },
      { label: 'Berries', value: 'svg:berries', isSvg: true },
      { label: 'Garlic', value: 'svg:garlic', isSvg: true },
      { label: 'Pasta', value: 'svg:pasta', isSvg: true },
      { label: 'Olive Oil', value: 'svg:olive-oil', isSvg: true },
      { label: 'Chocolate', value: 'svg:chocolate', isSvg: true },
      { label: 'Cheese', value: 'svg:cheese', isSvg: true },
      { label: 'Maple Syrup', value: 'svg:maple-syrup', isSvg: true },
      { label: 'Vanilla', value: 'svg:vanilla', isSvg: true },
      { label: 'Salt', value: 'svg:salt', isSvg: true },
      { label: 'Cinnamon', value: 'svg:cinnamon', isSvg: true },
      { label: 'Baking Powder', value: 'svg:baking-powder', isSvg: true },
    ],
  },
];

const KEYWORD_EMOJI_MAP: Array<{ regex: RegExp; emoji: string }> = [
  // Produce
  { regex: /\b(apple|apples|honeycrisp|fuji|gala)\b/i, emoji: '🍎' },
  { regex: /\b(banana|bananas)\b/i, emoji: '🍌' },
  { regex: /\b(lemon|lemons)\b/i, emoji: '🍋' },
  { regex: /\b(lime|limes)\b/i, emoji: '🍋' },
  { regex: /\b(avocado|avocados)\b/i, emoji: '🥑' },
  { regex: /\b(tomato|tomatoes|roma|cherry tomato)\b/i, emoji: '🍅' },
  { regex: /\b(onion|onions|scallion|scallions)\b/i, emoji: '🧅' },
  { regex: /\b(potato|potatoes|russet)\b/i, emoji: '🥔' },
  { regex: /\b(spinach|lettuce|romaine|kale|greens|salad|cabbage|celery)\b/i, emoji: '🥬' },
  { regex: /\b(carrot|carrots)\b/i, emoji: '🥕' },
  { regex: /\b(pepper|peppers|bell pepper)\b/i, emoji: '🫑' },
  { regex: /\b(broccoli|florets)\b/i, emoji: '🥦' },
  { regex: /\b(cucumber|cucumbers|zucchini)\b/i, emoji: '🥒' },
  { regex: /\b(mushroom|mushrooms|cremini)\b/i, emoji: '🍄' },
  { regex: /\b(basil|cilantro|parsley|rosemary|thyme|mint|herb|herbs)\b/i, emoji: '🌿' },
  { regex: /\b(ginger)\b/i, emoji: '🫚' },
  { regex: /\b(corn)\b/i, emoji: '🌽' },
  { regex: /\b(strawberry|strawberries|berry|berries|blueberry|blueberries|raspberry|blackberry)\b/i, emoji: '🍓' },
  { regex: /\b(grape|grapes)\b/i, emoji: '🍇' },
  { regex: /\b(orange|oranges|citrus)\b/i, emoji: '🍊' },
  { regex: /\b(peach|apricot)\b/i, emoji: '🍑' },
  { regex: /\b(watermelon|melon)\b/i, emoji: '🍉' },
  { regex: /\b(pineapple)\b/i, emoji: '🍍' },
  { regex: /\b(mango)\b/i, emoji: '🥭' },

  // Dairy & Eggs
  { regex: /\b(egg|eggs|yolk)\b/i, emoji: '🥚' },
  { regex: /\b(milk|cream|half and half|buttermilk|oat milk|almond milk)\b/i, emoji: '🥛' },
  { regex: /\b(cheese|cheddar|parmesan|mozzarella|feta|ricotta|gouda)\b/i, emoji: '🧀' },
  { regex: /\b(butter|ghee|margarine)\b/i, emoji: '🧈' },
  { regex: /\b(yogurt)\b/i, emoji: '🥣' },

  // Meat & Seafood
  { regex: /\b(chicken|poultry|turkey|wing|wings)\b/i, emoji: '🍗' },
  { regex: /\b(beef|steak|ground beef|meat|pork|lamb)\b/i, emoji: '🥩' },
  { regex: /\b(bacon|ham|prosciutto|sausage)\b/i, emoji: '🥓' },
  { regex: /\b(fish|salmon|tuna|cod|tilapia|halibut)\b/i, emoji: '🐟' },
  { regex: /\b(shrimp|prawn|lobster|crab|seafood)\b/i, emoji: '🍤' },

  // Bakery
  { regex: /\b(bread|sourdough|loaf|toast)\b/i, emoji: '🍞' },
  { regex: /\b(bagel|bagels)\b/i, emoji: '🥯' },
  { regex: /\b(croissant|croissants)\b/i, emoji: '🥐' },
  { regex: /\b(baguette)\b/i, emoji: '🥖' },
  { regex: /\b(tortilla|tortillas|wrap|pita|naan)\b/i, emoji: '🫓' },
  { regex: /\b(cookie|cookies)\b/i, emoji: '🍪' },
  { regex: /\b(cake|cupcake|muffin)\b/i, emoji: '🧁' },
  { regex: /\b(pancake|pancakes|waffle|waffles)\b/i, emoji: '🥞' },

  // Beverages
  { regex: /\b(coffee|espresso|latte|cappuccino|cold brew)\b/i, emoji: '☕' },
  { regex: /\b(tea|matcha|chai)\b/i, emoji: '🍵' },
  { regex: /\b(juice|cider|lemonade)\b/i, emoji: '🧃' },
  { regex: /\b(soda|sparkling|cola)\b/i, emoji: '🥤' },
  { regex: /\b(wine)\b/i, emoji: '🍷' },
  { regex: /\b(beer)\b/i, emoji: '🍺' },
  { regex: /\b(water)\b/i, emoji: '💧' },

  // Pantry
  { regex: /\b(rice)\b/i, emoji: '🍚' },
  { regex: /\b(pasta|spaghetti|noodle|noodles|penne|rigatoni)\b/i, emoji: '🍝' },
  { regex: /\b(bean|beans|canned|soup|broth)\b/i, emoji: '🥫' },
  { regex: /\b(sauce|soy sauce|vinegar)\b/i, emoji: '🍶' },
  { regex: /\b(oil|olive oil)\b/i, emoji: '🫒' },
  { regex: /\b(honey|maple syrup|syrup)\b/i, emoji: '🍯' },
  { regex: /\b(peanut|almond|nut|nuts|cashew|walnut)\b/i, emoji: '🥜' },
  { regex: /\b(oat|oats|oatmeal|cereal)\b/i, emoji: '🥣' },
  { regex: /\b(chocolate|cocoa)\b/i, emoji: '🍫' },

  // Spices & Seasonings
  { regex: /\b(salt|seasoning)\b/i, emoji: '🧂' },
  { regex: /\b(chili|paprika|cayenne|spicy)\b/i, emoji: '🌶️' },
  { regex: /\b(garlic)\b/i, emoji: '🧄' },

  // Frozen
  { regex: /\b(ice cream|gelato)\b/i, emoji: '🍨' },
  { regex: /\b(popsicle)\b/i, emoji: '🍧' },
  { regex: /\b(frozen|peas|ice)\b/i, emoji: '🧊' },

  // Household
  { regex: /\b(soap|detergent|shampoo|cleaner|dish soap)\b/i, emoji: '🧼' },
  { regex: /\b(paper towel|toilet paper|tissue|napkin|trash bag|trash|bag|bags)\b/i, emoji: '🧻' },
  { regex: /\b(sponge)\b/i, emoji: '🧽' },
  { regex: /\b(trash)\b/i, emoji: '🗑️' },
];

/**
 * Returns the CDN URL for a given ingredient key.
 */
export function getIngredientAssetUrl(key: string): string {
  return `/api/assets/ingredients/${key}.svg`;
}

/**
 * Normalizes text and matches against the stylized culinary ingredient library.
 */
export function getIngredientIcon(rawName: string): IngredientIcon | null {
  if (!rawName || typeof rawName !== 'string') return null;

  // Clean words (strip numbers, units, punctuation)
  const cleaned = rawName
    .toLowerCase()
    .replace(/[0-9/¼½¾⅓⅔⅛⅜⅝⅞.,:;()-]/g, ' ')
    .replace(
      /\b(cup|cups|tbsp|tsp|tablespoon|teaspoon|g|kg|oz|ml|l|pinch|dash|clove|cloves|can|can|pack|slice|slices|large|medium|small|fresh|sweet|pure|extra|virgin|unsalted|salted|grated|shredded|chopped|minced|melted|ground|warm|cold)\b/g,
      ' '
    )
    .trim();

  // 1. Direct key match
  for (const [key, keywords] of Object.entries(INGREDIENT_DICTIONARY)) {
    // Check if whole key is present
    if (cleaned.includes(key)) {
      return {
        key,
        url: getIngredientAssetUrl(key),
        fallbackUrl: `/ingredients/${key}.svg`,
        label: key.replace('-', ' '),
      };
    }

    // Check keywords
    for (const kw of keywords) {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(cleaned)) {
        return {
          key,
          url: getIngredientAssetUrl(key),
          fallbackUrl: `/ingredients/${key}.svg`,
          label: key.replace('-', ' '),
        };
      }
    }
  }

  return null;
}

/**
 * Resolves an item icon with fallback support:
 * 1. Custom icon (user selected emoji or svg:key)
 * 2. SVG Vector icon matching
 * 3. Culinary keyword emoji matching
 * 4. Category fallback emoji
 * 5. General fallback
 */
export function resolveItemIcon(
  rawName: string,
  _category?: string,
  customIcon?: string
): ResolvedItemIcon {
  // 1. Explicit custom icon provided
  if (customIcon && customIcon.trim()) {
    const trimmed = customIcon.trim();

    // Uploaded photo or custom image URL
    if (
      trimmed.startsWith('data:image/') ||
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('blob:')
    ) {
      return {
        type: 'image',
        value: trimmed,
        url: trimmed,
        label: rawName || 'Item image',
      };
    }

    if (trimmed.startsWith('svg:')) {
      const key = trimmed.slice(4);
      return {
        type: 'svg',
        value: key,
        url: getIngredientAssetUrl(key),
        fallbackUrl: `/ingredients/${key}.svg`,
        label: key.replace('-', ' '),
      };
    }
    if ((SVG_INGREDIENT_KEYS as readonly string[]).includes(trimmed)) {
      return {
        type: 'svg',
        value: trimmed,
        url: getIngredientAssetUrl(trimmed),
        fallbackUrl: `/ingredients/${trimmed}.svg`,
        label: trimmed.replace('-', ' '),
      };
    }
    // Text / emoji custom icon
    return {
      type: 'emoji',
      value: trimmed,
      label: rawName || 'Item icon',
    };
  }

  // 2. Try SVG matching via getIngredientIcon
  const svgIcon = getIngredientIcon(rawName);
  if (svgIcon) {
    return {
      type: 'svg',
      value: svgIcon.key,
      url: svgIcon.url,
      fallbackUrl: svgIcon.fallbackUrl,
      label: svgIcon.label,
    };
  }

  // 3. Keyword matching for emoji
  const lowerName = (rawName || '').toLowerCase().trim();
  if (lowerName) {
    for (const entry of KEYWORD_EMOJI_MAP) {
      if (entry.regex.test(lowerName)) {
        return {
          type: 'emoji',
          value: entry.emoji,
          label: rawName || 'Ingredient',
        };
      }
    }
  }

  // 4. Generic fallback icon for anything not on the recognized list (never defaults to an apple)
  return {
    type: 'emoji',
    value: '🛒',
    label: rawName || 'Grocery Item',
  };
}
