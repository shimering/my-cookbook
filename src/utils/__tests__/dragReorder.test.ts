import { describe, it, expect } from 'vitest';
import {
  reorderIngredients,
  moveIngredientToSection,
  reorderSteps,
} from '../dragReorder';
import type { Ingredient, RecipeStep } from '../../types';

describe('dragReorder utilities', () => {
  const sampleIngredients: Ingredient[] = [
    { id: '1', name: 'Flour', amount: 2, unit: 'cup', section: '' },
    { id: '2', name: 'Sugar', amount: 1, unit: 'cup', section: '' },
    { id: '3', name: 'Cream', amount: 1, unit: 'cup', section: 'For the Sauce' },
    { id: '4', name: 'Vanilla', amount: 1, unit: 'tsp', section: 'For the Sauce' },
  ];

  it('reorders ingredients within the same section', () => {
    const result = reorderIngredients(sampleIngredients, 0, 1, '');
    expect(result.map((i) => i.name)).toEqual(['Sugar', 'Flour', 'Cream', 'Vanilla']);
    expect(result[0].section).toBe('');
    expect(result[1].section).toBe('');
  });

  it('moves an ingredient from main to a named section when dropped on an item in that section', () => {
    // Move Flour (index 0) onto Vanilla (index 3, section: 'For the Sauce')
    const result = reorderIngredients(sampleIngredients, 0, 3, 'For the Sauce');
    expect(result.map((i) => i.name)).toEqual(['Sugar', 'Cream', 'Vanilla', 'Flour']);
    expect(result[3].section).toBe('For the Sauce');
  });

  it('moves an ingredient into a target section container (appending at end of that section)', () => {
    // Move Sugar (index 1, main) into 'For the Sauce'
    const result = moveIngredientToSection(sampleIngredients, 1, 'For the Sauce');
    expect(result.map((i) => i.name)).toEqual(['Flour', 'Cream', 'Vanilla', 'Sugar']);
    expect(result[3].section).toBe('For the Sauce');
  });

  it('moves an ingredient from a named section back to Main Ingredients', () => {
    // Move Cream (index 2, 'For the Sauce') into Main ('')
    const result = moveIngredientToSection(sampleIngredients, 2, '');
    expect(result.map((i) => i.name)).toEqual(['Flour', 'Sugar', 'Cream', 'Vanilla']);
    expect(result[2].section).toBe('');
  });

  it('reorders steps and renumbers stepNumber sequentially', () => {
    const steps: RecipeStep[] = [
      { id: 's1', stepNumber: 1, instruction: 'Mix dry ingredients' },
      { id: 's2', stepNumber: 2, instruction: 'Add wet ingredients' },
      { id: 's3', stepNumber: 3, instruction: 'Bake at 350F' },
    ];

    // Drag Step 3 (index 2) to Step 1 position (index 0)
    const result = reorderSteps(steps, 2, 0);
    expect(result.map((s) => s.instruction)).toEqual([
      'Bake at 350F',
      'Mix dry ingredients',
      'Add wet ingredients',
    ]);
    expect(result.map((s) => s.stepNumber)).toEqual([1, 2, 3]);
  });
});
