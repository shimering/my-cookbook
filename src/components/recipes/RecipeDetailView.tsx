import React, { useState } from 'react';
import {
  ChevronLeft,
  Heart,
  Clock,
  Users,
  Check,
  CalendarPlus,
  Edit3,
  Printer,
  Zap,
  Scale,
} from 'lucide-react';
import type { Recipe, Ingredient } from '../../types';
import { useWakeLock } from '../../hooks/useWakeLock';
import { getIngredientIcon } from '../../utils/ingredientIconResolver';
import {
  convertIngredient,
  getStoredUnitSystem,
  setStoredUnitSystem,
  type UnitSystem,
} from '../../utils/unitConverter';

interface RecipeDetailViewProps {
  recipe: Recipe;
  onBack: () => void;
  onEdit: (recipe: Recipe) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onAddToMealPlan: (recipe: Recipe) => void;
  onPrint: (recipe: Recipe) => void;
}

export const RecipeDetailView: React.FC<RecipeDetailViewProps> = ({
  recipe,
  onBack,
  onEdit,
  onToggleFavorite,
  onAddToMealPlan,
  onPrint,
}) => {
  // Screen Wake-Lock keeps the phone awake while cooking!
  const { isActive: isWakeLockActive, isSupported: isWakeLockSupported } = useWakeLock(true);

  // Set of checked ingredient IDs for interactive cooking checklist
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());

  // Servings multiplier state (allows adjusting servings live on detail view)
  const [servingsMultiplier, setServingsMultiplier] = useState<number>(1);

  // Measurement unit system preference ('us' = cups & spoons, 'metric' = grams & ml)
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(() => getStoredUnitSystem());

  const handleUnitSystemChange = (system: UnitSystem) => {
    setUnitSystem(system);
    setStoredUnitSystem(system);
  };

  const toggleIngredient = (id: string) => {
    const next = new Set(checkedIngredients);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setCheckedIngredients(next);
  };

  // Group ingredients by section if present
  const ingredientSections = React.useMemo(() => {
    const sections: { sectionName: string; items: Ingredient[] }[] = [];
    const map = new Map<string, Ingredient[]>();

    for (const ing of recipe.ingredients) {
      const sec = ing.section?.trim() || 'General';
      if (!map.has(sec)) {
        map.set(sec, []);
      }
      map.get(sec)!.push(ing);
    }

    for (const [sectionName, items] of map.entries()) {
      sections.push({ sectionName, items });
    }

    return sections;
  }, [recipe.ingredients]);

  const currentServings = Math.round(recipe.servings * servingsMultiplier);

  return (
    <div className="min-h-screen bg-[#FFF8F6] pb-28 px-4 sm:px-6">
      {/* Centered Desktop Container (max-width: 760px) */}
      <div className="max-w-[760px] mx-auto pt-3 sm:pt-5">
        {/* Hero Image Container with Downward Curved Mask (50% 36px) */}
        <div
          style={{
            borderBottomLeftRadius: '50% 36px',
            borderBottomRightRadius: '50% 36px',
          }}
          className="relative w-full aspect-16/10 sm:aspect-16/9 max-h-[420px] bg-[#FDECC8]/30 rounded-t-[24px] overflow-hidden shadow-cozy-lg border border-[#F3E5D8] no-print"
        >
          <img
            src={recipe.heroImage || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80'}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />

          {/* Top Floating Action Bar */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center text-[#3D231D] shadow-cozy hover:bg-white active:scale-95 transition-all border border-[#F3E5D8] cursor-pointer"
              aria-label="Back to Cookbook"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
            </button>

            <div className="flex items-center space-x-2">
              {/* Print button */}
              <button
                onClick={() => onPrint(recipe)}
                className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center text-[#3D231D] shadow-cozy hover:bg-white active:scale-95 transition-all border border-[#F3E5D8] cursor-pointer"
                title="Print Recipe"
              >
                <Printer className="w-4 h-4 stroke-[2]" />
              </button>

              {/* Edit button */}
              <button
                onClick={() => onEdit(recipe)}
                className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center text-[#3D231D] shadow-cozy hover:bg-white active:scale-95 transition-all border border-[#F3E5D8] cursor-pointer"
                title="Edit Recipe"
              >
                <Edit3 className="w-4 h-4 stroke-[2]" />
              </button>

              {/* Favorite button */}
              <button
                onClick={(e) => onToggleFavorite(recipe.id, e)}
                className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center text-[#3D231D] shadow-cozy hover:bg-white active:scale-95 transition-all border border-[#F3E5D8] cursor-pointer"
                title={recipe.isFavorite ? 'Remove favorite' : 'Add favorite'}
              >
                <Heart
                  className={`w-5 h-5 transition-transform active:scale-125 ${
                    recipe.isFavorite
                      ? 'fill-[#E85D75] text-[#E85D75]'
                      : 'text-[#8C726B] hover:text-[#E85D75]'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Main Recipe Content */}
        <div className="pt-6 relative px-1">
          {/* Title */}
          <h1 className="font-brand text-2xl sm:text-3xl font-bold text-[#3D231D] tracking-tight mb-2">
            {recipe.title}
          </h1>

          {recipe.description && (
            <p className="text-xs sm:text-sm text-[#8C726B] leading-relaxed mb-4">
              {recipe.description}
            </p>
          )}

          {/* Metadata Chips Row - Butter Peach Badges with Full Pill Rounding */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {/* Prep Time Metadata Pill */}
            <div className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#FDECC8] border border-[#F3E5D8] rounded-full text-xs font-semibold text-[#3D231D] shadow-xs">
              <Clock className="w-3.5 h-3.5 text-[#3D231D]" />
              <span>{recipe.prepTimeMinutes + (recipe.cookTimeMinutes || 0)} mins total</span>
            </div>

            {/* Servings Chip with Live Scaling */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 bg-[#FDECC8] border border-[#F3E5D8] rounded-full text-xs font-semibold text-[#3D231D] shadow-xs">
              <div className="flex items-center space-x-1">
                <Users className="w-3.5 h-3.5 text-[#3D231D]" />
                <span>{currentServings} servings</span>
              </div>
              <div className="flex items-center space-x-1 border-l border-[#F3E5D8] pl-1.5 no-print">
                <button
                  type="button"
                  onClick={() => setServingsMultiplier((prev) => Math.max(0.5, prev - 0.5))}
                  className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[#3D231D] hover:bg-[#FFF8F6] active:scale-95 text-xs font-bold border border-[#F3E5D8] cursor-pointer"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => setServingsMultiplier((prev) => prev + 0.5)}
                  className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[#3D231D] hover:bg-[#FFF8F6] active:scale-95 text-xs font-bold border border-[#F3E5D8] cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Wake Lock Indicator Pill */}
            {isWakeLockSupported && (
              <div
                className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border border-[#F3E5D8] ${
                  isWakeLockActive
                    ? 'bg-[#FDECC8] text-[#3D231D] shadow-xs'
                    : 'bg-white text-[#8C726B]'
                }`}
                title="Screen Wake-Lock is active while viewing this recipe"
              >
                <Zap className={`w-3.5 h-3.5 ${isWakeLockActive ? 'fill-[#3D231D] text-[#3D231D]' : 'text-[#8C726B]'}`} />
                <span>{isWakeLockActive ? 'Screen Awake' : 'Wake Lock'}</span>
              </div>
            )}
          </div>

          {/* Action Button: Add to Meal Plan (Full Pill Rounding) */}
          <div className="mb-6 flex gap-2 no-print">
            <button
              onClick={() => onAddToMealPlan(recipe)}
              className="flex-1 py-3 px-5 bg-[#FDECC8] hover:bg-[#FCE3B0] active:scale-98 text-[#3D231D] text-xs font-bold rounded-full flex items-center justify-center space-x-2 transition-all shadow-xs border border-[#F3E5D8] cursor-pointer"
            >
              <CalendarPlus className="w-4 h-4 text-[#E85D75]" />
              <span>Add to Meal Plan</span>
            </button>
          </div>

          {/* Ingredients Checklist */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2.5">
              <div className="flex items-center space-x-3 flex-wrap gap-2">
                <h2 className="font-brand text-xl font-bold text-[#3D231D]">Ingredients</h2>

                {/* Unit Switcher: Cups & Spoons vs Grams & Metric */}
                <div
                  role="group"
                  aria-label="Measurement unit system"
                  className="bg-[#FDECC8]/60 border border-[#F3E5D8] rounded-full p-0.5 inline-flex items-center text-xs shadow-2xs no-print"
                >
                  <button
                    type="button"
                    onClick={() => handleUnitSystemChange('us')}
                    aria-pressed={unitSystem === 'us'}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full transition-all duration-200 cursor-pointer ${
                      unitSystem === 'us'
                        ? 'bg-[#E85D75] text-white shadow-xs font-bold'
                        : 'text-[#8C726B] hover:text-[#3D231D] font-medium'
                    }`}
                    title="View ingredients in cups and spoons (US Customary)"
                  >
                    <svg
                      className="w-3.5 h-3.5 stroke-[2]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M4 4h14v11a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V4z" />
                      <path d="M18 8h3a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-3" />
                      <line x1="8" y1="8" x2="11" y2="8" />
                      <line x1="8" y1="12" x2="12" y2="12" />
                    </svg>
                    <span>Cups & Spoons</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUnitSystemChange('metric')}
                    aria-pressed={unitSystem === 'metric'}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full transition-all duration-200 cursor-pointer ${
                      unitSystem === 'metric'
                        ? 'bg-[#E85D75] text-white shadow-xs font-bold'
                        : 'text-[#8C726B] hover:text-[#3D231D] font-medium'
                    }`}
                    title="View ingredients in grams and milliliters (Metric)"
                  >
                    <Scale className="w-3.5 h-3.5 stroke-[2.2]" aria-hidden="true" />
                    <span>Grams & Metric</span>
                  </button>
                </div>
              </div>

              {checkedIngredients.size > 0 && (
                <button
                  onClick={() => setCheckedIngredients(new Set())}
                  className="text-xs text-[#E85D75] hover:underline font-semibold no-print cursor-pointer"
                >
                  Reset checks
                </button>
              )}
            </div>

            <div className="space-y-4">
              {ingredientSections.map(({ sectionName, items }) => (
                <div key={sectionName} className="space-y-2">
                  {sectionName !== 'General' && (
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#8C726B] pt-1">
                      {sectionName}
                    </h3>
                  )}

                  <div className="space-y-2">
                    {items.map((ing) => {
                      const isChecked = checkedIngredients.has(ing.id);
                      const icon = getIngredientIcon(ing.name);
                      const converted = convertIngredient(ing, unitSystem, servingsMultiplier);
                      const displayAmt = converted.displayQuantity;
                      const displayUnit = converted.unit;

                      return (
                        <div
                          key={ing.id}
                          onClick={() => toggleIngredient(ing.id)}
                          className={`flex items-center space-x-3 p-3 rounded-[16px] transition-all duration-200 cursor-pointer select-none border ${
                            isChecked
                              ? 'bg-[#FDE8EA]/60 border-[#F3E5D8]'
                              : 'bg-white hover:bg-[#FDECC8]/20 border-[#F3E5D8] shadow-cozy'
                          }`}
                        >
                          {/* Checkbox with border-radius: 6px */}
                          <div
                            className={`w-6 h-6 rounded-[6px] flex items-center justify-center transition-all duration-200 shrink-0 ${
                              isChecked
                                ? 'bg-[#E85D75] text-white shadow-xs'
                                : 'bg-[#FDECC8] border border-[#F3E5D8]'
                            }`}
                          >
                            {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                          </div>

                          {/* Stylized Ingredient Thumbnail */}
                          {icon && (
                            <div className="w-7 h-7 rounded-[8px] bg-[#FDECC8]/40 border border-[#F3E5D8] flex items-center justify-center p-0.5 shrink-0 overflow-hidden shadow-2xs">
                              <img
                                src={icon.url}
                                alt={icon.label}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = icon.fallbackUrl;
                                }}
                              />
                            </div>
                          )}

                          {/* Strikethrough Text */}
                          <div className="flex-1 text-sm font-medium leading-tight">
                            <span
                              className={`strikethrough-transition ${
                                isChecked
                                  ? 'line-through text-[#8C726B]/60 decoration-[#E85D75] decoration-2'
                                  : 'text-[#3D231D]'
                              }`}
                            >
                              <span className="font-bold mr-1.5">
                                {displayAmt} {displayUnit}
                              </span>
                              <span>{ing.name}</span>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Steps Section - Step cards with generous border-radius: 24px */}
          <div className="mb-8">
            <h2 className="font-brand text-xl font-bold text-[#3D231D] mb-3">Steps</h2>

            <div className="space-y-3">
              {recipe.steps.map((step) => (
                <div
                  key={step.id}
                  className="bg-white border border-[#F3E5D8] rounded-[24px] p-4 shadow-cozy flex items-start space-x-3.5 hover:bg-[#FFFDF9] transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-[#FDECC8] text-[#3D231D] font-brand font-bold text-sm flex items-center justify-center shrink-0 shadow-xs border border-[#F3E5D8]">
                    {step.stepNumber}
                  </div>
                  <div className="flex-1 text-xs sm:text-sm text-[#3D231D] leading-relaxed pt-0.5 font-medium">
                    {step.instruction}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
