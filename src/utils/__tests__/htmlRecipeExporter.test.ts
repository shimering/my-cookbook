import { describe, it, expect } from 'vitest';
import { generateCookbookHtml } from '../htmlRecipeExporter';
import type { Recipe } from '../../types';

describe('htmlRecipeExporter', () => {
  const sampleRecipes: Recipe[] = [
    {
      id: 'rec-1',
      title: 'Berry Fluffy Pancakes',
      description: 'Golden pancakes with bananas and blueberries.',
      heroImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
      prepTimeMinutes: 15,
      cookTimeMinutes: 10,
      servings: 4,
      categories: ['Breakfast', 'Quick Meals'],
      ingredients: [
        { id: 'ing-1', name: 'Flour', amount: 2, unit: 'cup', displayFraction: '2' },
        { id: 'ing-2', name: 'Milk', amount: 1.5, unit: 'cup', displayFraction: '1 1/2' },
        { id: 'ing-3', name: 'Eggs', amount: 2, unit: 'piece', displayFraction: '2' },
      ],
      steps: [
        { id: 'step-1', stepNumber: 1, instruction: 'Whisk dry ingredients together.' },
        { id: 'step-2', stepNumber: 2, instruction: 'Cook on griddle until golden.' },
      ],
      isFavorite: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'rec-2',
      title: 'Warm Cinnamon Rolls <script>alert("xss")</script>',
      description: 'Gooey rolls with frosting.',
      heroImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      prepTimeMinutes: 30,
      cookTimeMinutes: 25,
      servings: 8,
      categories: ['Desserts'],
      ingredients: [
        { id: 'ing-4', name: 'Yeast', amount: 1, unit: 'pkg', displayFraction: '1' },
      ],
      steps: [
        { id: 'step-3', stepNumber: 1, instruction: 'Roll out dough and spread cinnamon butter.' },
      ],
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  it('generates a full HTML document containing recipe titles, ingredients, and instructions', () => {
    const html = generateCookbookHtml(sampleRecipes, { appTitle: 'My Test Cookbook' });

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('My Test Cookbook');
    expect(html).toContain('Berry Fluffy Pancakes');
    expect(html).toContain('Golden pancakes with bananas and blueberries.');
    expect(html).toContain('Flour');
    expect(html).toContain('Whisk dry ingredients together.');
    expect(html).toContain('Cook on griddle until golden.');
    expect(html).toContain('https://images.unsplash.com/photo-1546069901-ba9599a7e63c');
    expect(html).toContain('Prep: 15 mins');
    expect(html).toContain('Cook: 10 mins');
    expect(html).toContain('Total: 25 mins');
    expect(html).toContain('Servings: 4');
  });

  it('properly escapes HTML entities to prevent script injection', () => {
    const html = generateCookbookHtml(sampleRecipes);
    expect(html).not.toContain('<script>alert("xss")</script>');
    expect(html).toContain('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  });

  it('includes interactive elements: table of contents, search filter, and print button', () => {
    const html = generateCookbookHtml(sampleRecipes);
    expect(html).toContain('Recipe Index (2)');
    expect(html).toContain('href="#recipe-rec-1"');
    expect(html).toContain('href="#recipe-rec-2"');
    expect(html).toContain('window.print()');
    expect(html).toContain('filterRecipes');
  });

  it('includes print styles for clean PDF and hardcopy export', () => {
    const html = generateCookbookHtml(sampleRecipes);
    expect(html).toContain('@media print');
    expect(html).toContain('page-break-after: always');
  });
});
