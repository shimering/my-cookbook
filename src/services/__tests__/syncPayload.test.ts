import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { db } from '../../db/cookbookDb';
import { cloudflareSync } from '../cloudflareSyncService';
import { cloudflareAuth } from '../cloudflareAuthService';
import type { Recipe, PlannedMeal, GroceryItem } from '../../types';

describe('Sync Payload Schema & Reconciliation', () => {
  beforeEach(async () => {
    await db.recipes.clear();
    await db.mealPlans.clear();
    await db.groceryItems.clear();
    vi.restoreAllMocks();
  });

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

  it('uploads local data URL photos and preserves local-only metadata on two-way sync merge', async () => {
    vi.spyOn(cloudflareAuth, 'getAuthToken').mockReturnValue('test-token');
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });

    const nowIso = new Date().toISOString();
    const localRecipe: Recipe = {
      id: 'rec_sync_1',
      title: 'Berry Tart',
      description: 'Fresh tart',
      heroImage: 'data:image/webp;base64,AAAA',
      originalHeroImage: 'data:image/webp;base64,BBBB',
      heroImageScale: 1.35,
      heroImagePosition: { x: 5, y: -4 },
      prepTimeMinutes: 20,
      cookTimeMinutes: 30,
      servings: 6,
      categories: ['Dessert'],
      ingredients: [
        { id: 'ing_1', name: 'Flour', amount: 1.5, unit: 'cup', displayFraction: '1 1/2' },
      ],
      steps: [{ id: 's1', stepNumber: 1, instruction: 'Bake crust.' }],
      isFavorite: true,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const localGrocery: GroceryItem = {
      id: 'groc_sync_1',
      name: 'Special Matcha',
      amount: 1,
      unit: 'tin',
      displayQuantity: '1',
      category: 'Beverages',
      checked: false,
      isManual: true,
      notes: 'Ceremonial grade',
      recipeSources: ['Manual Addition'],
      icon: '🍵',
    };

    await db.recipes.put(localRecipe);
    await db.groceryItems.put(localGrocery);

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === '/api/upload') {
        return new Response(
          JSON.stringify({ url: '/api/assets/recipes/uploaded.webp', key: 'recipes/uploaded.webp' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
      if (url === '/api/sync') {
        return new Response(
          JSON.stringify({
            recipes: [
              {
                id: 'rec_sync_1',
                title: 'Berry Tart',
                description: 'Fresh tart',
                heroImage: '/api/assets/recipes/uploaded.webp',
                prepTimeMinutes: 20,
                cookTimeMinutes: 30,
                servings: 6,
                categories: ['Dessert'],
                isFavorite: true,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                ingredients: [{ id: 'ing_1', name: 'Flour', quantity: '1.5', unit: 'cup' }],
                instructions: ['Bake crust.'],
              },
            ],
            mealPlans: [],
            groceries: [
              {
                id: 'groc_sync_1',
                name: 'Special Matcha',
                quantity: 1,
                unit: 'tin',
                category: 'Beverages',
                isChecked: true,
                isManual: true,
              },
            ],
            serverTime: Date.now(),
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return new Response('Not found', { status: 404 });
    });

    vi.stubGlobal('fetch', fetchMock);

    await cloudflareSync.syncNow();

    const syncedRecipe = await db.recipes.get('rec_sync_1');
    expect(syncedRecipe?.heroImage).toBe('/api/assets/recipes/uploaded.webp');
    expect(syncedRecipe?.originalHeroImage).toBe('data:image/webp;base64,BBBB');
    expect(syncedRecipe?.heroImageScale).toBe(1.35);
    expect(syncedRecipe?.heroImagePosition).toEqual({ x: 5, y: -4 });
    expect(syncedRecipe?.ingredients[0].displayFraction).toBe('1 1/2');
    expect(syncedRecipe?.synced).toBe(true);

    const syncedGrocery = await db.groceryItems.get('groc_sync_1');
    expect(syncedGrocery?.checked).toBe(true);
    expect(syncedGrocery?.icon).toBe('🍵');
    expect(syncedGrocery?.notes).toBe('Ceremonial grade');
    expect(syncedGrocery?.recipeSources).toEqual(['Manual Addition']);

    expect(cloudflareSync.getSyncState().error).toBeNull();
  });

  it('handles non-JSON 404 from /api/sync gracefully without crashing', async () => {
    vi.spyOn(cloudflareAuth, 'getAuthToken').mockReturnValue('test-token');
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('<!doctype html><html>Not Found</html>', { status: 404 }))
    );

    await cloudflareSync.syncNow();
    const state = cloudflareSync.getSyncState();
    expect(state.isSyncing).toBe(false);
    expect(state.error).toContain('Cloud sync API (/api/sync)');
  });
});
