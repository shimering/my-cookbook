import React from 'react';
import { Cloud, CloudOff, RefreshCw, SlidersHorizontal } from 'lucide-react';
import toastAndJamImg from '../../assets/toast-and-jam.png';

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
            className="p-2.5 rounded-full bg-white hover:bg-[#FDECC8]/50 text-[#3D231D] shadow-cozy hover:shadow-cozy-lg transition-all duration-200 border border-[#F3E5D8] cursor-pointer active:scale-95"
            title="Backup & Sync Settings"
            aria-label="Settings and Cloud Sync"
          >
            {hasCloudSync ? (
              isSyncing ? (
                <RefreshCw className="w-4 h-4 text-[#E85D75] animate-spin" />
              ) : isOnline ? (
                <div className="relative">
                  <Cloud className="w-4 h-4 text-[#E85D75]" />
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#4CAF50] rounded-full" />
                </div>
              ) : (
                <CloudOff className="w-4 h-4 text-[#8C726B]" />
              )
            ) : (
              <SlidersHorizontal className="w-4 h-4 text-[#3D231D]" />
            )}
          </button>
        </div>

        {/* Centered Smiling Toast & Jam Illustration & Title */}
        <div className="flex flex-col items-center justify-center">
          {/* Smiling Toast & Jam Mascot with stars and hearts */}
          <div className="mb-2 flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
            <img
              src={toastAndJamImg}
              alt="Smiling Toast and Jam Mascot"
              className="h-28 sm:h-32 w-auto object-contain drop-shadow-sm select-none"
            />
          </div>

          {/* Title in Dark Cocoa */}
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#3D231D] font-brand">
            My Cookbook
          </h1>

          {/* Subtitle in Warm Taupe */}
          <div className="flex items-center justify-center space-x-2 mt-1.5">
            <div className="h-[1.5px] w-6 bg-[#E85D75]/40 rounded-full" />
            <p className="text-xs sm:text-sm font-semibold text-[#8C726B] tracking-wide">
              What are we cooking today?
            </p>
            <div className="h-[1.5px] w-6 bg-[#E85D75]/40 rounded-full" />
          </div>
        </div>
      </div>
    </header>
  );
};
