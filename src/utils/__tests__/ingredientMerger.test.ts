import { describe, it, expect } from 'vitest';
import { categorizeIngredient, normalizeUnit, mergeIngredients } from '../ingredientMerger';

describe('ingredientMerger', () => {
  it('normalizes units', () => {
    expect(normalizeUnit('cups')).toBe('cup');
    expect(normalizeUnit('c')).toBe('cup');
    expect(normalizeUnit('Tablespoons')).toBe('tbsp');
    expect(normalizeUnit('tbsp')).toBe('tbsp');
    expect(normalizeUnit('tsp')).toBe('tsp');
    expect(normalizeUnit('g')).toBe('g');
  });

  it('categorizes ingredients accurately into grocery aisles', () => {
    expect(categorizeIngredient('Whole Milk')).toBe('Dairy & Eggs');
    expect(categorizeIngredient('Unsalted Butter')).toBe('Dairy & Eggs');
    expect(categorizeIngredient('Ground Cinnamon')).toBe('Spices & Seasonings');
    expect(categorizeIngredient('All-Purpose Flour')).toBe('Pantry');
    expect(categorizeIngredient('Granulated Sugar')).toBe('Pantry');
    expect(categorizeIngredient('Fresh Strawberries')).toBe('Produce');
    expect(categorizeIngredient('Garlic Cloves')).toBe('Produce');
    expect(categorizeIngredient('Chicken Breast')).toBe('Meat & Seafood');
    expect(categorizeIngredient('Brioche Buns')).toBe('Bakery');
  });

  it('merges duplicate ingredients across recipes with accurate total fractions', () => {
    const items = [
      {
        ingredient: { id: '1', name: 'Milk', amount: 1, unit: 'cup' },
        recipeTitle: 'Berry Pancakes',
        servingMultiplier: 1,
      },
      {
        ingredient: { id: '2', name: 'Milk', amount: 1.5, unit: 'cup' },
        recipeTitle: 'Cinnamon Rolls',
        servingMultiplier: 1,
      },
      {
        ingredient: { id: '3', name: 'Flour', amount: 2, unit: 'cups' },
        recipeTitle: 'Berry Pancakes',
        servingMultiplier: 1,
      },
    ];

    const merged = mergeIngredients(items);
    
    // Should merge the 2 Milk entries into 1 with total 2.5 cups
    const milkItem = merged.find(i => i.name.toLowerCase() === 'milk');
    expect(milkItem).toBeDefined();
    expect(milkItem?.amount).toBe(2.5);
    expect(milkItem?.displayQuantity).toBe('2 1/2');
    expect(milkItem?.unit).toBe('cup');
    expect(milkItem?.recipeSources).toContain('Berry Pancakes');
    expect(milkItem?.recipeSources).toContain('Cinnamon Rolls');
    expect(milkItem?.category).toBe('Dairy & Eggs');

    // Flour entry
    const flourItem = merged.find(i => i.name.toLowerCase() === 'flour');
    expect(flourItem).toBeDefined();
    expect(flourItem?.amount).toBe(2);
    expect(flourItem?.category).toBe('Pantry');
  });
});
