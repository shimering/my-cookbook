import { describe, it, expect } from 'vitest';
import {
  parseDurationToMinutes,
  parseYieldToServings,
  parseRawIngredientLine,
  parseRawInstructions,
  parseRecipeFromHtml,
} from '../recipeExtractor';

describe('recipeExtractor', () => {
  describe('parseDurationToMinutes', () => {
    it('parses standard ISO 8601 durations', () => {
      expect(parseDurationToMinutes('PT15M')).toBe(15);
      expect(parseDurationToMinutes('PT1H')).toBe(60);
      expect(parseDurationToMinutes('PT1H30M')).toBe(90);
      expect(parseDurationToMinutes('P0DT0H45M')).toBe(45);
      expect(parseDurationToMinutes('P1DT2H')).toBe(26 * 60);
    });

    it('parses human readable duration strings', () => {
      expect(parseDurationToMinutes('20 mins')).toBe(20);
      expect(parseDurationToMinutes('1 hour 15 minutes')).toBe(75);
      expect(parseDurationToMinutes('45 m')).toBe(45);
    });

    it('returns 0 for empty or invalid values', () => {
      expect(parseDurationToMinutes('')).toBe(0);
      expect(parseDurationToMinutes(null)).toBe(0);
      expect(parseDurationToMinutes('none')).toBe(0);
    });
  });

  describe('parseYieldToServings', () => {
    it('parses numbers and strings into servings count', () => {
      expect(parseYieldToServings(4)).toBe(4);
      expect(parseYieldToServings('4 servings')).toBe(4);
      expect(parseYieldToServings(['6', '6 servings'])).toBe(6);
      expect(parseYieldToServings('Makes 12 muffins')).toBe(12);
    });

    it('defaults to 4 if unspecified', () => {
      expect(parseYieldToServings(null)).toBe(4);
      expect(parseYieldToServings('')).toBe(4);
    });
  });

  describe('parseRawIngredientLine', () => {
    it('extracts amount, unit, and name from common ingredient lines', () => {
      const ing1 = parseRawIngredientLine('2 cups all-purpose flour', 0);
      expect(ing1.amount).toBe(2);
      expect(ing1.displayFraction).toBe('2');
      expect(ing1.unit).toBe('cup');
      expect(ing1.name).toBe('all-purpose flour');

      const ing2 = parseRawIngredientLine('1 1/2 tbsp olive oil', 1);
      expect(ing2.amount).toBe(1.5);
      expect(ing2.displayFraction).toBe('1 1/2');
      expect(ing2.unit).toBe('tbsp');
      expect(ing2.name).toBe('olive oil');

      const ing3 = parseRawIngredientLine('1/2 tsp pure vanilla extract', 2);
      expect(ing3.amount).toBe(0.5);
      expect(ing3.displayFraction).toBe('1/2');
      expect(ing3.unit).toBe('tsp');
      expect(ing3.name).toBe('pure vanilla extract');

      const ing4 = parseRawIngredientLine('250 g dark chocolate, chopped', 3);
      expect(ing4.amount).toBe(250);
      expect(ing4.unit).toBe('g');
      expect(ing4.name).toBe('dark chocolate, chopped');

      const ing5 = parseRawIngredientLine('3 large eggs', 4);
      expect(ing5.amount).toBe(3);
      expect(ing5.name).toBe('large eggs');
    });
  });

  describe('parseRawInstructions', () => {
    it('handles arrays of HowToStep objects', () => {
      const data = [
        { '@type': 'HowToStep', text: 'Preheat oven to 375°F (190°C).' },
        { '@type': 'HowToStep', text: 'Whisk flour, sugar, and baking powder in a large bowl.' },
      ];
      const steps = parseRawInstructions(data);
      expect(steps).toHaveLength(2);
      expect(steps[0].instruction).toBe('Preheat oven to 375°F (190°C).');
      expect(steps[0].stepNumber).toBe(1);
      expect(steps[1].instruction).toBe('Whisk flour, sugar, and baking powder in a large bowl.');
      expect(steps[1].stepNumber).toBe(2);
    });

    it('handles nested HowToSection structures', () => {
      const data = [
        {
          '@type': 'HowToSection',
          name: 'Make the Dough',
          itemListElement: [
            { '@type': 'HowToStep', text: 'Mix warm milk with yeast.' },
            { '@type': 'HowToStep', text: 'Knead for 8 minutes.' },
          ],
        },
      ];
      const steps = parseRawInstructions(data);
      expect(steps).toHaveLength(2);
      expect(steps[0].instruction).toBe('Mix warm milk with yeast.');
      expect(steps[1].instruction).toBe('Knead for 8 minutes.');
    });

    it('handles string arrays and cleans leading numbers', () => {
      const data = ['1. Melt the butter in a pan.', '2. Add onions and saute until golden.'];
      const steps = parseRawInstructions(data);
      expect(steps[0].instruction).toBe('Melt the butter in a pan.');
      expect(steps[1].instruction).toBe('Add onions and saute until golden.');
    });
  });

  describe('parseRecipeFromHtml', () => {
    it('extracts complete recipe from Schema.org JSON-LD in HTML', () => {
      const sampleHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "Recipe",
            "name": "Strawberry Milk Pancakes",
            "description": "Fluffy, cozy weekend pancakes topped with fresh strawberries.",
            "image": "https://example.com/pancakes.jpg",
            "prepTime": "PT15M",
            "cookTime": "PT15M",
            "recipeYield": "4 servings",
            "recipeCategory": ["Breakfast", "Pancakes"],
            "recipeIngredient": [
              "2 cups flour",
              "2 tbsp sugar",
              "2 tsp baking powder",
              "1 cup strawberry milk",
              "2 large eggs"
            ],
            "recipeInstructions": [
              { "@type": "HowToStep", "text": "Whisk dry ingredients together." },
              { "@type": "HowToStep", "text": "Add strawberry milk and eggs, mix until just combined." },
              { "@type": "HowToStep", "text": "Cook on medium heat until golden on both sides." }
            ]
          }
          </script>
        </head>
        <body></body>
        </html>
      `;

      const result = parseRecipeFromHtml(sampleHtml, 'https://example.com/recipe');
      expect(result.title).toBe('Strawberry Milk Pancakes');
      expect(result.description).toContain('Fluffy, cozy');
      expect(result.heroImage).toBe('https://example.com/pancakes.jpg');
      expect(result.prepTimeMinutes).toBe(15);
      expect(result.cookTimeMinutes).toBe(15);
      expect(result.servings).toBe(4);
      expect(result.categories).toContain('Breakfast');
      expect(result.ingredients).toHaveLength(5);
      expect(result.ingredients[0].name).toBe('flour');
      expect(result.ingredients[0].amount).toBe(2);
      expect(result.ingredients[0].unit).toBe('cup');
      expect(result.steps).toHaveLength(3);
      expect(result.steps[0].instruction).toBe('Whisk dry ingredients together.');
    });

    it('falls back to Open Graph tags when JSON-LD is absent', () => {
      const sampleHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Grandma's Cinnamon Rolls</title>
          <meta property="og:title" content="Grandma's Cinnamon Rolls" />
          <meta property="og:description" content="Warm, gooey cinnamon rolls with cream cheese glaze." />
          <meta property="og:image" content="https://example.com/rolls.jpg" />
        </head>
        <body></body>
        </html>
      `;

      const result = parseRecipeFromHtml(sampleHtml, 'https://example.com/rolls');
      expect(result.title).toBe("Grandma's Cinnamon Rolls");
      expect(result.description).toContain('Warm, gooey');
      expect(result.heroImage).toBe('https://example.com/rolls.jpg');
    });
  });
});
