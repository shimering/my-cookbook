import React from 'react';
import { Clock, Heart } from 'lucide-react';
import type { Recipe } from '../../types';

interface RecipeCardProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onSelect,
  onToggleFavorite,
}) => {
  const [imgSrc, setImgSrc] = React.useState(
    recipe.heroImage ||
      'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=600&q=80'
  );

  return (
    <div
      onClick={() => onSelect(recipe)}
      className="group relative bg-[#FFF3CC] border border-[#F5E6BF] rounded-[24px] p-2.5 sm:p-3 shadow-cozy hover:shadow-cozy-lg transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden hover:-translate-y-1"
    >
      {/* Recipe Photo */}
      <div className="relative w-full aspect-square rounded-[18px] overflow-hidden bg-[#FFE599]/40 mb-2.5">
        <img
          src={imgSrc}
          alt={recipe.title}
          loading="lazy"
          onError={() =>
            setImgSrc(
              'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=600&q=80'
            )
          }
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Category Pill Tag */}
        {recipe.categories && recipe.categories.length > 0 && (
          <span className="absolute top-2 left-2 bg-white/95 backdrop-blur-xs text-[#4A2C2A] text-[10px] font-semibold px-2.5 py-0.5 rounded-full shadow-xs border border-[#F5E6BF]">
            {recipe.categories[0]}
          </span>
        )}
      </div>

      {/* Recipe Title */}
      <h3 className="font-serif text-[15px] sm:text-base font-bold text-[#4A2C2A] leading-snug line-clamp-1 mb-1.5 px-0.5">
        {recipe.title}
      </h3>

      {/* Footer Info: Prep Time & Favorite Heart */}
      <div className="flex items-center justify-between text-xs text-[#8A6866] pt-0.5 px-0.5">
        <div className="flex items-center space-x-1">
          <Clock className="w-3.5 h-3.5 stroke-[2.2] text-[#8A6866]" />
          <span>{recipe.prepTimeMinutes ? `${recipe.prepTimeMinutes} mins` : 'Quick'}</span>
        </div>

        {/* Favorite Heart Button */}
        <button
          type="button"
          onClick={(e) => onToggleFavorite(recipe.id, e)}
          className="p-1.5 rounded-full hover:bg-white/80 transition-colors"
          title={recipe.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-label={recipe.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            className={`w-4 h-4 transition-transform active:scale-125 ${
              recipe.isFavorite
                ? 'fill-[#FF8FA3] text-[#FF8FA3]'
                : 'text-[#8A6866] hover:text-[#FF8FA3]'
            }`}
          />
        </button>
      </div>
    </div>
  );
};
