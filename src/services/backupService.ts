import { db } from '../db/cookbookDb';
import type { BackupArchive } from '../types';

/**
 * Exports all application data into a structured JSON string.
 */
export async function exportAllData(): Promise<string> {
  const recipes = await db.recipes.toArray();
  const mealPlans = await db.mealPlans.toArray();
  const groceryItems = await db.groceryItems.toArray();

  const archive: BackupArchive = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    appName: 'My Cookbook',
    recipes,
    mealPlans,
    groceryItems,
  };

  return JSON.stringify(archive, null, 2);
}

/**
 * Triggers a browser download of the backup file.
 */
export async function downloadBackupFile(): Promise<void> {
  const json = await exportAllData();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().split('T')[0];
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `my-cookbook-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Restores data from an uploaded JSON file into IndexedDB.
 */
export async function restoreFromBackupFile(file: File): Promise<{
  recipesCount: number;
  mealPlansCount: number;
  groceryItemsCount: number;
}> {
  const text = await file.text();
  const data: BackupArchive = JSON.parse(text);

  if (!data || !Array.isArray(data.recipes)) {
    throw new Error('Invalid backup file format: missing recipes array');
  }

  // Clear and restore in a transaction
  await db.transaction('rw', [db.recipes, db.mealPlans, db.groceryItems], async () => {
    if (data.recipes.length > 0) {
      await db.recipes.clear();
      await db.recipes.bulkPut(data.recipes);
    }
    if (Array.isArray(data.mealPlans)) {
      await db.mealPlans.clear();
      await db.mealPlans.bulkPut(data.mealPlans);
    }
    if (Array.isArray(data.groceryItems)) {
      await db.groceryItems.clear();
      await db.groceryItems.bulkPut(data.groceryItems);
    }
  });

  return {
    recipesCount: data.recipes.length,
    mealPlansCount: data.mealPlans?.length || 0,
    groceryItemsCount: data.groceryItems?.length || 0,
  };
}
