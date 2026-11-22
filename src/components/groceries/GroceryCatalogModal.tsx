import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Search,
  Plus,
  Trash2,
  Edit2,
  Check,
  RefreshCw,
  ShoppingBag,
  SlidersHorizontal,
  FolderPlus,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import type { CatalogItem, GroceryItem } from '../../types';
import {
  getStoredCategories,
  saveStoredCategories,
  getStoredCatalogItems,
  saveStoredCatalogItems,
  resetStoredCatalog,
} from '../../data/groceryCatalog';
import { getIngredientIcon } from '../../utils/ingredientIconResolver';

interface GroceryCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGroceryItem: (item: Omit<GroceryItem, 'id' | 'checked'>) => void;
  onCategoriesUpdated?: (categories: string[]) => void;
}

export const GroceryCatalogModal: React.FC<GroceryCatalogModalProps> = ({
  isOpen,
  onClose,
  onAddGroceryItem,
  onCategoriesUpdated,
}) => {
  const [categories, setCategories] = useState<string[]>(() => getStoredCategories());
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>(() => getStoredCatalogItems());

  // Navigation tab: 'browse' | 'manage'
  const [activeTab, setActiveTab] = useState<'browse' | 'manage'>('browse');

  // Browse state
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Per-item inline custom input (amount, unit, note)
  const [itemInputs, setItemInputs] = useState<
    Record<string, { amount: string; unit: string; note: string }>
  >({});
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  // Manage categories state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<{ oldName: string; newName: string } | null>(
    null
  );

  // Manage items state
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<string>(categories[0] || 'Produce');
  const [newItemUnit, setNewItemUnit] = useState('');
  const [newItemNote, setNewItemNote] = useState('');

  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    const prevTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouchAction;
    };
  }, [isOpen]);

  // Synchronize categories changes
  const updateCategories = (newCats: string[]) => {
    setCategories(newCats);
    saveStoredCategories(newCats);
    if (onCategoriesUpdated) {
      onCategoriesUpdated(newCats);
    }
  };

  const updateCatalogItems = (newItems: CatalogItem[]) => {
    setCatalogItems(newItems);
    saveStoredCatalogItems(newItems);
  };

  // Filtered catalog items for browsing
  const filteredCatalogItems = useMemo(() => {
    let items = catalogItems;
    if (selectedCategory !== 'All') {
      items = items.filter((item) => item.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.notes?.toLowerCase().includes(q)
      );
    }
    return items;
  }, [catalogItems, selectedCategory, searchQuery]);

  // Add item from catalog to grocery list
  const handleAddToList = (item: CatalogItem) => {
    const custom = itemInputs[item.id] || {
      amount: '1',
      unit: item.defaultUnit || '',
      note: item.notes || '',
    };

    const numAmount = parseFloat(custom.amount) || 1;

    onAddGroceryItem({
      name: item.name,
      amount: numAmount,
      unit: custom.unit || '',
      displayQuantity: custom.amount || '1',
      category: item.category,
      isManual: true,
      notes: custom.note ? custom.note.trim() : undefined,
      recipeSources: ['Available Foods Catalog'],
    });

    setRecentlyAddedId(item.id);
    setTimeout(() => {
      setRecentlyAddedId((curr) => (curr === item.id ? null : curr));
    }, 1500);
  };

  // Update draft input for an item
  const handleItemInputChange = (
    id: string,
    field: 'amount' | 'unit' | 'note',
    value: string,
    defaultUnit?: string,
    defaultNote?: string
  ) => {
    setItemInputs((prev) => {
      const current = prev[id] || {
        amount: '1',
        unit: defaultUnit || '',
        note: defaultNote || '',
      };
      return {
        ...prev,
        [id]: {
          ...current,
          [field]: value,
        },
      };
    });
  };

  // Category management handlers
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      alert('This category already exists.');
      return;
    }
    const updated = [...categories, trimmed];
    updateCategories(updated);
    setNewCategoryName('');
  };

  const handleSaveEditCategory = () => {
    if (!editingCategory) return;
    const trimmed = editingCategory.newName.trim();
    if (!trimmed) return;

    if (
      trimmed.toLowerCase() !== editingCategory.oldName.toLowerCase() &&
      categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())
    ) {
      alert('A category with this name already exists.');
      return;
    }

    const updatedCats = categories.map((c) => (c === editingCategory.oldName ? trimmed : c));
    updateCategories(updatedCats);

    // Also update catalog items referencing this category
    const updatedItems = catalogItems.map((item) =>
      item.category === editingCategory.oldName ? { ...item, category: trimmed } : item
    );
    updateCatalogItems(updatedItems);

    setEditingCategory(null);
  };

  const handleDeleteCategory = (catName: string) => {
    if (categories.length <= 1) {
      alert('You must have at least one grocery category.');
      return;
    }

    const count = catalogItems.filter((i) => i.category === catName).length;
    const msg =
      count > 0
        ? `Delete category "${catName}"? Its ${count} items will be moved to "${categories[0] === catName ? categories[1] : categories[0]}".`
        : `Delete category "${catName}"?`;

    if (!confirm(msg)) return;

    const fallback = categories.find((c) => c !== catName) || 'Household & Other';
    const updatedCats = categories.filter((c) => c !== catName);
    updateCategories(updatedCats);

    const updatedItems = catalogItems.map((item) =>
      item.category === catName ? { ...item, category: fallback } : item
    );
    updateCatalogItems(updatedItems);

    if (selectedCategory === catName) {
      setSelectedCategory('All');
    }
  };

  // Catalog item management handlers
  const handleAddNewItemToCatalog = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newItemName.trim();
    if (!trimmedName) return;

    const newItem: CatalogItem = {
      id: `custom-cat-${Date.now()}`,
      name: trimmedName,
      category: newItemCategory,
      defaultUnit: newItemUnit.trim() || undefined,
      notes: newItemNote.trim() || undefined,
      isCustom: true,
    };

    updateCatalogItems([newItem, ...catalogItems]);
    setNewItemName('');
    setNewItemUnit('');
    setNewItemNote('');
    setIsAddingItem(false);
  };

  const handleSaveEditItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    const trimmedName = editingItem.name.trim();
    if (!trimmedName) return;

    const updated = catalogItems.map((it) =>
      it.id === editingItem.id ? { ...editingItem, name: trimmedName } : it
    );
    updateCatalogItems(updated);
    setEditingItem(null);
  };

  const handleDeleteItemFromCatalog = (id: string, name: string) => {
    if (!confirm(`Delete "${name}" from available catalog items?`)) return;
    const updated = catalogItems.filter((it) => it.id !== id);
    updateCatalogItems(updated);
  };

  const handleResetCatalog = () => {
    if (
      confirm(
        'Reset the food grocery catalog and categories back to the original full library? Any custom additions will be restored to defaults.'
      )
    ) {
      const reset = resetStoredCatalog();
      setCategories(reset.categories);
      setCatalogItems(reset.items);
      if (onCategoriesUpdated) {
        onCategoriesUpdated(reset.categories);
      }
      setSelectedCategory('All');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-xs transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white border border-[#F3E5D8] rounded-[24px] shadow-cozy-lg w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-[#3D231D] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="catalog-dialog-title"
        style={{ overscrollBehavior: 'contain' }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F3E5D8] bg-[#F0FDF4]">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full bg-[#ECFDF5] text-[#16A34A] flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 id="catalog-dialog-title" className="font-serif text-lg font-bold text-[#3D231D] leading-tight">
                {activeTab === 'browse' ? 'Available Grocery Items' : 'Manage Catalog & Categories'}
              </h2>
              <p className="text-[11px] text-[#8C726B]">
                {activeTab === 'browse'
                  ? 'Choose food items to add with quantity and custom notes'
                  : 'Add, edit, or delete items and categories'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab(activeTab === 'browse' ? 'manage' : 'browse')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                activeTab === 'manage'
                  ? 'bg-[#FFE599] text-[#3D231D] border border-[#F5E6BF]'
                  : 'bg-white text-[#8C726B] hover:text-[#3D231D] border border-[#F3E5D8]'
              }`}
            >
              {activeTab === 'browse' ? (
                <>
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Edit Catalog</span>
                </>
              ) : (
                <>
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Browse</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#FFF0F3] text-[#8C726B] hover:text-[#3D231D] transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab 1: Browse Available Food Items */}
        {activeTab === 'browse' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Search and Category Filter Bar */}
            <div className="p-4 border-b border-[#F3E5D8] bg-white space-y-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-[#8C726B]" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search produce, dairy, bakery, meat, spices..."
                  className="w-full pl-9 pr-8 py-2 bg-[#FFF3CC]/60 border border-[#F5E6BF] rounded-full text-xs text-[#3D231D] placeholder-[#8C726B]/50 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/40"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8C726B] hover:text-[#3D231D] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
                <button
                  onClick={() => setSelectedCategory('All')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === 'All'
                      ? 'bg-[#16A34A] text-white font-bold shadow-xs'
                      : 'bg-[#F0FDF4] text-[#8C726B] hover:text-[#3D231D] border border-[#F3E5D8]'
                  }`}
                >
                  All ({catalogItems.length})
                </button>
                {categories.map((cat) => {
                  const count = catalogItems.filter((i) => i.category === cat).length;
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#16A34A] text-white font-bold shadow-xs'
                          : 'bg-[#F0FDF4] text-[#8C726B] hover:text-[#3D231D] border border-[#F3E5D8]'
                      }`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Catalog Items Scrollable List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {filteredCatalogItems.length > 0 ? (
                filteredCatalogItems.map((item) => {
                  const icon = getIngredientIcon(item.name);
                  const currentInput = itemInputs[item.id] || {
                    amount: '1',
                    unit: item.defaultUnit || '',
                    note: item.notes || '',
                  };
                  const isRecentlyAdded = recentlyAddedId === item.id;

                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-[18px] bg-white border border-[#F3E5D8] hover:border-[#16A34A]/40 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                    >
                      {/* Left: Thumbnail & Name & Category */}
                      <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                        {icon && (
                          <div className="w-8 h-8 rounded-[8px] bg-[#FFF3CC] border border-[#F5E6BF] flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-2xs">
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
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F0FDF4] border border-[#F3E5D8] text-[#8C726B] font-medium">
                              {item.category}
                            </span>
                          </div>
                          {item.notes && (
                            <span className="text-[11px] text-[#8C726B]/80 italic block truncate">
                              Tip: {item.notes}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Quantity, Unit, Note & Add Button */}
                      <div className="flex items-center space-x-2 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-[#F3E5D8]/60">
                        {/* Quantity Input */}
                        <div className="flex items-center space-x-1 bg-[#F0FDF4] border border-[#F3E5D8] rounded-[10px] px-2 py-1">
                          <input
                            type="text"
                            value={currentInput.amount}
                            onChange={(e) =>
                              handleItemInputChange(
                                item.id,
                                'amount',
                                e.target.value,
                                item.defaultUnit,
                                item.notes
                              )
                            }
                            placeholder="Qty"
                            className="w-8 text-center text-xs font-semibold text-[#3D231D] bg-transparent focus:outline-none"
                            title="Quantity"
                          />
                          <input
                            type="text"
                            value={currentInput.unit}
                            onChange={(e) =>
                              handleItemInputChange(
                                item.id,
                                'unit',
                                e.target.value,
                                item.defaultUnit,
                                item.notes
                              )
                            }
                            placeholder="unit"
                            className="w-12 text-xs text-[#8C726B] bg-transparent focus:outline-none"
                            title="Unit (e.g. lbs, cup, pack, pcs)"
                          />
                        </div>

                        {/* Note Input */}
                        <input
                          type="text"
                          value={currentInput.note}
                          onChange={(e) =>
                            handleItemInputChange(
                              item.id,
                              'note',
                              e.target.value,
                              item.defaultUnit,
                              item.notes
                            )
                          }
                          placeholder="Note (e.g. organic)"
                          className="w-24 sm:w-28 text-xs px-2 py-1 bg-[#F0FDF4] border border-[#F3E5D8] rounded-[10px] text-[#3D231D] placeholder-[#8C726B]/50 focus:outline-none focus:ring-1 focus:ring-[#16A34A]"
                          title="Custom notes"
                        />

                        {/* Add Button */}
                        <button
                          type="button"
                          onClick={() => handleAddToList(item)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer ${
                            isRecentlyAdded
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-[#16A34A] hover:bg-[#15803D] active:scale-95 text-white shadow-xs'
                          }`}
                        >
                          {isRecentlyAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Add</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center">
                  <p className="text-xs text-[#8C726B] mb-3">No available food items match your filter.</p>
                  <button
                    onClick={() => setActiveTab('manage')}
                    className="px-4 py-2 bg-[#FFE599] text-[#3D231D] text-xs font-bold rounded-full border border-[#F5E6BF] hover:bg-[#FFD970] transition-colors cursor-pointer"
                  >
                    + Add this item to catalog
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Manage Catalog & Categories */}
        {activeTab === 'manage' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
            {/* Section 1: Categories Management */}
            <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-[20px] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-sm font-bold text-[#3D231D]">Grocery Categories</h3>
                  <p className="text-[11px] text-[#8C726B]">Add, rename, or delete food departments</p>
                </div>
                <span className="text-[11px] font-bold text-[#16A34A] bg-white px-2.5 py-0.5 rounded-full border border-[#F3E5D8]">
                  {categories.length} categories
                </span>
              </div>

              {/* Add Category Form */}
              <form onSubmit={handleAddCategory} className="flex items-center space-x-2 pt-1">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="New category name (e.g. Deli & Cheese, Snacks)"
                  className="flex-1 px-3 py-2 bg-white border border-[#F3E5D8] rounded-[12px] text-xs text-[#3D231D] placeholder-[#8C726B]/50 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/40"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold rounded-[12px] flex items-center space-x-1 cursor-pointer"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </form>

              {/* Categories Pills List with Edit/Delete */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {categories.map((cat) => {
                  const itemCount = catalogItems.filter((i) => i.category === cat).length;
                  const isEditingThis = editingCategory?.oldName === cat;

                  if (isEditingThis) {
                    return (
                      <div
                        key={cat}
                        className="flex items-center space-x-1 bg-white border-2 border-[#16A34A] rounded-[12px] p-1.5"
                      >
                        <input
                          type="text"
                          value={editingCategory.newName}
                          onChange={(e) =>
                            setEditingCategory({ ...editingCategory, newName: e.target.value })
                          }
                          className="flex-1 text-xs px-2 py-1 bg-[#F0FDF4] rounded focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={handleSaveEditCategory}
                          className="p-1 bg-emerald-500 text-white rounded hover:bg-emerald-600 cursor-pointer"
                          title="Save"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                        <button
                          onClick={() => setEditingCategory(null)}
                          className="p-1 bg-gray-200 text-[#3D231D] rounded hover:bg-gray-300 cursor-pointer"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={cat}
                      className="flex items-center justify-between bg-white border border-[#F3E5D8] rounded-[12px] px-3 py-2 text-xs shadow-2xs"
                    >
                      <div className="flex items-center space-x-1.5 min-w-0">
                        <span className="font-semibold text-[#3D231D] truncate">{cat}</span>
                        <span className="text-[10px] text-[#8C726B]">({itemCount})</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => setEditingCategory({ oldName: cat, newName: cat })}
                          className="p-1 text-[#8C726B] hover:text-[#3D231D] rounded cursor-pointer"
                          title="Rename Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat)}
                          className="p-1 text-[#8C726B] hover:text-red-500 rounded cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Catalog Items Management */}
            <div className="bg-white border border-[#F3E5D8] rounded-[20px] p-4 space-y-3 shadow-cozy">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-sm font-bold text-[#3D231D]">Food Grocery Items</h3>
                  <p className="text-[11px] text-[#8C726B]">
                    {catalogItems.length} items registered in catalog
                  </p>
                </div>
                <button
                  onClick={() => setIsAddingItem(!isAddingItem)}
                  className="px-3 py-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold rounded-full flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{isAddingItem ? 'Close Form' : 'Add New Item'}</span>
                </button>
              </div>

              {/* Add New Item Form */}
              {isAddingItem && (
                <form
                  onSubmit={handleAddNewItemToCatalog}
                  className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-[16px] p-3.5 space-y-2.5 animate-in fade-in"
                >
                  <h4 className="text-xs font-bold text-[#3D231D]">Add New Item to Catalog</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="Item name (e.g. Almond Flour)"
                      className="px-3 py-2 bg-white border border-[#F3E5D8] rounded-[10px] text-xs text-[#3D231D] focus:outline-none focus:ring-1 focus:ring-[#16A34A]"
                      required
                    />
                    <select
                      value={newItemCategory}
                      onChange={(e) => setNewItemCategory(e.target.value)}
                      className="px-3 py-2 bg-white border border-[#F3E5D8] rounded-[10px] text-xs text-[#3D231D] focus:outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={newItemUnit}
                      onChange={(e) => setNewItemUnit(e.target.value)}
                      placeholder="Default unit (e.g. lbs, bag, box)"
                      className="px-3 py-2 bg-white border border-[#F3E5D8] rounded-[10px] text-xs text-[#3D231D] focus:outline-none"
                    />
                    <input
                      type="text"
                      value={newItemNote}
                      onChange={(e) => setNewItemNote(e.target.value)}
                      placeholder="Default notes (e.g. Organic, gluten free)"
                      className="px-3 py-2 bg-white border border-[#F3E5D8] rounded-[10px] text-xs text-[#3D231D] focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingItem(false)}
                      className="px-3 py-1.5 text-xs text-[#8C726B] hover:text-[#3D231D] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold rounded-full shadow-xs cursor-pointer"
                    >
                      Save Item
                    </button>
                  </div>
                </form>
              )}

              {/* Edit Item Modal / Inline Sheet */}
              {editingItem && (
                <form
                  onSubmit={handleSaveEditItem}
                  className="bg-[#FFF3CC] border border-[#F5E6BF] rounded-[16px] p-3.5 space-y-2.5 animate-in fade-in"
                >
                  <h4 className="text-xs font-bold text-[#3D231D]">Edit Catalog Item</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={editingItem.name}
                      onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                      placeholder="Item name"
                      className="px-3 py-2 bg-white border border-[#F5E6BF] rounded-[10px] text-xs text-[#3D231D] focus:outline-none"
                      required
                    />
                    <select
                      value={editingItem.category}
                      onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                      className="px-3 py-2 bg-white border border-[#F5E6BF] rounded-[10px] text-xs text-[#3D231D] focus:outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={editingItem.defaultUnit || ''}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, defaultUnit: e.target.value })
                      }
                      placeholder="Default unit"
                      className="px-3 py-2 bg-white border border-[#F5E6BF] rounded-[10px] text-xs text-[#3D231D] focus:outline-none"
                    />
                    <input
                      type="text"
                      value={editingItem.notes || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                      placeholder="Default notes"
                      className="px-3 py-2 bg-white border border-[#F5E6BF] rounded-[10px] text-xs text-[#3D231D] focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="px-3 py-1.5 text-xs text-[#8C726B] hover:text-[#3D231D] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold rounded-full shadow-xs cursor-pointer"
                    >
                      Update Item
                    </button>
                  </div>
                </form>
              )}

              {/* Items Management List */}
              <div className="max-h-64 overflow-y-auto space-y-1.5 pt-1">
                {catalogItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-[12px] bg-[#F0FDF4] border border-[#BBF7D0]/60 text-xs"
                  >
                    <div className="min-w-0 flex-1 flex items-center space-x-2">
                      <span className="font-semibold text-[#3D231D] truncate">{item.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-[#F3E5D8] text-[#8C726B]">
                        {item.category}
                      </span>
                      {item.defaultUnit && (
                        <span className="text-[10px] text-[#8C726B]">({item.defaultUnit})</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="p-1 text-[#8C726B] hover:text-[#3D231D] rounded cursor-pointer"
                        title="Edit Item"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteItemFromCatalog(item.id, item.name)}
                        className="p-1 text-[#8C726B] hover:text-red-500 rounded cursor-pointer"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reset Library to Defaults */}
            <div className="flex items-center justify-between p-3.5 bg-amber-50/60 border border-amber-200/60 rounded-[16px]">
              <div>
                <h4 className="text-xs font-bold text-[#3D231D]">Reset Standard Food Library</h4>
                <p className="text-[11px] text-[#8C726B]">
                  Restore the initial rich grocery catalog and department list
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetCatalog}
                className="px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-100 text-[#3D231D] text-xs font-semibold rounded-full flex items-center space-x-1 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3 text-amber-700" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-3.5 bg-[#F0FDF4] border-t border-[#BBF7D0] flex items-center justify-between text-xs">
          <span className="text-[#8C726B] flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Strawberry Milk & Butter Pantry</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold rounded-full shadow-xs cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
