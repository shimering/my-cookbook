import React, { useState, useRef, useEffect, useMemo, useId } from 'react';
import { filterSuggestions, type SuggestionItem } from '../../utils/suggestionUtils';

export type { SuggestionItem };

export interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (item: SuggestionItem) => void;
  items: SuggestionItem[];
  placeholder?: string;
  className?: string;
  containerClassName?: string;
  dropdownClassName?: string;
  required?: boolean;
  autoComplete?: string;
  ariaLabel?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  autoFocus?: boolean;
  maxSuggestions?: number;
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  value,
  onChange,
  onSelect,
  items,
  placeholder,
  className = '',
  containerClassName = '',
  dropdownClassName = '',
  required = false,
  autoComplete = 'off',
  ariaLabel,
  id,
  name,
  disabled = false,
  onKeyDown,
  onBlur,
  onFocus,
  autoFocus = false,
  maxSuggestions = 15,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const query = value.trimStart().toLowerCase();

  // Strict prefix filtering: only show items that START WITH the typed letters
  const matches = useMemo(
    () => filterSuggestions(items, value, maxSuggestions),
    [items, value, maxSuggestions]
  );

  const isDropdownOpen = isOpen && isFocused && query.length > 0 && matches.length > 0;

  // Handle outside click / touch dismiss
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  const handleSelectItem = (item: SuggestionItem) => {
    onChange(item.name);
    if (onSelect) {
      onSelect(item);
    }
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isDropdownOpen) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % matches.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + matches.length) % matches.length);
        return;
      }
      if (e.key === 'Enter') {
        if (highlightedIndex >= 0 && highlightedIndex < matches.length) {
          e.preventDefault();
          handleSelectItem(matches[highlightedIndex]);
          return;
        }
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        return;
      }
    }

    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${containerClassName} ${isDropdownOpen ? 'z-40' : ''}`}
    >
      <input
        ref={inputRef}
        type="text"
        id={id}
        name={name}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => {
          setIsFocused(true);
          setIsOpen(true);
          if (onFocus) onFocus();
        }}
        onBlur={() => {
          setIsFocused(false);
          if (onBlur) onBlur();
        }}
        onKeyDown={handleInputKeyDown}
        placeholder={placeholder}
        className={className}
        required={required}
        autoComplete={autoComplete}
        aria-label={ariaLabel}
        aria-autocomplete="list"
        aria-expanded={isDropdownOpen}
        aria-controls={isDropdownOpen ? listboxId : undefined}
        role="combobox"
        disabled={disabled}
        autoFocus={autoFocus}
      />

      {/* Suggestion Box: Positioned right after the input box */}
      {isDropdownOpen && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Suggestions"
          className={`absolute left-0 top-full mt-1.5 w-full bg-white border border-[#F3E5D8] rounded-2xl shadow-cozy-lg z-50 max-h-56 overflow-y-auto overscroll-contain py-1 animate-in fade-in zoom-in-95 duration-100 ${dropdownClassName}`}
        >
          {matches.map((item, idx) => {
            const isHighlighted = idx === highlightedIndex;
            const matchLen = query.length;
            const prefix = item.name.slice(0, matchLen);
            const suffix = item.name.slice(matchLen);

            return (
              <div
                key={`${item.id || item.name}-${idx}`}
                role="option"
                aria-selected={isHighlighted}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevents input blur before select
                  handleSelectItem(item);
                }}
                onMouseEnter={() => setHighlightedIndex(idx)}
                className={`w-full px-3.5 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer select-none ${
                  isHighlighted
                    ? 'bg-[#FFF0F3] text-[#3D231D]'
                    : 'text-[#3D231D] hover:bg-[#FFF5F7]'
                }`}
              >
                <div className="flex items-center space-x-1.5 min-w-0">
                  <span className="truncate">
                    <span className="font-bold text-[#E85D75] underline decoration-[#E85D75]/40 decoration-2 underline-offset-2">
                      {prefix}
                    </span>
                    <span className="font-medium text-[#3D231D]">{suffix}</span>
                  </span>
                  {item.defaultUnit && (
                    <span className="text-[10px] text-[#8C726B] shrink-0">
                      ({item.defaultUnit})
                    </span>
                  )}
                </div>
                {item.category && (
                  <span className="ml-2 text-[10px] font-semibold text-[#8C726B] bg-[#FFF8F6] border border-[#F3E5D8] px-2 py-0.5 rounded-full shrink-0">
                    {item.category}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
