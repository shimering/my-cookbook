import { describe, it, expect } from 'vitest';
import {
  getIngredientIcon,
  getIngredientAssetUrl,
  resolveItemIcon,
} from '../ingredientIconResolver';

describe('ingredientIconResolver', () => {
  it('resolves common ingredients to their canonical asset keys', () => {
    expect(getIngredientIcon('2 cups All-Purpose Flour')?.key).toBe('flour');
    expect(getIngredientIcon('1/2 cup sweet blueberries')?.key).toBe('berries');
    expect(getIngredientIcon('1 cup granulated sugar')?.key).toBe('sugar');
    expect(getIngredientIcon('2 tbsp Unsalted Butter')?.key).toBe('butter');
    expect(getIngredientIcon('2 large eggs')?.key).toBe('eggs');
    expect(getIngredientIcon('1 cup whole milk')?.key).toBe('milk');
    expect(getIngredientIcon('1 tsp ground cinnamon')?.key).toBe('cinnamon');
    expect(getIngredientIcon('3 cloves fresh garlic, minced')?.key).toBe('garlic');
    expect(getIngredientIcon('250g rigatoni pasta')?.key).toBe('pasta');
    expect(getIngredientIcon('1/4 cup pure maple syrup')?.key).toBe('maple-syrup');
    expect(getIngredientIcon('1/2 tsp kosher salt')?.key).toBe('salt');
    expect(getIngredientIcon('1 tsp baking powder')?.key).toBe('baking-powder');
    expect(getIngredientIcon('1 tsp vanilla extract')?.key).toBe('vanilla');
    expect(getIngredientIcon('2 tbsp extra virgin olive oil')?.key).toBe('olive-oil');
    expect(getIngredientIcon('100g dark chocolate chips')?.key).toBe('chocolate');
    expect(getIngredientIcon('1/2 cup grated parmesan cheese')?.key).toBe('cheese');
  });

  it('generates appropriate CDN asset URLs', () => {
    const icon = getIngredientIcon('All-Purpose Flour');
    expect(icon).not.toBeNull();
    expect(icon?.url).toContain('/api/assets/ingredients/flour.svg');
    expect(icon?.fallbackUrl).toBe('/ingredients/flour.svg');
    expect(getIngredientAssetUrl('butter')).toContain('/api/assets/ingredients/butter.svg');
  });

  it('returns null or fallback for unrecognized ingredient names in getIngredientIcon', () => {
    expect(getIngredientIcon('1 pack mysterious space powder')).toBeNull();
  });

  describe('resolveItemIcon', () => {
    it('resolves SVG vector assets when matched', () => {
      const flourIcon = resolveItemIcon('All-Purpose Flour');
      expect(flourIcon.type).toBe('svg');
      expect(flourIcon.value).toBe('flour');
      expect(flourIcon.url).toContain('/api/assets/ingredients/flour.svg');
    });

    it('resolves keyword emojis for produce and pantry items without SVG assets', () => {
      expect(resolveItemIcon('Honeycrisp Apples').value).toBe('🍎');
      expect(resolveItemIcon('Bananas').value).toBe('🍌');
      expect(resolveItemIcon('Chicken Breast').value).toBe('🍗');
      expect(resolveItemIcon('Ground Beef').value).toBe('🥩');
      expect(resolveItemIcon('Coffee Beans').value).toBe('☕');
      expect(resolveItemIcon('Dish Soap').value).toBe('🧼');
    });

    it('defaults to generic cart icon (not an apple) for items not on the list', () => {
      const unrecognizedItem = resolveItemIcon('Toothpaste', 'Produce');
      expect(unrecognizedItem.type).toBe('emoji');
      expect(unrecognizedItem.value).toBe('🛒');
      expect(unrecognizedItem.value).not.toBe('🍎');

      const randomGrocery = resolveItemIcon('Screwdriver', 'Household & Other');
      expect(randomGrocery.value).toBe('🛒');
    });

    it('falls back to general cart emoji when no category or keyword matches', () => {
      const generalFallback = resolveItemIcon('Unidentified Item');
      expect(generalFallback.type).toBe('emoji');
      expect(generalFallback.value).toBe('🛒');
    });

    it('honors custom emoji and custom SVG asset selections', () => {
      const customEmoji = resolveItemIcon('My Custom Item', 'Produce', '🥑');
      expect(customEmoji.type).toBe('emoji');
      expect(customEmoji.value).toBe('🥑');

      const customSvg = resolveItemIcon('Special Berry Mix', 'Produce', 'svg:berries');
      expect(customSvg.type).toBe('svg');
      expect(customSvg.value).toBe('berries');
    });

    it('honors custom uploaded image data URLs', () => {
      const sampleDataUrl = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
      const customImage = resolveItemIcon('Artisanal Bread', 'Bakery', sampleDataUrl);
      expect(customImage.type).toBe('image');
      expect(customImage.value).toBe(sampleDataUrl);
      expect(customImage.url).toBe(sampleDataUrl);
    });
  });
});
