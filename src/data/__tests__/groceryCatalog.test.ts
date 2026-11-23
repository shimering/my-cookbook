import { describe, it, expect, beforeEach } from 'vitest';
import {
  DEFAULT_GROCERY_CATEGORIES,
  DEFAULT_CATALOG_ITEMS,
  getStoredCategories,
  saveStoredCategories,
  getStoredCatalogItems,
  saveStoredCatalogItems,
  resetStoredCatalog,
} from '../groceryCatalog';

// Simple in-memory mock for localStorage in Vitest node environment
const store: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => store[key] || null,
  setItem: (key: string, value: string) => {
    store[key] = value;
  },
  removeItem: (key: string) => {
    delete store[key];
  },
  clear: () => {
    for (const k of Object.keys(store)) {
      delete store[k];
    }
  },
};

globalThis.localStorage = mockLocalStorage as unknown as Storage;

describe('groceryCatalog', () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
  });

  it('provides comprehensive default categories covering major food groups', () => {
    const cats = getStoredCategories();
    expect(cats).toContain('Produce');
    expect(cats).toContain('Dairy & Eggs');
    expect(cats).toContain('Meat & Seafood');
    expect(cats).toContain('Bakery');
    expect(cats).toContain('Pantry');
    expect(cats).toContain('Spices & Seasonings');
    expect(cats).toContain('Beverages');
    expect(cats).toContain('Frozen');
    expect(cats).toContain('Household & Other');
  });

  it('provides a rich library of default food grocery items', () => {
    const items = getStoredCatalogItems();
    expect(items.length).toBeGreaterThanOrEqual(50);
    const names = items.map((i) => i.name.toLowerCase());
    expect(names.some((n) => n.includes('apple'))).toBe(true);
    expect(names.some((n) => n.includes('milk'))).toBe(true);
    expect(names.some((n) => n.includes('chicken'))).toBe(true);
    expect(names.some((n) => n.includes('bread') || n.includes('sourdough'))).toBe(true);
    expect(names.some((n) => n.includes('flour'))).toBe(true);
  });

  it('persists customized categories to storage', () => {
    const custom = ['Organic Veggies', 'Baking Delights'];
    saveStoredCategories(custom);
    expect(getStoredCategories()).toEqual(custom);
  });

  it('resets to defaults when requested', () => {
    saveStoredCategories(['Custom Only']);
    saveStoredCatalogItems([]);
    expect(getStoredCategories()).toEqual(['Custom Only']);

    const restored = resetStoredCatalog();
    expect(restored.categories).toEqual(DEFAULT_GROCERY_CATEGORIES);
    expect(restored.items).toEqual(DEFAULT_CATALOG_ITEMS);
    expect(getStoredCategories()).toEqual(DEFAULT_GROCERY_CATEGORIES);
  });
});
