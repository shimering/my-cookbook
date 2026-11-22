import React from 'react';
import { X, Printer } from 'lucide-react';
import type { Recipe } from '../../types';

interface PrintableCookbookProps {
  recipes: Recipe[];
  onClose: () => void;
}

export const PrintableCookbook: React.FC<PrintableCookbookProps> = ({ recipes, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      {/* Non-printed Floating Action Bar */}
      <div className="sticky top-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-b border-[#F3D5DC] px-6 py-3 flex items-center justify-between no-print shadow-xs">
        <div>
          <h2 className="font-serif text-lg font-bold text-[#4A2C2A]">
            Print Preview ({recipes.length} {recipes.length === 1 ? 'Recipe' : 'Recipes'})
          </h2>
          <span className="text-xs text-[#8A6866]">
            Use your browser's print dialog to save as PDF or print physically.
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#FF8FA3] hover:bg-[#FF758F] text-white text-xs font-bold rounded-full shadow-pink-glow transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#FFF5F7] text-[#4A2C2A] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Printable Recipes Container */}
      <div className="max-w-3xl mx-auto p-8 font-sans">
        {recipes.map((recipe, index) => (
          <div
            key={recipe.id}
            className={`pb-12 ${index < recipes.length - 1 ? 'page-break mb-12 border-b border-[#F3D5DC]' : ''}`}
          >
            {/* Header */}
            <div className="text-center pb-6 border-b border-[#F3D5DC]/60 mb-6">
              <span className="text-xs uppercase tracking-widest text-[#FF8FA3] font-bold">
                My Cookbook
              </span>
              <h1 className="font-serif text-3xl font-bold text-[#4A2C2A] mt-1 mb-2">
                {recipe.title}
              </h1>
              {recipe.description && (
                <p className="text-sm text-gray-600 max-w-xl mx-auto italic">
                  {recipe.description}
                </p>
              )}
              <div className="flex items-center justify-center space-x-4 text-xs font-semibold text-gray-500 mt-3">
                <span>⏱ Prep: {recipe.prepTimeMinutes} mins</span>
                <span>🔥 Cook: {recipe.cookTimeMinutes || 0} mins</span>
                <span>👥 Servings: {recipe.servings}</span>
              </div>
            </div>

            {/* Photo & Ingredients Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {recipe.heroImage && (
                <div className="rounded-[20px] overflow-hidden aspect-4/3 max-h-72 bg-[#FFF5F7] border border-[#F3D5DC]">
                  <img
                    src={recipe.heroImage}
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Ingredients List */}
              <div>
                <h3 className="font-serif text-lg font-bold text-[#4A2C2A] mb-3 pb-1 border-b border-[#F3D5DC]">
                  Ingredients
                </h3>
                <ul className="space-y-1.5 text-xs text-gray-800">
                  {recipe.ingredients.map((ing) => (
                    <li key={ing.id} className="flex items-baseline space-x-2">
                      <span className="w-2 h-2 rounded-full bg-[#FF8FA3] shrink-0 translate-y-0.5" />
                      <span>
                        <strong className="font-bold">
                          {ing.displayFraction || ing.amount} {ing.unit}
                        </strong>{' '}
                        {ing.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Numbered Steps */}
            <div>
              <h3 className="font-serif text-lg font-bold text-[#4A2C2A] mb-3 pb-1 border-b border-[#F3D5DC]">
                Instructions
              </h3>
              <div className="space-y-3 text-xs leading-relaxed text-gray-800">
                {recipe.steps.map((step) => (
                  <div key={step.id} className="flex items-start space-x-3">
                    <span className="w-5 h-5 rounded-full bg-[#FFE599] text-[#4A2C2A] font-bold text-center leading-5 shrink-0 text-[11px] border border-[#F5E6BF]">
                      {step.stepNumber}
                    </span>
                    <p className="pt-0.5">{step.instruction}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
