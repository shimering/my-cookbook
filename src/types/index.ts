export interface Ingredient {
  id: string;
  name: string;
  amount: number;             // Numeric value for calculations, e.g. 1.5
  unit: string;               // e.g. "cup", "tbsp", "tsp", "g", "ml", "pinch", "piece"
  displayFraction?: string;   // e.g. "1 1/2" or "2"
  section?: string;           // e.g. "For the Batter", "For the Glaze"
}

export interface RecipeStep {
  id: string;
  stepNumber: number;
  instruction: string;
  photoUrl?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  heroImage: string;          // Data URL or remote URL
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  categories: string[];       // e.g. ["Breakfast", "Desserts", "Quick Meals"]
  ingredients: Ingredient[];
  steps: RecipeStep[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  synced?: boolean;
}

export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface PlannedMeal {
  id: string;
  date: string;               // ISO date string: YYYY-MM-DD
  slot: MealSlot;
  recipeId?: string;          // If assigned to a saved recipe
  recipeTitle?: string;       // Cached title for quick display
  customNote?: string;        // For freeform entries like "Leftover Pasta" or "Date Night"
  servingsMultiplier: number; // e.g. 1.0, 1.5, 2.0
}

export type DefaultGroceryCategory =
  | 'Produce'
  | 'Dairy & Eggs'
  | 'Pantry'
  | 'Spices & Seasonings'
  | 'Bakery'
  | 'Meat & Seafood'
  | 'Beverages'
  | 'Frozen'
  | 'Household & Other';

export type GroceryCategory = DefaultGroceryCategory | string;

export interface CatalogItem {
  id: string;
  name: string;
  category: string;
  defaultUnit?: string;
  notes?: string;
  isCustom?: boolean;
}

export interface GroceryItem {
  id: string;
  name: string;
  amount: number;
  unit: string;
  displayQuantity: string;
  category: GroceryCategory;
  checked: boolean;
  isManual: boolean;          // true if added directly by user (e.g. coffee, paper towels)
  notes?: string;             // Custom notes (e.g. "Extra ripe", "Organic", "Brand X")
  recipeSources?: string[];   // Recipe titles that contributed this ingredient
}

export interface DayPlan {
  date: string;               // YYYY-MM-DD
  dayOfWeek: string;          // "Monday", "Tuesday", etc.
  formattedDate: string;      // "Nov 23"
  meals: {
    breakfast: PlannedMeal[];
    lunch: PlannedMeal[];
    dinner: PlannedMeal[];
    snack: PlannedMeal[];
  };
}

export interface BackupArchive {
  version: string;
  exportedAt: string;
  appName: string;
  recipes: Recipe[];
  mealPlans: PlannedMeal[];
  groceryItems: GroceryItem[];
}
