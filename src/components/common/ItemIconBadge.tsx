import React, { useState } from 'react';
import type { ResolvedItemIcon } from '../../utils/ingredientIconResolver';

interface ItemIconBadgeProps {
  icon: ResolvedItemIcon;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isCompleted?: boolean;
}

const SIZE_CONTAINER_CLASSES: Record<string, string> = {
  xs: 'w-5 h-5 rounded-md p-0.5',
  sm: 'w-6 h-6 rounded-md p-0.5',
  md: 'w-7 h-7 rounded-[8px] p-0.5',
  lg: 'w-8 h-8 rounded-lg p-1',
  xl: 'w-10 h-10 rounded-xl p-1.5',
};

const SIZE_TEXT_CLASSES: Record<string, string> = {
  xs: 'text-[11px]',
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-xl',
};

export const ItemIconBadge: React.FC<ItemIconBadgeProps> = ({
  icon,
  size = 'md',
  className = '',
  isCompleted = false,
}) => {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  const containerSize = SIZE_CONTAINER_CLASSES[size] || SIZE_CONTAINER_CLASSES.md;
  const textSize = SIZE_TEXT_CLASSES[size] || SIZE_TEXT_CLASSES.md;

  const currentImgSrc =
    failedUrl === icon.url && icon.fallbackUrl ? icon.fallbackUrl : icon.url;

  if (isCompleted) {
    return (
      <div
        className={`${containerSize} bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden opacity-60 ${className}`}
      >
        {icon.type === 'image' && icon.url ? (
          <img
            src={icon.url}
            alt={icon.label}
            className="w-full h-full object-cover grayscale opacity-60"
          />
        ) : icon.type === 'svg' && currentImgSrc ? (
          <img
            src={currentImgSrc}
            alt={icon.label}
            className="w-full h-full object-contain grayscale"
            onError={() => {
              if (icon.url) {
                setFailedUrl(icon.url);
              }
            }}
          />
        ) : (
          <span
            className={`${textSize} leading-none select-none grayscale`}
            role="img"
            aria-label={icon.label}
          >
            {icon.value}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`${containerSize} bg-[#FFF3CC] border border-[#F5E6BF] flex items-center justify-center shrink-0 overflow-hidden shadow-2xs ${className}`}
    >
      {icon.type === 'image' && icon.url ? (
        <img
          src={icon.url}
          alt={icon.label}
          className="w-full h-full object-cover rounded-[inherit]"
        />
      ) : icon.type === 'svg' && currentImgSrc ? (
        <img
          src={currentImgSrc}
          alt={icon.label}
          className="w-full h-full object-contain"
          onError={() => {
            if (icon.url) {
              setFailedUrl(icon.url);
            }
          }}
        />
      ) : (
        <span
          className={`${textSize} leading-none select-none`}
          role="img"
          aria-label={icon.label}
        >
          {icon.value}
        </span>
      )}
    </div>
  );
};
