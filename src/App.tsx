import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, initializeDatabase } from './db/cookbookDb';
import { formatLocalDate } from './utils/dateUtils';
import type { Recipe, PlannedMeal, GroceryItem } from './types';
import { mergeIngredients, type IngredientInputItem } from './utils/ingredientMerger';

import { TopHeader } from './components/layout/TopHeader';
import { BottomNav, type NavTab } from './components/layout/BottomNav';
import { RecipeGrid } from './components/recipes/RecipeGrid';
import { RecipeDetailView } from './components/recipes/RecipeDetailView';
import { RecipeFormModal } from './components/recipes/RecipeFormModal';
import { MealPlannerView } from './components/planner/MealPlannerView';
import { GroceryListView } from './components/groceries/GroceryListView';
import { SyncBackupModal } from './components/settings/SyncBackupModal';
import { PrintableCookbook } from './components/export/PrintableCookbook';
import { cloudflareAuth, type CloudflareUser } from './services/cloudflareAuthService';
import { cloudflareSync, type SyncState } from './services/cloudflareSyncService';

export function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<NavTab>('recipes');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [isCreatingRecipe, setIsCreatingRecipe] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [printRecipes, setPrintRecipes] = useState<Recipe[] | null>(null);

  // Cloudflare Auth & Sync State
  const [cfUser, setCfUser] = useState<CloudflareUser | null>(cloudflareAuth.getAuthUser());
  const [cfSyncState, setCfSyncState] = useState<SyncState>(cloudflareSync.getSyncState());

  // Initialize DB with seed recipes on first run and start Cloudflare auto-sync
  useEffect(() => {
    initializeDatabase().catch((err) => console.error('Failed to init DB:', err));
    const stopAutoSync = cloudflareSync.startAutoSync(45);
    const unsubAuth = cloudflareAuth.onAuthStateChange(user => setCfUser(user));
    const unsubSync = cloudflareSync.onSyncStateChange(s => setCfSyncState(s));

    return () => {
      stopAutoSync();
      unsubAuth();
      unsubSync();
    };
  }, []);

  // Reactive Live Queries via Dexie
  const recipes = useLiveQuery(() => db.recipes.toArray(), []) || [];
  const plannedMeals = useLiveQuery(() => db.mealPlans.toArray(), []) || [];
  const groceryItems = useLiveQuery(() => db.groceryItems.toArray(), []) || [];

  const uncheckedGroceryCount = groceryItems.filter((i) => !i.checked).length;

  // Recipe Handlers
  const handleSaveRecipe = async (recipe: Recipe) => {
    await db.recipes.put(recipe);
    setIsCreatingRecipe(false);
    setEditingRecipe(null);
    if (selectedRecipe && selectedRecipe.id === recipe.id) {
      setSelectedRecipe(recipe);
    }
  };

  const handleToggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const recipe = await db.recipes.get(id);
    if (recipe) {
      await db.recipes.update(id, { isFavorite: !recipe.isFavorite });
      if (selectedRecipe && selectedRecipe.id === id) {
        setSelectedRecipe({ ...selectedRecipe, isFavorite: !recipe.isFavorite });
      }
    }
  };

  // Meal Plan Handlers
  const handleAddMeal = async (meal: Omit<PlannedMeal, 'id'>) => {
    const id = `meal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    await db.mealPlans.add({ ...meal, id });
  };

  const handleRemoveMeal = async (id: string) => {
    await db.mealPlans.delete(id);
  };

  const handleUpdateServingMultiplier = async (id: string, multiplier: number) => {
    await db.mealPlans.update(id, { servingsMultiplier: multiplier });
  };

  // Add recipe to meal plan shortcut from Recipe Detail View
  const handleAddRecipeToMealPlan = async (recipe: Recipe) => {
    const today = formatLocalDate(new Date());
    await handleAddMeal({
      date: today,
      slot: 'dinner',
      recipeId: recipe.id,
      recipeTitle: recipe.title,
      servingsMultiplier: 1,
    });
    setActiveTab('planner');
    setSelectedRecipe(null);
  };

  // Grocery List Handlers
  const handleGenerateGroceries = async ({
    startDate,
    endDate,
  }: {
    startDate: string;
    endDate: string;
  }) => {
    // Find all planned meals in range
    const mealsInRange = plannedMeals.filter(
      (m) => m.date >= startDate && m.date <= endDate && m.recipeId
    );

    if (mealsInRange.length === 0) {
      alert('No recipes planned for the selected week. Add some meals first!');
      return;
    }

    const inputItems: IngredientInputItem[] = [];

    for (const meal of mealsInRange) {
      const rec = recipes.find((r) => r.id === meal.recipeId);
      if (rec && rec.ingredients) {
        for (const ing of rec.ingredients) {
          inputItems.push({
            ingredient: ing,
            recipeTitle: rec.title,
            servingMultiplier: meal.servingsMultiplier || 1,
          });
        }
      }
    }

    // Merge duplicate ingredients and classify by aisle
    const merged = mergeIngredients(inputItems);

    // Keep existing manual additions
    const currentManuals = groceryItems.filter((i) => i.isManual);

    // Replace generated items
    await db.transaction('rw', db.groceryItems, async () => {
      await db.groceryItems.clear();
      await db.groceryItems.bulkPut([...currentManuals, ...merged]);
    });

    // Switch to groceries tab
    setActiveTab('groceries');
  };

  const handleToggleGroceryItem = async (id: string) => {
    const item = await db.groceryItems.get(id);
    if (item) {
      await db.groceryItems.update(id, { checked: !item.checked });
    }
  };

  const handleAddManualGroceryItem = async (
    item: Omit<GroceryItem, 'id' | 'checked'>
  ) => {
    const id = `manual-${Date.now()}`;
    await db.groceryItems.add({ ...item, id, checked: false });
  };

  const handleDeleteGroceryItem = async (id: string) => {
    await db.groceryItems.delete(id);
  };

  const handleClearCheckedGroceries = async () => {
    const checked = groceryItems.filter((i) => i.checked);
    await db.groceryItems.bulkDelete(checked.map((i) => i.id));
  };

  const handleClearAllGroceries = async () => {
    if (confirm('Clear entire grocery shopping list?')) {
      await db.groceryItems.clear();
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF5F7] text-[#4A2C2A] flex flex-col justify-between selection:bg-[#FF8FA3] selection:text-white">
      {/* Top Header (Visible unless viewing recipe in Cooking Mode or full print view) */}
      {!selectedRecipe && !printRecipes && (
        <TopHeader
          onOpenSettings={() => setShowSettings(true)}
          isOnline={navigator.onLine}
          hasCloudSync={Boolean(cfUser)}
          isSyncing={cfSyncState.isSyncing}
        />
      )}

      {/* Main View Area */}
      <main className="flex-1">
        {selectedRecipe ? (
          /* Cooking Mode / Recipe Detail View */
          <RecipeDetailView
            recipe={selectedRecipe}
            onBack={() => setSelectedRecipe(null)}
            onEdit={(rec) => {
              setEditingRecipe(rec);
            }}
            onToggleFavorite={handleToggleFavorite}
            onAddToMealPlan={handleAddRecipeToMealPlan}
            onPrint={(rec) => setPrintRecipes([rec])}
          />
        ) : (
          <>
            {/* Tab 1: Cookbook Recipes Grid */}
            {activeTab === 'recipes' && (
              <RecipeGrid
                recipes={recipes}
                onSelectRecipe={(recipe) => setSelectedRecipe(recipe)}
                onAddNewRecipe={() => setIsCreatingRecipe(true)}
                onToggleFavorite={handleToggleFavorite}
              />
            )}

            {/* Tab 2: 7-Day Weekly Meal Planner */}
            {activeTab === 'planner' && (
              <MealPlannerView
                plannedMeals={plannedMeals}
                recipes={recipes}
                onAddMeal={handleAddMeal}
                onRemoveMeal={handleRemoveMeal}
                onUpdateServingMultiplier={handleUpdateServingMultiplier}
                onGenerateGroceries={handleGenerateGroceries}
                onSelectRecipe={(recipe) => setSelectedRecipe(recipe)}
              />
            )}

            {/* Tab 3: Consolidated Grocery Shopping List */}
            {activeTab === 'groceries' && (
              <GroceryListView
                groceryItems={groceryItems}
                onToggleItem={handleToggleGroceryItem}
                onAddItem={handleAddManualGroceryItem}
                onDeleteItem={handleDeleteGroceryItem}
                onClearChecked={handleClearCheckedGroceries}
                onClearAll={handleClearAllGroceries}
              />
            )}
          </>
        )}
      </main>

      {/* Bottom 3-Pill Navigation Bar (hidden during Cooking Mode) */}
      {!selectedRecipe && !printRecipes && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setSelectedRecipe(null);
          }}
          groceryBadgeCount={uncheckedGroceryCount}
        />
      )}

      {/* Modals */}
      {/* New / Edit Recipe Form Modal */}
      {(isCreatingRecipe || editingRecipe) && (
        <RecipeFormModal
          initialRecipe={editingRecipe}
          onSave={handleSaveRecipe}
          onClose={() => {
            setIsCreatingRecipe(false);
            setEditingRecipe(null);
          }}
        />
      )}

      {/* Cloud Sync & Backup Modal */}
      {showSettings && (
        <SyncBackupModal
          onClose={() => setShowSettings(false)}
          onDataRestored={() => {
            // Live query updates automatically
          }}
          onPrintAll={() => {
            setShowSettings(false);
            setPrintRecipes(recipes);
          }}
        />
      )}

      {/* Printable Cookbook / PDF Preview */}
      {printRecipes && (
        <PrintableCookbook
          recipes={printRecipes}
          onClose={() => setPrintRecipes(null)}
        />
      )}
    </div>
  );
}

export default App;
