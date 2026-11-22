import { describe, it, expect } from 'vitest';
import { getIngredientIcon, getIngredientAssetUrl } from '../ingredientIconResolver';

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

  it('returns null or fallback for unrecognized ingredient names', () => {
    expect(getIngredientIcon('1 pack mysterious space powder')).toBeNull();
  });
});
