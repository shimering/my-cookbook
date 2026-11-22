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
        {/* Recipes Tab */}
        <button
          onClick={() => onTabChange('recipes')}
          className={`flex flex-col items-center py-1 px-4 rounded-2xl transition-all duration-200 ${
            activeTab === 'recipes'
              ? 'text-[#FF8FA3] font-semibold scale-105'
              : 'text-[#8A6866] hover:text-[#4A2C2A]'
          }`}
          aria-label="Cookbook Recipes"
        >
          <div className={`p-1.5 rounded-full ${activeTab === 'recipes' ? 'bg-[#FFF0F3]' : ''}`}>
            <BookOpen className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-xs mt-0.5">Recipes</span>
        </button>

        {/* Meal Plan Tab */}
        <button
          onClick={() => onTabChange('planner')}
          className={`flex flex-col items-center py-1 px-4 rounded-2xl transition-all duration-200 ${
            activeTab === 'planner'
              ? 'text-[#FF8FA3] font-semibold scale-105'
              : 'text-[#8A6866] hover:text-[#4A2C2A]'
          }`}
          aria-label="Weekly Meal Planner"
        >
          <div className={`p-1.5 rounded-full ${activeTab === 'planner' ? 'bg-[#FFF0F3]' : ''}`}>
            <Calendar className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-xs mt-0.5">Meal Plan</span>
        </button>

        {/* Groceries Tab */}
        <button
          onClick={() => onTabChange('groceries')}
          className={`flex flex-col items-center py-1 px-4 rounded-2xl transition-all duration-200 relative ${
            activeTab === 'groceries'
              ? 'text-[#FF8FA3] font-semibold scale-105'
              : 'text-[#8A6866] hover:text-[#4A2C2A]'
          }`}
          aria-label="Grocery Shopping List"
        >
          <div className={`p-1.5 rounded-full ${activeTab === 'groceries' ? 'bg-[#FFF0F3]' : ''}`}>
            <ShoppingBasket className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-xs mt-0.5">Groceries</span>
          {groceryBadgeCount > 0 && (
            <span className="absolute top-1 right-3 bg-[#FF8FA3] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[18px] text-center shadow-sm">
              {groceryBadgeCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
};
