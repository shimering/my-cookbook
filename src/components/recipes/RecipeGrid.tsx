import React, { useState, useMemo } from 'react';
import { Search, Heart, Utensils, X } from 'lucide-react';
import type { Recipe } from '../../types';
import { RecipeCard } from './RecipeCard';
import { WhiskIcon } from '../common/Botanicals';

interface RecipeGridProps {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  onAddNewRecipe: () => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

const CATEGORIES = ['All', 'Favorites', 'Breakfast', 'Desserts', 'Quick Meals', 'Dinner'];

export const RecipeGrid: React.FC<RecipeGridProps> = ({
  recipes,
  onSelectRecipe,
  onAddNewRecipe,
  onToggleFavorite,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter recipes based on search query (title or ingredient) and category
  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      // Category match
      if (selectedCategory === 'Favorites') {
        if (!recipe.isFavorite) return false;
      } else if (selectedCategory !== 'All') {
        const hasCat = recipe.categories?.some(
          (c) => c.toLowerCase() === selectedCategory.toLowerCase()
        );
        if (!hasCat) return false;
      }

      // Search match
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const titleMatch = recipe.title.toLowerCase().includes(q);
      const descMatch = recipe.description?.toLowerCase().includes(q);
      const ingredientMatch = recipe.ingredients.some((ing) =>
        ing.name.toLowerCase().includes(q)
      );

      return titleMatch || descMatch || ingredientMatch;
    });
  }, [recipes, searchQuery, selectedCategory]);

  return (
    <div className="pb-28 px-4 sm:px-6 max-w-[1120px] mx-auto">
      {/* Controls Container: Search & Filter Pills */}
      <div className="max-w-xl mx-auto mb-5 sm:mb-6">
        {/* Search Bar - Full Pill Rounding */}
        <div className="relative mb-3.5">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#8A6866]" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recipes or ingredients..."
            className="w-full pl-10 pr-9 py-2.5 bg-white border border-[#F3D5DC] rounded-full text-sm placeholder-[#8A6866]/60 text-[#4A2C2A] shadow-cozy focus:outline-none focus:ring-2 focus:ring-[#FF8FA3]/40 focus:border-[#FF8FA3] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8A6866] hover:text-[#4A2C2A] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter Pills - Full Pill Rounding */}
        <div className="flex items-center justify-start sm:justify-center space-x-2 overflow-x-auto no-scrollbar py-1 -mx-1 px-1">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center space-x-1 cursor-pointer ${
                  isActive
                    ? 'bg-[#FF8FA3] text-white shadow-pink-glow font-bold'
                    : 'bg-white text-[#4A2C2A] hover:bg-[#FFE599]/50 border border-[#F3D5DC]'
                }`}
              >
                {cat === 'Favorites' && <Heart className="w-3 h-3 fill-current inline-block mr-0.5" />}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Responsive Recipe Grid (2 cols mobile, 3-4 cols desktop) */}
      {filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onSelect={onSelectRecipe}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border border-[#F3D5DC] rounded-[24px] p-8 text-center my-8 shadow-cozy max-w-md mx-auto">
          <div className="w-14 h-14 bg-[#FFF0F3] rounded-full flex items-center justify-center mx-auto mb-3 text-[#FF8FA3]">
            <Utensils className="w-7 h-7 stroke-[1.8]" />
          </div>
          <h4 className="font-serif text-lg font-bold text-[#4A2C2A] mb-1">
            No recipes found
          </h4>
          <p className="text-xs text-[#8A6866] max-w-xs mx-auto mb-4 leading-relaxed">
            {searchQuery
              ? `No recipes matched "${searchQuery}". Try a different keyword.`
              : `You don't have any recipes in this category yet.`}
          </p>
          <button
            onClick={onAddNewRecipe}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#FF8FA3] hover:bg-[#FF758F] text-white text-xs font-bold rounded-full shadow-pink-glow transition-all cursor-pointer"
          >
            <WhiskIcon className="w-4 h-4 text-white" />
            <span>Create New Recipe</span>
          </button>
        </div>
      )}

      {/* Floating Action Button (FAB) - Whisk Icon (Positioned above BottomNav) */}
      <button
        onClick={onAddNewRecipe}
        className="fixed bottom-24 right-5 sm:bottom-28 sm:right-8 z-50 w-14 h-14 bg-[#FF8FA3] hover:bg-[#FF758F] active:scale-95 text-white rounded-full shadow-cozy-lg flex items-center justify-center transition-all duration-200 border-2 border-white focus:outline-none focus:ring-4 focus:ring-[#FF8FA3]/30 no-print cursor-pointer"
        title="Add New Recipe"
        aria-label="Add New Recipe"
      >
        <WhiskIcon className="w-7 h-7 text-white" />
      </button>
    </div>
  );
};
