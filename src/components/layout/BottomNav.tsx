import React from 'react';
import { Calendar, ListTodo } from 'lucide-react';

export type NavTab = 'recipes' | 'planner' | 'groceries';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  groceryBadgeCount?: number;
}

// Cute illustrated Recipe Book icon matching the user's reference mockup
const RecipeBookIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const color = isActive ? '#E85D75' : '#8C726B';
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5 transition-transform"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Book cover & spine */}
      <path d="M 4.5 17.5 V 4.5 A 1 1 0 0 1 5.5 3.5 H 18.5 A 1 1 0 0 1 19.5 4.5 V 17.5" />
      {/* Spine crease line */}
      <line x1="7" y1="3.5" x2="7" y2="17.5" />
      {/* Pages block at bottom */}
      <path d="M 7 17.5 H 18.5 A 0.8 0.8 0 0 1 19.3 18.3 V 18.7 A 0.8 0.8 0 0 1 18.5 19.5 H 6 A 1.5 1.5 0 0 1 4.5 18" />
      {/* Bottom cover edge */}
      <path d="M 4.5 18 A 2 2 0 0 0 6.5 20.5 H 19.5" />
      {/* Chef Hat outline on front cover */}
      <path
        d="M 11.2 13.2 C 10.3 13.1 9.7 11.8 10.3 10.7 C 10.6 10.1 11.2 9.7 11.8 9.8 C 12.1 8.6 13.3 7.8 14.2 8.1 C 15.1 8.4 15.8 9.4 15.6 10.4 C 16.5 10.7 17.1 11.9 16.6 12.8 C 16.4 13.2 15.8 13.3 15.4 13.2"
        strokeWidth="1.3"
      />
      <rect x="11.2" y="13.2" width="4.2" height="1.6" rx="0.3" strokeWidth="1.2" />
      {/* Spoon inside hat */}
      <ellipse cx="12.3" cy="11.1" rx="0.7" ry="1" fill={color} stroke="none" />
      <line x1="12.3" y1="12" x2="12.3" y2="13.2" strokeWidth="0.9" />
      {/* Fork inside hat */}
      <path d="M 13.7 10.3 V 11.3 C 13.7 11.6 14.1 11.8 14.4 11.8 C 14.7 11.8 15.1 11.6 15.1 11.3 V 10.3" strokeWidth="0.8" />
      <line x1="14.4" y1="10.3" x2="14.4" y2="11.4" strokeWidth="0.8" />
      <line x1="14.4" y1="11.8" x2="14.4" y2="13.2" strokeWidth="0.9" />
    </svg>
  );
};

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
            <RecipeBookIcon isActive={activeTab === 'recipes'} />
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
