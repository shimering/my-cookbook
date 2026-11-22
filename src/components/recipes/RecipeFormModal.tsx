import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Camera, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import type { Recipe, Ingredient, RecipeStep } from '../../types';
import { compressImageToDataUrl } from '../../services/imageCompression';

interface RecipeFormModalProps {
  initialRecipe?: Recipe | null;
  onSave: (recipe: Recipe) => void;
  onClose: () => void;
}

const COMMON_CATEGORIES = ['Breakfast', 'Desserts', 'Quick Meals', 'Dinner', 'Drinks', 'Snacks', 'Baking'];

export const RecipeFormModal: React.FC<RecipeFormModalProps> = ({
  initialRecipe,
  onSave,
  onClose,
}) => {
  const isEditing = Boolean(initialRecipe);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalCardRef = useRef<HTMLDivElement>(null);

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

  const [title, setTitle] = useState(initialRecipe?.title || '');
  const [description, setDescription] = useState(initialRecipe?.description || '');
  const [heroImage, setHeroImage] = useState(initialRecipe?.heroImage || '');
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(initialRecipe?.prepTimeMinutes?.toString() || '15');
  const [cookTimeMinutes, setCookTimeMinutes] = useState(initialRecipe?.cookTimeMinutes?.toString() || '15');
  const [servings, setServings] = useState(initialRecipe?.servings?.toString() || '4');
  const [categories, setCategories] = useState<string[]>(initialRecipe?.categories || ['Breakfast']);
  const [customTag, setCustomTag] = useState('');

  // Structured ingredients
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    initialRecipe?.ingredients?.length
      ? initialRecipe.ingredients
      : [
          { id: '1', name: '', amount: 1, unit: 'cup', displayFraction: '1', section: '' },
          { id: '2', name: '', amount: 2, unit: 'tbsp', displayFraction: '2', section: '' },
        ]
  );

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

  // Handle Photo Upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const dataUrl = await compressImageToDataUrl(file);
      setHeroImage(dataUrl);
    } catch (err) {
      console.error('Failed to compress image:', err);
    } finally {
      setIsCompressing(false);
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

  // Ingredients Helpers
  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string | number) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const addIngredient = (section: string = '') => {
    setIngredients([
      ...ingredients,
      {
        id: `ing-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: '',
        amount: 1,
        unit: 'cup',
        displayFraction: '1',
        section,
      },
    ]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
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
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a recipe title');
      return;
    }

    const cleanIngredients = ingredients.filter((ing) => ing.name.trim().length > 0);
    const cleanSteps = steps
      .filter((s) => s.instruction.trim().length > 0)
      .map((s, idx) => ({ ...s, stepNumber: idx + 1 }));

    const recipe: Recipe = {
      id: initialRecipe?.id || `recipe-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      heroImage: heroImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      prepTimeMinutes: parseInt(prepTimeMinutes, 10) || 15,
      cookTimeMinutes: parseInt(cookTimeMinutes, 10) || 15,
      servings: parseInt(servings, 10) || 4,
      categories: categories.length ? categories : ['Other'],
      ingredients: cleanIngredients,
      steps: cleanSteps,
      isFavorite: initialRecipe?.isFavorite || false,
      createdAt: initialRecipe?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      synced: false,
    };

    onSave(recipe);
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
          <div className="w-8" />
        </div>

        {/* Semantic Form with Scrollable Content and Sticky Save Footer */}
        <form id="recipe-form" onSubmit={handleSave} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Scrollable Form Content */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 overscroll-contain">
            {/* Photo Upload Card with border-radius: 24px */}
            <div className="relative">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                capture="environment"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              {heroImage ? (
                <div className="relative w-full aspect-video rounded-[24px] overflow-hidden border border-[#F3E5D8] bg-white shadow-inner group">
                  <img src={heroImage} alt="Recipe Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-white text-[#3D231D] text-xs font-semibold rounded-full shadow-md cursor-pointer"
                    >
                      Change Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeroImage('')}
                      className="px-4 py-2 bg-red-500 text-white text-xs font-semibold rounded-full shadow-md cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-8 border-2 border-dashed border-[#F3E5D8] bg-white rounded-[24px] flex flex-col items-center justify-center cursor-pointer hover:bg-[#FDE8EA]/30 transition-all duration-200 group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#FDE8EA] flex items-center justify-center text-[#E85D75] shadow-xs mb-2 group-hover:scale-105 transition-transform">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold text-[#8C726B]">
                    {isCompressing ? 'Compressing photo...' : 'Tap to upload photo'}
                  </span>
                  <span className="text-[11px] text-[#8C726B]/70 mt-0.5">Camera or Photo Gallery</span>
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
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#E85D75] text-white shadow-xs font-bold'
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
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-brand text-base font-bold text-[#3D231D]">Ingredients</h3>
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
                      const sec = prompt('Enter section header (e.g. "For the Sauce"):');
                      if (sec) addIngredient(sec);
                    }}
                    className="inline-flex items-center space-x-1 px-3.5 py-1 bg-[#FDECC8] hover:bg-[#F4A261] hover:text-white text-[#3D231D] text-xs font-bold rounded-full transition-colors border border-[#F3E5D8] cursor-pointer"
                  >
                    <span>+ Section</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {ingredients.map((ing, index) => (
                  <div
                    key={ing.id}
                    className="flex items-center space-x-1.5 bg-white p-2 rounded-[16px] border border-[#F3E5D8] shadow-xs"
                  >
                    {/* Amount / Fraction (Butter Peach) */}
                    <input
                      type="text"
                      value={ing.displayFraction || ing.amount || ''}
                      onChange={(e) => {
                        handleIngredientChange(index, 'displayFraction', e.target.value);
                        const parsed = parseFloat(e.target.value);
                        if (!isNaN(parsed)) handleIngredientChange(index, 'amount', parsed);
                      }}
                      placeholder="Qty"
                      className="w-14 px-2 py-1.5 bg-[#FDECC8]/60 border border-[#F3E5D8] rounded-[10px] text-xs font-semibold text-center text-[#3D231D] focus:outline-none focus:border-[#E85D75]"
                    />

                    {/* Unit (Butter Peach) with Metric and US suggestions */}
                    <input
                      type="text"
                      list="common-ingredient-units"
                      value={ing.unit || ''}
                      onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                      placeholder="Unit (g, ml, cup...)"
                      className="w-24 px-2 py-1.5 bg-[#FDECC8]/60 border border-[#F3E5D8] rounded-[10px] text-xs font-medium text-[#3D231D] focus:outline-none focus:border-[#E85D75]"
                    />

                    {/* Name */}
                    <div className="flex-1">
                      <input
                        type="text"
                        value={ing.name}
                        onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                        placeholder={ing.section ? `[${ing.section}] Ingredient name` : 'Ingredient name'}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#F3E5D8] rounded-[10px] text-xs font-medium text-[#3D231D] placeholder-[#8C726B]/50 focus:outline-none focus:border-[#E85D75]"
                      />
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="p-1.5 text-[#8C726B] hover:text-red-500 rounded-lg hover:bg-[#FDE8EA] transition-colors cursor-pointer"
                      aria-label="Remove Ingredient"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Datalist for common metric & US units */}
              <datalist id="common-ingredient-units">
                <option value="g">grams (g)</option>
                <option value="kg">kilograms (kg)</option>
                <option value="ml">milliliters (ml)</option>
                <option value="l">liters (l)</option>
                <option value="cup">cup</option>
                <option value="tbsp">tablespoon (tbsp)</option>
                <option value="tsp">teaspoon (tsp)</option>
                <option value="oz">ounce (oz)</option>
                <option value="lb">pound (lb)</option>
                <option value="pinch">pinch</option>
                <option value="piece">piece</option>
                <option value="clove">clove</option>
                <option value="slice">slice</option>
                <option value="can">can</option>
              </datalist>
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
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className="bg-[#FDECC8]/40 border border-[#F3E5D8] p-3.5 rounded-[24px] shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#3D231D] font-brand">
                        Step {step.stepNumber}
                      </span>
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveStep(index, 'up')}
                          className="p-1 text-[#8C726B] hover:text-[#3D231D] disabled:opacity-30 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === steps.length - 1}
                          onClick={() => moveStep(index, 'down')}
                          className="p-1 text-[#8C726B] hover:text-[#3D231D] disabled:opacity-30 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeStep(index)}
                          className="p-1 text-[#8C726B] hover:text-red-500 ml-1 cursor-pointer"
                          title="Remove Step"
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
                ))}
              </div>
            </div>
          </div>

          {/* Sticky Footer Bar with Prominent Save Recipe Button (Full Pill Rounding) */}
          <div className="p-4 border-t border-[#F3E5D8] bg-white shrink-0 z-20 shadow-xs">
            <button
              type="submit"
              className="w-full py-3.5 px-6 bg-[#E85D75] hover:bg-[#D94C65] active:scale-98 text-white font-bold rounded-full shadow-strawberry text-base transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>Save Recipe</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
