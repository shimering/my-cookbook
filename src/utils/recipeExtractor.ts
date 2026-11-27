import type { Ingredient, RecipeStep } from '../types';
import { parseQuantity } from './fractionParser';

export interface ExtractedRecipeData {
  title: string;
  description: string;
  heroImage: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  categories: string[];
  ingredients: Ingredient[];
  steps: RecipeStep[];
  sourceUrl?: string;
}

/**
 * Parses an ISO 8601 duration (e.g. "PT15M", "PT1H30M", "P0DT0H25M") or human text into minutes.
 */
export function parseDurationToMinutes(duration?: unknown): number {
  if (!duration) return 0;
  const str = String(duration).trim();

  // ISO 8601 format: PT#H#M or P#DT#H#M
  const isoRegex = /^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i;
  const isoMatch = str.match(isoRegex);
  if (isoMatch) {
    const days = parseInt(isoMatch[1] || '0', 10);
    const hours = parseInt(isoMatch[2] || '0', 10);
    const minutes = parseInt(isoMatch[3] || '0', 10);
    return days * 24 * 60 + hours * 60 + minutes;
  }

  // Common human text like "1 hr 15 mins", "45 minutes", "2 hours"
  let total = 0;
  const hrMatch = str.match(/(\d+)\s*(?:hours?|hrs?|h)\b/i);
  if (hrMatch) {
    total += parseInt(hrMatch[1], 10) * 60;
  }
  const minMatch = str.match(/(\d+)\s*(?:minutes?|mins?|m)\b/i);
  if (minMatch) {
    total += parseInt(minMatch[1], 10);
  }
  if (total > 0) return total;

  // Pure number fallback
  const num = parseInt(str, 10);
  return !isNaN(num) ? num : 0;
}

/**
 * Parses servings / yield into a number.
 * e.g. "4 servings", 4, ["4"], "Makes 12 cookies"
 */
export function parseYieldToServings(yieldData?: unknown): number {
  if (!yieldData) return 4;
  const str = Array.isArray(yieldData) ? String(yieldData[0]) : String(yieldData);
  const match = str.match(/\d+/);
  if (match) {
    const parsed = parseInt(match[0], 10);
    if (parsed > 0) return parsed;
  }
  return 4;
}

/**
 * Unit matching map for normalizing raw ingredient units into cookbook units.
 */
const KNOWN_UNITS: { regex: RegExp; unit: string }[] = [
  { regex: /^(?:tablespoons?|tbsp\.?|tbs\.?)\b/i, unit: 'tbsp' },
  { regex: /^(?:teaspoons?|tsp\.?)\b/i, unit: 'tsp' },
  { regex: /^(?:cups?|c\.)\b/i, unit: 'cup' },
  { regex: /^(?:fluid\s+ounces?|fl\.?\s*oz\.?)\b/i, unit: 'fl oz' },
  { regex: /^(?:ounces?|oz\.?)\b/i, unit: 'oz' },
  { regex: /^(?:pounds?|lbs?\.?)\b/i, unit: 'lb' },
  { regex: /^(?:grams?|g\.?)\b/i, unit: 'g' },
  { regex: /^(?:kilograms?|kg\.?)\b/i, unit: 'kg' },
  { regex: /^(?:milliliters?|ml\.?)\b/i, unit: 'ml' },
  { regex: /^(?:liters?|l\.?)\b/i, unit: 'l' },
  { regex: /^(?:pinches|pinch)\b/i, unit: 'pinch' },
  { regex: /^(?:cloves?)\b/i, unit: 'clove' },
  { regex: /^(?:slices?)\b/i, unit: 'slice' },
  { regex: /^(?:cans?)\b/i, unit: 'can' },
  { regex: /^(?:sprigs?)\b/i, unit: 'sprig' },
  { regex: /^(?:stalks?)\b/i, unit: 'stalk' },
  { regex: /^(?:packages?|pkgs?\.?)\b/i, unit: 'pkg' },
  { regex: /^(?:pieces?|pcs?\.?)\b/i, unit: 'piece' },
  { regex: /^(?:pints?|pt\.?)\b/i, unit: 'pt' },
  { regex: /^(?:quarts?|qt\.?)\b/i, unit: 'qt' },
  { regex: /^(?:gallons?|gal\.?)\b/i, unit: 'gal' },
];

/**
 * Parses a raw ingredient line into a structured Ingredient object.
 * e.g. "1 1/2 cups all-purpose flour" -> { amount: 1.5, displayFraction: "1 1/2", unit: "cup", name: "all-purpose flour" }
 * e.g. "2 large eggs" -> { amount: 2, displayFraction: "2", unit: "piece", name: "large eggs" }
 * e.g. "Kosher salt to taste" -> { amount: 1, displayFraction: "1", unit: "pinch", name: "Kosher salt to taste" }
 */
export function parseRawIngredientLine(raw: string, index: number): Ingredient {
  const clean = raw
    .replace(/<\/?[^>]+(>|$)/g, '') // remove HTML tags
    .replace(/\s+/g, ' ')
    .trim();

  // Fraction or decimal regex at the start
  // Matches "1 1/2", "1/2", "0.75", "2", "3-4" -> captures "3"
  const qtyRegex = /^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)/;
  const qtyMatch = clean.match(qtyRegex);

  let amount = 1;
  let displayFraction = '1';
  let remaining = clean;

  if (qtyMatch) {
    const rawQty = qtyMatch[1].trim();
    const parsed = parseQuantity(rawQty).valueOf();
    if (parsed > 0) {
      amount = parsed;
      displayFraction = rawQty;
    }
    remaining = clean.slice(qtyMatch[0].length).trim();
  }

  // Strip leading hyphen or "of" like "- 2 cups" or "1 cup of milk"
  remaining = remaining.replace(/^-\s*/, '').trim();

  // Try matching a unit
  let unit = '';
  for (const { regex, unit: matchedUnit } of KNOWN_UNITS) {
    const uMatch = remaining.match(regex);
    if (uMatch) {
      unit = matchedUnit;
      remaining = remaining.slice(uMatch[0].length).trim();
      // Remove trailing "of", e.g. "cup of flour" -> "flour"
      remaining = remaining.replace(/^of\s+/i, '').trim();
      break;
    }
  }

  // Clean remaining name
  let name = remaining.replace(/^,\s*/, '').trim();
  if (!name) {
    name = clean;
  }

  return {
    id: `ing-extracted-${Date.now()}-${index}`,
    name,
    amount,
    unit,
    displayFraction,
  };
}

/**
 * Extracts instruction steps from Schema.org recipeInstructions format.
 */
export function parseRawInstructions(instructionsData: unknown): RecipeStep[] {
  if (!instructionsData) return [];

  const rawSteps: string[] = [];

  const processNode = (node: unknown) => {
    if (!node) return;
    if (typeof node === 'string') {
      const trimmed = node.trim();
      if (trimmed) rawSteps.push(trimmed);
      return;
    }

    if (Array.isArray(node)) {
      for (const item of node) {
        processNode(item);
      }
      return;
    }

    if (typeof node === 'object' && node !== null) {
      const obj = node as Record<string, unknown>;
      // HowToStep
      if (obj.text) {
        const text = String(obj.text).trim();
        if (text) rawSteps.push(text);
        return;
      }
      // HowToSection with itemListElement
      if (obj.itemListElement) {
        processNode(obj.itemListElement);
        return;
      }
      // Fallback description or name
      if (obj.description) {
        rawSteps.push(String(obj.description).trim());
      } else if (obj.name) {
        rawSteps.push(String(obj.name).trim());
      }
    }
  };

  processNode(instructionsData);

  // If a single string with multiple steps was returned (e.g. separated by newlines or "1. Step...")
  const finalSteps: string[] = [];
  for (const s of rawSteps) {
    // Check if step contains multiple newline-separated instructions
    const lines = s.split(/\r?\n+/).map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      // Strip leading step numbers like "1. ", "Step 1: "
      const cleanLine = line
        .replace(/<\/?[^>]+(>|$)/g, '') // remove HTML tags
        .replace(/^(?:Step\s*\d+[:.]?|\d+[).])\s*/i, '')
        .trim();
      if (cleanLine.length > 0) {
        finalSteps.push(cleanLine);
      }
    }
  }

  return finalSteps.map((instruction, idx) => ({
    id: `step-extracted-${Date.now()}-${idx}`,
    stepNumber: idx + 1,
    instruction,
  }));
}

/**
 * Scores an image candidate for how well it matches preferred 16:9 widescreen dimensions.
 */
function scoreImageCandidate(candidate: unknown): { url: string; score: number } | null {
  let url = '';
  let width = 0;
  let height = 0;

  if (typeof candidate === 'string') {
    url = candidate.trim();
  } else if (typeof candidate === 'object' && candidate !== null) {
    const record = candidate as Record<string, unknown>;
    if (typeof record.url === 'string') {
      url = record.url.trim();
    } else if (typeof record.contentUrl === 'string') {
      url = record.contentUrl.trim();
    }
    width = Number(record.width) || 0;
    height = Number(record.height) || 0;
  }

  if (!url) return null;

  let score = 10;

  if (width > 0 && height > 0) {
    const ratio = width / height;
    if (Math.abs(ratio - 16 / 9) <= 0.15 && width >= 600) {
      score += 50; // Preferred 16:9 landscape
    } else if (ratio > 1.1 && width >= 600) {
      score += 30; // Landscape (e.g. 4:3)
    } else if (Math.abs(ratio - 1) <= 0.1 && width >= 600) {
      score += 15; // Square
    }
  }

  if (/16x9|16-9|1200x675|1280x720|1600x900/i.test(url)) {
    score += 45;
  } else if (/4x3|4-3|1200x900|800x600/i.test(url)) {
    score += 25;
  }

  return { url, score };
}

/**
 * Extracts a high resolution image URL from recipe image data or OpenGraph tags.
 * Prefers images matching 16:9 widescreen dimensions when multiple candidates exist,
 * otherwise falls back to the main image normally.
 */
export function extractImageUrl(imageData: unknown, html: string): string {
  if (imageData) {
    if (typeof imageData === 'string' && imageData.trim()) {
      return imageData.trim();
    }
    if (Array.isArray(imageData) && imageData.length > 0) {
      const scoredCandidates = imageData
        .map((item, index) => {
          const scored = scoreImageCandidate(item);
          return scored ? { ...scored, index } : null;
        })
        .filter((item): item is { url: string; score: number; index: number } => item !== null);

      if (scoredCandidates.length > 0) {
        scoredCandidates.sort((a, b) => (b.score !== a.score ? b.score - a.score : a.index - b.index));
        return scoredCandidates[0].url;
      }
    }
    if (typeof imageData === 'object' && imageData !== null) {
      const scored = scoreImageCandidate(imageData);
      if (scored) return scored.url;
    }
  }

  // Fallback: Open Graph image <meta property="og:image" content="..." />
  const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=(?:"([^"]*)"|'([^']*)')/i) ||
                  html.match(/<meta[^>]+content=(?:"([^"]*)"|'([^']*)')[^>]+property=["']og:image["']/i);
  if (ogMatch) {
    const url = (ogMatch[1] !== undefined ? ogMatch[1] : ogMatch[2] || '').trim();
    if (url) return url;
  }

  // Fallback: Twitter image
  const twitterMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=(?:"([^"]*)"|'([^']*)')/i) ||
                       html.match(/<meta[^>]+content=(?:"([^"]*)"|'([^']*)')[^>]+name=["']twitter:image["']/i);
  if (twitterMatch) {
    const url = (twitterMatch[1] !== undefined ? twitterMatch[1] : twitterMatch[2] || '').trim();
    if (url) return url;
  }

  return '';
}

/**
 * Searches for Schema.org Recipe in JSON-LD scripts or HTML microdata.
 */
export function parseRecipeFromHtml(html: string, sourceUrl?: string): ExtractedRecipeData {
  let recipeObj: Record<string, unknown> | null = null;

  // 1. Look for <script type="application/ld+json"> blocks
  const jsonLdRegex = /<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;

  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      const content = match[1].trim();
      const parsed = JSON.parse(content) as unknown;

      const findRecipeInObj = (obj: unknown): Record<string, unknown> | null => {
        if (!obj || typeof obj !== 'object') return null;

        const record = obj as Record<string, unknown>;

        // Direct Recipe object
        const type = record['@type'];
        if (type === 'Recipe' || (Array.isArray(type) && type.includes('Recipe'))) {
          return record;
        }

        // Nested @graph array
        if (Array.isArray(record['@graph'])) {
          for (const item of record['@graph']) {
            const found = findRecipeInObj(item);
            if (found) return found;
          }
        }

        // Array of items
        if (Array.isArray(obj)) {
          for (const item of obj) {
            const found = findRecipeInObj(item);
            if (found) return found;
          }
        }

        return null;
      };

      const found = findRecipeInObj(parsed);
      if (found) {
        recipeObj = found;
        break;
      }
    } catch {
      // Ignore JSON parse errors in individual tags and continue searching
    }
  }

  // Fallbacks from Open Graph / Meta if JSON-LD is missing or partial
  const getOgMeta = (prop: string): string => {
    const regex1 = new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=(?:"([^"]*)"|'([^']*)')`, 'i');
    const regex2 = new RegExp(`<meta[^>]+content=(?:"([^"]*)"|'([^']*)')[^>]+property=["']${prop}["']`, 'i');
    const m = html.match(regex1) || html.match(regex2);
    if (!m) return '';
    return (m[1] !== undefined ? m[1] : m[2] || '').trim();
  };

  const getTitleFallback = (): string => {
    const ogTitle = getOgMeta('og:title');
    if (ogTitle) return ogTitle;
    const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return titleTag ? titleTag[1].trim() : 'Imported Recipe';
  };

  const getDescriptionFallback = (): string => {
    const ogDesc = getOgMeta('og:description');
    if (ogDesc) return ogDesc;
    const metaDesc = html.match(/<meta[^>]+name=["']description["'][^>]+content=(?:"([^"]*)"|'([^']*)')/i) ||
                     html.match(/<meta[^>]+content=(?:"([^"]*)"|'([^']*)')[^>]+name=["']description["']/i);
    if (metaDesc) {
      return (metaDesc[1] !== undefined ? metaDesc[1] : metaDesc[2] || '').trim();
    }
    return '';
  };

  if (!recipeObj) {
    // If no Schema.org Recipe JSON-LD found, build best-effort from meta tags
    return {
      title: getTitleFallback(),
      description: getDescriptionFallback(),
      heroImage: extractImageUrl(null, html),
      prepTimeMinutes: 15,
      cookTimeMinutes: 20,
      servings: 4,
      categories: ['Quick Meals'],
      ingredients: [],
      steps: [],
      sourceUrl,
    };
  }

  // Process Recipe Object
  const title = (recipeObj.name ? String(recipeObj.name).trim() : '') || getTitleFallback();
  const description = (recipeObj.description ? String(recipeObj.description).trim() : '') || getDescriptionFallback();
  const heroImage = extractImageUrl(recipeObj.image, html);

  const prepTimeMinutes = parseDurationToMinutes(recipeObj.prepTime);
  const cookTimeMinutes = parseDurationToMinutes(recipeObj.cookTime);
  const servings = parseYieldToServings(recipeObj.recipeYield || recipeObj.yield);

  // Categories / Tags
  const rawCats: string[] = [];
  if (recipeObj.recipeCategory) {
    if (Array.isArray(recipeObj.recipeCategory)) {
      rawCats.push(...recipeObj.recipeCategory.map(String));
    } else {
      rawCats.push(...String(recipeObj.recipeCategory).split(/[,;]+/));
    }
  }
  if (recipeObj.keywords) {
    if (Array.isArray(recipeObj.keywords)) {
      rawCats.push(...recipeObj.keywords.map(String));
    } else {
      rawCats.push(...String(recipeObj.keywords).split(/[,;]+/));
    }
  }

  const cleanCategories = Array.from(
    new Set(
      rawCats
        .map((c) => c.trim())
        .filter((c) => c.length > 1 && c.length < 25 && !c.includes('http'))
    )
  ).slice(0, 5);

  if (cleanCategories.length === 0) {
    cleanCategories.push('Dinner');
  }

  // Ingredients
  const rawIngredients: string[] = [];
  const ingSource = recipeObj.recipeIngredient || recipeObj.ingredients;
  if (Array.isArray(ingSource)) {
    for (const ing of ingSource) {
      if (typeof ing === 'string' && ing.trim()) {
        rawIngredients.push(ing.trim());
      }
    }
  }

  const ingredients: Ingredient[] = rawIngredients.map((raw, idx) =>
    parseRawIngredientLine(raw, idx)
  );

  // Steps
  const steps: RecipeStep[] = parseRawInstructions(recipeObj.recipeInstructions);

  return {
    title,
    description,
    heroImage,
    prepTimeMinutes: prepTimeMinutes || 15,
    cookTimeMinutes: cookTimeMinutes || 20,
    servings: servings || 4,
    categories: cleanCategories,
    ingredients,
    steps,
    sourceUrl,
  };
}

/**
 * Extracts recipe data from a URL.
 * First calls the server endpoint /api/extract-recipe.
 * If server is unavailable, falls back to a public CORS proxy.
 */
export async function extractRecipeFromUrl(url: string): Promise<ExtractedRecipeData> {
  const trimmedUrl = url.trim();
  if (!trimmedUrl) {
    throw new Error('Please enter a valid recipe link');
  }

  // Validate URL protocol
  try {
    const parsed = new URL(trimmedUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Please enter a valid web URL starting with http:// or https://');
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('http')) {
      throw err;
    }
    throw new Error('Please enter a valid website URL (e.g. https://www.allrecipes.com/...)');
  }

  let backendError = '';

  // 1. Try our own backend / Vite dev server endpoint
  try {
    const res = await fetch('/api/extract-recipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: trimmedUrl }),
    });

    if (res.ok) {
      const data = (await res.json()) as { recipe?: ExtractedRecipeData; html?: string };
      if (data.recipe) {
        return data.recipe;
      }
      if (data.html) {
        const recipe = parseRecipeFromHtml(data.html, trimmedUrl);
        if (!recipe.title || (recipe.ingredients.length === 0 && recipe.steps.length === 0)) {
          throw new Error(
            'Could not find standard recipe details on this page. You can still enter your recipe manually!'
          );
        }
        return recipe;
      }
    } else {
      const errBody = (await res.json().catch(() => ({}))) as { error?: string };
      if (errBody.error) {
        backendError = errBody.error;
      }
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('standard recipe details')) {
      throw err;
    }
    // Endpoint unavailable, proceed to CORS proxy fallback
  }

  // 2. Fallback: Fetch HTML via public CORS proxies with short timeouts
  const proxyUrls = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(trimmedUrl)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(trimmedUrl)}`,
  ];

  for (const proxyUrl of proxyUrls) {
    try {
      const res = await fetch(proxyUrl, {
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) continue;
      const html = await res.text();
      if (!html || html.includes('window._cf_chl_opt')) continue;
      const recipe = parseRecipeFromHtml(html, trimmedUrl);
      if (!recipe.title || (recipe.ingredients.length === 0 && recipe.steps.length === 0)) {
        continue;
      }
      return recipe;
    } catch {
      // Try next proxy
    }
  }

  throw new Error(
    backendError
      ? `Could not import from this website (${backendError}). Some sites block automated imports — you can still enter your recipe manually!`
      : 'Could not extract recipe from this URL. Please verify the link or enter details manually.'
  );
}
