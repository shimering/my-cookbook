/**
 * Utility to map ingredient names and text lines to their matching stylized
 * R2/Cloudflare asset icons.
 */

export interface IngredientIcon {
  key: string;
  url: string;
  fallbackUrl: string;
  label: string;
}

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
    .replace(/[0-9/¼½¾⅓⅔⅛⅜⅝⅞.,:;()\-]/g, ' ')
    .replace(/\b(cup|cups|tbsp|tsp|tablespoon|teaspoon|g|kg|oz|ml|l|pinch|dash|clove|cloves|can|can|pack|slice|slices|large|medium|small|fresh|sweet|pure|extra|virgin|unsalted|salted|grated|shredded|chopped|minced|melted|ground|warm|cold)\b/g, ' ')
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
