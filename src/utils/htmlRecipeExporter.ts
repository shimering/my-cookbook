import type { Recipe } from '../types';
import { convertIngredient, type UnitSystem } from './unitConverter';

export interface HtmlExportOptions {
  unitSystem?: UnitSystem;
  appTitle?: string;
}

/**
 * Escapes HTML special characters to prevent injection.
 */
function escapeHtml(str?: string | null): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Attempts to convert an image URL to a base64 data URL for complete offline portability.
 * Falls back to the original URL if CORS or offline prevents fetching.
 */
async function imageToDataUrl(url?: string): Promise<string> {
  if (!url) return '';
  if (url.startsWith('data:')) return url;

  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) return url;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : url);
      reader.onerror = () => resolve(url);
      reader.readAsDataURL(blob);
    });
  } catch {
    return url;
  }
}

/**
 * Generates a complete, beautiful, standalone HTML document containing all recipes.
 */
export function generateCookbookHtml(recipes: Recipe[], options: HtmlExportOptions = {}): string {
  const { unitSystem = 'us', appTitle = 'My Cookbook' } = options;
  const exportDate = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Collect all unique categories
  const allCategories = Array.from(
    new Set(recipes.flatMap((r) => r.categories || []).filter(Boolean))
  ).sort();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(appTitle)} - Recipe Collection</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-cream: #FFF8F6;
      --card-white: #FFFFFF;
      --border-warm: #F3E5D8;
      --accent-strawberry: #E85D75;
      --accent-strawberry-hover: #D94C65;
      --accent-butter: #FDECC8;
      --text-cocoa: #3D231D;
      --text-taupe: #8C726B;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg-cream);
      color: var(--text-cocoa);
      font-family: 'Nunito', system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      padding: 24px 16px;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
    }

    /* Top Bar & Branding */
    header {
      text-align: center;
      margin-bottom: 32px;
      padding: 24px;
      background: var(--card-white);
      border: 1px solid var(--border-warm);
      border-radius: 28px;
      box-shadow: 0 4px 20px rgba(61, 35, 29, 0.05);
    }

    .header-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--accent-strawberry);
      background: #FFF0F3;
      padding: 4px 14px;
      border-radius: 9999px;
      margin-bottom: 8px;
    }

    h1.app-title {
      font-family: 'Fredoka', 'Nunito', Georgia, serif;
      font-size: 32px;
      color: var(--text-cocoa);
      margin-bottom: 6px;
      letter-spacing: -0.01em;
    }

    .header-subtext {
      font-size: 14px;
      color: var(--text-taupe);
      margin-bottom: 16px;
    }

    .header-controls {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      gap: 12px;
      margin-top: 16px;
    }

    .search-input {
      padding: 8px 18px;
      border-radius: 9999px;
      border: 1px solid var(--border-warm);
      background: var(--bg-cream);
      font-family: inherit;
      font-size: 13px;
      color: var(--text-cocoa);
      width: 260px;
      outline: none;
      transition: all 0.2s;
    }

    .search-input:focus {
      border-color: var(--accent-strawberry);
      box-shadow: 0 0 0 3px rgba(232, 93, 117, 0.15);
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 18px;
      font-size: 13px;
      font-weight: 700;
      border-radius: 9999px;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s;
      border: 1px solid transparent;
    }

    .btn-primary {
      background: var(--accent-strawberry);
      color: #FFFFFF;
    }

    .btn-primary:hover {
      background: var(--accent-strawberry-hover);
    }

    .btn-secondary {
      background: var(--accent-butter);
      color: var(--text-cocoa);
      border-color: var(--border-warm);
    }

    .btn-secondary:hover {
      background: #F8DAA0;
    }

    /* Table of Contents / Index */
    .toc-card {
      background: var(--card-white);
      border: 1px solid var(--border-warm);
      border-radius: 24px;
      padding: 20px 24px;
      margin-bottom: 32px;
      box-shadow: 0 4px 16px rgba(61, 35, 29, 0.04);
    }

    .toc-title {
      font-family: 'Fredoka', 'Nunito', sans-serif;
      font-size: 18px;
      margin-bottom: 12px;
      color: var(--text-cocoa);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .toc-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 8px;
    }

    .toc-link {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 12px;
      background: var(--bg-cream);
      border: 1px solid var(--border-warm);
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-cocoa);
      text-decoration: none;
      transition: all 0.2s;
    }

    .toc-link:hover {
      background: #FFF0F3;
      border-color: var(--accent-strawberry);
      color: var(--accent-strawberry);
      transform: translateY(-1px);
    }

    /* Individual Recipe Card */
    .recipe-card {
      background: var(--card-white);
      border: 1px solid var(--border-warm);
      border-radius: 28px;
      padding: 28px;
      margin-bottom: 32px;
      box-shadow: 0 6px 24px rgba(61, 35, 29, 0.05);
      scroll-margin-top: 24px;
      transition: box-shadow 0.2s;
    }

    .recipe-card:hover {
      box-shadow: 0 8px 32px rgba(61, 35, 29, 0.08);
    }

    .recipe-header {
      margin-bottom: 20px;
    }

    .recipe-title {
      font-family: 'Fredoka', 'Nunito', Georgia, serif;
      font-size: 26px;
      color: var(--text-cocoa);
      line-height: 1.25;
      margin-bottom: 8px;
    }

    .recipe-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 12px;
    }

    .tag-pill {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 12px;
      border-radius: 9999px;
      background: var(--accent-butter);
      color: var(--text-cocoa);
      border: 1px solid var(--border-warm);
    }

    .recipe-description {
      font-size: 14px;
      color: var(--text-taupe);
      font-style: italic;
      line-height: 1.5;
      margin-bottom: 16px;
    }

    .metadata-strip {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      padding: 10px 16px;
      background: var(--bg-cream);
      border: 1px solid var(--border-warm);
      border-radius: 16px;
      font-size: 12px;
      font-weight: 700;
      color: var(--text-cocoa);
      margin-bottom: 20px;
    }

    .metadata-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .hero-image-wrap {
      width: 100%;
      max-height: 380px;
      border-radius: 20px;
      overflow: hidden;
      margin-bottom: 24px;
      border: 1px solid var(--border-warm);
      background: #FDF4F0;
    }

    .hero-image {
      width: 100%;
      height: 100%;
      max-height: 380px;
      object-fit: cover;
      display: block;
    }

    /* Two-column layout for Ingredients & Steps */
    .recipe-body {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
    }

    @media (min-width: 680px) {
      .recipe-body {
        grid-template-columns: 1fr 1.4fr;
        gap: 28px;
      }
    }

    .section-title {
      font-family: 'Fredoka', 'Nunito', sans-serif;
      font-size: 16px;
      color: var(--text-cocoa);
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 2px solid var(--border-warm);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* Ingredients Checklist */
    .ingredient-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .ingredient-item {
      display: flex;
      align-items: baseline;
      gap: 8px;
      font-size: 13px;
      line-height: 1.4;
      padding: 4px 6px;
      border-radius: 8px;
      transition: background 0.15s;
    }

    .ingredient-item:hover {
      background: #FFF5F7;
    }

    .ingredient-checkbox {
      accent-color: var(--accent-strawberry);
      cursor: pointer;
      width: 15px;
      height: 15px;
      border-radius: 4px;
      flex-shrink: 0;
      transform: translateY(2px);
    }

    .ingredient-qty {
      font-weight: 700;
      color: var(--accent-strawberry);
      flex-shrink: 0;
    }

    .ingredient-name {
      color: var(--text-cocoa);
    }

    .ingredient-section-header {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-taupe);
      margin-top: 10px;
      margin-bottom: 4px;
      padding-left: 6px;
    }

    /* Steps List */
    .steps-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .step-item {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      font-size: 13px;
      line-height: 1.6;
    }

    .step-num {
      width: 24px;
      height: 24px;
      border-radius: 9999px;
      background: var(--accent-strawberry);
      color: #FFFFFF;
      font-size: 12px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 2px;
      box-shadow: 0 2px 6px rgba(232, 93, 117, 0.3);
    }

    .step-text {
      flex: 1;
      color: var(--text-cocoa);
    }

    /* Footer */
    footer {
      text-align: center;
      font-size: 12px;
      color: var(--text-taupe);
      padding: 24px 0 12px;
    }

    /* Print Styles */
    @media print {
      body {
        background: #FFFFFF;
        color: #000000;
        padding: 0;
      }

      header .header-controls,
      .toc-card,
      footer {
        display: none !important;
      }

      .recipe-card {
        page-break-after: always;
        break-after: page;
        border: none !important;
        box-shadow: none !important;
        padding: 16px 0 !important;
        margin: 0 !important;
      }

      .hero-image-wrap {
        max-height: 240px;
      }

      .hero-image {
        max-height: 240px;
      }

      .recipe-body {
        grid-template-columns: 1fr 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <header>
      <span class="header-badge">Offline Archive & Keepsake</span>
      <h1 class="app-title">🍰 ${escapeHtml(appTitle)}</h1>
      <p class="header-subtext">Exported on ${escapeHtml(exportDate)} • ${recipes.length} ${recipes.length === 1 ? 'Delicious Recipe' : 'Delicious Recipes'}</p>

      <div class="header-controls">
        <input
          type="text"
          id="recipe-search"
          placeholder="Filter recipes or ingredients..."
          class="search-input"
          oninput="filterRecipes(this.value)"
        >
        <button type="button" onclick="window.print()" class="btn btn-primary">
          🖨️ Print / Save as PDF
        </button>
      </div>

      ${
        allCategories.length > 0
          ? `
      <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; margin-top: 14px;">
        <button type="button" onclick="filterCategory('')" class="btn btn-secondary" style="font-size: 11px; padding: 3px 12px;">All</button>
        ${allCategories
          .map(
            (c) => `
          <button type="button" onclick="filterCategory('${escapeHtml(c.toLowerCase())}')" class="btn btn-secondary" style="font-size: 11px; padding: 3px 12px;">${escapeHtml(c)}</button>
        `
          )
          .join('')}
      </div>
      `
          : ''
      }
    </header>

    <!-- Table of Contents -->
    ${
      recipes.length > 1
        ? `
    <div class="toc-card">
      <h2 class="toc-title">📖 Recipe Index (${recipes.length})</h2>
      <div class="toc-grid">
        ${recipes
          .map(
            (r) => `
          <a href="#recipe-${escapeHtml(r.id)}" class="toc-link">
            <span>${escapeHtml(r.title)}</span>
            <span style="color: var(--text-taupe); font-size: 11px;">⏱ ${r.prepTimeMinutes + (r.cookTimeMinutes || 0)}m</span>
          </a>
        `
          )
          .join('')}
      </div>
    </div>
    `
        : ''
    }

    <!-- Recipes List -->
    <main id="recipes-container">
      ${recipes
        .map((recipe) => {
          // Pre-convert ingredient measurements to chosen unit system
          const convertedIngredients = (recipe.ingredients || []).map((ing) => {
            if (!ing.name.trim() || !ing.amount) return ing;
            const res = convertIngredient(ing, unitSystem, 1);
            return {
              ...ing,
              amount: res.amount,
              unit: res.unit,
              displayFraction: res.displayQuantity,
            };
          });

          // Group ingredients by section if available
          const hasSections = convertedIngredients.some((i) => i.section && i.section.trim());

          return `
      <article class="recipe-card" id="recipe-${escapeHtml(recipe.id)}" data-title="${escapeHtml(recipe.title.toLowerCase())}" data-ingredients="${escapeHtml(convertedIngredients.map((i) => i.name.toLowerCase()).join(' '))}">
        <div class="recipe-header">
          <div class="recipe-tags">
            ${(recipe.categories || [])
              .map((c) => `<span class="tag-pill">${escapeHtml(c)}</span>`)
              .join('')}
          </div>
          <h2 class="recipe-title">${escapeHtml(recipe.title)}</h2>
          ${
            recipe.description
              ? `<p class="recipe-description">${escapeHtml(recipe.description)}</p>`
              : ''
          }
          
          <div class="metadata-strip">
            <div class="metadata-item">
              <span>⏱</span>
              <span>Prep: ${recipe.prepTimeMinutes || 15} mins</span>
            </div>
            <div class="metadata-item">
              <span>🔥</span>
              <span>Cook: ${recipe.cookTimeMinutes || 0} mins</span>
            </div>
            <div class="metadata-item">
              <span>⏳</span>
              <span>Total: ${(recipe.prepTimeMinutes || 15) + (recipe.cookTimeMinutes || 0)} mins</span>
            </div>
            <div class="metadata-item">
              <span>👥</span>
              <span>Servings: ${recipe.servings || 4}</span>
            </div>
          </div>
        </div>

        ${
          recipe.heroImage
            ? `
        <div class="hero-image-wrap">
          <img src="${escapeHtml(recipe.heroImage)}" alt="${escapeHtml(recipe.title)}" class="hero-image" loading="lazy">
        </div>
        `
            : ''
        }

        <div class="recipe-body">
          <!-- Ingredients Column -->
          <div class="ingredients-column">
            <h3 class="section-title">🍓 Ingredients</h3>
            <ul class="ingredient-list">
              ${
                hasSections
                  ? convertedIngredients
                      .map((ing, idx, arr) => {
                        const isNewSection =
                          ing.section && (!arr[idx - 1] || arr[idx - 1].section !== ing.section);
                        const qtyText = `${ing.displayFraction || ing.amount || ''} ${ing.unit || ''}`.trim();
                        return `
                        ${isNewSection ? `<li class="ingredient-section-header">${escapeHtml(ing.section)}</li>` : ''}
                        <li class="ingredient-item">
                          <input type="checkbox" class="ingredient-checkbox">
                          ${qtyText ? `<span class="ingredient-qty">${escapeHtml(qtyText)}</span>` : ''}
                          <span class="ingredient-name">${escapeHtml(ing.name)}</span>
                        </li>
                      `;
                      })
                      .join('')
                  : convertedIngredients
                      .map((ing) => {
                        const qtyText = `${ing.displayFraction || ing.amount || ''} ${ing.unit || ''}`.trim();
                        return `
                        <li class="ingredient-item">
                          <input type="checkbox" class="ingredient-checkbox">
                          ${qtyText ? `<span class="ingredient-qty">${escapeHtml(qtyText)}</span>` : ''}
                          <span class="ingredient-name">${escapeHtml(ing.name)}</span>
                        </li>
                      `;
                      })
                      .join('')
              }
            </ul>
          </div>

          <!-- Steps Column -->
          <div class="steps-column">
            <h3 class="section-title">🥣 Instructions</h3>
            <ol class="steps-list">
              ${(recipe.steps || [])
                .map(
                  (step, idx) => `
                <li class="step-item">
                  <span class="step-num">${step.stepNumber || idx + 1}</span>
                  <div class="step-text">${escapeHtml(step.instruction)}</div>
                </li>
              `
                )
                .join('')}
            </ol>
          </div>
        </div>
      </article>
      `;
        })
        .join('')}
    </main>

    <footer>
      <p>Baked with love by ${escapeHtml(appTitle)} • Keep on cooking! 🥞</p>
    </footer>
  </div>

  <script>
    function filterRecipes(query) {
      const q = (query || '').toLowerCase().trim();
      const cards = document.querySelectorAll('.recipe-card');
      cards.forEach(card => {
        const title = card.getAttribute('data-title') || '';
        const ings = card.getAttribute('data-ingredients') || '';
        if (!q || title.includes(q) || ings.includes(q)) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    }

    function filterCategory(category) {
      var input = document.getElementById('recipe-search');
      if (input) input.value = category;
      filterRecipes(category);
    }
  </script>
</body>
</html>`;
}

/**
 * Converts images where possible, generates the HTML file, and triggers a browser download.
 */
export async function exportCookbookAsHtml(
  recipes: Recipe[],
  options: HtmlExportOptions = {}
): Promise<{ filename: string; recipeCount: number }> {
  if (!recipes || recipes.length === 0) {
    throw new Error('No recipes found to export.');
  }

  // Pre-process images into data URLs for complete offline resilience
  const processedRecipes: Recipe[] = await Promise.all(
    recipes.map(async (recipe) => {
      if (!recipe.heroImage || recipe.heroImage.startsWith('data:')) {
        return recipe;
      }
      try {
        const dataUrl = await imageToDataUrl(recipe.heroImage);
        return { ...recipe, heroImage: dataUrl };
      } catch {
        return recipe;
      }
    })
  );

  const htmlContent = generateCookbookHtml(processedRecipes, options);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const filename = `my-cookbook-recipes-${new Date().toISOString().split('T')[0]}.html`;

  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);

  return { filename, recipeCount: recipes.length };
}
