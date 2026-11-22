import React from 'react';
import { Cloud, CloudOff, SlidersHorizontal } from 'lucide-react';
import { BotanicalBranchLeft, BotanicalBranchRight, BotanicalSprig } from '../common/Botanicals';

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
      {/* Decorative Botanical Leaf Line Art in top corners */}
      <div className="absolute -top-1 left-0 pointer-events-none opacity-90 drop-shadow-xs">
        <BotanicalBranchLeft className="w-20 h-20 sm:w-24 sm:h-24" color="#4A2C2A" />
      </div>

      <div className="absolute -top-1 right-12 pointer-events-none opacity-90 drop-shadow-xs">
        <BotanicalBranchRight className="w-20 h-20 sm:w-24 sm:h-24" color="#4A2C2A" />
      </div>

      {/* Floating background botanical accents */}
      <div className="absolute top-9 left-20 pointer-events-none opacity-40 hidden sm:block">
        <BotanicalSprig className="w-5 h-5 -rotate-45" color="#FF8FA3" />
      </div>
      <div className="absolute top-8 right-32 pointer-events-none opacity-40 hidden sm:block">
        <BotanicalSprig className="w-5 h-5 rotate-45" color="#FF8FA3" />
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
          {/* Left mini leafy accent */}
          <span className="text-[#FF8FA3] text-sm opacity-80">🌿</span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#4A2C2A] font-serif">
            My Cookbook
          </h1>
          {/* Right mini leafy accent */}
          <span className="text-[#FF8FA3] text-sm opacity-80 scale-x-[-1] inline-block">🌿</span>
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
