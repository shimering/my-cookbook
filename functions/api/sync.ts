import { Env, authenticateRequest, jsonResponse } from '../utils/auth';

export const onRequestOptions = async () => {
  return jsonResponse({}, 200);
};

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  try {
    const user = await authenticateRequest(request, env);
    if (!user) {
      return jsonResponse({ error: 'Unauthorized. Please sign in.' }, 401);
    }

    const body = (await request.json()) as {
      recipes?: any[];
      mealPlans?: any[];
      groceries?: any[];
      lastSyncedAt?: number;
    };

    const clientRecipes = body.recipes || [];
    const clientMealPlans = body.mealPlans || [];
    const clientGroceries = body.groceries || [];
    const lastSyncedAt = body.lastSyncedAt || 0;
    const now = Date.now();

    // 1. Process incoming recipes
    for (const r of clientRecipes) {
      if (!r.id || !r.title) continue;
      const updatedAt = r.updatedAt || now;
      const createdAt = r.createdAt || now;
      const categoriesJson = JSON.stringify(r.categories || []);

      await env.DB.prepare(
        `INSERT INTO recipes (id, user_id, title, description, prep_time, cook_time, servings, hero_image_url, categories, is_favorite, created_at, updated_at, deleted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           title = excluded.title,
           description = excluded.description,
           prep_time = excluded.prep_time,
           cook_time = excluded.cook_time,
           servings = excluded.servings,
           hero_image_url = excluded.hero_image_url,
           categories = excluded.categories,
           is_favorite = excluded.is_favorite,
           updated_at = excluded.updated_at,
           deleted_at = excluded.deleted_at
         WHERE excluded.updated_at >= recipes.updated_at`
      )
        .bind(
          r.id,
          user.id,
          r.title,
          r.description || '',
          r.prepTimeMinutes || 0,
          r.cookTimeMinutes || 0,
          r.servings || 1,
          r.heroImage || null,
          categoriesJson,
          r.isFavorite ? 1 : 0,
          createdAt,
          updatedAt,
          r.deletedAt || null
        )
        .run();

      // Refresh ingredients and instructions if active
      if (!r.deletedAt) {
        await env.DB.prepare('DELETE FROM ingredients WHERE recipe_id = ?').bind(r.id).run();
        if (Array.isArray(r.ingredients)) {
          for (let i = 0; i < r.ingredients.length; i++) {
            const ing = r.ingredients[i];
            const ingId = ing.id || crypto.randomUUID();
            const qty = parseFloat(ing.quantity) || 0;
            await env.DB.prepare(
              `INSERT INTO ingredients (id, recipe_id, name, quantity, unit, section, display_order)
               VALUES (?, ?, ?, ?, ?, ?, ?)`
            )
              .bind(ingId, r.id, ing.name || '', qty, ing.unit || '', ing.section || null, i)
              .run();
          }
        }

        await env.DB.prepare('DELETE FROM instructions WHERE recipe_id = ?').bind(r.id).run();
        if (Array.isArray(r.instructions)) {
          for (let i = 0; i < r.instructions.length; i++) {
            const stepId = crypto.randomUUID();
            await env.DB.prepare(
              `INSERT INTO instructions (id, recipe_id, step_number, instruction_text)
               VALUES (?, ?, ?, ?)`
            )
              .bind(stepId, r.id, i + 1, r.instructions[i] || '')
              .run();
          }
        }
      }
    }

    // 2. Process incoming meal plans
    for (const m of clientMealPlans) {
      if (!m.id || !m.date || !m.slot) continue;
      const updatedAt = m.updatedAt || now;
      const createdAt = m.createdAt || now;

      await env.DB.prepare(
        `INSERT INTO meal_plans (id, user_id, date, slot, recipe_id, custom_title, servings, servings_multiplier, is_completed, created_at, updated_at, deleted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           date = excluded.date,
           slot = excluded.slot,
           recipe_id = excluded.recipe_id,
           custom_title = excluded.custom_title,
           servings = excluded.servings,
           servings_multiplier = excluded.servings_multiplier,
           is_completed = excluded.is_completed,
           updated_at = excluded.updated_at,
           deleted_at = excluded.deleted_at
         WHERE excluded.updated_at >= meal_plans.updated_at`
      )
        .bind(
          m.id,
          user.id,
          m.date,
          m.slot,
          m.recipeId || null,
          m.customTitle || null,
          m.servings || 1,
          m.servingsMultiplier || 1,
          m.isCompleted ? 1 : 0,
          createdAt,
          updatedAt,
          m.deletedAt || null
        )
        .run();
    }

    // 3. Process incoming groceries
    for (const g of clientGroceries) {
      if (!g.id || !g.name) continue;
      const updatedAt = g.updatedAt || now;
      const createdAt = g.createdAt || now;
      const qty = typeof g.quantity === 'number' ? g.quantity : parseFloat(g.quantity) || 0;

      await env.DB.prepare(
        `INSERT INTO groceries (id, user_id, name, quantity, unit, category, is_checked, is_manual, created_at, updated_at, deleted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           name = excluded.name,
           quantity = excluded.quantity,
           unit = excluded.unit,
           category = excluded.category,
           is_checked = excluded.is_checked,
           is_manual = excluded.is_manual,
           updated_at = excluded.updated_at,
           deleted_at = excluded.deleted_at
         WHERE excluded.updated_at >= groceries.updated_at`
      )
        .bind(
          g.id,
          user.id,
          g.name,
          qty,
          g.unit || '',
          g.category || 'Pantry',
          g.isChecked ? 1 : 0,
          g.isManual ? 1 : 0,
          createdAt,
          updatedAt,
          g.deletedAt || null
        )
        .run();
    }

    // 4. Pull updates since lastSyncedAt
    const recipesRows = await env.DB.prepare(
      `SELECT * FROM recipes WHERE user_id = ? AND updated_at > ?`
    )
      .bind(user.id, lastSyncedAt)
      .all<any>();

    const pulledRecipes: any[] = [];
    if (recipesRows.results) {
      for (const row of recipesRows.results) {
        if (row.deleted_at) {
          pulledRecipes.push({ id: row.id, deletedAt: row.deleted_at });
          continue;
        }

        const ingRows = await env.DB.prepare(
          `SELECT * FROM ingredients WHERE recipe_id = ? ORDER BY display_order ASC`
        )
          .bind(row.id)
          .all<any>();

        const stepRows = await env.DB.prepare(
          `SELECT * FROM instructions WHERE recipe_id = ? ORDER BY step_number ASC`
        )
          .bind(row.id)
          .all<any>();

        let categories: string[] = [];
        try {
          categories = JSON.parse(row.categories || '[]');
        } catch {}

        pulledRecipes.push({
          id: row.id,
          title: row.title,
          description: row.description,
          prepTimeMinutes: row.prep_time,
          cookTimeMinutes: row.cook_time,
          servings: row.servings,
          heroImage: row.hero_image_url,
          categories,
          isFavorite: row.is_favorite === 1,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          ingredients: (ingRows.results || []).map((i: any) => ({
            id: i.id,
            name: i.name,
            quantity: i.quantity ? String(i.quantity) : '',
            unit: i.unit,
            section: i.section,
          })),
          instructions: (stepRows.results || []).map((s: any) => s.instruction_text),
        });
      }
    }

    const mealPlansRows = await env.DB.prepare(
      `SELECT * FROM meal_plans WHERE user_id = ? AND updated_at > ?`
    )
      .bind(user.id, lastSyncedAt)
      .all<any>();

    const pulledMealPlans = (mealPlansRows.results || []).map((m: any) => ({
      id: m.id,
      date: m.date,
      slot: m.slot,
      recipeId: m.recipe_id,
      customTitle: m.custom_title,
      servings: m.servings,
      servingsMultiplier: m.servings_multiplier,
      isCompleted: m.is_completed === 1,
      createdAt: m.created_at,
      updatedAt: m.updated_at,
      deletedAt: m.deleted_at,
    }));

    const groceriesRows = await env.DB.prepare(
      `SELECT * FROM groceries WHERE user_id = ? AND updated_at > ?`
    )
      .bind(user.id, lastSyncedAt)
      .all<any>();

    const pulledGroceries = (groceriesRows.results || []).map((g: any) => ({
      id: g.id,
      name: g.name,
      quantity: g.quantity,
      unit: g.unit,
      category: g.category,
      isChecked: g.is_checked === 1,
      isManual: g.is_manual === 1,
      createdAt: g.created_at,
      updatedAt: g.updated_at,
      deletedAt: g.deleted_at,
    }));

    return jsonResponse({
      recipes: pulledRecipes,
      mealPlans: pulledMealPlans,
      groceries: pulledGroceries,
      serverTime: now,
    });
  } catch (err: any) {
    console.error('Sync endpoint error:', err);
    return jsonResponse({ error: err.message || 'Sync failed' }, 500);
  }
};
