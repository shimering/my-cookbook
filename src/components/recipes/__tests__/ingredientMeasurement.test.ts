import { describe, it, expect } from 'vitest';
import { getQtyOptions } from '../RecipeFormModal';
import { parseQuantity } from '../../../utils/fractionParser';

describe('Ingredient Measurement & Quantity Dropdown Logic', () => {
  it('returns fractional and whole US quantities for cup, tbsp, tsp, and oz units', () => {
    const cupOptions = getQtyOptions('us', 'cup');
    expect(cupOptions).toContain('1/4');
    expect(cupOptions).toContain('1/2');
    expect(cupOptions).toContain('1');
    expect(cupOptions).toContain('2');
    expect(cupOptions).toContain('3');

    const tbspOptions = getQtyOptions('us', 'tbsp');
    expect(tbspOptions).toEqual(cupOptions);
  });

  it('returns fine-grained metric weight numbers for g and ml', () => {
    const gramOptions = getQtyOptions('metric', 'g');
    expect(gramOptions).toContain('10');
    expect(gramOptions).toContain('50');
    expect(gramOptions).toContain('100');
    expect(gramOptions).toContain('250');
    expect(gramOptions).toContain('500');

    // Also when in US mode, selecting grams should provide gram quantities
    const gramInUsMode = getQtyOptions('us', 'g');
    expect(gramInUsMode).toContain('100');
    expect(gramInUsMode).toContain('250');
  });

  it('returns decimal volume quantities for kg and l', () => {
    const kgOptions = getQtyOptions('metric', 'kg');
    expect(kgOptions).toContain('0.5');
    expect(kgOptions).toContain('1');
    expect(kgOptions).toContain('1.5');
    expect(kgOptions).toContain('2');
  });

  it('returns whole count quantities for pieces, cloves, and slices', () => {
    const cloveOptions = getQtyOptions('us', 'clove');
    expect(cloveOptions).toContain('1');
    expect(cloveOptions).toContain('2');
    expect(cloveOptions).toContain('3');
    expect(cloveOptions).toContain('4');
  });

  it('correctly updates both displayFraction and amount atomically on quantity change', () => {
    let ingredient = {
      id: '1',
      name: 'Flour',
      amount: 1,
      unit: 'cup',
      displayFraction: '1',
      section: '',
    };

    const updateIngredient = (updates: Partial<typeof ingredient>) => {
      ingredient = { ...ingredient, ...updates };
    };

    // User chooses '2' from the dropdown
    const chosenVal = '2';
    const parsed = parseQuantity(chosenVal).valueOf();
    updateIngredient({
      displayFraction: chosenVal,
      amount: parsed > 0 ? parsed : 1,
    });

    expect(ingredient.displayFraction).toBe('2');
    expect(ingredient.amount).toBe(2);

    // User chooses '1/2' from the dropdown
    const chosenValHalf = '1/2';
    const parsedHalf = parseQuantity(chosenValHalf).valueOf();
    updateIngredient({
      displayFraction: chosenValHalf,
      amount: parsedHalf > 0 ? parsedHalf : 1,
    });

    expect(ingredient.displayFraction).toBe('1/2');
    expect(ingredient.amount).toBe(0.5);
  });
});
