import React from 'react';
import { Cloud, CloudOff, SlidersHorizontal } from 'lucide-react';
import { BotanicalBranchLeft, BotanicalBranchRight, BotanicalFlourish } from '../common/Botanicals';

interface TopHeaderProps {
  onOpenSettings: () => void;
  isOnline?: boolean;
  hasCloudSync?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onOpenSettings,
  isOnline = true,
  hasCloudSync = false,
}) => {
  return (
    <header className="relative pt-6 pb-5 px-5 text-center overflow-hidden no-print select-none">
      {/* Decorative Botanical Leaf Line Art in top corners - graceful & delicate */}
      <div className="absolute top-0 left-0 pointer-events-none opacity-85">
        <BotanicalBranchLeft className="w-16 h-16 sm:w-20 sm:h-20" color="#4A2C2A" />
      </div>

      <div className="absolute top-0 right-10 pointer-events-none opacity-85">
        <BotanicalBranchRight className="w-16 h-16 sm:w-20 sm:h-20" color="#4A2C2A" />
      </div>

      {/* Top action buttons (Sync & Settings) */}
      <div className="absolute top-4 right-4 flex items-center space-x-2 z-30">
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-full bg-white/90 hover:bg-white text-[#4A2C2A] shadow-sm hover:shadow transition-all duration-200 border border-[#F3D5DC] cursor-pointer active:scale-95"
          title="Backup & Sync Settings"
          aria-label="Settings and Cloud Sync"
        >
          {hasCloudSync ? (
            isOnline ? (
              <Cloud className="w-4 h-4 text-[#FF8FA3]" />
            ) : (
              <CloudOff className="w-4 h-4 text-[#8A6866]" />
            )
          ) : (
            <SlidersHorizontal className="w-4 h-4 text-[#4A2C2A]" />
          )}
        </button>
      </div>

      {/* Main Title & Subtitle with Botanical Flair */}
      <div className="relative z-10 pt-1">
        <div className="inline-flex items-center justify-center space-x-2">
          {/* Left delicate leafy flourish */}
          <BotanicalFlourish className="w-4 h-4 text-[#FF8FA3] opacity-80" color="#FF8FA3" />
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#4A2C2A] font-serif">
            My Cookbook
          </h1>
          {/* Right delicate leafy flourish */}
          <BotanicalFlourish className="w-4 h-4 text-[#FF8FA3] opacity-80 scale-x-[-1] inline-block" color="#FF8FA3" />
        </div>

        <div className="flex items-center justify-center space-x-2 mt-1">
          <div className="h-[1px] w-6 bg-[#FFB3C1]/50 rounded-full" />
          <p className="text-xs sm:text-sm font-medium text-[#8A6866] tracking-wide">
            What are we cooking today?
          </p>
          <div className="h-[1px] w-6 bg-[#FFB3C1]/50 rounded-full" />
        </div>
      </div>
    </header>
  );
};
