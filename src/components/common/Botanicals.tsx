import React from 'react';

interface BotanicalProps {
  className?: string;
  color?: string;
}

/**
 * Hand-drawn botanical branch with elegant pointed leaves, delicate leaf veins,
 * and subtle pastel berry accents.
 * Designed to faithfully capture the cozy bakery & stationery aesthetic from the mockup.
 */
export const BotanicalBranchLeft: React.FC<BotanicalProps> = ({
  className = "w-16 h-16",
  color = "#4A2C2A"
}) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Main Stem with natural organic curve */}
    <path
      d="M 8 8 C 22 28, 42 60, 82 88"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    {/* Secondary arching stem */}
    <path
      d="M 40 48 C 52 56, 68 64, 86 68"
      stroke={color}
      strokeWidth="1.3"
      strokeLinecap="round"
    />

    {/* Leaf 1 (Top Left) - elegant pointed leaf with midrib */}
    <path
      d="M 18 22 C 10 20, 5 15, 4 12 C 7 18, 13 25, 18 22 Z"
      fill="#FCE8EC"
      stroke={color}
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path d="M 18 22 L 7 14" stroke={color} strokeWidth="0.9" strokeLinecap="round" />

    {/* Leaf 2 (Top Right) */}
    <path
      d="M 23 28 C 30 22, 38 20, 42 21 C 39 27, 31 32, 23 28 Z"
      fill="#FFF2F4"
      stroke={color}
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path d="M 23 28 L 38 22" stroke={color} strokeWidth="0.9" strokeLinecap="round" />

    {/* Leaf 3 (Mid-low Left) */}
    <path
      d="M 32 40 C 22 35, 14 34, 12 37 C 16 43, 25 46, 32 40 Z"
      fill="#FCE8EC"
      stroke={color}
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path d="M 32 40 L 15 37" stroke={color} strokeWidth="0.9" strokeLinecap="round" />

    {/* Leaf 4 (Mid-high Right) */}
    <path
      d="M 38 46 C 47 39, 56 38, 60 40 C 56 47, 47 52, 38 46 Z"
      fill="#FFF2F4"
      stroke={color}
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path d="M 38 46 L 56 41" stroke={color} strokeWidth="0.9" strokeLinecap="round" />

    {/* Leaf 5 (Lower Left) */}
    <path
      d="M 49 59 C 39 57, 31 60, 29 63 C 35 69, 44 67, 49 59 Z"
      fill="#FCE8EC"
      stroke={color}
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path d="M 49 59 L 32 62" stroke={color} strokeWidth="0.9" strokeLinecap="round" />

    {/* Sub-branch Leaf 1 */}
    <path
      d="M 58 58 C 65 52, 73 51, 76 53 C 73 59, 66 62, 58 58 Z"
      fill="#FFF2F4"
      stroke={color}
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <path d="M 58 58 L 73 53" stroke={color} strokeWidth="0.8" strokeLinecap="round" />

    {/* Sub-branch Leaf 2 */}
    <path
      d="M 72 65 C 79 61, 86 61, 88 63 C 86 68, 80 70, 72 65 Z"
      fill="#FCE8EC"
      stroke={color}
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <path d="M 72 65 L 85 63" stroke={color} strokeWidth="0.8" strokeLinecap="round" />

    {/* Main Stem Tip Leaf */}
    <path
      d="M 78 84 C 83 91, 91 94, 96 95 C 94 88, 87 83, 78 84 Z"
      fill="#FCE8EC"
      stroke={color}
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path d="M 78 84 L 92 92" stroke={color} strokeWidth="0.9" strokeLinecap="round" />

    {/* Tiny delicate pastel berry accents */}
    <circle cx="28" cy="34" r="2" fill="#FF8FA3" stroke={color} strokeWidth="0.8" />
    <circle cx="46" cy="54" r="2" fill="#FF8FA3" stroke={color} strokeWidth="0.8" />
    <circle cx="66" cy="72" r="1.8" fill="#FFE599" stroke={color} strokeWidth="0.8" />
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
        d="M 8 8 C 22 28, 42 60, 82 88"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M 40 48 C 52 56, 68 64, 86 68"
        stroke={color}
        strokeWidth="1.3"
        strokeLinecap="round"
      />

      {/* Leaf 1 */}
      <path
        d="M 18 22 C 10 20, 5 15, 4 12 C 7 18, 13 25, 18 22 Z"
        fill="#FCE8EC"
        stroke={color}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M 18 22 L 7 14" stroke={color} strokeWidth="0.9" strokeLinecap="round" />

      {/* Leaf 2 */}
      <path
        d="M 23 28 C 30 22, 38 20, 42 21 C 39 27, 31 32, 23 28 Z"
        fill="#FFF2F4"
        stroke={color}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M 23 28 L 38 22" stroke={color} strokeWidth="0.9" strokeLinecap="round" />

      {/* Leaf 3 */}
      <path
        d="M 32 40 C 22 35, 14 34, 12 37 C 16 43, 25 46, 32 40 Z"
        fill="#FCE8EC"
        stroke={color}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M 32 40 L 15 37" stroke={color} strokeWidth="0.9" strokeLinecap="round" />

      {/* Leaf 4 */}
      <path
        d="M 38 46 C 47 39, 56 38, 60 40 C 56 47, 47 52, 38 46 Z"
        fill="#FFF2F4"
        stroke={color}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M 38 46 L 56 41" stroke={color} strokeWidth="0.9" strokeLinecap="round" />

      {/* Leaf 5 */}
      <path
        d="M 49 59 C 39 57, 31 60, 29 63 C 35 69, 44 67, 49 59 Z"
        fill="#FCE8EC"
        stroke={color}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M 49 59 L 32 62" stroke={color} strokeWidth="0.9" strokeLinecap="round" />

      {/* Sub-branch Leaf 1 */}
      <path
        d="M 58 58 C 65 52, 73 51, 76 53 C 73 59, 66 62, 58 58 Z"
        fill="#FFF2F4"
        stroke={color}
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M 58 58 L 73 53" stroke={color} strokeWidth="0.8" strokeLinecap="round" />

      {/* Sub-branch Leaf 2 */}
      <path
        d="M 72 65 C 79 61, 86 61, 88 63 C 86 68, 80 70, 72 65 Z"
        fill="#FCE8EC"
        stroke={color}
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M 72 65 L 85 63" stroke={color} strokeWidth="0.8" strokeLinecap="round" />

      {/* Main Stem Tip Leaf */}
      <path
        d="M 78 84 C 83 91, 91 94, 96 95 C 94 88, 87 83, 78 84 Z"
        fill="#FCE8EC"
        stroke={color}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M 78 84 L 92 92" stroke={color} strokeWidth="0.9" strokeLinecap="round" />

      {/* Berries */}
      <circle cx="28" cy="34" r="2" fill="#FF8FA3" stroke={color} strokeWidth="0.8" />
      <circle cx="46" cy="54" r="2" fill="#FF8FA3" stroke={color} strokeWidth="0.8" />
      <circle cx="66" cy="72" r="1.8" fill="#FFE599" stroke={color} strokeWidth="0.8" />
    </g>
  </svg>
);

/**
 * Elegant botanical sprig with floating leaves for small decorative accents.
 */
export const BotanicalSprig: React.FC<BotanicalProps> = ({
  className = "w-6 h-6",
  color = "#4A2C2A"
}) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M6 34 C 14 24, 24 16, 34 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M14 26 C 8 24, 6 19, 9 17 C 14 19, 15 24, 14 26 Z" fill="#FCE8EC" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
    <path d="M14 26 L 8 18" stroke={color} strokeWidth="0.8" strokeLinecap="round" />
    <path d="M22 18 C 25 12, 30 13, 29 18 C 26 21, 23 20, 22 18 Z" fill="#FFF2F4" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
    <path d="M22 18 L 29 14" stroke={color} strokeWidth="0.8" strokeLinecap="round" />
    <circle cx="18" cy="22" r="1.5" fill="#FF8FA3" />
  </svg>
);

/**
 * Delicate hand-drawn twin-leaf flourish for headers, titles, and card dividers.
 */
export const BotanicalFlourish: React.FC<BotanicalProps> = ({
  className = "w-5 h-5",
  color = "#FF8FA3"
}) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M3 18 C 8 13, 14 11, 21 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8 14 C 6 10, 8 6, 12 7 C 12 11, 9 13, 8 14 Z" fill="#FCE8EC" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
    <path d="M8 14 L 11 8" stroke={color} strokeWidth="0.75" strokeLinecap="round" />
    <path d="M14 11 C 13 7, 16 4, 19 5 C 19 9, 16 11, 14 11 Z" fill="#FFF2F4" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
    <path d="M14 11 L 18 5.5" stroke={color} strokeWidth="0.75" strokeLinecap="round" />
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
