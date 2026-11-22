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
} from 'lucide-react';
import type { Recipe, Ingredient } from '../../types';
import { useWakeLock } from '../../hooks/useWakeLock';
import { getIngredientIcon } from '../../utils/ingredientIconResolver';

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
    <div className="min-h-screen bg-[#FFF5F7] pb-28">
      {/* Hero Image Container with Deep Rounded Bowl Mask */}
      <div className="relative w-full aspect-4/3 max-h-[400px] bg-[#FFE599]/30 rounded-b-[64px] sm:rounded-b-[84px] overflow-hidden shadow-cozy-lg no-print">
        <img
          src={recipe.heroImage || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80'}
          alt={recipe.title}
          className="w-full h-full object-cover"
        />

        {/* Top Floating Action Bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#4A2C2A] shadow-cozy hover:bg-white active:scale-95 transition-all"
            aria-label="Back to Cookbook"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
          </button>

          <div className="flex items-center space-x-2">
            {/* Print button */}
            <button
              onClick={() => onPrint(recipe)}
              className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#4A2C2A] shadow-cozy hover:bg-white active:scale-95 transition-all"
              title="Print Recipe"
            >
              <Printer className="w-4 h-4 stroke-[2]" />
            </button>

            {/* Edit button */}
            <button
              onClick={() => onEdit(recipe)}
              className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#4A2C2A] shadow-cozy hover:bg-white active:scale-95 transition-all"
              title="Edit Recipe"
            >
              <Edit3 className="w-4 h-4 stroke-[2]" />
            </button>

            {/* Favorite button */}
            <button
              onClick={(e) => onToggleFavorite(recipe.id, e)}
              className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#4A2C2A] shadow-cozy hover:bg-white active:scale-95 transition-all"
              title={recipe.isFavorite ? 'Remove favorite' : 'Add favorite'}
            >
              <Heart
                className={`w-5 h-5 transition-transform active:scale-125 ${
                  recipe.isFavorite
                    ? 'fill-[#FF8FA3] text-[#FF8FA3]'
                    : 'text-[#8A6866] hover:text-[#FF8FA3]'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Main Recipe Content */}
      <div className="max-w-lg mx-auto px-5 pt-6 relative">
        {/* Title */}
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A2C2A] tracking-tight mb-2">
          {recipe.title}
        </h1>

        {recipe.description && (
          <p className="text-xs sm:text-sm text-[#8A6866] leading-relaxed mb-4">
            {recipe.description}
          </p>
        )}

        {/* Metadata Chips Row */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#FFF9E6] border border-[#F5E6BF] rounded-full text-xs font-semibold text-[#4A2C2A] shadow-xs">
            <Clock className="w-3.5 h-3.5 text-[#8A6866]" />
            <span>{recipe.prepTimeMinutes + (recipe.cookTimeMinutes || 0)} mins total</span>
          </div>

          {/* Servings Chip with Live Scaling */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#FFF9E6] border border-[#F5E6BF] rounded-full text-xs font-semibold text-[#4A2C2A] shadow-xs">
            <div className="flex items-center space-x-1">
              <Users className="w-3.5 h-3.5 text-[#8A6866]" />
              <span>{currentServings} servings</span>
            </div>
            <div className="flex items-center space-x-1 border-l border-[#F5E6BF] pl-1.5 no-print">
              <button
                type="button"
                onClick={() => setServingsMultiplier((prev) => Math.max(0.5, prev - 0.5))}
                className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[#8A6866] hover:bg-[#FFE599] active:scale-95 text-xs font-bold"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => setServingsMultiplier((prev) => prev + 0.5)}
                className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[#8A6866] hover:bg-[#FFE599] active:scale-95 text-xs font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Wake Lock Indicator Pill */}
          {isWakeLockSupported && (
            <div
              className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                isWakeLockActive
                  ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]'
                  : 'bg-[#FFF0F3] text-[#FF8FA3]'
              }`}
              title="Screen Wake-Lock is active while viewing this recipe"
            >
              <Zap className="w-3 h-3 fill-current" />
              <span>{isWakeLockActive ? 'Screen Awake' : 'Wake Lock'}</span>
            </div>
          )}
        </div>

        {/* Action Button: Add to Meal Plan */}
        <div className="mb-6 flex gap-2 no-print">
          <button
            onClick={() => onAddToMealPlan(recipe)}
            className="flex-1 py-2.5 px-4 bg-[#FFE4E9] hover:bg-[#FFD2DC] active:scale-98 text-[#4A2C2A] text-xs font-bold rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-xs"
          >
            <CalendarPlus className="w-4 h-4 text-[#FF8FA3]" />
            <span>Add to Meal Plan</span>
          </button>
        </div>

        {/* Ingredients Checklist */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-lg font-bold text-[#4A2C2A]">Ingredients</h2>
            {checkedIngredients.size > 0 && (
              <button
                onClick={() => setCheckedIngredients(new Set())}
                className="text-[11px] text-[#FF8FA3] hover:underline font-semibold no-print"
              >
                Reset checks
              </button>
            )}
          </div>

          <div className="space-y-4">
            {ingredientSections.map(({ sectionName, items }) => (
              <div key={sectionName} className="space-y-2">
                {sectionName !== 'General' && (
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#8A6866] pt-1">
                    {sectionName}
                  </h3>
                )}

                <div className="space-y-1.5">
                  {items.map((ing) => {
                    const isChecked = checkedIngredients.has(ing.id);
                    const icon = getIngredientIcon(ing.name);
                    // Compute scaled amount if multiplier changed
                    const displayAmt = ing.displayFraction || (ing.amount ? ing.amount.toString() : '');

                    return (
                      <div
                        key={ing.id}
                        onClick={() => toggleIngredient(ing.id)}
                        className={`flex items-center space-x-3 p-2.5 rounded-2xl transition-all duration-200 cursor-pointer select-none ${
                          isChecked
                            ? 'bg-[#FFF0F3]/80 border border-[#F3D5DC]'
                            : 'bg-white hover:bg-[#FFF9E6] border border-[#F3D5DC]/60 shadow-xs'
                        }`}
                      >
                        {/* Rounded Checkbox */}
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 shrink-0 ${
                            isChecked
                              ? 'bg-[#FF8FA3] text-white shadow-xs'
                              : 'bg-[#FFF9E6] border border-[#F5E6BF]'
                          }`}
                        >
                          {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                        </div>

                        {/* Stylized Ingredient Thumbnail */}
                        {icon && (
                          <div className="w-7 h-7 rounded-lg bg-[#FFF9E6] border border-[#F5E6BF] flex items-center justify-center p-0.5 shrink-0 overflow-hidden shadow-2xs">
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
                                ? 'line-through text-[#B89D9B] decoration-[#FF8FA3] decoration-2'
                                : 'text-[#4A2C2A]'
                            }`}
                          >
                            <span className="font-bold mr-1">
                              {displayAmt} {ing.unit}
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

        {/* Steps Section */}
        <div className="mb-8">
          <h2 className="font-serif text-lg font-bold text-[#4A2C2A] mb-3">Steps</h2>

          <div className="space-y-3">
            {recipe.steps.map((step) => (
              <div
                key={step.id}
                className="bg-[#FFF9E6] border border-[#F5E6BF] rounded-2xl p-4 shadow-xs flex items-start space-x-3.5 hover:bg-[#FFF6D9] transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-[#FFE599] text-[#4A2C2A] font-serif font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                  {step.stepNumber}
                </div>
                <div className="flex-1 text-xs sm:text-sm text-[#4A2C2A] leading-relaxed pt-0.5 font-medium">
                  {step.instruction}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
