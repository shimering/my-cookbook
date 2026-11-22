import React, { useState } from 'react';
import {
  Check,
  Plus,
  Trash2,
  Sparkles,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Edit2,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { GroceryItem } from '../../types';
import { getIngredientIcon } from '../../utils/ingredientIconResolver';
import { getStoredCategories } from '../../data/groceryCatalog';
import { GroceryCatalogModal } from './GroceryCatalogModal';
import { GroceryItemEditModal } from './GroceryItemEditModal';

interface GroceryListViewProps {
  groceryItems: GroceryItem[];
  onToggleItem: (id: string) => void;
  onAddItem: (item: Omit<GroceryItem, 'id' | 'checked'>) => void;
  onUpdateItem?: (id: string, updates: Partial<Omit<GroceryItem, 'id'>>) => void;
  onDeleteItem: (id: string) => void;
  onClearChecked: () => void;
  onClearAll: () => void;
}

export const GroceryListView: React.FC<GroceryListViewProps> = ({
  groceryItems,
  onToggleItem,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onClearChecked,
  onClearAll,
}) => {
  // Dynamic categories initialized from persistent storage
  const [categories, setCategories] = useState<string[]>(() => getStoredCategories());

  // Quick manual add form fields
  const [manualName, setManualName] = useState('');
  const [manualAmount, setManualAmount] = useState('1');
  const [manualUnit, setManualUnit] = useState('');
  const [manualCategory, setManualCategory] = useState<string>(categories[0] || 'Produce');
  const [manualNotes, setManualNotes] = useState('');
  const [showNotesInput, setShowNotesInput] = useState(false);

  // Modals state
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);

  const [showCompleted, setShowCompleted] = useState(true);

  // Separate active vs completed items
  const activeItems = groceryItems.filter((i) => !i.checked);
  const completedItems = groceryItems.filter((i) => i.checked);

  // Group active items by category/aisle
  const activeByAisle = React.useMemo(() => {
    const map = new Map<string, GroceryItem[]>();
    for (const aisle of categories) {
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
  }, [activeItems, categories]);

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
            colors: ['#FF8FA3', '#FFE599', '#FFF0F3', '#3D231D'],
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

    const numAmount = parseFloat(manualAmount) || 1;

    onAddItem({
      name: manualName.trim(),
      amount: numAmount,
      unit: manualUnit.trim(),
      displayQuantity: manualAmount.trim() || '1',
      category: manualCategory,
      isManual: true,
      notes: manualNotes.trim() || undefined,
      recipeSources: ['Manual Addition'],
    });

    setManualName('');
    setManualAmount('1');
    setManualUnit('');
    setManualNotes('');
    setShowNotesInput(false);
  };

  const handleSaveItemEdit = (id: string, updates: Partial<Omit<GroceryItem, 'id'>>) => {
    if (onUpdateItem) {
      onUpdateItem(id, updates);
    }
  };

  return (
    <div className="pb-28 px-4 sm:px-6 max-w-[1120px] mx-auto">
      {/* List Header & Summary Card - Rounded 24px */}
      <div className="bg-white border border-[#F3E5D8] rounded-[24px] p-4 sm:p-5 shadow-cozy mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-full bg-[#ECFDF5] text-[#16A34A] flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#3D231D]">Grocery List</h2>
              <span className="text-xs text-[#8C726B]">
                {activeItems.length} items to pick up • {completedItems.length} checked
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-wrap">
            {/* Choose from Available Items button (Green) */}
            <button
              type="button"
              onClick={() => setIsCatalogModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#16A34A] hover:bg-[#15803D] active:scale-95 text-white text-xs font-bold rounded-full shadow-xs transition-all cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Browse Available Items</span>
            </button>

            {completedItems.length > 0 && (
              <button
                type="button"
                onClick={onClearChecked}
                className="text-xs font-semibold text-[#8C726B] hover:text-[#16A34A] px-3 py-1 bg-[#FFF5F7] hover:bg-[#ECFDF5] rounded-full transition-colors border border-[#F3E5D8] cursor-pointer"
                title="Clear Completed"
              >
                Clear checked
              </button>
            )}

            {groceryItems.length > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-xs font-semibold text-[#8C726B] hover:text-red-500 px-3 py-1 bg-[#F0FDF4] hover:bg-red-50 rounded-full transition-colors border border-[#F3E5D8] cursor-pointer"
                title="Reset Grocery List"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Quick Add Form with Quantity, Unit, Category & Notes */}
        <form onSubmit={handleAddManual} className="mt-3 space-y-2 pt-2 border-t border-[#F3E5D8]/60">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Item Name */}
            <input
              type="text"
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              placeholder="Add item (e.g. Honeycrisp Apples, Oat Milk...)"
              className="flex-1 px-3.5 py-2.5 bg-[#FFF3CC] border border-[#F5E6BF] rounded-[16px] text-xs text-[#3D231D] placeholder-[#8C726B]/50 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/40"
              required
            />

            <div className="flex items-center space-x-1.5">
              {/* Quantity */}
              <input
                type="text"
                value={manualAmount}
                onChange={(e) => setManualAmount(e.target.value)}
                placeholder="Qty"
                className="w-14 px-2 py-2.5 bg-[#FFF3CC] border border-[#F5E6BF] rounded-[16px] text-xs text-center font-semibold text-[#3D231D] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/40"
                title="Quantity"
              />

              {/* Unit */}
              <input
                type="text"
                value={manualUnit}
                onChange={(e) => setManualUnit(e.target.value)}
                placeholder="unit"
                className="w-16 px-2 py-2.5 bg-[#FFF3CC] border border-[#F5E6BF] rounded-[16px] text-xs text-[#3D231D] placeholder-[#8C726B]/50 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/40"
                title="Unit (e.g. lbs, cup, pack, pcs)"
              />

              {/* Category */}
              <select
                value={manualCategory}
                onChange={(e) => setManualCategory(e.target.value)}
                className="px-2.5 py-2.5 bg-white border border-[#F3E5D8] rounded-[16px] text-xs font-semibold text-[#8C726B] focus:outline-none cursor-pointer max-w-[130px] truncate"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* Submit Button */}
              <button
                type="submit"
                className="p-2.5 bg-[#16A34A] hover:bg-[#15803D] active:scale-95 text-white rounded-full shadow-xs transition-transform cursor-pointer shrink-0"
                title="Add to grocery list"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Optional Notes toggle & input */}
          <div className="flex items-center justify-between text-[11px] pt-0.5">
            <button
              type="button"
              onClick={() => setShowNotesInput(!showNotesInput)}
              className="text-[#8C726B] hover:text-[#16A34A] font-medium flex items-center space-x-1 cursor-pointer"
            >
              <span>{showNotesInput ? '- Hide note' : '+ Add custom note (e.g. organic, brand preference)'}</span>
            </button>
          </div>

          {showNotesInput && (
            <input
              type="text"
              value={manualNotes}
              onChange={(e) => setManualNotes(e.target.value)}
              placeholder="Custom note for this item (e.g. Get ripe ones, organic pasture-raised, low sodium)"
              className="w-full px-3.5 py-2 bg-[#F0FDF4] border border-[#F3E5D8] rounded-[12px] text-xs text-[#3D231D] placeholder-[#8C726B]/50 focus:outline-none focus:ring-1 focus:ring-[#16A34A]"
            />
          )}
        </form>
      </div>

      {/* Active Items Grouped by Category (Rounded 24px cards) */}
      {activeItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((aisle) => {
            const items = activeByAisle.get(aisle) || [];
            if (items.length === 0) return null;

            return (
              <div
                key={aisle}
                className="bg-white border border-[#F3E5D8] rounded-[24px] p-4 shadow-cozy space-y-2.5"
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-[#F3E5D8]">
                  <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-[#16A34A]">
                    {aisle}
                  </h3>
                  <span className="text-[10px] font-semibold text-[#8C726B]">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  {items.map((item) => {
                    const icon = getIngredientIcon(item.name);
                    const qtyDisplay = [item.displayQuantity || (item.amount ? String(item.amount) : ''), item.unit]
                      .filter(Boolean)
                      .join(' ');

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleToggle(item.id)}
                        className="flex items-center justify-between p-2.5 rounded-[16px] hover:bg-[#FFF3CC]/30 cursor-pointer transition-colors group select-none border border-transparent hover:border-[#F5E6BF]"
                      >
                        <div className="flex items-start space-x-2.5 flex-1 min-w-0">
                          {/* Rounded Tap-Friendly Checkbox (border-radius: 6px) */}
                          <div className="w-6 h-6 rounded-[6px] bg-[#FFE599] border border-[#F5E6BF] group-hover:border-[#16A34A] flex items-center justify-center shrink-0 transition-colors mt-0.5">
                            {/* Unchecked */}
                          </div>

                          {/* Stylized Ingredient Thumbnail */}
                          {icon && (
                            <div className="w-7 h-7 rounded-[8px] bg-[#FFF3CC] border border-[#F5E6BF] flex items-center justify-center p-0.5 shrink-0 overflow-hidden shadow-2xs mt-0.5">
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
                            <div className="flex items-center space-x-1.5 flex-wrap">
                              <span className="text-xs font-bold text-[#3D231D]">{item.name}</span>
                              {qtyDisplay && (
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FFF3CC] border border-[#F5E6BF] text-[#3D231D]">
                                  {qtyDisplay}
                                </span>
                              )}
                            </div>

                            {/* Custom Note */}
                            {item.notes && (
                              <div className="text-[11px] text-[#16A34A] font-medium italic mt-0.5 flex items-center space-x-1">
                                <span>Note: {item.notes}</span>
                              </div>
                            )}

                            {/* Recipe Sources */}
                            {item.recipeSources && item.recipeSources.length > 0 && (
                              <span className="text-[10px] text-[#8C726B] truncate block mt-0.5">
                                For: {item.recipeSources.join(', ')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action buttons: Edit & Delete */}
                        <div className="flex items-center space-x-1 shrink-0 ml-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingItem(item);
                            }}
                            className="p-1.5 text-[#8C726B] hover:text-[#3D231D] hover:bg-white rounded-full opacity-70 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="Edit quantity, unit, or notes"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteItem(item.id);
                            }}
                            className="p-1.5 text-[#8C726B] hover:text-red-500 hover:bg-white rounded-full opacity-70 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="Delete item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
        <div className="bg-white border border-[#F3E5D8] rounded-[24px] p-8 text-center my-4 shadow-cozy max-w-md mx-auto">
          <div className="w-12 h-12 bg-[#ECFDF5] rounded-full flex items-center justify-center mx-auto mb-2.5 text-[#16A34A]">
            <Sparkles className="w-6 h-6" />
          </div>
          <h4 className="font-serif text-base font-bold text-[#3D231D] mb-1">
            {completedItems.length > 0 ? 'All done shopping!' : 'Your list is empty'}
          </h4>
          <p className="text-xs text-[#8C726B] max-w-xs mx-auto mb-4 leading-relaxed">
            {completedItems.length > 0
              ? 'You have checked off all items for this week. Happy cooking!'
              : 'Add ingredients from your weekly meal plan, or browse our standard food library.'}
          </p>
          <button
            type="button"
            onClick={() => setIsCatalogModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold rounded-full shadow-xs transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4 stroke-[2.2]" />
            <span>Browse Available Food Items</span>
          </button>
        </div>
      )}

      {/* Completed Items Section (Collapsible) */}
      {completedItems.length > 0 && (
        <div className="mt-5 bg-white/70 border border-[#F3E5D8] rounded-[24px] p-4 shadow-xs">
          <button
            type="button"
            onClick={() => setShowCompleted(!showCompleted)}
            className="w-full flex items-center justify-between text-left cursor-pointer"
          >
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-[#8C726B]">
                Completed ({completedItems.length})
              </span>
            </div>
            {showCompleted ? (
              <ChevronUp className="w-4 h-4 text-[#8C726B]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#8C726B]" />
            )}
          </button>

          {showCompleted && (
            <div className="space-y-1.5 pt-3">
              {completedItems.map((item) => {
                const icon = getIngredientIcon(item.name);
                const qtyDisplay = [item.displayQuantity || (item.amount ? String(item.amount) : ''), item.unit]
                  .filter(Boolean)
                  .join(' ');

                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggle(item.id)}
                    className="flex items-center justify-between p-2 rounded-[16px] bg-white hover:bg-[#FFF3CC]/30 cursor-pointer transition-colors group select-none border border-[#F3E5D8]/50"
                  >
                    <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                      <div className="w-6 h-6 rounded-[6px] bg-[#16A34A] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                      {icon && (
                        <div className="w-6 h-6 rounded-[6px] bg-[#FFF3CC] border border-[#F5E6BF] flex items-center justify-center p-0.5 shrink-0 overflow-hidden opacity-60">
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
                      <div className="min-w-0 flex-1 flex items-center space-x-2">
                        <span className="text-xs font-medium text-[#8C726B]/70 line-through decoration-[#16A34A] truncate">
                          {qtyDisplay ? `${qtyDisplay} ` : ''}
                          {item.name}
                        </span>
                        {item.notes && (
                          <span className="text-[10px] text-[#8C726B]/60 italic truncate">
                            ({item.notes})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingItem(item);
                        }}
                        className="p-1 text-[#8C726B] hover:text-[#3D231D] rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Edit item"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteItem(item.id);
                        }}
                        className="p-1 text-[#8C726B] hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Delete item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Available Food Catalog Modal */}
      <GroceryCatalogModal
        isOpen={isCatalogModalOpen}
        onClose={() => setIsCatalogModalOpen(false)}
        onAddGroceryItem={onAddItem}
        onCategoriesUpdated={(newCats) => setCategories(newCats)}
      />

      {/* Edit Grocery Item Modal */}
      <GroceryItemEditModal
        item={editingItem}
        categories={categories}
        isOpen={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveItemEdit}
      />
    </div>
  );
};
