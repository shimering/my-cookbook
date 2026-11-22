import React, { useState, useEffect } from 'react';
import { X, Save, Edit3 } from 'lucide-react';
import type { GroceryItem } from '../../types';
import { getStoredCatalogItems } from '../../data/groceryCatalog';
import { AutocompleteInput, type SuggestionItem } from '../common/AutocompleteInput';

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
          className="px-5 py-2 bg-[#16A34A] hover:bg-[#15803D] active:scale-95 text-white text-xs font-bold rounded-full shadow-xs flex items-center space-x-1.5 cursor-pointer"
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

  if (!isOpen || !item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white border border-[#F3E5D8] rounded-[24px] shadow-cozy-lg w-full max-w-md overflow-hidden text-[#3D231D] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-item-dialog-title"
        style={{ overscrollBehavior: 'contain' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#BBF7D0] bg-[#F0FDF4]">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-[#ECFDF5] text-[#16A34A] flex items-center justify-center">
              <Edit3 className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h2 id="edit-item-dialog-title" className="font-serif text-base font-bold text-[#3D231D]">
                Edit Grocery Item
              </h2>
              <span className="text-[11px] text-[#8C726B]">Update quantity, department, and notes</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[#FFF0F3] text-[#8C726B] hover:text-[#3D231D] cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inner Form keyed by item.id */}
        <InnerEditForm
          key={item.id}
          item={item}
          categories={categories}
          onClose={onClose}
          onSave={onSave}
        />
      </div>
    </div>
  );
};
