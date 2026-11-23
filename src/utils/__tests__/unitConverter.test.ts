import { describe, it, expect, beforeEach } from 'vitest';
import {
  convertIngredient,
  getStoredUnitSystem,
  setStoredUnitSystem,
  isMetricUnit,
  isUsUnit,
} from '../unitConverter';
import type { Ingredient } from '../../types';

// In-memory mock for localStorage in Vitest node environment
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
globalThis.window = { localStorage: mockLocalStorage } as unknown as Window & typeof globalThis;

describe('unitConverter', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('localStorage preference persistence', () => {
    it('defaults to us system when no storage value exists', () => {
      expect(getStoredUnitSystem()).toBe('us');
    });

    it('persists and retrieves metric preference', () => {
      setStoredUnitSystem('metric');
      expect(getStoredUnitSystem()).toBe('metric');
    });

    it('persists and retrieves us preference', () => {
      setStoredUnitSystem('metric');
      setStoredUnitSystem('us');
      expect(getStoredUnitSystem()).toBe('us');
    });
  });

  describe('unit detection', () => {
    it('identifies metric units correctly', () => {
      expect(isMetricUnit('g')).toBe(true);
      expect(isMetricUnit('grams')).toBe(true);
      expect(isMetricUnit('kg')).toBe(true);
      expect(isMetricUnit('ml')).toBe(true);
      expect(isMetricUnit('l')).toBe(true);
      expect(isMetricUnit('cup')).toBe(false);
      expect(isMetricUnit('tbsp')).toBe(false);
    });

    it('identifies US customary units correctly', () => {
      expect(isUsUnit('cup')).toBe(true);
      expect(isUsUnit('cups')).toBe(true);
      expect(isUsUnit('tbsp')).toBe(true);
      expect(isUsUnit('tsp')).toBe(true);
      expect(isUsUnit('oz')).toBe(true);
      expect(isUsUnit('lb')).toBe(true);
      expect(isUsUnit('g')).toBe(false);
      expect(isUsUnit('ml')).toBe(false);
    });
  });

  describe('convertIngredient US -> Metric', () => {
    it('converts cups of all-purpose flour to grams accurately', () => {
      const ing: Ingredient = {
        id: '1',
        name: 'All-Purpose Flour',
        amount: 2,
        unit: 'cup',
        displayFraction: '2',
      };
      const res = convertIngredient(ing, 'metric', 1);
      expect(res.unit).toBe('g');
      expect(res.amount).toBe(250);
      expect(res.displayQuantity).toBe('250');
    });

    it('converts tablespoons of granulated sugar to grams', () => {
      const ing: Ingredient = {
        id: '2',
        name: 'Granulated Sugar',
        amount: 2,
        unit: 'tbsp',
        displayFraction: '2',
      };
      const res = convertIngredient(ing, 'metric', 1);
      expect(res.unit).toBe('g');
      expect(res.amount).toBe(25);
      expect(res.displayQuantity).toBe('25');
    });

    it('converts teaspoons of baking powder to grams', () => {
      const ing: Ingredient = {
        id: '3',
        name: 'Baking Powder',
        amount: 2,
        unit: 'tsp',
        displayFraction: '2',
      };
      const res = convertIngredient(ing, 'metric', 1);
      expect(res.unit).toBe('g');
      expect(res.amount).toBe(8);
      expect(res.displayQuantity).toBe('8');
    });

    it('converts half teaspoon of salt to grams', () => {
      const ing: Ingredient = {
        id: '4',
        name: 'Salt',
        amount: 0.5,
        unit: 'tsp',
        displayFraction: '1/2',
      };
      const res = convertIngredient(ing, 'metric', 1);
      expect(res.unit).toBe('g');
      expect(res.amount).toBe(3);
      expect(res.displayQuantity).toBe('3');
    });

    it('converts cups of milk to milliliters', () => {
      const ing: Ingredient = {
        id: '5',
        name: 'Whole Milk',
        amount: 1.5,
        unit: 'cup',
        displayFraction: '1 1/2',
      };
      const res = convertIngredient(ing, 'metric', 1);
      expect(res.unit).toBe('ml');
      expect(res.amount).toBe(360);
      expect(res.displayQuantity).toBe('360');
    });

    it('converts weight ounces to grams', () => {
      const ing: Ingredient = {
        id: '6',
        name: 'Spaghetti Pasta',
        amount: 8,
        unit: 'oz',
        displayFraction: '8',
      };
      const res = convertIngredient(ing, 'metric', 1);
      expect(res.unit).toBe('g');
      expect(res.amount).toBe(225);
      expect(res.displayQuantity).toBe('225');
    });

    it('preserves non-convertible count units like eggs and cloves', () => {
      const eggs: Ingredient = {
        id: '7',
        name: 'Eggs',
        amount: 2,
        unit: '',
        displayFraction: '2',
      };
      const resEggs = convertIngredient(eggs, 'metric', 1);
      expect(resEggs.unit).toBe('');
      expect(resEggs.amount).toBe(2);
      expect(resEggs.displayQuantity).toBe('2');

      const garlic: Ingredient = {
        id: '8',
        name: 'Garlic Cloves',
        amount: 6,
        unit: 'clove',
        displayFraction: '6',
      };
      const resGarlic = convertIngredient(garlic, 'metric', 1);
      expect(resGarlic.unit).toBe('clove');
      expect(resGarlic.amount).toBe(6);
      expect(resGarlic.displayQuantity).toBe('6');
    });
  });

  describe('convertIngredient with Servings Scaling', () => {
    it('scales amounts correctly when multiplier is applied', () => {
      const ing: Ingredient = {
        id: '1',
        name: 'All-Purpose Flour',
        amount: 2,
        unit: 'cup',
        displayFraction: '2',
      };
      // Double the recipe (2x multiplier)
      const res = convertIngredient(ing, 'metric', 2);
      expect(res.unit).toBe('g');
      expect(res.amount).toBe(500);
      expect(res.displayQuantity).toBe('500');

      // In US mode with 2x
      const resUs = convertIngredient(ing, 'us', 2);
      expect(resUs.unit).toBe('cup');
      expect(resUs.amount).toBe(4);
      expect(resUs.displayQuantity).toBe('4');
    });
  });

  describe('convertIngredient Metric -> US', () => {
    it('converts grams of flour back to cups', () => {
      const ing: Ingredient = {
        id: '1',
        name: 'All-Purpose Flour',
        amount: 250,
        unit: 'g',
        displayFraction: '250',
      };
      const res = convertIngredient(ing, 'us', 1);
      expect(res.unit).toBe('cup');
      expect(res.amount).toBe(2);
      expect(res.displayQuantity).toBe('2');
    });

    it('converts milliliters of milk back to cups', () => {
      const ing: Ingredient = {
        id: '2',
        name: 'Whole Milk',
        amount: 240,
        unit: 'ml',
        displayFraction: '240',
      };
      const res = convertIngredient(ing, 'us', 1);
      expect(res.unit).toBe('cup');
      expect(res.amount).toBe(1);
      expect(res.displayQuantity).toBe('1');
    });
  });
});
