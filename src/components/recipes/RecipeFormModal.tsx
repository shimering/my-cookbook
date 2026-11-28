import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  Camera,
  Image as ImageIcon,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Link2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Info,
  Layers,
  X,
  Video,
  GripVertical,
} from 'lucide-react';
import type { Recipe, Ingredient, RecipeStep } from '../../types';
import {
  reorderIngredients,
  moveIngredientToSection,
  reorderSteps,
} from '../../utils/dragReorder';
import { compressImageToDataUrl } from '../../services/imageCompression';
import { RecipePhotoFramingEditor } from './RecipePhotoFramingEditor';
import {
  convertIngredient,
  getStoredUnitSystem,
  type UnitSystem,
} from '../../utils/unitConverter';
import { parseQuantity } from '../../utils/fractionParser';
import { getStoredCatalogItems } from '../../data/groceryCatalog';
import { db } from '../../db/cookbookDb';
import { AutocompleteInput, type SuggestionItem } from '../common/AutocompleteInput';
import { extractRecipeFromUrl } from '../../utils/recipeExtractor';

interface RecipeFormModalProps {
  initialRecipe?: Recipe | null;
  onSave: (recipe: Recipe) => void;
  onDelete?: (recipeId: string) => void;
  onClose: () => void;
}

const COMMON_CATEGORIES = ['Breakfast', 'Desserts', 'Quick Meals', 'Dinner', 'Drinks', 'Snacks', 'Baking'];

const US_UNITS = [
  { value: 'cup', label: 'cup (cups)' },
  { value: 'tbsp', label: 'tbsp (tablespoons)' },
  { value: 'tsp', label: 'tsp (teaspoons)' },
  { value: 'oz', label: 'oz (ounces)' },
  { value: 'fl oz', label: 'fl oz (fluid oz)' },
  { value: 'lb', label: 'lb (pounds)' },
  { value: 'pt', label: 'pt (pints)' },
  { value: 'qt', label: 'qt (quarts)' },
  { value: 'gal', label: 'gal (gallons)' },
];

const METRIC_UNITS = [
  { value: 'g', label: 'g (grams)' },
  { value: 'kg', label: 'kg (kilograms)' },
  { value: 'ml', label: 'ml (milliliters)' },
  { value: 'l', label: 'l (liters)' },
];

const COUNT_UNITS = [
  { value: '', label: '(whole / count)' },
  { value: 'piece', label: 'piece (pieces)' },
  { value: 'pinch', label: 'pinch' },
  { value: 'clove', label: 'clove (cloves)' },
  { value: 'slice', label: 'slice (slices)' },
  { value: 'can', label: 'can (cans)' },
  { value: 'sprig', label: 'sprig (sprigs)' },
  { value: 'stalk', label: 'stalk (stalks)' },
  { value: 'pkg', label: 'pkg (package)' },
];

const STANDARD_UNITS = [
  ...US_UNITS.map((u) => u.value),
  ...METRIC_UNITS.map((u) => u.value),
  ...COUNT_UNITS.map((u) => u.value),
].filter(Boolean);

const US_QTY_OPTIONS = [
  '1/8',
  '1/4',
  '1/3',
  '1/2',
  '2/3',
  '3/4',
  '1',
  '1 1/4',
  '1 1/3',
  '1 1/2',
  '1 3/4',
  '2',
  '2 1/2',
  '3',
  '4',
  '5',
  '6',
  '8',
  '10',
  '12',
];

const METRIC_WEIGHT_QTY_OPTIONS = [
  '5',
  '10',
  '15',
  '20',
  '25',
  '30',
  '50',
  '75',
  '100',
  '125',
  '150',
  '175',
  '200',
  '225',
  '250',
  '300',
  '350',
  '400',
  '450',
  '500',
  '600',
  '700',
  '750',
  '800',
  '1000',
];

const METRIC_VOLUME_LARGE_OPTIONS = [
  '0.25',
  '0.5',
  '0.75',
  '1',
  '1.25',
  '1.5',
  '2',
  '2.5',
  '3',
];

const COUNT_QTY_OPTIONS = [
  '1/2',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '8',
  '10',
  '12',
];

export function getQtyOptions(unitSystem: UnitSystem, unit: string): string[] {
  const u = (unit || '').toLowerCase().trim();
  if (u === 'g' || u === 'ml') {
    return METRIC_WEIGHT_QTY_OPTIONS;
  }
  if (u === 'kg' || u === 'l') {
    return METRIC_VOLUME_LARGE_OPTIONS;
  }
  if (
    u === 'cup' ||
    u === 'tbsp' ||
    u === 'tsp' ||
    u === 'oz' ||
    u === 'fl oz' ||
    u === 'lb' ||
    u === 'pt' ||
    u === 'qt' ||
    u === 'gal'
  ) {
    return US_QTY_OPTIONS;
  }
  if (COUNT_UNITS.some((cu) => cu.value === u)) {
    return COUNT_QTY_OPTIONS;
  }
  return unitSystem === 'metric' ? METRIC_WEIGHT_QTY_OPTIONS : US_QTY_OPTIONS;
}

export const RecipeFormModal: React.FC<RecipeFormModalProps> = ({
  initialRecipe,
  onSave,
  onDelete,
  onClose,
}) => {
  const isEditing = Boolean(initialRecipe);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const modalCardRef = useRef<HTMLDivElement>(null);
  const deleteCancelBtnRef = useRef<HTMLButtonElement>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Lock body scroll and focus modal dialog on mount
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    const prevTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    // Focus the modal container so mouse wheel and keyboard focus stay on the popup
    modalCardRef.current?.focus();

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouchAction;
    };
  }, []);

  // Handle Escape key to dismiss confirmation or modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showDeleteConfirm) {
          e.stopPropagation();
          setShowDeleteConfirm(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDeleteConfirm, onClose]);

  // Autofocus the safe Cancel action whenever the delete alert dialog opens
  useEffect(() => {
    if (showDeleteConfirm) {
      deleteCancelBtnRef.current?.focus();
    }
  }, [showDeleteConfirm]);

  const [title, setTitle] = useState(initialRecipe?.title || '');
  const [description, setDescription] = useState(initialRecipe?.description || '');
  const [heroImage, setHeroImage] = useState(initialRecipe?.heroImage || '');
  const [originalHeroImage, setOriginalHeroImage] = useState(
    initialRecipe?.originalHeroImage || initialRecipe?.heroImage || ''
  );
  const [heroImageScale, setHeroImageScale] = useState<number>(initialRecipe?.heroImageScale ?? 1.0);
  const [heroImagePosition, setHeroImagePosition] = useState<{ x: number; y: number }>(
    initialRecipe?.heroImagePosition ?? { x: 0, y: 0 }
  );
  const [isExtractedImage, setIsExtractedImage] = useState(false);
  const getFramedDataUrlRef = useRef<(() => Promise<string>) | null>(null);
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(initialRecipe?.prepTimeMinutes?.toString() || '15');
  const [cookTimeMinutes, setCookTimeMinutes] = useState(initialRecipe?.cookTimeMinutes?.toString() || '15');
  const [servings, setServings] = useState(initialRecipe?.servings?.toString() || '4');
  const [categories, setCategories] = useState<string[]>(initialRecipe?.categories || ['Breakfast']);
  const [customTag, setCustomTag] = useState('');
  const [sourceUrl, setSourceUrl] = useState(initialRecipe?.sourceUrl || '');
  const [youtubeUrl, setYoutubeUrl] = useState(initialRecipe?.youtubeUrl || '');

  // Unit system for adding/editing measurements: 'us' (cups, tbsp) or 'metric' (grams, ml)
  const [formUnitSystem, setFormUnitSystem] = useState<UnitSystem>(() => getStoredUnitSystem());

  // Structured ingredients
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    initialRecipe?.ingredients?.length
      ? initialRecipe.ingredients
      : [
          { id: '1', name: '', amount: 1, unit: 'cup', displayFraction: '1', section: '' },
          { id: '2', name: '', amount: 2, unit: 'tbsp', displayFraction: '2', section: '' },
        ]
  );

  // Grocery item suggestions loaded from catalog and stored items in Dexie
  const [grocerySuggestions, setGrocerySuggestions] = useState<SuggestionItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    const loadSuggestions = async () => {
      try {
        const catalogItems = getStoredCatalogItems();
        const map = new Map<string, SuggestionItem>();
        for (const item of catalogItems) {
          map.set(item.name.toLowerCase(), {
            id: item.id,
            name: item.name,
            category: item.category,
            defaultUnit: item.defaultUnit,
            notes: item.notes,
          });
        }

        const dbItems = await db.groceryItems.toArray();
        for (const item of dbItems) {
          if (!map.has(item.name.toLowerCase())) {
            map.set(item.name.toLowerCase(), {
              id: item.id,
              name: item.name,
              category: item.category,
              defaultUnit: item.unit,
              notes: item.notes,
            });
          }
        }

        const itemsList = Array.from(map.values()).sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        if (isMounted) {
          setGrocerySuggestions(itemsList);
        }
      } catch (err) {
        console.error('Failed to load grocery suggestions:', err);
      }
    };
    loadSuggestions();
    return () => {
      isMounted = false;
    };
  }, []);

  // Numbered steps
  const [steps, setSteps] = useState<RecipeStep[]>(
    initialRecipe?.steps?.length
      ? initialRecipe.steps
      : [
          { id: '1', stepNumber: 1, instruction: '' },
          { id: '2', stepNumber: 2, instruction: '' },
        ]
  );

  const [isCompressing, setIsCompressing] = useState(false);

  // URL extraction state
  const [urlInput, setUrlInput] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState('');
  const [extractionSuccess, setExtractionSuccess] = useState('');

  // Extract Recipe from Web URL
  const handleExtractUrl = async () => {
    if (!urlInput.trim()) return;

    try {
      setIsExtracting(true);
      setExtractionError('');
      setExtractionSuccess('');

      const trimmedUrl = urlInput.trim();
      const extracted = await extractRecipeFromUrl(trimmedUrl);

      setSourceUrl(trimmedUrl);
      if (extracted.title) setTitle(extracted.title);
      if (extracted.description) setDescription(extracted.description);
      if (extracted.heroImage) {
        setHeroImage(extracted.heroImage);
        setOriginalHeroImage(extracted.heroImage);
        setHeroImageScale(1.0);
        setHeroImagePosition({ x: 0, y: 0 });
        setIsExtractedImage(true);
      }
      if (extracted.prepTimeMinutes) setPrepTimeMinutes(String(extracted.prepTimeMinutes));
      if (extracted.cookTimeMinutes) setCookTimeMinutes(String(extracted.cookTimeMinutes));
      if (extracted.servings) setServings(String(extracted.servings));
      if (extracted.categories && extracted.categories.length > 0) {
        setCategories(extracted.categories);
      }
      if (extracted.ingredients && extracted.ingredients.length > 0) {
        setIngredients(extracted.ingredients);
      }
      if (extracted.steps && extracted.steps.length > 0) {
        setSteps(extracted.steps);
      }

      setExtractionSuccess(
        `Extracted "${extracted.title || 'Recipe'}" with ${extracted.ingredients.length} ingredients and ${extracted.steps.length} steps!`
      );
    } catch (err: unknown) {
      setExtractionError(
        err instanceof Error
          ? err.message
          : 'Failed to extract recipe from URL. Please check the link or enter details manually.'
      );
    } finally {
      setIsExtracting(false);
    }
  };

  // Handle Photo Upload from either Camera or Gallery
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const dataUrl = await compressImageToDataUrl(file);
      setHeroImage(dataUrl);
      setOriginalHeroImage(dataUrl);
      setHeroImageScale(1.0);
      setHeroImagePosition({ x: 0, y: 0 });
      setIsExtractedImage(false);
    } catch (err) {
      console.error('Failed to compress image:', err);
    } finally {
      setIsCompressing(false);
      // Reset input value so same photo can be re-selected if desired
      e.target.value = '';
    }
  };

  // Category Toggle
  const toggleCategory = (cat: string) => {
    if (categories.includes(cat)) {
      setCategories(categories.filter((c) => c !== cat));
    } else {
      setCategories([...categories, cat]);
    }
  };

  const addCustomTag = () => {
    if (customTag.trim() && !categories.includes(customTag.trim())) {
      setCategories([...categories, customTag.trim()]);
      setCustomTag('');
    }
  };

  // Unit System change handler (converts existing ingredients to selected system)
  const handleFormUnitSystemChange = (targetSystem: UnitSystem) => {
    if (targetSystem === formUnitSystem) return;
    setFormUnitSystem(targetSystem);

    setIngredients((prev) =>
      prev.map((ing) => {
        if (!ing.name.trim() || !ing.amount) {
          const isMetric = targetSystem === 'metric';
          const defaultUnit = isMetric ? 'g' : 'cup';
          const defaultQty = isMetric ? '100' : '1';
          const defaultAmount = isMetric ? 100 : 1;
          return {
            ...ing,
            unit: defaultUnit,
            displayFraction: defaultQty,
            amount: defaultAmount,
          };
        }
        const res = convertIngredient(ing, targetSystem, 1);
        return {
          ...ing,
          amount: res.amount,
          unit: res.unit,
          displayFraction: res.displayQuantity,
        };
      })
    );
  };

  // Helper to update one or more fields on an ingredient cleanly using functional state
  const updateIngredient = (index: number, updates: Partial<Ingredient>) => {
    setIngredients((prev) => {
      const updated = [...prev];
      if (!updated[index]) return prev;
      updated[index] = { ...updated[index], ...updates };
      return updated;
    });
  };

  // Quantity dropdown select handler
  const handleQuantitySelect = (index: number, val: string) => {
    if (val === '__custom__') {
      const custom = prompt('Enter custom quantity (e.g. 1 1/2, 250, 0.5):');
      if (custom && custom.trim()) {
        const parsedNum = parseQuantity(custom.trim()).valueOf();
        updateIngredient(index, {
          displayFraction: custom.trim(),
          amount: parsedNum > 0 ? parsedNum : 1,
        });
      }
    } else {
      const parsedNum = parseQuantity(val).valueOf();
      updateIngredient(index, {
        displayFraction: val,
        amount: parsedNum > 0 ? parsedNum : 1,
      });
    }
  };

  // Unit dropdown select handler
  const handleUnitSelect = (index: number, val: string) => {
    if (val === '__custom__') {
      const custom = prompt('Enter custom measurement unit (e.g. handful, dash, sheet):');
      if (custom && custom.trim()) {
        updateIngredient(index, { unit: custom.trim() });
      }
    } else {
      const u = val.toLowerCase();
      const current = ingredients[index];
      const updates: Partial<Ingredient> = { unit: val };
      if ((u === 'g' || u === 'ml') && current && (current.amount === 1 || current.displayFraction === '1')) {
        updates.amount = 100;
        updates.displayFraction = '100';
      } else if (u === 'cup' && current && current.amount === 100) {
        updates.amount = 1;
        updates.displayFraction = '1';
      }
      updateIngredient(index, updates);
    }
  };

  // Ingredients Helpers
  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string | number) => {
    updateIngredient(index, { [field]: value });
  };

  const addIngredient = (section: string = '') => {
    setIngredients((prev) => [
      ...prev,
      {
        id: `ing-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        name: '',
        amount: formUnitSystem === 'metric' ? 100 : 1,
        unit: formUnitSystem === 'metric' ? 'g' : 'cup',
        displayFraction: formUnitSystem === 'metric' ? '100' : '1',
        section,
      },
    ]);
  };

  const removeIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  // Section State & Helpers
  const [showAddSectionCard, setShowAddSectionCard] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const newSectionInputRef = useRef<HTMLInputElement>(null);

  const handleCreateSection = (name?: string) => {
    const secName = (name !== undefined ? name : newSectionTitle).trim();
    if (!secName) return;

    setIngredients((prev) => [
      ...prev,
      {
        id: `ing-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        name: '',
        amount: formUnitSystem === 'metric' ? 100 : 1,
        unit: formUnitSystem === 'metric' ? 'g' : 'cup',
        displayFraction: formUnitSystem === 'metric' ? '100' : '1',
        section: secName,
      },
    ]);
    setNewSectionTitle('');
    setShowAddSectionCard(false);
  };

  const handleRenameSection = (oldName: string, newName: string) => {
    setIngredients((prev) =>
      prev.map((ing) =>
        (ing.section || '').trim() === oldName.trim()
          ? { ...ing, section: newName }
          : ing
      )
    );
  };

  const handleDeleteSection = (sectionName: string) => {
    const hasNamedItems = ingredients.some(
      (ing) => (ing.section || '').trim() === sectionName.trim() && ing.name.trim().length > 0
    );
    if (hasNamedItems) {
      if (
        confirm(
          `Remove the "${sectionName}" section header? Click OK to keep its ingredients in the main list, or Cancel to leave it as is.`
        )
      ) {
        setIngredients((prev) =>
          prev.map((ing) =>
            (ing.section || '').trim() === sectionName.trim() ? { ...ing, section: '' } : ing
          )
        );
      }
    } else {
      setIngredients((prev) =>
        prev.filter((ing) => (ing.section || '').trim() !== sectionName.trim())
      );
    }
  };

  const ingredientGroups = useMemo(() => {
    const groups: { section: string; items: { ing: Ingredient; originalIndex: number }[] }[] = [];
    const map = new Map<string, { section: string; items: { ing: Ingredient; originalIndex: number }[] }>();

    ingredients.forEach((ing, index) => {
      const sec = ing.section?.trim() || '';
      if (!map.has(sec)) {
        const group = { section: sec, items: [] as { ing: Ingredient; originalIndex: number }[] };
        map.set(sec, group);
        groups.push(group);
      }
      map.get(sec)!.items.push({ ing, originalIndex: index });
    });

    return groups;
  }, [ingredients]);

  const hasNamedSections = useMemo(() => {
    return ingredientGroups.some((g) => g.section !== '');
  }, [ingredientGroups]);

  // Drag & Drop State for Ingredients (supports both HTML5 DnD and unified Pointer Events for mouse/touch)
  const [draggedIngIndex, setDraggedIngIndex] = useState<number | null>(null);
  const [dragOverIngIndex, setDragOverIngIndex] = useState<number | null>(null);
  const [dragOverSection, setDragOverSection] = useState<string | null>(null);
  const [isPointerDraggingIng, setIsPointerDraggingIng] = useState(false);
  const [ingDragPreview, setIngDragPreview] = useState<{
    x: number;
    y: number;
    width: number;
  } | null>(null);
  const ingDragOffsetRef = useRef<{ offsetX: number; offsetY: number }>({ offsetX: 16, offsetY: 20 });
  const dragOverlayRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const resetIngDragState = () => {
    setDraggedIngIndex(null);
    setDragOverIngIndex(null);
    setDragOverSection(null);
    setIsPointerDraggingIng(false);
    setIngDragPreview(null);
  };

  const handleIngDropOnItem = (targetIndex: number, targetSection?: string) => {
    if (draggedIngIndex === null) {
      resetIngDragState();
      return;
    }
    const currentSec = (ingredients[draggedIngIndex]?.section || '').trim();
    const resolvedTargetSec = targetSection !== undefined ? targetSection.trim() : currentSec;
    if (draggedIngIndex !== targetIndex || currentSec !== resolvedTargetSec) {
      setIngredients((prev) =>
        reorderIngredients(prev, draggedIngIndex, targetIndex, resolvedTargetSec)
      );
    }
    resetIngDragState();
  };

  const handleIngDropOnSection = (targetSection: string) => {
    if (draggedIngIndex === null) {
      resetIngDragState();
      return;
    }
    setIngredients((prev) => moveIngredientToSection(prev, draggedIngIndex, targetSection));
    resetIngDragState();
  };

  useEffect(() => {
    if (!isPointerDraggingIng || draggedIngIndex === null) return;

    const handlePointerMove = (e: PointerEvent) => {
      // Move the floating preview smoothly with the pointer/finger
      if (dragOverlayRef.current) {
        const tx = e.clientX - ingDragOffsetRef.current.offsetX;
        const ty = e.clientY - ingDragOffsetRef.current.offsetY;
        dragOverlayRef.current.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(1.02)`;
      }

      // Auto-scroll modal content if dragging near top/bottom edges
      if (scrollContainerRef.current) {
        const rect = scrollContainerRef.current.getBoundingClientRect();
        if (e.clientY < rect.top + 48) {
          scrollContainerRef.current.scrollTop -= 12;
        } else if (e.clientY > rect.bottom - 48) {
          scrollContainerRef.current.scrollTop += 12;
        }
      }

      const elements = document.elementsFromPoint(e.clientX, e.clientY);
      const rowEl = elements.find((el) => (el as HTMLElement).dataset?.ingIndex !== undefined) as HTMLElement | undefined;
      if (rowEl && rowEl.dataset.ingIndex !== undefined) {
        const idx = parseInt(rowEl.dataset.ingIndex, 10);
        if (!Number.isNaN(idx)) {
          setDragOverIngIndex(idx);
          setDragOverSection(null);
          return;
        }
      }
      const secEl = elements.find((el) => (el as HTMLElement).dataset?.ingSection !== undefined) as HTMLElement | undefined;
      if (secEl && secEl.dataset.ingSection !== undefined) {
        setDragOverSection(secEl.dataset.ingSection);
        setDragOverIngIndex(null);
      }
    };

    const handlePointerUp = () => {
      if (dragOverIngIndex !== null) {
        const targetSec = (ingredients[dragOverIngIndex]?.section || '').trim();
        handleIngDropOnItem(dragOverIngIndex, targetSec);
      } else if (dragOverSection !== null) {
        handleIngDropOnSection(dragOverSection);
      } else {
        resetIngDragState();
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  });

  // Drag & Drop State for Steps (supports both HTML5 DnD and unified Pointer Events for mouse/touch)
  const [draggedStepIndex, setDraggedStepIndex] = useState<number | null>(null);
  const [dragOverStepIndex, setDragOverStepIndex] = useState<number | null>(null);
  const [isPointerDraggingStep, setIsPointerDraggingStep] = useState(false);
  const [stepDragPreview, setStepDragPreview] = useState<{
    x: number;
    y: number;
    width: number;
  } | null>(null);
  const stepDragOffsetRef = useRef<{ offsetX: number; offsetY: number }>({ offsetX: 16, offsetY: 20 });

  const resetStepDragState = () => {
    setDraggedStepIndex(null);
    setDragOverStepIndex(null);
    setIsPointerDraggingStep(false);
    setStepDragPreview(null);
  };

  const handleStepDrop = (targetIndex: number) => {
    if (draggedStepIndex !== null && draggedStepIndex !== targetIndex) {
      setSteps((prev) => reorderSteps(prev, draggedStepIndex, targetIndex));
    }
    resetStepDragState();
  };

  useEffect(() => {
    if (!isPointerDraggingStep || draggedStepIndex === null) return;

    const handlePointerMove = (e: PointerEvent) => {
      // Move the floating preview smoothly with the pointer/finger
      if (dragOverlayRef.current) {
        const tx = e.clientX - stepDragOffsetRef.current.offsetX;
        const ty = e.clientY - stepDragOffsetRef.current.offsetY;
        dragOverlayRef.current.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(1.02)`;
      }

      // Auto-scroll modal content if dragging near top/bottom edges
      if (scrollContainerRef.current) {
        const rect = scrollContainerRef.current.getBoundingClientRect();
        if (e.clientY < rect.top + 48) {
          scrollContainerRef.current.scrollTop -= 12;
        } else if (e.clientY > rect.bottom - 48) {
          scrollContainerRef.current.scrollTop += 12;
        }
      }

      const elements = document.elementsFromPoint(e.clientX, e.clientY);
      const stepEl = elements.find((el) => (el as HTMLElement).dataset?.stepIndex !== undefined) as HTMLElement | undefined;
      if (stepEl && stepEl.dataset.stepIndex !== undefined) {
        const idx = parseInt(stepEl.dataset.stepIndex, 10);
        if (!Number.isNaN(idx)) {
          setDragOverStepIndex(idx);
        }
      }
    };

    const handlePointerUp = () => {
      if (dragOverStepIndex !== null) {
        handleStepDrop(dragOverStepIndex);
      } else {
        resetStepDragState();
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  });

  const renderIngredientRow = (ing: Ingredient, index: number) => {
    const qtyOptions = getQtyOptions(formUnitSystem, ing.unit);
    const currentQtyVal = ing.displayFraction || (ing.amount ? ing.amount.toString() : '1');
    const hasCustomQty = currentQtyVal && !qtyOptions.includes(currentQtyVal);
    const ingSection = (ing.section || '').trim();
    const isDragging = draggedIngIndex === index;
    const isDragOver = dragOverIngIndex === index && draggedIngIndex !== index;

    return (
      <div
        key={ing.id}
        data-ing-index={index}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', String(index));
          setDraggedIngIndex(index);
        }}
        onDragOver={(e) => {
          if (draggedIngIndex === null) return;
          e.preventDefault();
          e.stopPropagation();
          e.dataTransfer.dropEffect = 'move';
          if (dragOverIngIndex !== index) {
            setDragOverIngIndex(index);
            setDragOverSection(null);
          }
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleIngDropOnItem(index, ingSection);
        }}
        onDragEnd={resetIngDragState}
        className={`flex items-center space-x-1.5 bg-white p-2 rounded-[16px] border shadow-xs transition-all ${
          isDragging
            ? 'opacity-50 scale-[0.98] border-[#E85D75] ring-2 ring-[#E85D75]/30'
            : isDragOver
              ? 'border-[#E85D75] ring-2 ring-[#E85D75] bg-[#FFF0F3]/40'
              : 'border-[#F3E5D8]'
        }`}
      >
        {/* Drag Handle (unified Pointer Events for mouse/pen/touch) */}
        <div
          role="button"
          tabIndex={0}
          onPointerDown={(e) => {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            e.preventDefault();
            const rowEl = e.currentTarget.closest('[data-ing-index]') as HTMLElement | null;
            const rect = rowEl?.getBoundingClientRect();
            const offsetX = rect ? e.clientX - rect.left : 16;
            const offsetY = rect ? e.clientY - rect.top : 20;
            ingDragOffsetRef.current = { offsetX, offsetY };
            setIngDragPreview({
              x: e.clientX - offsetX,
              y: e.clientY - offsetY,
              width: rect?.width || 320,
            });
            setDraggedIngIndex(index);
            setIsPointerDraggingIng(true);
          }}
          className="p-1 text-[#8C726B]/60 hover:text-[#E85D75] cursor-grab active:cursor-grabbing touch-none select-none shrink-0 rounded"
          aria-label={`Drag to reorder ${ing.name || 'ingredient'}`}
          title="Drag to reorder or move between sections"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Quantity Dropdown Menu */}
        <select
          value={currentQtyVal}
          onChange={(e) => handleQuantitySelect(index, e.target.value)}
          aria-label="Ingredient quantity"
          className="w-20 px-2 py-1.5 bg-[#FDECC8]/60 border border-[#F3E5D8] rounded-[10px] text-xs font-semibold text-center text-[#3D231D] focus:outline-none focus:border-[#E85D75] focus:ring-1 focus:ring-[#E85D75]/40 cursor-pointer shrink-0 truncate"
        >
          {hasCustomQty && (
            <option value={currentQtyVal}>{currentQtyVal}</option>
          )}
          {qtyOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
          <option value="__custom__">+ Custom Qty...</option>
        </select>

        {/* Unit Dropdown Menu with List of Measurements */}
        <select
          value={ing.unit || ''}
          onChange={(e) => handleUnitSelect(index, e.target.value)}
          className="w-24 sm:w-28 px-1.5 py-1.5 bg-[#FDECC8]/60 border border-[#F3E5D8] rounded-[10px] text-xs font-semibold text-[#3D231D] focus:outline-none focus:border-[#E85D75] focus:ring-1 focus:ring-[#E85D75]/40 cursor-pointer shrink-0 truncate"
          aria-label="Measurement unit"
        >
          {ing.unit && !STANDARD_UNITS.includes(ing.unit.toLowerCase()) && (
            <option value={ing.unit}>{ing.unit} (custom)</option>
          )}

          {formUnitSystem === 'metric' ? (
            <>
              <optgroup label="Metric (g, ml, kg, l)">
                {METRIC_UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="US Customary (cups, spoons, oz)">
                {US_UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </optgroup>
            </>
          ) : (
            <>
              <optgroup label="US Customary (cups, spoons, oz)">
                {US_UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Metric (g, ml, kg, l)">
                {METRIC_UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </optgroup>
            </>
          )}

          <optgroup label="Count & Portions">
            {COUNT_UNITS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </optgroup>
          <option value="__custom__">+ Custom unit...</option>
        </select>

        {/* Ingredient Name Box */}
        <div className="flex-1 min-w-0">
          <AutocompleteInput
            value={ing.name}
            onChange={(val) => handleIngredientChange(index, 'name', val)}
            onSelect={(item) => {
              handleIngredientChange(index, 'name', item.name);
            }}
            items={grocerySuggestions}
            placeholder="Ingredient name (e.g. Flour)"
            className="w-full px-2.5 py-1.5 bg-white border border-[#F3E5D8] rounded-[10px] text-xs font-medium text-[#3D231D] placeholder-[#8C726B]/50 focus:outline-none focus:border-[#E85D75] focus:ring-1 focus:ring-[#E85D75]/40"
            ariaLabel="Ingredient name"
          />
        </div>

        {/* Delete button */}
        <button
          type="button"
          onClick={() => removeIngredient(index)}
          className="p-1.5 text-[#8C726B] hover:text-red-500 rounded-lg hover:bg-[#FDE8EA] transition-colors cursor-pointer shrink-0"
          aria-label="Remove Ingredient"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  };

  // Steps Helpers
  const handleStepChange = (index: number, instruction: string) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], instruction };
    setSteps(updated);
  };

  const addStep = () => {
    setSteps([
      ...steps,
      {
        id: `step-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        stepNumber: steps.length + 1,
        instruction: '',
      },
    ]);
  };

  const removeStep = (index: number) => {
    const filtered = steps.filter((_, i) => i !== index);
    const renumbered = filtered.map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
    setSteps(renumbered);
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;
    const reordered = [...steps];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    const renumbered = reordered.map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
    setSteps(renumbered);
  };

  // Save Recipe
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a recipe title');
      return;
    }

    const cleanIngredients = ingredients.filter((ing) => ing.name.trim().length > 0);
    const cleanSteps = steps
      .filter((s) => s.instruction.trim().length > 0)
      .map((s, idx) => ({ ...s, stepNumber: idx + 1 }));

    // Generate framed 16:9 crop if framing editor is active
    let finalHeroImage = heroImage;
    if (getFramedDataUrlRef.current && (originalHeroImage || heroImage)) {
      try {
        finalHeroImage = await getFramedDataUrlRef.current();
      } catch (err) {
        console.warn('Could not generate framed crop, using original:', err);
      }
    }

    const recipe: Recipe = {
      id: initialRecipe?.id || `recipe-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      heroImage: finalHeroImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      originalHeroImage: originalHeroImage || undefined,
      heroImageScale,
      heroImagePosition,
      prepTimeMinutes: parseInt(prepTimeMinutes, 10) || 15,
      cookTimeMinutes: parseInt(cookTimeMinutes, 10) || 15,
      servings: parseInt(servings, 10) || 4,
      categories: categories.length ? categories : ['Other'],
      ingredients: cleanIngredients,
      steps: cleanSteps,
      sourceUrl: sourceUrl.trim() || undefined,
      youtubeUrl: youtubeUrl.trim() || undefined,
      isFavorite: initialRecipe?.isFavorite || false,
      createdAt: initialRecipe?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      synced: false,
    };

    onSave(recipe);
  };

  const handleDelete = () => {
    if (initialRecipe?.id && onDelete) {
      onDelete(initialRecipe.id);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#3D231D]/40 backdrop-blur-xs flex justify-center items-end sm:items-center sm:p-4 overflow-hidden overscroll-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalCardRef}
        tabIndex={-1}
        className="bg-[#FFF8F6] w-full max-w-lg h-[92vh] sm:h-auto sm:max-h-[90vh] rounded-t-[24px] sm:rounded-[24px] flex flex-col shadow-cozy-lg border border-[#F3E5D8] overflow-hidden overscroll-contain focus:outline-none animate-in slide-in-from-bottom-6 duration-300"
      >
        {/* Top Bar Header */}
        <div className="relative px-5 py-4 border-b border-[#F3E5D8] bg-white flex items-center justify-between shrink-0 sticky top-0 z-20">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 -ml-1.5 rounded-full hover:bg-[#FFF0F3] text-[#3D231D] transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
          </button>
          <h2 className="font-brand text-lg font-bold text-[#3D231D]">
            {isEditing ? 'Edit Recipe' : 'New Recipe'}
          </h2>
          {isEditing && onDelete ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 -mr-1.5 rounded-full hover:bg-red-50 text-[#8C726B] hover:text-red-600 transition-colors cursor-pointer"
              aria-label="Delete Recipe"
              title="Delete Recipe"
            >
              <Trash2 className="w-5 h-5 stroke-[2]" />
            </button>
          ) : (
            <div className="w-8" />
          )}
        </div>

        {/* Semantic Form with Scrollable Content and Sticky Save Footer */}
        <form id="recipe-form" onSubmit={handleSave} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Scrollable Form Content */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto px-5 py-5 space-y-5 overscroll-contain"
          >
            {/* 🪄 Import from Recipe Link Card */}
            <div className="bg-[#FFF0F3]/70 border border-[#F3E5D8] rounded-[24px] p-4 shadow-2xs">
              <div className="flex items-center space-x-2.5 mb-2.5">
                <div className="w-8 h-8 rounded-full bg-[#E85D75] text-white flex items-center justify-center shadow-xs shrink-0">
                  <Sparkles className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-brand text-xs sm:text-sm font-bold text-[#3D231D]">
                    Import from Recipe Link
                  </h3>
                  <p className="text-[11px] text-[#8C726B]">
                    Paste any recipe URL to auto-extract ingredients, steps & photo
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C726B]">
                    <Link2 className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => {
                      setUrlInput(e.target.value);
                      if (extractionError) setExtractionError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleExtractUrl();
                      }
                    }}
                    placeholder="https://www.allrecipes.com/recipe/..."
                    className="w-full pl-8 pr-3 py-2 bg-white border border-[#F3E5D8] rounded-full text-xs text-[#3D231D] placeholder-[#8C726B]/50 focus:outline-none focus:ring-2 focus:ring-[#E85D75]/40"
                    disabled={isExtracting}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleExtractUrl}
                  disabled={isExtracting || !urlInput.trim()}
                  className="px-4 py-2 bg-[#E85D75] hover:bg-[#D44760] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-full shadow-xs transition-all cursor-pointer flex items-center justify-center space-x-1.5 shrink-0"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Extracting...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Extract</span>
                    </>
                  )}
                </button>
              </div>

              {extractionError && (
                <div className="mt-2.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-[12px] p-2.5 flex items-start space-x-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                  <span className="flex-1">{extractionError}</span>
                </div>
              )}

              {extractionSuccess && (
                <div className="mt-2.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-[12px] p-2.5 flex items-center space-x-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span className="flex-1">{extractionSuccess}</span>
                </div>
              )}
            </div>

            {/* Photo Upload Card with border-radius: 24px (Camera & Gallery Options) */}
            <div className="relative">
              {/* Camera Input (opens native camera directly on mobile) */}
              <input
                type="file"
                ref={cameraInputRef}
                accept="image/*"
                capture="environment"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              {/* Gallery Input (opens photo gallery / files on mobile & desktop) */}
              <input
                type="file"
                ref={galleryInputRef}
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              {originalHeroImage || heroImage ? (
                <RecipePhotoFramingEditor
                  imageSrc={originalHeroImage || heroImage}
                  initialScale={heroImageScale}
                  initialPosition={heroImagePosition}
                  autoFitNonMatching={isExtractedImage}
                  onChange={({ scale, position, getFramedDataUrl }) => {
                    setHeroImageScale(scale);
                    setHeroImagePosition(position);
                    getFramedDataUrlRef.current = getFramedDataUrl;
                  }}
                  onTakePhoto={() => cameraInputRef.current?.click()}
                  onFromGallery={() => galleryInputRef.current?.click()}
                  onRemove={() => {
                    setHeroImage('');
                    setOriginalHeroImage('');
                    setHeroImageScale(1.0);
                    setHeroImagePosition({ x: 0, y: 0 });
                    setIsExtractedImage(false);
                    getFramedDataUrlRef.current = null;
                  }}
                  disabled={isCompressing}
                />
              ) : (
                <div className="w-full py-6 px-4 border-2 border-dashed border-[#F3E5D8] bg-white rounded-3xl flex flex-col items-center justify-center space-y-3.5 shadow-2xs">
                  <div className="text-center">
                    <span className="text-xs font-bold text-[#3D231D] uppercase tracking-wider block">
                      {isCompressing ? 'Compressing photo...' : 'Recipe Photo'}
                    </span>
                    <span className="text-[11px] text-[#8C726B] mt-0.5 block">
                      Take a photo with your camera or select from your gallery
                    </span>
                  </div>

                  <div className="flex items-center space-x-2.5 w-full max-w-xs justify-center">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex-1 inline-flex items-center justify-center space-x-2 py-2 px-3 bg-[#FDE8EA] hover:bg-[#FCD2D8] active:scale-95 text-[#E85D75] text-xs font-bold rounded-full transition-all cursor-pointer shadow-xs border border-[#F3E5D8]"
                    >
                      <Camera className="w-4 h-4 stroke-[2.2]" />
                      <span>Take Photo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="flex-1 inline-flex items-center justify-center space-x-2 py-2 px-3 bg-[#FDECC8] hover:bg-[#FCE3B0] active:scale-95 text-[#3D231D] text-xs font-bold rounded-full transition-all cursor-pointer shadow-xs border border-[#F3E5D8]"
                    >
                      <ImageIcon className="w-4 h-4 stroke-[2.2]" />
                      <span>Photo Gallery</span>
                    </button>
                  </div>

                  {/* Preferred Dimensions & Ratio Information Callout */}
                  <div className="pt-2.5 border-t border-[#F5E6BF]/80 flex items-start space-x-2 text-[#8C726B] max-w-sm text-left">
                    <Info className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                    <div className="text-[11px] leading-relaxed">
                      <span className="font-bold text-[#3D231D] block">
                        Preferred Dimensions & Aspect Ratios:
                      </span>
                      <span className="block text-[#8C726B]">
                        • <strong>16:9 Landscape</strong> (Recommended: 1200 × 675 px, min. 800 × 450 px)
                      </span>
                      <span className="block text-[#8C726B]">
                        • <strong>4:3 Standard</strong> (1200 × 900 px, min. 800 × 600 px)
                      </span>
                      <span className="block text-[#8C726B]/80 text-[10px] mt-0.5">
                        Supports JPG, PNG, and WebP. You can move and zoom your photo after adding.
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Recipe Title Input (border-radius: 16px) */}
            <div>
              <label className="block text-xs font-bold text-[#8C726B] mb-1.5">
                Recipe Title
              </label>
              <input
                type="text"
                required
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Cinnamon Rolls"
                className="w-full px-4 py-3 bg-white border border-[#F3E5D8] rounded-[16px] text-base font-brand font-bold text-[#3D231D] placeholder-[#8C726B]/50 focus:outline-none focus:ring-2 focus:ring-[#E85D75]/40 focus:border-[#E85D75] shadow-cozy"
              />
            </div>

            {/* Description (border-radius: 16px) */}
            <div>
              <label className="block text-xs font-bold text-[#8C726B] mb-1.5">
                Description (Optional)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A brief note about this delicious dish..."
                className="w-full px-4 py-2.5 bg-white border border-[#F3E5D8] rounded-[16px] text-xs text-[#3D231D] placeholder-[#8C726B]/50 focus:outline-none focus:ring-2 focus:ring-[#E85D75]/40 shadow-cozy resize-none"
              />
            </div>

            {/* Recipe Source Link & YouTube Video Link (Optional) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#8C726B] mb-1.5">
                  Recipe Link (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C726B]">
                    <Link2 className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://example.com/recipe"
                    aria-label="Recipe link URL"
                    className="w-full pl-8 pr-3 py-2 bg-white border border-[#F3E5D8] rounded-[14px] text-xs text-[#3D231D] placeholder-[#8C726B]/50 focus:outline-none focus:ring-2 focus:ring-[#E85D75]/40 focus:border-[#E85D75] shadow-cozy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8C726B] mb-1.5">
                  YouTube Video Link (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#E85D75]">
                    <Video className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    aria-label="YouTube video link URL"
                    className="w-full pl-8 pr-3 py-2 bg-white border border-[#F3E5D8] rounded-[14px] text-xs text-[#3D231D] placeholder-[#8C726B]/50 focus:outline-none focus:ring-2 focus:ring-[#E85D75]/40 focus:border-[#E85D75] shadow-cozy"
                  />
                </div>
              </div>
            </div>

            {/* Metadata Row: Prep Time, Cook Time, Servings (Butter Peach, border-radius: 16px) */}
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-[#8C726B] mb-1">
                  Prep Time
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={prepTimeMinutes}
                    onChange={(e) => setPrepTimeMinutes(e.target.value)}
                    placeholder="15"
                    className="w-full px-3 py-2.5 bg-[#FDECC8]/60 border border-[#F3E5D8] rounded-[16px] text-sm font-semibold text-[#3D231D] focus:outline-none focus:ring-2 focus:ring-[#E85D75]/40 shadow-xs"
                  />
                  <span className="absolute right-2.5 top-2.5 text-[11px] text-[#8C726B] pointer-events-none">
                    mins
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8C726B] mb-1">
                  Cook Time
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={cookTimeMinutes}
                    onChange={(e) => setCookTimeMinutes(e.target.value)}
                    placeholder="20"
                    className="w-full px-3 py-2.5 bg-[#FDECC8]/60 border border-[#F3E5D8] rounded-[16px] text-sm font-semibold text-[#3D231D] focus:outline-none focus:ring-2 focus:ring-[#E85D75]/40 shadow-xs"
                  />
                  <span className="absolute right-2.5 top-2.5 text-[11px] text-[#8C726B] pointer-events-none">
                    mins
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8C726B] mb-1">
                  Servings
                </label>
                <input
                  type="number"
                  min="1"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  placeholder="4"
                  className="w-full px-3 py-2.5 bg-[#FDECC8]/60 border border-[#F3E5D8] rounded-[16px] text-sm font-semibold text-[#3D231D] focus:outline-none focus:ring-2 focus:ring-[#E85D75]/40 shadow-xs"
                />
              </div>
            </div>

            {/* Categories / Tags (Full Pill Rounding) */}
            <div>
              <label className="block text-xs font-bold text-[#8C726B] mb-1.5">
                Categories & Tags
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {COMMON_CATEGORIES.map((cat) => {
                  const isSelected = categories.includes(cat);
                  return (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      aria-pressed={isSelected}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
                        isSelected
                          ? 'bg-[#E85D75] text-white shadow-xs font-bold border border-[#D94C65]'
                          : 'bg-white border border-[#F3E5D8] text-[#3D231D] hover:bg-[#FDECC8]'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
              {/* Custom Tag Input */}
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomTag();
                    }
                  }}
                  placeholder="Add custom tag (e.g. Gluten-Free)"
                  className="flex-1 px-3 py-2 bg-white border border-[#F3E5D8] rounded-[16px] text-xs text-[#3D231D] placeholder-[#8C726B]/50 focus:outline-none focus:border-[#E85D75]"
                />
                <button
                  type="button"
                  onClick={addCustomTag}
                  className="px-4 py-2 bg-[#FDECC8] hover:bg-[#F4A261] hover:text-white text-[#3D231D] text-xs font-bold rounded-full border border-[#F3E5D8] cursor-pointer transition-colors"
                >
                  Add Tag
                </button>
              </div>
            </div>

            {/* Structured Ingredients Section */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2.5 flex-wrap gap-2">
                <div className="flex items-center space-x-2.5 flex-wrap gap-1.5">
                  <h3 className="font-brand text-base font-bold text-[#3D231D]">Ingredients</h3>

                  {/* Two options to add measurements: US vs Metric */}
                  <div
                    role="group"
                    aria-label="Measurement system for adding ingredients"
                    className="bg-[#FDECC8]/60 border border-[#F3E5D8] rounded-full p-0.5 inline-flex items-center text-[11px] shadow-2xs"
                  >
                    <button
                      type="button"
                      onClick={() => handleFormUnitSystemChange('us')}
                      aria-pressed={formUnitSystem === 'us'}
                      className={`px-2.5 py-0.5 rounded-full transition-all duration-200 cursor-pointer ${
                        formUnitSystem === 'us'
                          ? 'bg-[#E85D75] text-white shadow-xs font-bold'
                          : 'text-[#8C726B] hover:text-[#3D231D] font-medium'
                      }`}
                      title="Add ingredients in US Customary units (cups, spoons, oz)"
                    >
                      <span>US (Cups)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleFormUnitSystemChange('metric')}
                      aria-pressed={formUnitSystem === 'metric'}
                      className={`px-2.5 py-0.5 rounded-full transition-all duration-200 cursor-pointer ${
                        formUnitSystem === 'metric'
                          ? 'bg-[#E85D75] text-white shadow-xs font-bold'
                          : 'text-[#8C726B] hover:text-[#3D231D] font-medium'
                      }`}
                      title="Add ingredients in Metric units (grams, milliliters)"
                    >
                      <span>Metric (Grams)</span>
                    </button>
                  </div>
                </div>

                <div className="flex space-x-1.5">
                  <button
                    type="button"
                    onClick={() => addIngredient()}
                    className="inline-flex items-center space-x-1 px-3.5 py-1 bg-white hover:bg-[#FDE8EA] border border-[#F3E5D8] text-[#E85D75] text-xs font-bold rounded-full transition-colors shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Add Line</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddSectionCard((prev) => !prev);
                      setNewSectionTitle('');
                    }}
                    aria-expanded={showAddSectionCard}
                    className="inline-flex items-center space-x-1 px-3.5 py-1 bg-[#FDECC8] hover:bg-[#FCE3B0] text-[#3D231D] text-xs font-bold rounded-full transition-colors border border-[#F3E5D8] cursor-pointer shadow-xs"
                    title="Add a grouped section (e.g. For the Sauce, For the Crust)"
                  >
                    <Layers className="w-3.5 h-3.5 stroke-[2.2] text-[#E85D75]" />
                    <span>+ Section</span>
                  </button>
                </div>
              </div>

              {/* Inline Add Section Creator */}
              {showAddSectionCard && (
                <div className="mb-3 bg-[#FFF0F3]/80 border border-[#E85D75]/30 rounded-[20px] p-3.5 shadow-xs space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Layers className="w-4 h-4 text-[#E85D75]" />
                      <span className="font-brand font-bold text-xs text-[#3D231D]">
                        New Ingredient Section
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddSectionCard(false)}
                      className="p-1 rounded-full text-[#8C726B] hover:text-[#3D231D] hover:bg-white/80 transition-colors cursor-pointer"
                      aria-label="Close section creator"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-[11px] text-[#8C726B]">
                    Group ingredients under a header like "For the Sauce", "For the Crust", or "Topping".
                  </p>

                  <div className="flex items-center gap-2">
                    <input
                      ref={newSectionInputRef}
                      type="text"
                      autoFocus
                      value={newSectionTitle}
                      onChange={(e) => setNewSectionTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCreateSection();
                        } else if (e.key === 'Escape') {
                          setShowAddSectionCard(false);
                        }
                      }}
                      placeholder='Section title (e.g. "For the Sauce", "For the Crust")...'
                      className="flex-1 px-3 py-1.5 bg-white border border-[#F3E5D8] rounded-[12px] text-xs font-semibold text-[#3D231D] placeholder-[#8C726B]/50 focus:outline-none focus:border-[#E85D75] focus:ring-1 focus:ring-[#E85D75]/40"
                    />
                    <button
                      type="button"
                      onClick={() => handleCreateSection()}
                      disabled={!newSectionTitle.trim()}
                      className="px-4 py-1.5 bg-[#E85D75] hover:bg-[#D94C65] disabled:opacity-40 text-white text-xs font-bold rounded-full transition-all cursor-pointer shadow-xs shrink-0"
                    >
                      Add Section
                    </button>
                  </div>

                  {/* Quick suggestion chips */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className="text-[10px] text-[#8C726B] font-medium">Suggestions:</span>
                    {['For the Sauce', 'For the Crust', 'For the Filling', 'For the Glaze', 'Topping', 'Dressing'].map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => handleCreateSection(sug)}
                        className="px-2 py-0.5 bg-white hover:bg-[#FDE8EA] border border-[#F3E5D8] rounded-full text-[10px] font-medium text-[#3D231D] hover:text-[#E85D75] transition-colors cursor-pointer"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Ingredients List: standard flat list if no sections, or structured Section Cards if sections exist */}
              {!hasNamedSections ? (
                <div className="space-y-2">
                  {ingredients.map((ing, index) => renderIngredientRow(ing, index))}
                </div>
              ) : (
                <div className="space-y-3">
                  {ingredientGroups.map((group) => {
                    const isMain = !group.section;
                    const isSecDragOver = dragOverSection === group.section;

                    return (
                      <div
                        key={group.section || 'main-section'}
                        data-ing-section={group.section}
                        onDragOver={(e) => {
                          if (draggedIngIndex === null) return;
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'move';
                          if (dragOverSection !== group.section) {
                            setDragOverSection(group.section);
                            setDragOverIngIndex(null);
                          }
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          handleIngDropOnSection(group.section);
                        }}
                        className={`rounded-[20px] overflow-hidden border transition-all ${
                          isSecDragOver
                            ? 'ring-2 ring-[#E85D75] border-[#E85D75] bg-[#FFF0F3]/40'
                            : isMain
                              ? 'bg-[#FFF8F6]/60 border-[#F3E5D8] p-2.5 space-y-2'
                              : 'bg-[#FFF8F6]/80 border-[#F3E5D8] shadow-2xs'
                        }`}
                      >
                        {/* Section Header */}
                        <div
                          className={`flex items-center justify-between gap-2 ${
                            isMain
                              ? 'pb-1 border-b border-[#F3E5D8]/80'
                              : 'bg-[#FDECC8]/50 border-b border-[#F3E5D8] px-3.5 py-2'
                          }`}
                        >
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            {!isMain && <Layers className="w-4 h-4 text-[#E85D75] shrink-0" />}
                            {isMain ? (
                              <span className="font-brand font-bold text-xs uppercase tracking-wider text-[#8C726B]">
                                Main Ingredients
                              </span>
                            ) : (
                              <input
                                type="text"
                                value={group.section}
                                onChange={(e) => handleRenameSection(group.section, e.target.value)}
                                placeholder="Section name (e.g. For the Sauce)"
                                className="font-brand font-bold text-xs uppercase tracking-wider text-[#3D231D] bg-transparent border-b border-dashed border-[#E85D75]/40 hover:border-[#E85D75] focus:border-[#E85D75] focus:outline-none px-1 py-0.5 flex-1 min-w-0"
                                title="Click to rename section"
                                aria-label="Section title"
                              />
                            )}
                          </div>

                          <div className="flex items-center space-x-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => addIngredient(group.section)}
                              className="inline-flex items-center space-x-1 px-2.5 py-1 bg-white hover:bg-[#FDE8EA] border border-[#F3E5D8] text-[#E85D75] text-[11px] font-bold rounded-full transition-colors shadow-2xs cursor-pointer"
                              title={`Add ingredient to ${group.section || 'main'}`}
                            >
                              <Plus className="w-3 h-3 stroke-[2.5]" />
                              <span>Add Line</span>
                            </button>

                            {!isMain && (
                              <button
                                type="button"
                                onClick={() => handleDeleteSection(group.section)}
                                className="p-1 text-[#8C726B] hover:text-red-500 rounded-full hover:bg-white transition-colors cursor-pointer"
                                title="Remove section header"
                                aria-label={`Remove ${group.section} section`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Ingredients Rows for this Group */}
                        <div className={isMain ? 'space-y-2' : 'p-2.5 space-y-2'}>
                          {group.items.map(({ ing, originalIndex }) => renderIngredientRow(ing, originalIndex))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Steps Section - Step cards with generous border-radius: 24px and Butter Peach */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-brand text-base font-bold text-[#3D231D]">Steps</h3>
                <button
                  type="button"
                  onClick={addStep}
                  className="inline-flex items-center space-x-1 px-3.5 py-1 bg-white hover:bg-[#FDE8EA] border border-[#F3E5D8] text-[#E85D75] text-xs font-bold rounded-full transition-colors shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add Step</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {steps.map((step, index) => {
                  const isStepDragging = draggedStepIndex === index;
                  const isStepDragOver = dragOverStepIndex === index && draggedStepIndex !== index;

                  return (
                    <div
                      key={step.id}
                      data-step-index={index}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', String(index));
                        setDraggedStepIndex(index);
                      }}
                      onDragOver={(e) => {
                        if (draggedStepIndex === null) return;
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        if (dragOverStepIndex !== index) {
                          setDragOverStepIndex(index);
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleStepDrop(index);
                      }}
                      onDragEnd={resetStepDragState}
                      className={`p-3.5 rounded-2xl shadow-xs space-y-2 border transition-all ${
                        isStepDragging
                          ? 'opacity-50 scale-[0.98] bg-[#FDECC8]/60 border-[#E85D75] ring-2 ring-[#E85D75]/30'
                          : isStepDragOver
                            ? 'bg-[#FFF0F3]/60 border-[#E85D75] ring-2 ring-[#E85D75]'
                            : 'bg-[#FDECC8]/40 border-[#F3E5D8]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <div
                            role="button"
                            tabIndex={0}
                            onPointerDown={(e) => {
                              if (e.pointerType === 'mouse' && e.button !== 0) return;
                              e.preventDefault();
                              const stepEl = e.currentTarget.closest('[data-step-index]') as HTMLElement | null;
                              const rect = stepEl?.getBoundingClientRect();
                              const offsetX = rect ? e.clientX - rect.left : 16;
                              const offsetY = rect ? e.clientY - rect.top : 20;
                              stepDragOffsetRef.current = { offsetX, offsetY };
                              setStepDragPreview({
                                x: e.clientX - offsetX,
                                y: e.clientY - offsetY,
                                width: rect?.width || 360,
                              });
                              setDraggedStepIndex(index);
                              setIsPointerDraggingStep(true);
                            }}
                            className="p-1 -ml-1 text-[#8C726B]/60 hover:text-[#E85D75] cursor-grab active:cursor-grabbing touch-none select-none rounded"
                            aria-label={`Drag to reorder Step ${step.stepNumber}`}
                            title="Drag to reorder step"
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-[#3D231D] font-brand">
                            Step {step.stepNumber}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => moveStep(index, 'up')}
                            className="p-1.5 text-[#8C726B] hover:text-[#3D231D] active:scale-95 disabled:opacity-30 cursor-pointer rounded"
                            title="Move Up"
                            aria-label="Move step up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={index === steps.length - 1}
                            onClick={() => moveStep(index, 'down')}
                            className="p-1.5 text-[#8C726B] hover:text-[#3D231D] active:scale-95 disabled:opacity-30 cursor-pointer rounded"
                            title="Move Down"
                            aria-label="Move step down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeStep(index)}
                            className="p-1.5 text-[#8C726B] hover:text-red-500 active:scale-95 ml-1 cursor-pointer rounded"
                            title="Remove Step"
                            aria-label="Remove step"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <textarea
                        rows={2}
                        value={step.instruction}
                        onChange={(e) => handleStepChange(index, e.target.value)}
                        placeholder="e.g. Warm the milk and whisk in yeast..."
                        className="w-full px-3 py-2 bg-white border border-[#F3E5D8] rounded-[16px] text-xs text-[#3D231D] placeholder-[#8C726B]/50 focus:outline-none focus:ring-2 focus:ring-[#E85D75]/40 resize-none"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Danger Zone: Delete Recipe (Only visible when editing an existing recipe) */}
            {isEditing && onDelete && (
              <div className="pt-4 border-t border-[#F3E5D8]/80">
                <div className="bg-[#FFF5F5] border border-red-200/80 rounded-[24px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-red-700">Delete this recipe</h4>
                    <p className="text-xs text-[#8C726B] mt-0.5">
                      Permanently remove this recipe from your cookbook.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="self-start sm:self-auto inline-flex items-center space-x-1.5 px-4 py-2 bg-white hover:bg-red-600 hover:text-white border border-red-300 text-red-600 text-xs font-bold rounded-full transition-colors shadow-2xs cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Recipe</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Footer Bar with Prominent Save Recipe Button and Delete Option */}
          <div className="p-4 border-t border-[#F3E5D8] bg-white shrink-0 z-20 shadow-xs flex items-center gap-2.5">
            {isEditing && onDelete && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="py-3.5 px-4 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold rounded-full text-xs sm:text-sm transition-all duration-200 cursor-pointer flex items-center justify-center space-x-1.5 shrink-0"
                aria-label="Delete Recipe"
                title="Delete Recipe"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-3.5 px-6 bg-[#E85D75] hover:bg-[#D94C65] active:scale-98 text-white font-bold rounded-full shadow-strawberry text-base transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>Save Recipe</span>
            </button>
          </div>
        </form>

        {/* Delete Confirmation Alert Dialog */}
        {showDeleteConfirm && (
          <div
            className="fixed inset-0 z-60 bg-[#3D231D]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-recipe-dialog-title"
            aria-describedby="delete-recipe-dialog-desc"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowDeleteConfirm(false);
            }}
          >
            <div className="bg-white w-full max-w-sm rounded-[24px] p-6 shadow-cozy-lg border border-[#F3E5D8] flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                <Trash2 className="w-6 h-6 stroke-[2.2]" />
              </div>

              <div className="space-y-1.5">
                <h3 id="delete-recipe-dialog-title" className="font-brand text-lg font-bold text-[#3D231D]">
                  Delete Recipe?
                </h3>
                <p id="delete-recipe-dialog-desc" className="text-xs text-[#8C726B] leading-relaxed">
                  Are you sure you want to delete <strong className="text-[#3D231D]">{title.trim() || 'this recipe'}</strong>? This action will permanently remove it from your cookbook.
                </p>
              </div>

              <div className="w-full flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  ref={deleteCancelBtnRef}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 px-4 bg-[#F3E5D8]/50 hover:bg-[#F3E5D8] text-[#3D231D] font-bold rounded-full text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 active:scale-98 text-white font-bold rounded-full text-xs transition-all duration-200 shadow-xs cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Yes, Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Drag Preview for Ingredient (follows pointer/finger) */}
        {isPointerDraggingIng && draggedIngIndex !== null && ingDragPreview && ingredients[draggedIngIndex] && (
          <div
            ref={dragOverlayRef}
            style={{
              width: ingDragPreview.width,
              transform: `translate3d(${ingDragPreview.x}px, ${ingDragPreview.y}px, 0) scale(1.02)`,
            }}
            className="fixed top-0 left-0 z-100 pointer-events-none bg-white border-2 border-[#E85D75] rounded-[16px] p-2.5 shadow-cozy-lg flex items-center space-x-2"
          >
            <GripVertical className="w-4 h-4 text-[#E85D75] shrink-0" />
            <span className="px-2 py-0.5 bg-[#FDECC8] rounded-[8px] text-xs font-bold text-[#3D231D] shrink-0">
              {ingredients[draggedIngIndex].displayFraction || ingredients[draggedIngIndex].amount || '1'}{' '}
              {ingredients[draggedIngIndex].unit}
            </span>
            <span className="text-xs font-semibold text-[#3D231D] truncate flex-1">
              {ingredients[draggedIngIndex].name || 'Ingredient'}
            </span>
          </div>
        )}

        {/* Floating Drag Preview for Step (follows pointer/finger) */}
        {isPointerDraggingStep && draggedStepIndex !== null && stepDragPreview && steps[draggedStepIndex] && (
          <div
            ref={dragOverlayRef}
            style={{
              width: stepDragPreview.width,
              transform: `translate3d(${stepDragPreview.x}px, ${stepDragPreview.y}px, 0) scale(1.02)`,
            }}
            className="fixed top-0 left-0 z-100 pointer-events-none bg-[#FFF8F6] border-2 border-[#E85D75] rounded-2xl p-3.5 shadow-cozy-lg space-y-1.5"
          >
            <div className="flex items-center space-x-1.5">
              <GripVertical className="w-4 h-4 text-[#E85D75] shrink-0" />
              <span className="text-xs font-bold text-[#3D231D] font-brand">
                Step {steps[draggedStepIndex].stepNumber}
              </span>
            </div>
            <p className="text-xs text-[#8C726B] line-clamp-2">
              {steps[draggedStepIndex].instruction || 'Step instruction...'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
