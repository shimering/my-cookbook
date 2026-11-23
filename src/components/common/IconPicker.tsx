import React, { useState } from 'react';
import {
  POPULAR_ICON_PRESETS,
  resolveItemIcon,
  type ResolvedItemIcon,
} from '../../utils/ingredientIconResolver';
import { compressImageToDataUrl } from '../../services/imageCompression';
import { ItemIconBadge } from './ItemIconBadge';
import { RotateCcw, X, Upload, Image as ImageIcon, Trash2, Loader2 } from 'lucide-react';

interface IconPickerProps {
  value: string;
  onChange: (iconValue: string) => void;
  itemName?: string;
  itemCategory?: string;
  onClose?: () => void;
}

export const IconPicker: React.FC<IconPickerProps> = ({
  value,
  onChange,
  itemName = '',
  itemCategory = '',
  onClose,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [customInput, setCustomInput] = useState<string>(
    value.startsWith('svg:') || value.startsWith('data:image/') || value.startsWith('http')
      ? ''
      : value
  );
  const [isUploading, setIsUploading] = useState(false);

  const autoResolved: ResolvedItemIcon = resolveItemIcon(itemName, itemCategory);
  const currentResolved: ResolvedItemIcon = resolveItemIcon(itemName, itemCategory, value || undefined);

  const isCustomImage = value.startsWith('data:image/') || value.startsWith('http');
  const groups = ['All', ...POPULAR_ICON_PRESETS.map((p) => p.name)];

  const displayedPresets = selectedGroup === 'All'
    ? POPULAR_ICON_PRESETS.flatMap((p) => p.icons)
    : POPULAR_ICON_PRESETS.find((p) => p.name === selectedGroup)?.icons || [];

  const handleSelect = (iconValue: string) => {
    onChange(iconValue);
    if (!iconValue.startsWith('svg:') && !iconValue.startsWith('data:image/')) {
      setCustomInput(iconValue);
    } else {
      setCustomInput('');
    }
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value;
    setCustomInput(nextVal);
    onChange(nextVal);
  };

  const handleResetToAuto = () => {
    onChange('');
    setCustomInput('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const dataUrl = await compressImageToDataUrl(file, {
        maxSizeMB: 0.05,
        maxWidthOrHeight: 256,
      });
      onChange(dataUrl);
      setCustomInput('');
    } catch (err) {
      console.error('Failed to compress/upload item image:', err);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="p-3 bg-white border border-[#F5E6BF] rounded-2xl shadow-cozy space-y-3">
      {/* Header: Current Selection & Status */}
      <div className="flex items-center justify-between border-b border-[#F5E6BF] pb-2.5">
        <div className="flex items-center space-x-2.5">
          <ItemIconBadge icon={currentResolved} size="lg" />
          <div>
            <div className="text-xs font-bold text-[#3D231D]">
              {isCustomImage
                ? 'Custom Photo Uploaded'
                : value
                ? 'Custom Icon Selected'
                : 'Auto-detected Icon'}
            </div>
            <div className="text-[11px] text-[#8C726B]">
              {isCustomImage
                ? 'Using custom uploaded photo'
                : value
                ? `Using custom "${value}"`
                : `Matches "${autoResolved.label}"`}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {value && (
            <button
              type="button"
              onClick={handleResetToAuto}
              className="px-2 py-1 text-[11px] font-semibold text-amber-800 hover:bg-[#FFF3CC] rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
              title="Reset to automatic icon"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Auto</span>
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-[#8C726B] hover:text-[#3D231D] rounded-lg cursor-pointer"
              aria-label="Close icon picker"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Upload Custom Image Option */}
      <div className="bg-[#FFFDF7] border border-[#F5E6BF] rounded-xl p-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#FFF3CC] text-amber-900 border border-[#F5E6BF] flex items-center justify-center shrink-0">
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#16A34A]" />
            ) : (
              <ImageIcon className="w-4 h-4 text-amber-800" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-bold text-[#3D231D] block">Upload Photo / Image</span>
            <span className="text-[10px] text-[#8C726B] truncate block">
              {isCustomImage ? 'Custom image loaded' : 'Upload your own grocery photo'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 shrink-0">
          <label className="px-3 py-1.5 bg-[#16A34A] hover:bg-[#15803D] active:scale-95 text-white text-xs font-semibold rounded-full shadow-2xs cursor-pointer flex items-center space-x-1 transition-all">
            <Upload className="w-3 h-3" />
            <span>{isUploading ? 'Uploading...' : 'Choose File'}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={isUploading}
            />
          </label>
          {isCustomImage && (
            <button
              type="button"
              onClick={handleResetToAuto}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
              title="Remove uploaded image"
              aria-label="Remove uploaded image"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Custom Emoji Input */}
      <div>
        <label className="block text-[11px] font-semibold text-[#8C726B] mb-1">
          Or Type / Paste Any Emoji
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={customInput}
            onChange={handleCustomChange}
            placeholder="e.g. 🥑, 🥐, 🧄, 🥗..."
            className="flex-1 px-3 py-1.5 bg-[#FFFDF7] border border-[#F5E6BF] rounded-lg text-xs text-[#3D231D] focus:outline-none focus:ring-1 focus:ring-[#16A34A]"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-thin">
        {groups.map((group) => {
          const isSelected = selectedGroup === group;
          return (
            <button
              key={group}
              type="button"
              onClick={() => setSelectedGroup(group)}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-[#16A34A] text-white shadow-2xs'
                  : 'bg-[#FFF3CC]/60 text-[#8C726B] hover:bg-[#FFF3CC] hover:text-[#3D231D]'
              }`}
            >
              {group}
            </button>
          );
        })}
      </div>

      {/* Preset Icons Grid */}
      <div className="grid grid-cols-7 sm:grid-cols-9 gap-1.5 max-h-44 overflow-y-auto p-1 bg-[#FFFDF7] border border-[#F5E6BF]/80 rounded-xl">
        {displayedPresets.map((preset) => {
          const isSelected = value === preset.value;
          const resolved = resolveItemIcon(preset.label, undefined, preset.value);

          return (
            <button
              key={preset.value}
              type="button"
              onClick={() => handleSelect(preset.value)}
              className={`p-1 rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#16A34A]/15 ring-2 ring-[#16A34A]'
                  : 'hover:bg-[#FFF3CC] hover:scale-105 active:scale-95'
              }`}
              title={preset.label}
              aria-label={`Select ${preset.label} icon`}
            >
              <ItemIconBadge icon={resolved} size="sm" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
