import React from 'react';
import { BookOpen, Calendar, ShoppingBasket } from 'lucide-react';

export type NavTab = 'recipes' | 'planner' | 'groceries';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  groceryBadgeCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  groceryBadgeCount = 0,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#F3D5DC] px-6 py-2 pb-safe no-print">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* Recipes Tab (Pink) */}
        <button
          onClick={() => onTabChange('recipes')}
          className={`flex flex-col items-center py-1.5 px-3.5 sm:px-4 rounded-full transition-all duration-200 cursor-pointer ${
            activeTab === 'recipes'
              ? 'text-[#FF8FA3] font-semibold bg-[#FFF0F3] shadow-xs'
              : 'text-[#8A6866] hover:text-[#4A2C2A] hover:bg-black/5'
          }`}
          aria-label="Cookbook Recipes"
        >
          <div className="p-0.5">
            <BookOpen className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-xs mt-0.5">Recipes</span>
        </button>

        {/* Meal Plan Tab (Purple) */}
        <button
          onClick={() => onTabChange('planner')}
          className={`flex flex-col items-center py-1.5 px-3.5 sm:px-4 rounded-full transition-all duration-200 cursor-pointer ${
            activeTab === 'planner'
              ? 'text-[#8B5CF6] font-semibold bg-[#F3E8FF] shadow-xs'
              : 'text-[#8A6866] hover:text-[#4A2C2A] hover:bg-black/5'
          }`}
          aria-label="Weekly Meal Planner"
        >
          <div className="p-0.5">
            <Calendar className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-xs mt-0.5">Meal Plan</span>
        </button>

        {/* Groceries Tab (Green) */}
        <button
          onClick={() => onTabChange('groceries')}
          className={`flex flex-col items-center py-1.5 px-3.5 sm:px-4 rounded-full transition-all duration-200 relative cursor-pointer ${
            activeTab === 'groceries'
              ? 'text-[#16A34A] font-semibold bg-[#ECFDF5] shadow-xs'
              : 'text-[#8A6866] hover:text-[#4A2C2A] hover:bg-black/5'
          }`}
          aria-label="Grocery Shopping List"
        >
          <div className="p-0.5">
            <ShoppingBasket className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-xs mt-0.5">Groceries</span>
          {groceryBadgeCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#16A34A] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[18px] text-center shadow-xs">
              {groceryBadgeCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
};
