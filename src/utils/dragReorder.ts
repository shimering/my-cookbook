import type { Ingredient, RecipeStep } from '../types';

/**
 * Reorder an ingredient to a target index, optionally assigning it to a target section.
 */
export function reorderIngredients(
  ingredients: Ingredient[],
  fromIndex: number,
  toIndex: number,
  targetSection?: string
): Ingredient[] {
  if (
    fromIndex < 0 ||
    fromIndex >= ingredients.length ||
    toIndex < 0 ||
    toIndex >= ingredients.length
  ) {
    return ingredients;
  }

  const next = [...ingredients];
  const [moved] = next.splice(fromIndex, 1);
  const updatedMoved: Ingredient =
    targetSection !== undefined
      ? { ...moved, section: targetSection.trim() }
      : moved;

  next.splice(toIndex, 0, updatedMoved);
  return next;
}

/**
 * Move an ingredient into a target section, placing it at the end of that section's items.
 */
export function moveIngredientToSection(
  ingredients: Ingredient[],
  fromIndex: number,
  targetSection: string
): Ingredient[] {
  if (fromIndex < 0 || fromIndex >= ingredients.length) {
    return ingredients;
  }

  const normalizedTarget = targetSection.trim();
  const currentSection = (ingredients[fromIndex].section || '').trim();
  if (currentSection === normalizedTarget) {
    return ingredients;
  }

  const next = [...ingredients];
  const [moved] = next.splice(fromIndex, 1);
  const updatedMoved: Ingredient = { ...moved, section: normalizedTarget };

  // Find the last index in `next` that belongs to `normalizedTarget`
  let lastTargetIdx = -1;
  for (let i = next.length - 1; i >= 0; i--) {
    if ((next[i].section || '').trim() === normalizedTarget) {
      lastTargetIdx = i;
      break;
    }
  }

  if (lastTargetIdx !== -1) {
    next.splice(lastTargetIdx + 1, 0, updatedMoved);
  } else {
    next.push(updatedMoved);
  }

  return next;
}

/**
 * Reorder a recipe step and renumber all steps sequentially (1..N).
 */
export function reorderSteps(
  steps: RecipeStep[],
  fromIndex: number,
  toIndex: number
): RecipeStep[] {
  if (
    fromIndex < 0 ||
    fromIndex >= steps.length ||
    toIndex < 0 ||
    toIndex >= steps.length ||
    fromIndex === toIndex
  ) {
    return steps;
  }

  const next = [...steps];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);

  return next.map((step, idx) => ({
    ...step,
    stepNumber: idx + 1,
  }));
}
