import React from 'react';
import { Calendar, ListTodo } from 'lucide-react';

export type NavTab = 'recipes' | 'planner' | 'groceries';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  groceryBadgeCount?: number;
}

// Cute tiny strawberry icon for Recipes tab
const StrawberryIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <svg
    viewBox="0 0 24 24"
    className="w-5 h-5 transition-transform"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Leaves */}
    <path
      d="M12 2.5C11.2 3.8 9.5 4.3 7.8 3.8C8.3 5.1 9.6 5.9 11 5.9C9.7 6.8 8.3 7.2 7 6.7C8.4 8 10.2 8 11.5 7.5C11.1 8.8 11.6 10.1 12.5 10.1C13.4 10.1 13.9 8.8 13.5 7.5C14.8 8 16.6 8 18 6.7C16.7 7.2 15.3 6.8 14 5.9C15.4 5.9 16.7 5.1 17.2 3.8C15.5 4.3 13.8 3.8 13 2.5H12Z"
      fill="#2E7D32"
    />
    {/* Strawberry berry */}
    <path
      d="M12 6.8C8.2 6.8 5.8 9.7 5.8 13.2C5.8 17.2 9.7 20.8 12 21.8C14.3 20.8 18.2 17.2 18.2 13.2C18.2 9.7 15.8 6.8 12 6.8Z"
      fill={isActive ? '#E85D75' : '#8C726B'}
    />
    {/* Seeds */}
    <circle cx="9.5" cy="11.5" r="0.7" fill="#FFE599" />
    <circle cx="14.5" cy="11.5" r="0.7" fill="#FFE599" />
    <circle cx="12" cy="14" r="0.7" fill="#FFE599" />
    <circle cx="9.2" cy="16" r="0.7" fill="#FFE599" />
    <circle cx="14.8" cy="16" r="0.7" fill="#FFE599" />
    <circle cx="12" cy="18.2" r="0.7" fill="#FFE599" />
  </svg>
);

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  groceryBadgeCount = 0,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#F3E5D8] px-6 py-2 pb-safe no-print shadow-cozy">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* Recipes Tab (Deep Strawberry Pink) */}
        <button
          onClick={() => onTabChange('recipes')}
          className={`flex flex-col items-center py-1.5 px-3.5 sm:px-4 rounded-full transition-all duration-200 cursor-pointer ${
            activeTab === 'recipes'
              ? 'text-[#E85D75] font-bold bg-[#FDE8EA] shadow-xs'
              : 'text-[#8C726B] hover:text-[#3D231D] hover:bg-black/5'
          }`}
          aria-label="Cookbook Recipes"
        >
          <div className="p-0.5">
            <StrawberryIcon isActive={activeTab === 'recipes'} />
          </div>
          <span className="text-xs mt-0.5">Recipes</span>
        </button>

        {/* Meal Planner Tab (Purple) */}
        <button
          onClick={() => onTabChange('planner')}
          className={`flex flex-col items-center py-1.5 px-3.5 sm:px-4 rounded-full transition-all duration-200 cursor-pointer ${
            activeTab === 'planner'
              ? 'text-[#8B5CF6] font-bold bg-[#F3E8FF] shadow-xs'
              : 'text-[#8C726B] hover:text-[#3D231D] hover:bg-black/5'
          }`}
          aria-label="Weekly Meal Planner"
        >
          <div className="p-0.5">
            <Calendar className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-xs mt-0.5">Meal Planner</span>
        </button>

        {/* Shopping List Tab (Green) */}
        <button
          onClick={() => onTabChange('groceries')}
          className={`flex flex-col items-center py-1.5 px-3.5 sm:px-4 rounded-full transition-all duration-200 relative cursor-pointer ${
            activeTab === 'groceries'
              ? 'text-[#16A34A] font-bold bg-[#ECFDF5] shadow-xs'
              : 'text-[#8C726B] hover:text-[#3D231D] hover:bg-black/5'
          }`}
          aria-label="Grocery Shopping List"
        >
          <div className="p-0.5">
            <ListTodo className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-xs mt-0.5">Shopping List</span>
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
