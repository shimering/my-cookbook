import React from 'react';
import { Cloud, CloudOff, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { ToastAndJam } from '../common/ToastAndJam';

interface TopHeaderProps {
  onOpenSettings: () => void;
  isOnline?: boolean;
  hasCloudSync?: boolean;
  isSyncing?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onOpenSettings,
  isOnline = true,
  hasCloudSync = false,
  isSyncing = false,
}) => {
  return (
    <header className="relative pt-6 pb-4 px-4 sm:px-6 text-center no-print select-none">
      <div className="max-w-[1120px] mx-auto relative flex flex-col items-center justify-center">
        {/* Top action buttons (Sync & Settings) anchored in top right */}
        <div className="absolute top-0 right-0 flex items-center space-x-2 z-30">
          <button
            onClick={onOpenSettings}
            className="p-2.5 rounded-full bg-white hover:bg-[#FFF3CC] text-[#4A2C2A] shadow-cozy hover:shadow-cozy-lg transition-all duration-200 border border-[#F3D5DC] cursor-pointer active:scale-95"
            title="Backup & Sync Settings"
            aria-label="Settings and Cloud Sync"
          >
            {hasCloudSync ? (
              isSyncing ? (
                <RefreshCw className="w-4 h-4 text-[#FF8FA3] animate-spin" />
              ) : isOnline ? (
                <div className="relative">
                  <Cloud className="w-4 h-4 text-[#FF8FA3]" />
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#4CAF50] rounded-full" />
                </div>
              ) : (
                <CloudOff className="w-4 h-4 text-[#8A6866]" />
              )
            ) : (
              <SlidersHorizontal className="w-4 h-4 text-[#4A2C2A]" />
            )}
          </button>
        </div>

        {/* Centered Smiling Toast & Jam Illustration & Title */}
        <div className="flex flex-col items-center justify-center">
          {/* Smiling Toast & Jam Emblem (72px tall) */}
          <div className="mb-1 flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
            <ToastAndJam className="h-[72px] w-auto drop-shadow-xs" />
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#4A2C2A] font-serif">
            My Cookbook
          </h1>

          {/* Decorative Divider & Subtitle */}
          <div className="flex items-center justify-center space-x-2 mt-1.5">
            <div className="h-[1.5px] w-6 bg-[#FF8FA3]/40 rounded-full" />
            <p className="text-xs sm:text-sm font-medium text-[#8A6866] tracking-wide">
              What are we cooking today?
            </p>
            <div className="h-[1.5px] w-6 bg-[#FF8FA3]/40 rounded-full" />
          </div>
        </div>
      </div>
    </header>
  );
};
