import React, { useState, useEffect } from 'react';
import { X, Save, Edit3 } from 'lucide-react';
import type { GroceryItem } from '../../types';
import { getStoredCatalogItems } from '../../data/groceryCatalog';
import { AutocompleteInput, type SuggestionItem } from '../common/AutocompleteInput';
import { resolveItemIcon } from '../../utils/ingredientIconResolver';
import { ItemIconBadge } from '../common/ItemIconBadge';
import { IconPicker } from '../common/IconPicker';

interface GroceryItemEditModalProps {
  item: GroceryItem | null;
  categories: string[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Omit<GroceryItem, 'id'>>) => void;
}

interface InnerFormProps {
  item: GroceryItem;
  categories: string[];
  onClose: () => void;
  onSave: (id: string, updates: Partial<Omit<GroceryItem, 'id'>>) => void;
}

const InnerEditForm: React.FC<InnerFormProps> = ({ item, categories, onClose, onSave }) => {
  const [name, setName] = useState(item.name);
  const [quantity, setQuantity] = useState(
    item.displayQuantity || (item.amount ? String(item.amount) : '1')
  );
  const [unit, setUnit] = useState(item.unit || '');
  const [category, setCategory] = useState(item.category || categories[0] || 'Produce');
  const [notes, setNotes] = useState(item.notes || '');
  const [icon, setIcon] = useState<string>(item.icon || '');
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [catalogItems] = useState<SuggestionItem[]>(() => getStoredCatalogItems());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const numAmount = parseFloat(quantity) || 1;

    onSave(item.id, {
      name: trimmedName,
      amount: numAmount,
      displayQuantity: quantity.trim() || '1',
      unit: unit.trim(),
      category,
      notes: notes.trim() || undefined,
      icon: icon.trim() || undefined,
    });

    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 space-y-4">
      <div>
        <label className="block text-xs font-bold text-[#3D231D] mb-1">Item Name</label>
        <AutocompleteInput
          value={name}
          onChange={setName}
          onSelect={(suggested) => {
            setName(suggested.name);
            if (suggested.category) setCategory(suggested.category);
            if (suggested.defaultUnit && !unit) setUnit(suggested.defaultUnit);
            if (suggested.notes && !notes) setNotes(suggested.notes);
          }}
          items={catalogItems}
          placeholder="e.g. Honeycrisp Apples"
          className="w-full px-3.5 py-2.5 bg-[#FFF3CC]/40 border border-[#F5E6BF] rounded-[16px] text-xs text-[#3D231D] focus:outline-none focus:ring-2 focus:ring-[#FF8FA3]/40"
          required
          ariaLabel="Item Name"
        />
      </div>

      {/* Icon & Photo Customization */}
      <div className="bg-[#FFFDF7] border border-[#F5E6BF] rounded-[16px] p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <ItemIconBadge
              icon={resolveItemIcon(name, category, icon || undefined)}
              size="lg"
            />
            <div>
              <span className="text-xs font-bold text-[#3D231D] block">Item Photo / Icon</span>
              <span className="text-[10px] text-[#8C726B]">
                {icon?.startsWith('data:image/') || icon?.startsWith('http')
                  ? 'Custom photo attached'
                  : icon
                  ? `Custom: ${icon}`
                  : 'Auto-detected'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsPickerOpen(!isPickerOpen)}
            className="px-3 py-1.5 bg-white border border-[#F5E6BF] hover:bg-[#FFF3CC] text-xs font-semibold text-[#3D231D] rounded-full transition-colors cursor-pointer"
          >
            {isPickerOpen ? 'Hide Options' : 'Upload / Change'}
          </button>
        </div>

        {isPickerOpen && (
          <IconPicker
            value={icon}
            onChange={setIcon}
            itemName={name}
            itemCategory={category}
            onClose={() => setIsPickerOpen(false)}
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-[#3D231D] mb-1">Quantity</label>
          <input
            type="text"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="e.g. 2, 1/2, 1.5"
            className="w-full px-3.5 py-2.5 bg-[#FFF3CC]/40 border border-[#F5E6BF] rounded-[16px] text-xs text-[#3D231D] focus:outline-none focus:ring-2 focus:ring-[#FF8FA3]/40"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-[#3D231D] mb-1">Unit</label>
          <input
            type="text"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="e.g. lbs, cup, pack, pcs"
            className="w-full px-3.5 py-2.5 bg-[#FFF3CC]/40 border border-[#F5E6BF] rounded-[16px] text-xs text-[#3D231D] focus:outline-none focus:ring-2 focus:ring-[#FF8FA3]/40"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-[#3D231D] mb-1">Category / Department</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-white border border-[#F3E5D8] rounded-[16px] text-xs font-semibold text-[#3D231D] focus:outline-none focus:ring-2 focus:ring-[#FF8FA3]/40 cursor-pointer"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-[#3D231D] mb-1">Custom Notes</label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Ripe avocados for guacamole, organic pasture-raised"
          className="w-full px-3.5 py-2 bg-[#FFF3CC]/40 border border-[#F5E6BF] rounded-[16px] text-xs text-[#3D231D] placeholder-[#8C726B]/50 focus:outline-none focus:ring-2 focus:ring-[#FF8FA3]/40"
        />
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-end space-x-2.5 pt-2 border-t border-[#F3E5D8]">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-xs font-semibold text-[#8C726B] hover:text-[#3D231D] cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 bg-[#16A34A] hover:bg-[#15803D] active:scale-95 text-white text-xs font-bold rounded-full shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Changes</span>
        </button>
      </div>
    </form>
  );
};

export const GroceryItemEditModal: React.FC<GroceryItemEditModalProps> = ({
  item,
  categories,
  isOpen,
  onClose,
  onSave,
}) => {
  // Lock body scroll when open
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

  if (!isOpen || !item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-item-modal-title"
    >
      <div
        className="w-full max-w-md bg-[#FFFDF7] rounded-3xl border border-[#F5E6BF] shadow-cozy overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 bg-[#FFF3CC] border-b border-[#F5E6BF] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-full bg-[#FFE599] text-amber-900 flex items-center justify-center">
              <Edit3 className="w-3.5 h-3.5" />
            </div>
            <h3 id="edit-item-modal-title" className="font-serif font-bold text-sm text-[#3D231D]">
              Edit Grocery Item
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#8C726B] hover:text-[#3D231D] hover:bg-black/5 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Form */}
        <InnerEditForm
          item={item}
          categories={categories}
          onClose={onClose}
          onSave={onSave}
        />
      </div>
    </div>
  );
};
