import React from 'react';

interface BotanicalProps {
  className?: string;
  color?: string;
}

/**
 * Hand-drawn botanical branch with multiple leaf pairs and delicate berry buds.
 * Inspired by cozy bakery & botanical stationery artwork.
 */
export const BotanicalBranchLeft: React.FC<BotanicalProps> = ({
  className = "w-16 h-16",
  color = "#4A2C2A"
}) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Main Stem */}
    <path
      d="M10 90 C 25 70, 50 50, 85 15"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    {/* Secondary small curving branch */}
    <path
      d="M38 60 C 50 64, 62 72, 70 82"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
    />

    {/* Leaf Pair 1 (Bottom) */}
    <path
      d="M22 75 C 10 74, 5 62, 14 56 C 24 60, 24 70, 22 75 Z"
      fill="#FCE4EC"
      stroke={color}
      strokeWidth="1.8"
    />
    <path
      d="M32 68 C 38 56, 52 56, 48 68 C 42 74, 34 72, 32 68 Z"
      fill="#FFF0F3"
      stroke={color}
      strokeWidth="1.8"
    />

    {/* Leaf Pair 2 (Mid-low) */}
    <path
      d="M40 54 C 28 50, 24 38, 34 34 C 42 38, 43 47, 40 54 Z"
      fill="#FCE4EC"
      stroke={color}
      strokeWidth="1.8"
    />
    <path
      d="M52 46 C 58 35, 70 37, 66 48 C 60 54, 52 51, 52 46 Z"
      fill="#FFF0F3"
      stroke={color}
      strokeWidth="1.8"
    />

    {/* Leaf Pair 3 (Mid-high) */}
    <path
      d="M58 36 C 48 30, 48 18, 57 16 C 64 21, 63 30, 58 36 Z"
      fill="#FCE4EC"
      stroke={color}
      strokeWidth="1.8"
    />
    <path
      d="M70 28 C 76 18, 86 21, 83 31 C 78 36, 71 34, 70 28 Z"
      fill="#FFF0F3"
      stroke={color}
      strokeWidth="1.8"
    />

    {/* Tip Leaf */}
    <path
      d="M85 15 C 82 4, 94 4, 94 12 C 94 18, 88 19, 85 15 Z"
      fill="#FCE4EC"
      stroke={color}
      strokeWidth="1.8"
    />

    {/* Secondary Branch Leaves */}
    <path
      d="M52 68 C 50 60, 58 56, 61 63 C 60 68, 55 70, 52 68 Z"
      fill="#FFF0F3"
      stroke={color}
      strokeWidth="1.5"
    />
    <path
      d="M66 76 C 68 68, 76 68, 77 74 C 76 80, 70 80, 66 76 Z"
      fill="#FCE4EC"
      stroke={color}
      strokeWidth="1.5"
    />

    {/* Strawberry Berry Accents */}
    <circle cx="28" cy="58" r="3.2" fill="#FF8FA3" stroke={color} strokeWidth="1.2" />
    <circle cx="60" cy="40" r="2.8" fill="#FF8FA3" stroke={color} strokeWidth="1.2" />
    <circle cx="76" cy="22" r="2.4" fill="#FFE599" stroke={color} strokeWidth="1.2" />
  </svg>
);

export const BotanicalBranchRight: React.FC<BotanicalProps> = ({
  className = "w-16 h-16",
  color = "#4A2C2A"
}) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g transform="translate(100, 0) scale(-1, 1)">
      {/* Main Stem */}
      <path
        d="M10 90 C 25 70, 50 50, 85 15"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Secondary small curving branch */}
      <path
        d="M38 60 C 50 64, 62 72, 70 82"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Leaf Pair 1 */}
      <path
        d="M22 75 C 10 74, 5 62, 14 56 C 24 60, 24 70, 22 75 Z"
        fill="#FCE4EC"
        stroke={color}
        strokeWidth="1.8"
      />
      <path
        d="M32 68 C 38 56, 52 56, 48 68 C 42 74, 34 72, 32 68 Z"
        fill="#FFF0F3"
        stroke={color}
        strokeWidth="1.8"
      />

      {/* Leaf Pair 2 */}
      <path
        d="M40 54 C 28 50, 24 38, 34 34 C 42 38, 43 47, 40 54 Z"
        fill="#FCE4EC"
        stroke={color}
        strokeWidth="1.8"
      />
      <path
        d="M52 46 C 58 35, 70 37, 66 48 C 60 54, 52 51, 52 46 Z"
        fill="#FFF0F3"
        stroke={color}
        strokeWidth="1.8"
      />

      {/* Leaf Pair 3 */}
      <path
        d="M58 36 C 48 30, 48 18, 57 16 C 64 21, 63 30, 58 36 Z"
        fill="#FCE4EC"
        stroke={color}
        strokeWidth="1.8"
      />
      <path
        d="M70 28 C 76 18, 86 21, 83 31 C 78 36, 71 34, 70 28 Z"
        fill="#FFF0F3"
        stroke={color}
        strokeWidth="1.8"
      />

      {/* Tip Leaf */}
      <path
        d="M85 15 C 82 4, 94 4, 94 12 C 94 18, 88 19, 85 15 Z"
        fill="#FCE4EC"
        stroke={color}
        strokeWidth="1.8"
      />

      {/* Secondary Branch Leaves */}
      <path
        d="M52 68 C 50 60, 58 56, 61 63 C 60 68, 55 70, 52 68 Z"
        fill="#FFF0F3"
        stroke={color}
        strokeWidth="1.5"
      />
      <path
        d="M66 76 C 68 68, 76 68, 77 74 C 76 80, 70 80, 66 76 Z"
        fill="#FCE4EC"
        stroke={color}
        strokeWidth="1.5"
      />

      {/* Berries */}
      <circle cx="28" cy="58" r="3.2" fill="#FF8FA3" stroke={color} strokeWidth="1.2" />
      <circle cx="60" cy="40" r="2.8" fill="#FF8FA3" stroke={color} strokeWidth="1.2" />
      <circle cx="76" cy="22" r="2.4" fill="#FFE599" stroke={color} strokeWidth="1.2" />
    </g>
  </svg>
);

/**
 * Delicate botanical sprig with floating leaves and star sparkles for header & section framing.
 */
export const BotanicalSprig: React.FC<BotanicalProps> = ({
  className = "w-6 h-6",
  color = "#4A2C2A"
}) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M5 35 C 15 25, 25 15, 35 5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <path d="M14 26 C 8 26, 6 20, 10 18 C 16 19, 16 24, 14 26 Z" fill="#FCE4EC" stroke={color} strokeWidth="1.4" />
    <path d="M22 20 C 25 14, 31 15, 29 20 C 26 23, 23 22, 22 20 Z" fill="#FFF0F3" stroke={color} strokeWidth="1.4" />
    <path d="M27 13 C 24 8, 30 6, 32 10 C 31 13, 29 14, 27 13 Z" fill="#FCE4EC" stroke={color} strokeWidth="1.4" />
    <circle cx="18" cy="22" r="2" fill="#FF8FA3" />
  </svg>
);

/**
 * Cute hand-drawn whisk icon
 */
export const WhiskIcon: React.FC<{ className?: string; color?: string }> = ({
  className = "w-6 h-6",
  color = "currentColor"
}) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g transform="translate(12,12) rotate(-45) translate(-12,-12)" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 15L12 21" strokeWidth="2.5" />
      <circle cx="12" cy="21.5" r="1" fill={color} />
      <rect x="10.5" y="13.5" width="3" height="2" rx="0.8" fill={color} />
      <path d="M12 13.5C8.5 10 7.5 5 12 2C16.5 5 15.5 10 12 13.5Z" />
      <path d="M12 13.5C9.5 9.5 9 4.5 12 2C15 4.5 14.5 9.5 12 13.5Z" />
      <path d="M12 13.5C10.5 8.5 10.5 4 12 2C13.5 4 13.5 8.5 12 13.5Z" />
    </g>
  </svg>
);
