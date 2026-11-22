import type { CatalogItem } from '../types';

export const DEFAULT_GROCERY_CATEGORIES: string[] = [
  'Produce',
  'Dairy & Eggs',
  'Meat & Seafood',
  'Bakery',
  'Pantry',
  'Spices & Seasonings',
  'Beverages',
  'Frozen',
  'Household & Other',
];

export const DEFAULT_CATALOG_ITEMS: CatalogItem[] = [
  // Produce
  { id: 'cat-prod-honeycrisp', name: 'Honeycrisp Apples', category: 'Produce', defaultUnit: 'lbs', notes: 'Crisp & sweet' },
  { id: 'cat-prod-1', name: 'Apples (Honeycrisp)', category: 'Produce', defaultUnit: 'lbs', notes: 'Crisp & sweet' },
  { id: 'cat-prod-2', name: 'Bananas', category: 'Produce', defaultUnit: 'bunch', notes: 'Slightly green' },
  { id: 'cat-prod-3', name: 'Strawberries', category: 'Produce', defaultUnit: 'box', notes: 'Fresh, red' },
  { id: 'cat-prod-4', name: 'Blueberries', category: 'Produce', defaultUnit: 'box', notes: 'Organic' },
  { id: 'cat-prod-5', name: 'Lemons', category: 'Produce', defaultUnit: 'pcs', notes: 'Juicy' },
  { id: 'cat-prod-6', name: 'Limes', category: 'Produce', defaultUnit: 'pcs' },
  { id: 'cat-prod-7', name: 'Avocados', category: 'Produce', defaultUnit: 'pcs', notes: 'Ready to eat' },
  { id: 'cat-prod-tomatoes', name: 'Tomatoes', category: 'Produce', defaultUnit: 'lbs' },
  { id: 'cat-prod-8', name: 'Roma Tomatoes', category: 'Produce', defaultUnit: 'lbs' },
  { id: 'cat-prod-9', name: 'Cherry Tomatoes', category: 'Produce', defaultUnit: 'pint' },
  { id: 'cat-prod-onions', name: 'Onions', category: 'Produce', defaultUnit: 'lbs' },
  { id: 'cat-prod-10', name: 'Yellow Onions', category: 'Produce', defaultUnit: 'lbs' },
  { id: 'cat-prod-11', name: 'Red Onions', category: 'Produce', defaultUnit: 'pcs' },
  { id: 'cat-prod-garlic', name: 'Garlic', category: 'Produce', defaultUnit: 'clove' },
  { id: 'cat-prod-12', name: 'Fresh Garlic', category: 'Produce', defaultUnit: 'head' },
  { id: 'cat-prod-potatoes', name: 'Potatoes', category: 'Produce', defaultUnit: 'bag' },
  { id: 'cat-prod-13', name: 'Russet Potatoes', category: 'Produce', defaultUnit: 'bag' },
  { id: 'cat-prod-spinach', name: 'Spinach', category: 'Produce', defaultUnit: 'bag' },
  { id: 'cat-prod-14', name: 'Baby Spinach', category: 'Produce', defaultUnit: 'bag', notes: 'Pre-washed' },
  { id: 'cat-prod-15', name: 'Romaine Lettuce', category: 'Produce', defaultUnit: 'head' },
  { id: 'cat-prod-16', name: 'Carrots', category: 'Produce', defaultUnit: 'bag' },
  { id: 'cat-prod-17', name: 'Celery', category: 'Produce', defaultUnit: 'bunch' },
  { id: 'cat-prod-18', name: 'Bell Peppers', category: 'Produce', defaultUnit: 'pcs', notes: 'Assorted colors' },
  { id: 'cat-prod-19', name: 'Broccoli Florets', category: 'Produce', defaultUnit: 'crown' },
  { id: 'cat-prod-20', name: 'Cucumbers', category: 'Produce', defaultUnit: 'pcs', notes: 'English seedless' },
  { id: 'cat-prod-21', name: 'Zucchini', category: 'Produce', defaultUnit: 'pcs' },
  { id: 'cat-prod-mushrooms', name: 'Mushrooms', category: 'Produce', defaultUnit: 'pack' },
  { id: 'cat-prod-22', name: 'Cremini Mushrooms', category: 'Produce', defaultUnit: 'pack' },
  { id: 'cat-prod-basil', name: 'Basil', category: 'Produce', defaultUnit: 'bunch' },
  { id: 'cat-prod-23', name: 'Fresh Basil', category: 'Produce', defaultUnit: 'bunch' },
  { id: 'cat-prod-24', name: 'Fresh Cilantro', category: 'Produce', defaultUnit: 'bunch' },
  { id: 'cat-prod-25', name: 'Fresh Parsley', category: 'Produce', defaultUnit: 'bunch' },
  { id: 'cat-prod-26', name: 'Fresh Ginger Root', category: 'Produce', defaultUnit: 'pcs' },
  { id: 'cat-prod-27', name: 'Green Onions (Scallions)', category: 'Produce', defaultUnit: 'bunch' },

  // Dairy & Eggs
  { id: 'cat-dairy-milk', name: 'Milk', category: 'Dairy & Eggs', defaultUnit: 'cup' },
  { id: 'cat-dairy-1', name: 'Whole Milk', category: 'Dairy & Eggs', defaultUnit: 'gal' },
  { id: 'cat-dairy-oatmilk', name: 'Oat Milk', category: 'Dairy & Eggs', defaultUnit: 'carton' },
  { id: 'cat-dairy-2', name: 'Oat Milk (Barista)', category: 'Dairy & Eggs', defaultUnit: 'carton', notes: 'Unsweetened' },
  { id: 'cat-dairy-3', name: 'Almond Milk', category: 'Dairy & Eggs', defaultUnit: 'carton' },
  { id: 'cat-dairy-heavycream', name: 'Heavy Cream', category: 'Dairy & Eggs', defaultUnit: 'cup' },
  { id: 'cat-dairy-4', name: 'Heavy Whipping Cream', category: 'Dairy & Eggs', defaultUnit: 'pint' },
  { id: 'cat-dairy-5', name: 'Half and Half', category: 'Dairy & Eggs', defaultUnit: 'quart' },
  { id: 'cat-dairy-butter', name: 'Butter', category: 'Dairy & Eggs', defaultUnit: 'tbsp' },
  { id: 'cat-dairy-6', name: 'Unsalted Butter', category: 'Dairy & Eggs', defaultUnit: 'pack', notes: 'Bakery quality' },
  { id: 'cat-dairy-7', name: 'Salted Butter', category: 'Dairy & Eggs', defaultUnit: 'pack' },
  { id: 'cat-dairy-eggs', name: 'Eggs', category: 'Dairy & Eggs', defaultUnit: 'pcs' },
  { id: 'cat-dairy-8', name: 'Large Eggs (Grade A)', category: 'Dairy & Eggs', defaultUnit: 'dozen', notes: 'Free-range or pasture-raised' },
  { id: 'cat-dairy-yogurt', name: 'Yogurt', category: 'Dairy & Eggs', defaultUnit: 'cup' },
  { id: 'cat-dairy-9', name: 'Greek Yogurt (Plain)', category: 'Dairy & Eggs', defaultUnit: 'tub', notes: 'Whole milk / 5%' },
  { id: 'cat-dairy-cheese', name: 'Cheese', category: 'Dairy & Eggs', defaultUnit: 'cup' },
  { id: 'cat-dairy-cheddar', name: 'Cheddar Cheese', category: 'Dairy & Eggs', defaultUnit: 'cup' },
  { id: 'cat-dairy-10', name: 'Sharp Cheddar Cheese', category: 'Dairy & Eggs', defaultUnit: 'block' },
  { id: 'cat-dairy-mozzarella', name: 'Mozzarella Cheese', category: 'Dairy & Eggs', defaultUnit: 'cup' },
  { id: 'cat-dairy-11', name: 'Shredded Mozzarella', category: 'Dairy & Eggs', defaultUnit: 'bag' },
  { id: 'cat-dairy-parmesan', name: 'Parmesan Cheese', category: 'Dairy & Eggs', defaultUnit: 'cup' },
  { id: 'cat-dairy-12', name: 'Parmigiano-Reggiano', category: 'Dairy & Eggs', defaultUnit: 'wedge' },
  { id: 'cat-dairy-13', name: 'Cream Cheese', category: 'Dairy & Eggs', defaultUnit: 'oz', notes: 'Full fat brick' },
  { id: 'cat-dairy-14', name: 'Sour Cream', category: 'Dairy & Eggs', defaultUnit: 'tub' },

  // Meat & Seafood
  { id: 'cat-meat-chicken', name: 'Chicken', category: 'Meat & Seafood', defaultUnit: 'lbs' },
  { id: 'cat-meat-1', name: 'Boneless Chicken Breast', category: 'Meat & Seafood', defaultUnit: 'lbs' },
  { id: 'cat-meat-2', name: 'Chicken Thighs (Boneless/Skinless)', category: 'Meat & Seafood', defaultUnit: 'lbs' },
  { id: 'cat-meat-beef', name: 'Beef', category: 'Meat & Seafood', defaultUnit: 'lbs' },
  { id: 'cat-meat-3', name: 'Ground Beef (85/15)', category: 'Meat & Seafood', defaultUnit: 'lbs' },
  { id: 'cat-meat-4', name: 'Ground Turkey', category: 'Meat & Seafood', defaultUnit: 'lbs' },
  { id: 'cat-meat-bacon', name: 'Bacon', category: 'Meat & Seafood', defaultUnit: 'slice' },
  { id: 'cat-meat-5', name: 'Thick-Cut Bacon', category: 'Meat & Seafood', defaultUnit: 'pack', notes: 'Applewood smoked' },
  { id: 'cat-meat-6', name: 'Italian Sausage', category: 'Meat & Seafood', defaultUnit: 'lbs', notes: 'Sweet or mild' },
  { id: 'cat-meat-salmon', name: 'Salmon', category: 'Meat & Seafood', defaultUnit: 'lbs' },
  { id: 'cat-meat-7', name: 'Fresh Salmon Fillet', category: 'Meat & Seafood', defaultUnit: 'lbs', notes: 'Skin-on' },
  { id: 'cat-meat-shrimp', name: 'Shrimp', category: 'Meat & Seafood', defaultUnit: 'lbs' },
  { id: 'cat-meat-8', name: 'Raw Shrimp (Peeled & Deveined)', category: 'Meat & Seafood', defaultUnit: 'lbs' },
  { id: 'cat-meat-9', name: 'Wild Albacore Canned Tuna', category: 'Meat & Seafood', defaultUnit: 'can' },
  { id: 'cat-meat-10', name: 'Ribeye Steak', category: 'Meat & Seafood', defaultUnit: 'lbs' },

  // Bakery
  { id: 'cat-bake-bread', name: 'Bread', category: 'Bakery', defaultUnit: 'loaf' },
  { id: 'cat-bake-1', name: 'Artisan Sourdough Loaf', category: 'Bakery', defaultUnit: 'loaf' },
  { id: 'cat-bake-2', name: 'Sandwich Bread (Whole Wheat)', category: 'Bakery', defaultUnit: 'loaf' },
  { id: 'cat-bake-3', name: 'Brioche Burger Buns', category: 'Bakery', defaultUnit: 'pack' },
  { id: 'cat-bake-4', name: 'Flour Tortillas', category: 'Bakery', defaultUnit: 'pack', notes: 'Street taco or burrito size' },
  { id: 'cat-bake-bagels', name: 'Bagels', category: 'Bakery', defaultUnit: 'pack' },
  { id: 'cat-bake-5', name: 'Plain Bagels', category: 'Bakery', defaultUnit: 'pack' },
  { id: 'cat-bake-6', name: 'Butter Croissants', category: 'Bakery', defaultUnit: 'pack' },
  { id: 'cat-bake-7', name: 'Pita Bread', category: 'Bakery', defaultUnit: 'pack' },

  // Pantry
  { id: 'cat-pantry-flour', name: 'Flour', category: 'Pantry', defaultUnit: 'cup' },
  { id: 'cat-pantry-3', name: 'All-Purpose Flour', category: 'Pantry', defaultUnit: 'bag', notes: 'Unbleached' },
  { id: 'cat-pantry-sugar', name: 'Sugar', category: 'Pantry', defaultUnit: 'cup' },
  { id: 'cat-pantry-4', name: 'Granulated White Sugar', category: 'Pantry', defaultUnit: 'bag' },
  { id: 'cat-pantry-brownsugar', name: 'Brown Sugar', category: 'Pantry', defaultUnit: 'cup' },
  { id: 'cat-pantry-5', name: 'Light Brown Sugar', category: 'Pantry', defaultUnit: 'bag' },
  { id: 'cat-pantry-powderedsugar', name: 'Powdered Sugar', category: 'Pantry', defaultUnit: 'cup' },
  { id: 'cat-pantry-6', name: 'Powdered Confectioners Sugar', category: 'Pantry', defaultUnit: 'bag' },
  { id: 'cat-pantry-oliveoil', name: 'Olive Oil', category: 'Pantry', defaultUnit: 'tbsp' },
  { id: 'cat-pantry-1', name: 'Extra Virgin Olive Oil', category: 'Pantry', defaultUnit: 'bottle', notes: 'Cold-pressed' },
  { id: 'cat-pantry-oil', name: 'Oil (Vegetable / Canola)', category: 'Pantry', defaultUnit: 'tbsp' },
  { id: 'cat-pantry-2', name: 'Avocado Oil / Canola Oil', category: 'Pantry', defaultUnit: 'bottle' },
  { id: 'cat-pantry-honey', name: 'Honey', category: 'Pantry', defaultUnit: 'tbsp' },
  { id: 'cat-pantry-8', name: 'Raw Honey', category: 'Pantry', defaultUnit: 'jar' },
  { id: 'cat-pantry-maplesyrup', name: 'Maple Syrup', category: 'Pantry', defaultUnit: 'tbsp' },
  { id: 'cat-pantry-7', name: 'Pure Maple Syrup', category: 'Pantry', defaultUnit: 'bottle', notes: 'Grade A Amber' },
  { id: 'cat-pantry-rice', name: 'Rice', category: 'Pantry', defaultUnit: 'cup' },
  { id: 'cat-pantry-9', name: 'Jasmine Rice', category: 'Pantry', defaultUnit: 'bag' },
  { id: 'cat-pantry-pasta', name: 'Pasta', category: 'Pantry', defaultUnit: 'box' },
  { id: 'cat-pantry-10', name: 'Spaghetti Pasta', category: 'Pantry', defaultUnit: 'box' },
  { id: 'cat-pantry-11', name: 'Penne Rigate Pasta', category: 'Pantry', defaultUnit: 'box' },
  { id: 'cat-pantry-oats', name: 'Oats', category: 'Pantry', defaultUnit: 'cup' },
  { id: 'cat-pantry-12', name: 'Old Fashioned Rolled Oats', category: 'Pantry', defaultUnit: 'container' },
  { id: 'cat-pantry-13', name: 'Canned San Marzano Tomatoes', category: 'Pantry', defaultUnit: 'can' },
  { id: 'cat-pantry-14', name: 'Tomato Paste', category: 'Pantry', defaultUnit: 'tube' },
  { id: 'cat-pantry-15', name: 'Canned Black Beans', category: 'Pantry', defaultUnit: 'can' },
  { id: 'cat-pantry-16', name: 'Canned Chickpeas (Garbanzo)', category: 'Pantry', defaultUnit: 'can' },
  { id: 'cat-pantry-peanutbutter', name: 'Peanut Butter', category: 'Pantry', defaultUnit: 'tbsp' },
  { id: 'cat-pantry-17', name: 'Creamy Peanut Butter', category: 'Pantry', defaultUnit: 'jar' },
  { id: 'cat-pantry-18', name: 'Chicken Bone Broth', category: 'Pantry', defaultUnit: 'carton' },
  { id: 'cat-pantry-19', name: 'Vegetable Broth', category: 'Pantry', defaultUnit: 'carton' },
  { id: 'cat-pantry-soysauce', name: 'Soy Sauce', category: 'Pantry', defaultUnit: 'tbsp' },
  { id: 'cat-pantry-20', name: 'Low-Sodium Soy Sauce', category: 'Pantry', defaultUnit: 'bottle' },
  { id: 'cat-pantry-21', name: 'Balsamic Vinegar', category: 'Pantry', defaultUnit: 'bottle' },
  { id: 'cat-pantry-22', name: 'Apple Cider Vinegar', category: 'Pantry', defaultUnit: 'bottle' },

  // Spices & Seasonings
  { id: 'cat-spice-salt', name: 'Salt', category: 'Spices & Seasonings', defaultUnit: 'tsp' },
  { id: 'cat-spice-1', name: 'Fine Sea Salt / Kosher Salt', category: 'Spices & Seasonings', defaultUnit: 'box' },
  { id: 'cat-spice-pepper', name: 'Pepper', category: 'Spices & Seasonings', defaultUnit: 'tsp' },
  { id: 'cat-spice-blackpepper', name: 'Black Pepper', category: 'Spices & Seasonings', defaultUnit: 'tsp' },
  { id: 'cat-spice-2', name: 'Black Peppercorns (Whole)', category: 'Spices & Seasonings', defaultUnit: 'grinder' },
  { id: 'cat-spice-3', name: 'Garlic Powder', category: 'Spices & Seasonings', defaultUnit: 'jar' },
  { id: 'cat-spice-4', name: 'Onion Powder', category: 'Spices & Seasonings', defaultUnit: 'jar' },
  { id: 'cat-spice-5', name: 'Smoked Paprika', category: 'Spices & Seasonings', defaultUnit: 'jar' },
  { id: 'cat-spice-cinnamon', name: 'Cinnamon', category: 'Spices & Seasonings', defaultUnit: 'tsp' },
  { id: 'cat-spice-6', name: 'Ground Cinnamon', category: 'Spices & Seasonings', defaultUnit: 'jar' },
  { id: 'cat-spice-cumin', name: 'Cumin', category: 'Spices & Seasonings', defaultUnit: 'tsp' },
  { id: 'cat-spice-7', name: 'Ground Cumin', category: 'Spices & Seasonings', defaultUnit: 'jar' },
  { id: 'cat-spice-oregano', name: 'Oregano', category: 'Spices & Seasonings', defaultUnit: 'tsp' },
  { id: 'cat-spice-8', name: 'Dried Oregano', category: 'Spices & Seasonings', defaultUnit: 'jar' },
  { id: 'cat-spice-9', name: 'Crushed Red Pepper Flakes', category: 'Spices & Seasonings', defaultUnit: 'jar' },
  { id: 'cat-spice-vanilla', name: 'Vanilla Extract', category: 'Spices & Seasonings', defaultUnit: 'tsp' },
  { id: 'cat-spice-10', name: 'Pure Vanilla Extract', category: 'Spices & Seasonings', defaultUnit: 'bottle', notes: 'Madagascar Bourbon' },
  { id: 'cat-spice-bakingpowder', name: 'Baking Powder', category: 'Spices & Seasonings', defaultUnit: 'tsp' },
  { id: 'cat-spice-11', name: 'Baking Powder (Aluminum Free)', category: 'Spices & Seasonings', defaultUnit: 'can' },
  { id: 'cat-spice-bakingsoda', name: 'Baking Soda', category: 'Spices & Seasonings', defaultUnit: 'tsp' },
  { id: 'cat-spice-12', name: 'Baking Soda', category: 'Spices & Seasonings', defaultUnit: 'box' },
  { id: 'cat-spice-yeast', name: 'Yeast', category: 'Spices & Seasonings', defaultUnit: 'packet' },
  { id: 'cat-spice-13', name: 'Active Dry Yeast Packets', category: 'Spices & Seasonings', defaultUnit: 'strip' },

  // Beverages
  { id: 'cat-bev-coffee', name: 'Coffee', category: 'Beverages', defaultUnit: 'cup' },
  { id: 'cat-bev-1', name: 'Whole Bean Coffee', category: 'Beverages', defaultUnit: 'bag', notes: 'Medium roast' },
  { id: 'cat-bev-tea', name: 'Tea', category: 'Beverages', defaultUnit: 'bag' },
  { id: 'cat-bev-2', name: 'Green Tea / Matcha', category: 'Beverages', defaultUnit: 'box' },
  { id: 'cat-bev-3', name: 'Earl Grey Black Tea', category: 'Beverages', defaultUnit: 'box' },
  { id: 'cat-bev-4', name: 'Sparkling Mineral Water', category: 'Beverages', defaultUnit: 'pack' },
  { id: 'cat-bev-5', name: 'Fresh Squeezed Orange Juice', category: 'Beverages', defaultUnit: 'bottle', notes: 'No pulp' },

  // Frozen
  { id: 'cat-froz-1', name: 'Frozen Mixed Berries', category: 'Frozen', defaultUnit: 'bag', notes: 'For smoothies & baking' },
  { id: 'cat-froz-2', name: 'Frozen Sweet Peas', category: 'Frozen', defaultUnit: 'bag' },
  { id: 'cat-froz-3', name: 'Frozen Cut Corn', category: 'Frozen', defaultUnit: 'bag' },
  { id: 'cat-froz-4', name: 'Vanilla Bean Ice Cream', category: 'Frozen', defaultUnit: 'pint' },
  { id: 'cat-froz-5', name: 'Frozen Chopped Spinach', category: 'Frozen', defaultUnit: 'box' },

  // Household & Other
  { id: 'cat-house-1', name: 'Paper Towels', category: 'Household & Other', defaultUnit: 'rolls' },
  { id: 'cat-house-2', name: 'Dish Soap', category: 'Household & Other', defaultUnit: 'bottle' },
  { id: 'cat-house-3', name: 'Parchment Paper Rolls', category: 'Household & Other', defaultUnit: 'box', notes: 'Non-stick baking' },
  { id: 'cat-house-4', name: 'Heavy Duty Aluminum Foil', category: 'Household & Other', defaultUnit: 'box' },
  { id: 'cat-house-5', name: 'Kitchen Trash Bags', category: 'Household & Other', defaultUnit: 'box' },
];

const STORAGE_KEY_CATEGORIES = 'my_cookbook_grocery_categories_v2';
const STORAGE_KEY_ITEMS = 'my_cookbook_grocery_catalog_v2';

export function getStoredCategories(): string[] {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
  } catch {
    // ignore parse error
  }
  return DEFAULT_GROCERY_CATEGORIES;
}

export function saveStoredCategories(categories: string[]): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    }
  } catch {
    // ignore
  }
}

export function getStoredCatalogItems(): CatalogItem[] {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY_ITEMS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
  } catch {
    // ignore
  }
  return DEFAULT_CATALOG_ITEMS;
}

export function saveStoredCatalogItems(items: CatalogItem[]): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
    }
  } catch {
    // ignore
  }
}

export function resetStoredCatalog(): { categories: string[]; items: CatalogItem[] } {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_CATEGORIES);
      localStorage.removeItem(STORAGE_KEY_ITEMS);
    }
  } catch {
    // ignore
  }
  return {
    categories: DEFAULT_GROCERY_CATEGORIES,
    items: DEFAULT_CATALOG_ITEMS,
  };
}
