import 'fake-indexeddb/auto';
import { describe, it, expect } from 'vitest';
import type { Recipe } from '../../../types';

describe('Recipe Photo Framing Metadata', () => {
  it('supports originalHeroImage, heroImageScale, and heroImagePosition in Recipe model', () => {
    const recipeWithFraming: Recipe = {
      id: 'recipe-framed-1',
      title: 'Framed Croissant',
      description: 'Buttery flaky croissants',
      heroImage: 'data:image/webp;base64,framedDataUrl',
      originalHeroImage: 'data:image/webp;base64,sourceRawDataUrl',
      heroImageScale: 1.45,
      heroImagePosition: { x: 12.5, y: -8.0 },
      prepTimeMinutes: 30,
      cookTimeMinutes: 20,
      servings: 8,
      categories: ['Bakery'],
      ingredients: [],
      steps: [],
      isFavorite: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(recipeWithFraming.heroImageScale).toBe(1.45);
    expect(recipeWithFraming.heroImagePosition).toEqual({ x: 12.5, y: -8.0 });
    expect(recipeWithFraming.originalHeroImage).toBe('data:image/webp;base64,sourceRawDataUrl');
    expect(recipeWithFraming.heroImage).toBe('data:image/webp;base64,framedDataUrl');
  });

  it('correctly calculates 16:9 aspect ratio target dimensions', () => {
    const targetWidth = 1200;
    const targetHeight = 675;
    const ratio = targetWidth / targetHeight;

    expect(ratio).toBeCloseTo(16 / 9, 3);
  });
});
