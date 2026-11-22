import React from 'react';
import { Cloud, CloudOff, SlidersHorizontal } from 'lucide-react';
import { BotanicalBranchLeft, BotanicalBranchRight } from '../common/Botanicals';

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
    <header className="relative pt-6 pb-4 px-5 text-center overflow-hidden no-print">
      {/* Decorative Botanical Leaf Line Art in top corners */}
      <div className="absolute -top-1 left-1 pointer-events-none opacity-85">
        <BotanicalBranchLeft className="w-14 h-14" color="#4A2C2A" />
      </div>
      <div className="absolute -top-1 right-1 pointer-events-none opacity-85">
        <BotanicalBranchRight className="w-14 h-14" color="#4A2C2A" />
      </div>

      {/* Top action buttons (Sync & Settings) */}
      <div className="absolute top-4 right-4 flex items-center space-x-2 z-30">
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-full bg-white/90 hover:bg-white text-[#4A2C2A] shadow-sm hover:shadow transition-all duration-200 border border-[#F3D5DC] cursor-pointer"
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

      {/* Main Title & Subtitle */}
      <div className="relative z-10 pt-2">
        <h1 className="text-3xl font-bold tracking-tight text-[#4A2C2A] font-serif">
          My Cookbook
        </h1>
        <p className="text-sm font-medium text-[#8A6866] mt-1 tracking-wide">
          What are we cooking today?
        </p>
      </div>
    </header>
  );
};
