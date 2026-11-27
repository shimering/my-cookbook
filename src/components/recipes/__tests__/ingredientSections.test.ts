import { describe, it, expect } from 'vitest';
import type { Ingredient } from '../../../types';

// Pure logic functions mirroring the section workflow in RecipeFormModal
function groupIngredientsBySection(ingredients: Ingredient[]) {
  const groups: { section: string; items: { ing: Ingredient; originalIndex: number }[] }[] = [];
  const map = new Map<string, { section: string; items: { ing: Ingredient; originalIndex: number }[] }>();

  ingredients.forEach((ing, index) => {
    const sec = ing.section?.trim() || '';
    if (!map.has(sec)) {
      const group = { section: sec, items: [] as { ing: Ingredient; originalIndex: number }[] };
      map.set(sec, group);
      groups.push(group);
    }
    map.get(sec)!.items.push({ ing, originalIndex: index });
  });

  return groups;
}

function renameSection(ingredients: Ingredient[], oldName: string, newName: string) {
  return ingredients.map((ing) =>
    (ing.section || '').trim() === oldName.trim() ? { ...ing, section: newName.trim() } : ing
  );
}

function ungroupSection(ingredients: Ingredient[], sectionName: string) {
  return ingredients.map((ing) =>
    (ing.section || '').trim() === sectionName.trim() ? { ...ing, section: '' } : ing
  );
}

describe('Ingredient Sections Workflow', () => {
  const sampleIngredients: Ingredient[] = [
    { id: '1', name: 'All-Purpose Flour', amount: 2, unit: 'cup', section: '' },
    { id: '2', name: 'Granulated Sugar', amount: 1, unit: 'cup', section: '' },
    { id: '3', name: 'Heavy Whipping Cream', amount: 1, unit: 'cup', section: 'For the Sauce' },
    { id: '4', name: 'Vanilla Extract', amount: 1, unit: 'tsp', section: 'For the Sauce' },
    { id: '5', name: 'Strawberries', amount: 2, unit: 'cup', section: 'Topping' },
  ];

  it('groups ingredients accurately into main and named sections while preserving original indices', () => {
    const groups = groupIngredientsBySection(sampleIngredients);
    expect(groups).toHaveLength(3);

    // Main section
    expect(groups[0].section).toBe('');
    expect(groups[0].items).toHaveLength(2);
    expect(groups[0].items[0].originalIndex).toBe(0);
    expect(groups[0].items[1].originalIndex).toBe(1);

    // "For the Sauce" section
    expect(groups[1].section).toBe('For the Sauce');
    expect(groups[1].items).toHaveLength(2);
    expect(groups[1].items[0].originalIndex).toBe(2);
    expect(groups[1].items[1].originalIndex).toBe(3);

    // "Topping" section
    expect(groups[2].section).toBe('Topping');
    expect(groups[2].items).toHaveLength(1);
    expect(groups[2].items[0].originalIndex).toBe(4);
  });

  it('detects when no named sections exist', () => {
    const noSections: Ingredient[] = [
      { id: '1', name: 'Flour', amount: 2, unit: 'cup', section: '' },
      { id: '2', name: 'Sugar', amount: 1, unit: 'cup' },
    ];
    const groups = groupIngredientsBySection(noSections);
    const hasNamed = groups.some((g) => g.section !== '');
    expect(hasNamed).toBe(false);
  });

  it('renames an existing section across all associated ingredients', () => {
    const renamed = renameSection(sampleIngredients, 'For the Sauce', 'Salted Caramel Sauce');
    const sauceItems = renamed.filter((i) => i.section === 'Salted Caramel Sauce');
    expect(sauceItems).toHaveLength(2);
    expect(sauceItems.map((i) => i.name)).toEqual(['Heavy Whipping Cream', 'Vanilla Extract']);

    // Other sections unchanged
    expect(renamed.find((i) => i.name === 'Strawberries')?.section).toBe('Topping');
  });

  it('ungroups a section so its ingredients cleanly merge into main ingredients', () => {
    const ungrouped = ungroupSection(sampleIngredients, 'For the Sauce');
    const mainItems = ungrouped.filter((i) => !i.section);
    expect(mainItems).toHaveLength(4);
    expect(mainItems.map((i) => i.name)).toContain('Heavy Whipping Cream');
    expect(mainItems.map((i) => i.name)).toContain('Vanilla Extract');
  });
});
