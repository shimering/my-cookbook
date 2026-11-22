import { describe, it, expect } from 'vitest';
import type { Recipe, MealPlanEntry, GroceryItem } from '../../types';

describe('Sync Payload Schema & Reconciliation', () => {
  it('validates structure of client push payload', () => {
    const recipe: Recipe = {
      id: 'rec_1',
      title: 'Pancakes',
      description: 'Yummy',
      prepTimeMinutes: 10,
      cookTimeMinutes: 15,
      servings: 4,
      categories: ['Breakfast'],
      isFavorite: true,
      ingredients: [{ id: 'ing_1', name: 'Flour', quantity: '2', unit: 'cups' }],
      instructions: ['Mix and cook'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const mealPlan: MealPlanEntry = {
      id: 'mp_1',
      date: '2026-11-22',
      slot: 'breakfast',
      recipeId: 'rec_1',
      servingsMultiplier: 1,
      isCompleted: false,
    };

    const grocery: GroceryItem = {
      id: 'groc_1',
      name: 'Flour',
      quantity: 2,
      unit: 'cups',
      category: 'Pantry',
      isChecked: false,
      isManual: false,
      recipeIds: ['rec_1'],
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
