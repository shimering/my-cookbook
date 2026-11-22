import React, { useState } from 'react';
import {
  Check,
  Plus,
  Trash2,
  Sparkles,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { GroceryItem, GroceryCategory } from '../../types';
import { getIngredientIcon } from '../../utils/ingredientIconResolver';

interface GroceryListViewProps {
  groceryItems: GroceryItem[];
  onToggleItem: (id: string) => void;
  onAddItem: (item: Omit<GroceryItem, 'id' | 'checked'>) => void;
  onDeleteItem: (id: string) => void;
  onClearChecked: () => void;
  onClearAll: () => void;
}

const AISLE_ORDER: GroceryCategory[] = [
  'Produce',
  'Dairy & Eggs',
  'Meat & Seafood',
  'Bakery',
  'Pantry',
  'Spices & Seasonings',
  'Household & Other',
];

export const GroceryListView: React.FC<GroceryListViewProps> = ({
  groceryItems,
  onToggleItem,
  onAddItem,
  onDeleteItem,
  onClearChecked,
  onClearAll,
}) => {
  const [manualName, setManualName] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [manualCategory, setManualCategory] = useState<GroceryCategory>('Household & Other');
  const [showCompleted, setShowCompleted] = useState(true);

  // Separate active vs completed items
  const activeItems = groceryItems.filter((i) => !i.checked);
  const completedItems = groceryItems.filter((i) => i.checked);

  // Group active items by aisle
  const activeByAisle = React.useMemo(() => {
    const map = new Map<GroceryCategory, GroceryItem[]>();
    for (const aisle of AISLE_ORDER) {
      map.set(aisle, []);
    }
    for (const item of activeItems) {
      const aisle = item.category || 'Household & Other';
      if (!map.has(aisle)) {
        map.set(aisle, []);
      }
      map.get(aisle)!.push(item);
    }
    return map;
  }, [activeItems]);

  const handleToggle = (id: string) => {
    const item = groceryItems.find((i) => i.id === id);
    if (item && !item.checked) {
      // If toggling the last unchecked item to checked, trigger celebratory confetti!
      if (activeItems.length === 1 && activeItems[0].id === id) {
        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#FF8FA3', '#FFE599', '#FFF0F3', '#4A2C2A'],
          });
        } catch {
          // Fallback if canvas-confetti is not loaded
        }
      }
    }
    onToggleItem(id);
  };

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    onAddItem({
      name: manualName.trim(),
      amount: parseFloat(manualAmount) || 1,
      unit: '',
      displayQuantity: manualAmount.trim() || '1',
      category: manualCategory,
      isManual: true,
      recipeSources: ['Manual Addition'],
    });

    setManualName('');
    setManualAmount('');
  };

  return (
    <div className="pb-28 px-4 max-w-lg mx-auto">
      {/* List Header & Summary Card */}
      <div className="bg-white border border-[#F3D5DC] rounded-3xl p-4 shadow-cozy mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-full bg-[#FFF0F3] text-[#FF8FA3] flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-[#4A2C2A]">Grocery List</h2>
              <span className="text-[11px] text-[#8A6866]">
                {activeItems.length} items to pick up • {completedItems.length} checked
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {completedItems.length > 0 && (
              <button
                type="button"
                onClick={onClearChecked}
                className="text-[11px] font-semibold text-[#8A6866] hover:text-[#FF8FA3] px-2 py-1 bg-[#FFF5F7] rounded-lg transition-colors"
                title="Clear Completed"
              >
                Clear checked
              </button>
            )}
            {groceryItems.length > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-[11px] font-semibold text-[#8A6866] hover:text-red-500 px-2 py-1 bg-[#FFF5F7] rounded-lg transition-colors"
                title="Reset Grocery List"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Quick Add Manual Item Form */}
        <form onSubmit={handleAddManual} className="mt-3 flex items-center space-x-1.5">
          <input
            type="text"
            value={manualName}
            onChange={(e) => setManualName(e.target.value)}
            placeholder="Add item (e.g. Paper towels, Coffee...)"
            className="flex-1 px-3 py-2 bg-[#FFF9E6] border border-[#F5E6BF] rounded-xl text-xs text-[#4A2C2A] placeholder-[#B89D9B] focus:outline-none focus:ring-2 focus:ring-[#FF8FA3]/50"
          />

          <select
            value={manualCategory}
            onChange={(e) => setManualCategory(e.target.value as GroceryCategory)}
            className="px-2 py-2 bg-white border border-[#F3D5DC] rounded-xl text-[11px] font-semibold text-[#8A6866] focus:outline-none"
          >
            {AISLE_ORDER.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="p-2 bg-[#FF8FA3] hover:bg-[#FF758F] active:scale-95 text-white rounded-xl shadow-xs transition-transform"
            title="Add to grocery list"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>
      </div>

      {/* Active Items Grouped by Aisle */}
      {activeItems.length > 0 ? (
        <div className="space-y-4">
          {AISLE_ORDER.map((aisle) => {
            const items = activeByAisle.get(aisle) || [];
            if (items.length === 0) return null;

            return (
              <div
                key={aisle}
                className="bg-white border border-[#F3D5DC] rounded-2xl p-3.5 shadow-cozy space-y-2"
              >
                <div className="flex items-center justify-between pb-1 border-b border-[#F3D5DC]/60">
                  <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-[#FF8FA3]">
                    {aisle}
                  </h3>
                  <span className="text-[10px] font-semibold text-[#8A6866]">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  {items.map((item) => {
                    const icon = getIngredientIcon(item.name);
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleToggle(item.id)}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-[#FFF9E6] cursor-pointer transition-colors group select-none"
                      >
                        <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                          {/* Rounded Tap-Friendly Checkbox */}
                          <div className="w-6 h-6 rounded-lg bg-[#FFF9E6] border border-[#F5E6BF] group-hover:border-[#FF8FA3] flex items-center justify-center shrink-0 transition-colors">
                            {/* Unchecked */}
                          </div>

                          {/* Stylized Ingredient Thumbnail */}
                          {icon && (
                            <div className="w-6 h-6 rounded-md bg-[#FFF9E6] border border-[#F5E6BF] flex items-center justify-center p-0.5 shrink-0 overflow-hidden shadow-2xs">
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

                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-semibold text-[#4A2C2A] block truncate">
                              {item.displayQuantity ? `${item.displayQuantity} ` : ''}
                              {item.unit ? `${item.unit} ` : ''}
                              {item.name}
                            </span>
                            {item.recipeSources && item.recipeSources.length > 0 && (
                              <span className="text-[10px] text-[#8A6866] truncate block">
                                For: {item.recipeSources.join(', ')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Delete Item Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteItem(item.id);
                          }}
                          className="p-1 text-[#B89D9B] hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white/80 border border-[#F3D5DC] rounded-3xl p-8 text-center my-4 shadow-cozy">
          <div className="w-12 h-12 bg-[#FFF0F3] rounded-full flex items-center justify-center mx-auto mb-2.5 text-[#FF8FA3]">
            <Sparkles className="w-6 h-6" />
          </div>
          <h4 className="font-serif text-base font-bold text-[#4A2C2A] mb-1">
            {completedItems.length > 0 ? 'All done shopping!' : 'Your list is empty'}
          </h4>
          <p className="text-xs text-[#8A6866] max-w-xs mx-auto mb-3">
            {completedItems.length > 0
              ? 'You have checked off all items for this week. Happy cooking!'
              : 'Add ingredients from your weekly meal plan, or add quick items above.'}
          </p>
        </div>
      )}

      {/* Completed Items Section (Collapsible) */}
      {completedItems.length > 0 && (
        <div className="mt-5 bg-[#FFF0F3]/60 border border-[#F3D5DC] rounded-2xl p-3.5 shadow-xs">
          <button
            type="button"
            onClick={() => setShowCompleted(!showCompleted)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-[#8A6866]">
                Completed ({completedItems.length})
              </span>
            </div>
            {showCompleted ? (
              <ChevronUp className="w-4 h-4 text-[#8A6866]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#8A6866]" />
            )}
          </button>

          {showCompleted && (
            <div className="space-y-1.5 pt-3">
              {completedItems.map((item) => {
                const icon = getIngredientIcon(item.name);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggle(item.id)}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/60 hover:bg-white cursor-pointer transition-colors group select-none"
                  >
                    <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-[#FF8FA3] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                      {icon && (
                        <div className="w-6 h-6 rounded-md bg-[#FFF9E6] border border-[#F5E6BF] flex items-center justify-center p-0.5 shrink-0 overflow-hidden opacity-60">
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
                      <span className="text-xs font-medium text-[#B89D9B] line-through decoration-[#FF8FA3] truncate">
                        {item.displayQuantity ? `${item.displayQuantity} ` : ''}
                        {item.unit ? `${item.unit} ` : ''}
                        {item.name}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteItem(item.id);
                      }}
                      className="p-1 text-[#B89D9B] hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
