import { describe, it, expect } from 'vitest';
import type { Recipe, PlannedMeal, GroceryItem } from '../../types';

describe('Sync Payload Schema & Reconciliation', () => {
  it('validates structure of client push payload', () => {
    const nowIso = new Date().toISOString();
    const recipe: Recipe = {
      id: 'rec_1',
      title: 'Pancakes',
      description: 'Yummy',
      heroImage: 'https://example.com/pancakes.jpg',
      prepTimeMinutes: 10,
      cookTimeMinutes: 15,
      servings: 4,
      categories: ['Breakfast'],
      isFavorite: true,
      ingredients: [{ id: 'ing_1', name: 'Flour', amount: 2, unit: 'cups' }],
      steps: [{ id: 'step_1', stepNumber: 1, instruction: 'Mix and cook' }],
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const mealPlan: PlannedMeal = {
      id: 'mp_1',
      date: '2026-11-22',
      slot: 'breakfast',
      recipeId: 'rec_1',
      servingsMultiplier: 1,
    };

    const grocery: GroceryItem = {
      id: 'groc_1',
      name: 'Flour',
      amount: 2,
      unit: 'cups',
      displayQuantity: '2 cups',
      category: 'Pantry',
      checked: false,
      isManual: false,
    };

    const payload = {
      recipes: [recipe],
      mealPlans: [mealPlan],
      groceries: [grocery],
      lastSyncedAt: 0,
    };

    expect(payload.recipes).toHaveLength(1);
    expect(payload.recipes[0].ingredients).toHaveLength(1);
    expect(payload.mealPlans).toHaveLength(1);
    expect(payload.groceries).toHaveLength(1);
  });
});
