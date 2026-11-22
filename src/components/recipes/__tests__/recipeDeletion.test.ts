import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../../db/cookbookDb';
import type { Recipe } from '../../../types';

describe('Recipe Deletion Workflow', () => {
  const sampleRecipe: Recipe = {
    id: 'test-recipe-to-delete',
    title: 'Berry Brioche French Toast',
    description: 'Golden brioche soaked in rich vanilla custard',
    heroImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    servings: 4,
    categories: ['Breakfast', 'Baking'],
    ingredients: [
      { id: 'i1', name: 'Brioche Bread', amount: 8, unit: 'slice', displayFraction: '8', section: '' },
      { id: 'i2', name: 'Eggs', amount: 4, unit: '', displayFraction: '4', section: '' },
    ],
    steps: [
      { id: 's1', stepNumber: 1, instruction: 'Whisk eggs, cream, and vanilla in a wide bowl.' },
      { id: 's2', stepNumber: 2, instruction: 'Dip brioche slices and fry in butter until golden.' },
    ],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    synced: false,
  };

  const sampleRecipe2: Recipe = {
    id: 'test-recipe-preserve',
    title: 'Vanilla Scones',
    description: 'Crumbly English scones',
    heroImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
    prepTimeMinutes: 15,
    cookTimeMinutes: 20,
    servings: 6,
    categories: ['Baking'],
    ingredients: [],
    steps: [],
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    synced: false,
  };

  beforeEach(async () => {
    await db.recipes.clear();
    await db.recipes.bulkPut([sampleRecipe, sampleRecipe2]);
  });

  it('permanently deletes the target recipe from IndexedDB', async () => {
    expect(await db.recipes.get('test-recipe-to-delete')).toBeDefined();

    // Perform deletion
    await db.recipes.delete('test-recipe-to-delete');

    // Verify deleted
    const deleted = await db.recipes.get('test-recipe-to-delete');
    expect(deleted).toBeUndefined();

    // Verify other recipes are untouched
    const remaining = await db.recipes.get('test-recipe-preserve');
    expect(remaining).toBeDefined();
    expect(remaining?.title).toBe('Vanilla Scones');
  });

  it('resets selected recipe and modal state in deletion handler', async () => {
    let selectedRecipe: Recipe | null = sampleRecipe;
    let isCreating = false;
    let editingRecipe: Recipe | null = sampleRecipe;

    // Simulate handleDeleteRecipe in App.tsx
    const handleDeleteRecipe = async (id: string) => {
      await db.recipes.delete(id);
      if (selectedRecipe && selectedRecipe.id === id) {
        selectedRecipe = null;
      }
      isCreating = false;
      editingRecipe = null;
    };

    await handleDeleteRecipe('test-recipe-to-delete');

    expect(selectedRecipe).toBeNull();
    expect(editingRecipe).toBeNull();
    expect(isCreating).toBe(false);
    expect(await db.recipes.get('test-recipe-to-delete')).toBeUndefined();
  });
});
