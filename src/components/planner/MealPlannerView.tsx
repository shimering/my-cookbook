import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Utensils,
  ShoppingBag,
  Sparkles,
  Calendar as CalendarIcon,
  X,
  Search,
} from 'lucide-react';
import { formatLocalDate, getSundayOfWeek } from '../../utils/dateUtils';
import type { PlannedMeal, MealSlot, Recipe } from '../../types';

interface MealPlannerViewProps {
  plannedMeals: PlannedMeal[];
  recipes: Recipe[];
  onAddMeal: (meal: Omit<PlannedMeal, 'id'>) => void;
  onRemoveMeal: (id: string) => void;
  onUpdateServingMultiplier: (id: string, multiplier: number) => void;
  onGenerateGroceries: (selectedDateRange: { startDate: string; endDate: string }) => void;
  onSelectRecipe: (recipe: Recipe) => void;
}

const MEAL_SLOTS: { slot: MealSlot; label: string; icon: string }[] = [
  { slot: 'breakfast', label: 'Breakfast', icon: '🥞' },
  { slot: 'lunch', label: 'Lunch', icon: '🥗' },
  { slot: 'dinner', label: 'Dinner', icon: '🍝' },
  { slot: 'snack', label: 'Snacks & Dessert', icon: '🧁' },
];

export const MealPlannerView: React.FC<MealPlannerViewProps> = ({
  plannedMeals,
  recipes,
  onAddMeal,
  onRemoveMeal,
  onUpdateServingMultiplier,
  onGenerateGroceries,
  onSelectRecipe,
}) => {
  // Current Sunday anchor (starts from Sunday till Saturday)
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => getSundayOfWeek());

  // Active day index (0 = Sunday, ..., 6 = Saturday; default to today's index)
  const [activeDayIndex, setActiveDayIndex] = useState<number>(() => {
    return new Date().getDay();
  });

  // Modal for adding a meal to a slot
  const [modalSlot, setModalSlot] = useState<{ date: string; slot: MealSlot } | null>(null);
  const [recipeSearch, setRecipeSearch] = useState('');
  const [customNoteInput, setCustomNoteInput] = useState('');
  const [servingsMultiplier, setServingsMultiplier] = useState(1);

  // Lock body scroll when add-meal modal is active
  useEffect(() => {
    if (modalSlot) {
      const prevOverflow = document.body.style.overflow;
      const prevTouchAction = document.body.style.touchAction;
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      return () => {
        document.body.style.overflow = prevOverflow;
        document.body.style.touchAction = prevTouchAction;
      };
    }
  }, [modalSlot]);

  // Generate 7 days for the current week (Sunday to Saturday)
  const weekDays = useMemo(() => {
    const days: { dateStr: string; dayName: string; formatted: string; isToday: boolean }[] = [];
    const todayStr = formatLocalDate(new Date());

    for (let i = 0; i < 7; i++) {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + i);
      const dateStr = formatLocalDate(d);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      days.push({
        dateStr,
        dayName,
        formatted,
        isToday: dateStr === todayStr,
      });
    }
    return days;
  }, [currentWeekStart]);

  const activeDay = weekDays[activeDayIndex] || weekDays[0];

  // Meals for the active day
  const mealsBySlot = useMemo(() => {
    const map: Record<MealSlot, PlannedMeal[]> = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    };

    const dayMeals = plannedMeals.filter((m) => m.date === activeDay.dateStr);
    for (const m of dayMeals) {
      if (map[m.slot]) {
        map[m.slot].push(m);
      }
    }
    return map;
  }, [plannedMeals, activeDay.dateStr]);

  // Navigate weeks
  const changeWeek = (direction: 'prev' | 'next') => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + (direction === 'prev' ? -7 : 7));
    setCurrentWeekStart(next);
  };

  // Recipe selection in modal
  const filteredRecipes = useMemo(() => {
    if (!recipeSearch.trim()) return recipes;
    const q = recipeSearch.toLowerCase();
    return recipes.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.categories?.some((c) => c.toLowerCase().includes(q))
    );
  }, [recipes, recipeSearch]);

  const handleConfirmAddMeal = (recipe?: Recipe) => {
    if (!modalSlot) return;

    if (recipe) {
      onAddMeal({
        date: modalSlot.date,
        slot: modalSlot.slot,
        recipeId: recipe.id,
        recipeTitle: recipe.title,
        servingsMultiplier,
      });
    } else if (customNoteInput.trim()) {
      onAddMeal({
        date: modalSlot.date,
        slot: modalSlot.slot,
        customNote: customNoteInput.trim(),
        servingsMultiplier,
      });
    }

    setModalSlot(null);
    setRecipeSearch('');
    setCustomNoteInput('');
    setServingsMultiplier(1);
  };

  // Calculate total meals planned this week
  const weekMealsCount = useMemo(() => {
    const start = weekDays[0].dateStr;
    const end = weekDays[6].dateStr;
    return plannedMeals.filter((m) => m.date >= start && m.date <= end).length;
  }, [plannedMeals, weekDays]);

  return (
    <div className="pb-28 px-4 sm:px-6 max-w-[1120px] mx-auto">
      {/* Week Header & Navigation - Rounded 24px */}
      <div className="flex items-center justify-between mb-4 bg-white border border-[#F3D5DC] rounded-[24px] p-3.5 sm:p-4 shadow-cozy">
        <button
          onClick={() => changeWeek('prev')}
          className="p-2 rounded-full hover:bg-[#FFF3CC] text-[#4A2C2A] transition-colors cursor-pointer"
          title="Previous Week"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-1.5 text-xs font-bold text-[#8A6866]">
            <CalendarIcon className="w-3.5 h-3.5 text-[#FF8FA3]" />
            <span>Weekly Meal Plan</span>
          </div>
          <span className="font-serif text-sm sm:text-base font-bold text-[#4A2C2A]">
            {weekDays[0].formatted} – {weekDays[6].formatted}
          </span>
        </div>

        <button
          onClick={() => changeWeek('next')}
          className="p-2 rounded-full hover:bg-[#FFF3CC] text-[#4A2C2A] transition-colors cursor-pointer"
          title="Next Week"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 7-Day Calendar Tabs (Monday to Sunday) - Rounded 16px */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-4">
        {weekDays.map((day, idx) => {
          const isSelected = idx === activeDayIndex;
          const dayMeals = plannedMeals.filter((m) => m.date === day.dateStr);
          const hasMeals = dayMeals.length > 0;

          return (
            <button
              key={day.dateStr}
              onClick={() => setActiveDayIndex(idx)}
              className={`flex flex-col items-center py-2.5 px-1 rounded-[16px] transition-all duration-200 border cursor-pointer ${
                isSelected
                  ? 'bg-[#FF8FA3] text-white border-[#FF8FA3] shadow-pink-glow scale-102 font-bold'
                  : 'bg-white hover:bg-[#FFF3CC]/50 text-[#4A2C2A] border-[#F3D5DC] shadow-xs'
              }`}
            >
              <span className={`text-[10px] font-bold ${isSelected ? 'text-white' : 'text-[#8A6866]'}`}>
                {day.dayName}
              </span>
              <span className="text-xs font-serif font-bold mt-0.5">
                {day.dateStr.split('-')[2]}
              </span>
              {/* Dot indicator if day has planned meals */}
              <div className="h-1.5 flex items-center justify-center mt-1">
                {hasMeals && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-[#FF8FA3]'
                    }`}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Generate Grocery List Floating Trigger Banner - Butter Yellow, Rounded 24px */}
      <div className="bg-[#FFE599] border border-[#F5E6BF] rounded-[24px] p-4 mb-5 shadow-cozy flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-[#4A2C2A] flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FF8FA3]" />
            <span>Generate Groceries</span>
          </h4>
          <p className="text-[11px] text-[#8A6866] mt-0.5">
            {weekMealsCount} {weekMealsCount === 1 ? 'meal' : 'meals'} planned for this week
          </p>
        </div>

        <button
          onClick={() =>
            onGenerateGroceries({
              startDate: weekDays[0].dateStr,
              endDate: weekDays[6].dateStr,
            })
          }
          className="px-4 py-2 bg-[#FF8FA3] hover:bg-[#FF758F] active:scale-95 text-white text-xs font-bold rounded-full shadow-pink-glow flex items-center space-x-1.5 transition-all cursor-pointer"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Build List</span>
        </button>
      </div>

      {/* Slots for the active day - Rounded 24px cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MEAL_SLOTS.map(({ slot, label, icon }) => {
          const slotMeals = mealsBySlot[slot];

          return (
            <div
              key={slot}
              className="bg-white border border-[#F3D5DC] rounded-[24px] p-4 shadow-cozy space-y-3"
            >
              {/* Slot Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-base">{icon}</span>
                  <h3 className="font-serif text-sm font-bold text-[#4A2C2A]">{label}</h3>
                </div>

                <button
                  type="button"
                  onClick={() => setModalSlot({ date: activeDay.dateStr, slot })}
                  className="inline-flex items-center space-x-1 px-3.5 py-1 bg-[#FFE599] hover:bg-[#FFD966] text-[#4A2C2A] text-xs font-bold rounded-full transition-colors border border-[#F5E6BF] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add</span>
                </button>
              </div>

              {/* Planned Meals in this Slot */}
              {slotMeals.length > 0 ? (
                <div className="space-y-2">
                  {slotMeals.map((meal) => {
                    const matchedRecipe = recipes.find((r) => r.id === meal.recipeId);

                    return (
                      <div
                        key={meal.id}
                        className="bg-[#FFF3CC] border border-[#F5E6BF] rounded-[16px] p-2.5 flex items-center justify-between space-x-2 shadow-xs"
                      >
                        <div
                          className="flex items-center space-x-2.5 flex-1 min-w-0 cursor-pointer"
                          onClick={() => matchedRecipe && onSelectRecipe(matchedRecipe)}
                        >
                          {matchedRecipe ? (
                            <img
                              src={matchedRecipe.heroImage}
                              alt={matchedRecipe.title}
                              className="w-10 h-10 rounded-[10px] object-cover shrink-0 border border-[#F5E6BF]"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-[10px] bg-[#FFE599] flex items-center justify-center shrink-0 text-[#4A2C2A]">
                              <Utensils className="w-4 h-4" />
                            </div>
                          )}

                          <div className="min-w-0">
                            <span className="text-xs font-bold text-[#4A2C2A] truncate block">
                              {meal.recipeTitle || meal.customNote}
                            </span>
                            <span className="text-[10px] text-[#8A6866]">
                              {matchedRecipe ? 'From Cookbook' : 'Custom Note'}
                            </span>
                          </div>
                        </div>

                        {/* Serving Multiplier Selector */}
                        <div className="flex items-center space-x-1 text-xs text-[#8A6866] shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateServingMultiplier(
                                meal.id,
                                Math.max(0.5, meal.servingsMultiplier - 0.5)
                              )
                            }
                            className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[#4A2C2A] hover:bg-[#FFE599] font-bold border border-[#F5E6BF] cursor-pointer"
                            title="Decrease Servings"
                          >
                            -
                          </button>
                          <span className="font-bold w-6 text-center text-[#4A2C2A]">
                            {meal.servingsMultiplier}x
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateServingMultiplier(meal.id, meal.servingsMultiplier + 0.5)
                            }
                            className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[#4A2C2A] hover:bg-[#FFE599] font-bold border border-[#F5E6BF] cursor-pointer"
                            title="Increase Servings"
                          >
                            +
                          </button>

                          {/* Delete Meal */}
                          <button
                            type="button"
                            onClick={() => onRemoveMeal(meal.id)}
                            className="p-1.5 text-[#8A6866] hover:text-red-500 rounded-lg transition-colors ml-1 cursor-pointer"
                            title="Remove from meal plan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  onClick={() => setModalSlot({ date: activeDay.dateStr, slot })}
                  className="py-3 px-3 border border-dashed border-[#F3D5DC] rounded-[16px] text-center text-[11px] text-[#8A6866] cursor-pointer hover:bg-[#FFF3CC]/30 transition-colors"
                >
                  Empty slot — tap to plan {label.toLowerCase()}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Meal Modal - Rounded 24px */}
      {modalSlot && (
        <div
          className="fixed inset-0 z-50 bg-[#4A2C2A]/40 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4 overflow-hidden overscroll-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalSlot(null);
          }}
        >
          <div className="bg-[#FFF5F7] w-full max-w-md max-h-[85vh] rounded-t-[24px] sm:rounded-[24px] border border-[#F3D5DC] shadow-cozy-lg flex flex-col overflow-hidden overscroll-contain animate-in slide-in-from-bottom-6 duration-200">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-[#F3D5DC] bg-white flex items-center justify-between">
              <div>
                <h3 className="font-serif text-base font-bold text-[#4A2C2A]">
                  Add to {modalSlot.slot.charAt(0).toUpperCase() + modalSlot.slot.slice(1)}
                </h3>
                <span className="text-[11px] text-[#8A6866]">{activeDay.formatted}</span>
              </div>
              <button
                onClick={() => setModalSlot(null)}
                className="p-1.5 rounded-full hover:bg-[#FFF0F3] text-[#8A6866] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Option A: Pick From Saved Recipes */}
              <div>
                <label className="block text-xs font-bold text-[#8A6866] mb-1.5">
                  Choose from Saved Recipes
                </label>
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-[#8A6866] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={recipeSearch}
                    onChange={(e) => setRecipeSearch(e.target.value)}
                    placeholder="Search cookbook..."
                    className="w-full pl-8 pr-3 py-2 bg-white border border-[#F3D5DC] rounded-[16px] text-xs text-[#4A2C2A] placeholder-[#8A6866]/50 focus:outline-none focus:border-[#FF8FA3]"
                  />
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {filteredRecipes.map((recipe) => (
                    <div
                      key={recipe.id}
                      onClick={() => handleConfirmAddMeal(recipe)}
                      className="flex items-center space-x-2.5 p-2 bg-white hover:bg-[#FFF3CC]/40 border border-[#F3D5DC] rounded-[16px] cursor-pointer transition-colors"
                    >
                      <img
                        src={recipe.heroImage}
                        alt={recipe.title}
                        className="w-9 h-9 rounded-[10px] object-cover shrink-0 border border-[#F3D5DC]"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-[#4A2C2A] block truncate">
                          {recipe.title}
                        </span>
                        <span className="text-[10px] text-[#8A6866]">
                          ⏱ {recipe.prepTimeMinutes} mins
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#4A2C2A] px-3 py-1 bg-[#FFE599] rounded-full border border-[#F5E6BF]">
                        Select
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-[#F3D5DC] w-full" />
                <span className="bg-[#FFF5F7] px-2 text-[10px] font-bold text-[#8A6866] uppercase">
                  or custom note
                </span>
              </div>

              {/* Option B: Custom / Leftover Note */}
              <div>
                <label className="block text-xs font-bold text-[#8A6866] mb-1.5">
                  Custom Entry (e.g. "Eating out", "Leftover Pasta")
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={customNoteInput}
                    onChange={(e) => setCustomNoteInput(e.target.value)}
                    placeholder="e.g. Leftover Curry"
                    className="flex-1 px-3.5 py-2 bg-white border border-[#F3D5DC] rounded-[16px] text-xs text-[#4A2C2A] placeholder-[#8A6866]/50 focus:outline-none focus:border-[#FF8FA3]"
                  />
                  <button
                    type="button"
                    disabled={!customNoteInput.trim()}
                    onClick={() => handleConfirmAddMeal()}
                    className="px-4 py-2 bg-[#FF8FA3] hover:bg-[#FF758F] disabled:opacity-40 text-white text-xs font-bold rounded-full shadow-xs cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
