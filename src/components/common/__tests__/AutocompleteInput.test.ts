import { describe, it, expect } from 'vitest';
import { filterSuggestions, type SuggestionItem } from '../../../utils/suggestionUtils';

describe('AutocompleteInput prefix filtering', () => {
  const sampleItems: SuggestionItem[] = [
    { name: 'Honeycrisp Apples', category: 'Produce' },
    { name: 'Apples (Honeycrisp)', category: 'Produce' },
    { name: 'Pineapple', category: 'Produce' },
    { name: 'Grapefruit', category: 'Produce' },
    { name: 'Grapes', category: 'Produce' },
    { name: 'Jalapeno', category: 'Produce' },
    { name: 'Honey', category: 'Pantry' },
    { name: 'Raw Honey', category: 'Pantry' },
    { name: 'Oat Milk', category: 'Dairy & Eggs' },
    { name: 'Whole Milk', category: 'Dairy & Eggs' },
    { name: 'Almond Milk', category: 'Dairy & Eggs' },
    { name: 'Oats', category: 'Pantry' },
    { name: 'Chicken Breast', category: 'Meat & Seafood' },
    { name: 'Zucchini', category: 'Produce' },
  ];

  it('only returns items that start with the typed letters (not ones that contain them)', () => {
    // When typing 'ap', matches 'Apples (Honeycrisp)', but NOT 'Pineapple' or 'Jalapeno' or 'Grapefruit'
    const results = filterSuggestions(sampleItems, 'ap');
    const names = results.map((r) => r.name);
    expect(names).toContain('Apples (Honeycrisp)');
    expect(names).not.toContain('Pineapple');
    expect(names).not.toContain('Jalapeno');
    expect(names).not.toContain('Grapefruit');
  });

  it('returns items starting with "hon", strictly excluding items with "hon" in the middle', () => {
    const results = filterSuggestions(sampleItems, 'hon');
    const names = results.map((r) => r.name);
    expect(names).toContain('Honeycrisp Apples');
    expect(names).toContain('Honey');
    expect(names).not.toContain('Raw Honey'); // Starts with 'R', not 'H'
  });

  it('matches prefix case-insensitively', () => {
    const lower = filterSuggestions(sampleItems, 'oat');
    const upper = filterSuggestions(sampleItems, 'OAT');
    const mixed = filterSuggestions(sampleItems, 'Oat');
    expect(lower.map((r) => r.name)).toEqual(upper.map((r) => r.name));
    expect(lower.map((r) => r.name)).toEqual(mixed.map((r) => r.name));
    expect(lower.map((r) => r.name)).toEqual(['Oat Milk', 'Oats']);
  });

  it('returns empty array when input is empty or whitespace only', () => {
    expect(filterSuggestions(sampleItems, '')).toEqual([]);
    expect(filterSuggestions(sampleItems, '   ')).toEqual([]);
  });

  it('handles leading whitespace gracefully by trimming start', () => {
    const results = filterSuggestions(sampleItems, '  ch');
    const names = results.map((r) => r.name);
    expect(names).toContain('Chicken Breast');
    expect(names).not.toContain('Zucchini');
  });

  it('deduplicates items with identical names', () => {
    const duplicates: SuggestionItem[] = [
      { name: 'Butter', category: 'Dairy' },
      { name: 'Butter', category: 'Pantry' },
      { name: 'Buttermilk', category: 'Dairy' },
    ];
    const results = filterSuggestions(duplicates, 'butt');
    expect(results).toHaveLength(2);
    expect(results.map((r) => r.name)).toEqual(['Butter', 'Buttermilk']);
  });
});
