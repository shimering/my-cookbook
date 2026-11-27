import { db } from '../db/cookbookDb';
import type { Recipe, PlannedMeal, GroceryItem, MealSlot } from '../types';
import { cloudflareAuth } from './cloudflareAuthService';

const LAST_SYNCED_KEY = 'my_cookbook_last_synced_at';

export interface SyncState {
  isSyncing: boolean;
  lastSyncedAt: number | null;
  error: string | null;
}

type SyncListener = (state: SyncState) => void;
const listeners = new Set<SyncListener>();

let state: SyncState = {
  isSyncing: false,
  lastSyncedAt:
    typeof localStorage !== 'undefined'
      ? Number(localStorage.getItem(LAST_SYNCED_KEY)) || null
      : null,
  error: null,
};

function updateState(partial: Partial<SyncState>) {
  state = { ...state, ...partial };
  listeners.forEach(fn => fn(state));
}

// Convert data URL to Blob
function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/webp';
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

interface UploadResponse {
  url: string;
  key: string;
  error?: string;
}

interface RemoteIngredient {
  id?: string;
  name: string;
  quantity: string | number;
  unit?: string;
  section?: string;
}

interface RemoteRecipe {
  id: string;
  title: string;
  description?: string;
  heroImage?: string;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  servings?: number;
  categories?: string[];
  isFavorite?: boolean | number;
  createdAt: string | number;
  updatedAt: string | number;
  deletedAt?: string | number | null;
  ingredients?: RemoteIngredient[];
  instructions?: string[];
}

interface RemoteMealPlan {
  id: string;
  date: string;
  slot: MealSlot;
  recipeId?: string;
  customTitle?: string;
  servingsMultiplier?: number;
  deletedAt?: string | number | null;
}

interface RemoteGrocery {
  id: string;
  name: string;
  quantity?: number;
  unit?: string;
  category?: string;
  isChecked?: boolean | number;
  isManual?: boolean | number;
  deletedAt?: string | number | null;
}

interface SyncPayloadResponse {
  recipes: RemoteRecipe[];
  mealPlans: RemoteMealPlan[];
  groceries: RemoteGrocery[];
  serverTime: number;
}

export const cloudflareSync = {
  getSyncState(): SyncState {
    return state;
  },

  onSyncStateChange(callback: SyncListener): () => void {
    listeners.add(callback);
    callback(state);
    return () => listeners.delete(callback);
  },

  /**
   * Upload an image Blob to Cloudflare R2
   */
  async uploadImage(blob: Blob): Promise<{ url: string; key: string }> {
    const token = cloudflareAuth.getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const formData = new FormData();
    formData.append('file', blob, 'recipe.webp');

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const rawText = await res.text();
    let data: UploadResponse;
    try {
      data = JSON.parse(rawText) as UploadResponse;
    } catch {
      throw new Error(`Upload endpoint unavailable (HTTP ${res.status})`);
    }
    if (!res.ok) {
      throw new Error(data.error || 'Upload failed');
    }

    return data;
  },

  /**
   * Main two-way synchronization run
   */
  async syncNow(): Promise<void> {
    if (state.isSyncing) return;
    if (!navigator.onLine) {
      updateState({ error: 'You are currently offline' });
      return;
    }

    const token = cloudflareAuth.getAuthToken();
    if (!token) {
      // Not logged in to Cloudflare
      return;
    }

    updateState({ isSyncing: true, error: null });

    try {
      // 1. Process local offline photos: Convert local data URLs to Cloudflare R2 URLs
      const localRecipes = await db.recipes.toArray();
      for (const recipe of localRecipes) {
        if (recipe.heroImage && recipe.heroImage.startsWith('data:image/')) {
          try {
            const blob = dataUrlToBlob(recipe.heroImage);
            const uploadResult = await this.uploadImage(blob);
            recipe.heroImage = uploadResult.url;
            recipe.updatedAt = new Date().toISOString();
            await db.recipes.put(recipe);
          } catch (uploadErr) {
            console.warn('Could not upload recipe photo to R2 (will retry next sync):', uploadErr);
          }
        }
      }

      // 2. Prepare payload for Cloudflare D1
      const currentRecipes = await db.recipes.toArray();
      const currentMealPlans = await db.mealPlans.toArray();
      const currentGroceries = await db.groceryItems.toArray();

      const formattedRecipes = currentRecipes.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        prepTimeMinutes: r.prepTimeMinutes,
        cookTimeMinutes: r.cookTimeMinutes,
        servings: r.servings,
        heroImage: r.heroImage,
        categories: r.categories,
        isFavorite: r.isFavorite,
        createdAt: new Date(r.createdAt).getTime(),
        updatedAt: new Date(r.updatedAt).getTime(),
        ingredients: (r.ingredients || []).map(i => ({
          id: i.id,
          name: i.name,
          quantity: i.amount,
          unit: i.unit,
          section: i.section,
        })),
        instructions: (r.steps || []).map(s => s.instruction),
      }));

      const formattedMealPlans = currentMealPlans.map(m => ({
        id: m.id,
        date: m.date,
        slot: m.slot,
        recipeId: m.recipeId,
        customTitle: m.customNote || m.recipeTitle,
        servingsMultiplier: m.servingsMultiplier,
        isCompleted: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }));

      const formattedGroceries = currentGroceries.map(g => ({
        id: g.id,
        name: g.name,
        quantity: g.amount,
        unit: g.unit,
        category: g.category,
        isChecked: g.checked,
        isManual: g.isManual,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }));

      const lastSynced = state.lastSyncedAt || 0;

      // 3. Post to /api/sync
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipes: formattedRecipes,
          mealPlans: formattedMealPlans,
          groceries: formattedGroceries,
          lastSyncedAt: lastSynced,
        }),
      });

      const rawSyncText = await res.text();
      if (!res.ok) {
        if (res.status === 401) {
          // Token expired
          await cloudflareAuth.logout();
          throw new Error('Your session expired. Please sign in again.');
        }
        let errMessage = `Sync failed (HTTP ${res.status})`;
        try {
          const errData = JSON.parse(rawSyncText) as { error?: string };
          if (errData.error) errMessage = errData.error;
        } catch {
          if (res.status === 404) {
            errMessage = 'Cloud sync API (/api/sync) is only active when deployed on Cloudflare Pages or running via Wrangler.';
          }
        }
        throw new Error(errMessage);
      }

      let syncResult: SyncPayloadResponse;
      try {
        syncResult = JSON.parse(rawSyncText) as SyncPayloadResponse;
      } catch {
        throw new Error('Cloud sync API returned an unexpected non-JSON response.');
      }

      // 4. Merge incoming changes into IndexedDB while preserving local-only metadata
      // Merge remote recipes
      for (const remoteR of syncResult.recipes || []) {
        if (remoteR.deletedAt) {
          await db.recipes.delete(remoteR.id);
        } else {
          const existing = await db.recipes.get(remoteR.id);
          const existingIngMap = new Map(
            (existing?.ingredients || []).map((i) => [i.id, i])
          );

          const mapped: Recipe = {
            id: remoteR.id,
            title: remoteR.title,
            description: remoteR.description,
            heroImage: remoteR.heroImage || existing?.heroImage || '',
            originalHeroImage: existing?.originalHeroImage,
            heroImageScale: existing?.heroImageScale,
            heroImagePosition: existing?.heroImagePosition,
            prepTimeMinutes: remoteR.prepTimeMinutes || 0,
            cookTimeMinutes: remoteR.cookTimeMinutes || 0,
            servings: remoteR.servings || 1,
            categories: remoteR.categories || [],
            isFavorite: Boolean(remoteR.isFavorite),
            createdAt: new Date(remoteR.createdAt).toISOString(),
            updatedAt: new Date(remoteR.updatedAt).toISOString(),
            ingredients: (remoteR.ingredients || []).map((ing: RemoteIngredient) => {
              const ingId = ing.id || crypto.randomUUID();
              const prevIng = existingIngMap.get(ingId);
              return {
                id: ingId,
                name: ing.name,
                amount: typeof ing.quantity === 'number' ? ing.quantity : parseFloat(String(ing.quantity)) || 0,
                unit: ing.unit || '',
                displayFraction: prevIng?.displayFraction,
                section: ing.section,
              };
            }),
            steps: (remoteR.instructions || []).map((stepText: string, idx: number) => ({
              id: `step-${idx + 1}`,
              stepNumber: idx + 1,
              instruction: stepText,
            })),
            synced: true,
          };
          await db.recipes.put(mapped);
        }
      }

      // Merge remote meal plans
      for (const remoteM of syncResult.mealPlans || []) {
        if (remoteM.deletedAt) {
          await db.mealPlans.delete(remoteM.id);
        } else {
          const existing = await db.mealPlans.get(remoteM.id);
          const mappedPlan: PlannedMeal = {
            id: remoteM.id,
            date: remoteM.date,
            slot: remoteM.slot,
            recipeId: remoteM.recipeId,
            recipeTitle: existing?.recipeTitle,
            customNote: remoteM.customTitle ?? existing?.customNote,
            servingsMultiplier: remoteM.servingsMultiplier || 1,
          };
          await db.mealPlans.put(mappedPlan);
        }
      }

      // Merge remote groceries
      for (const remoteG of syncResult.groceries || []) {
        if (remoteG.deletedAt) {
          await db.groceryItems.delete(remoteG.id);
        } else {
          const existing = await db.groceryItems.get(remoteG.id);
          const mappedGroc: GroceryItem = {
            id: remoteG.id,
            name: remoteG.name,
            amount: remoteG.quantity ?? 1,
            unit: remoteG.unit ?? '',
            displayQuantity: existing?.displayQuantity || String(remoteG.quantity ?? ''),
            category: remoteG.category ?? 'Other',
            checked: Boolean(remoteG.isChecked),
            isManual: Boolean(remoteG.isManual),
            notes: existing?.notes,
            recipeSources: existing?.recipeSources,
            icon: existing?.icon,
          };
          await db.groceryItems.put(mappedGroc);
        }
      }

      const newSyncedAt = syncResult.serverTime || Date.now();
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(LAST_SYNCED_KEY, String(newSyncedAt));
      }
      updateState({ isSyncing: false, lastSyncedAt: newSyncedAt, error: null });
    } catch (err: unknown) {
      console.error('Cloudflare Sync error:', err);
      updateState({
        isSyncing: false,
        error: err instanceof Error ? err.message : 'Sync failed',
      });
    }
  },

  /**
   * Initializes automatic sync on app start, network online events, and interval
   */
  startAutoSync(intervalSeconds = 60): () => void {
    const handleOnline = () => {
      this.syncNow();
    };

    window.addEventListener('online', handleOnline);

    // Initial check & sync if logged in
    cloudflareAuth.checkSession().then(user => {
      if (user) {
        this.syncNow();
      }
    });

    const timer = setInterval(() => {
      if (cloudflareAuth.isAuthenticated() && navigator.onLine) {
        this.syncNow();
      }
    }, intervalSeconds * 1000);

    return () => {
      window.removeEventListener('online', handleOnline);
      clearInterval(timer);
    };
  },
};
