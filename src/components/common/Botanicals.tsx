import React from 'react';

interface BotanicalProps {
  className?: string;
  color?: string;
}

/**
 * Hand-drawn botanical branch with elegant almond leaves and delicate leaf veins.
 * Faithfully captures the cozy bakery & stationery aesthetic from the original mockup.
 */
export const BotanicalBranchLeft: React.FC<BotanicalProps> = ({
  className = "w-16 h-16",
  color = "#4A2C2A"
}) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Main Gentle Curved Stem */}
    <path
      d="M 6 4 C 18 20, 34 46, 76 76"
      stroke={color}
      strokeWidth="1.7"
      strokeLinecap="round"
    />

    {/* Leaf 1 (Top Left) - elegant almond leaf with midrib */}
    <path
      d="M 16 15 C 8 11, 2 11, 1 14 C 4 19, 11 23, 16 15 Z"
      fill="#FCE4EC"
      stroke={color}
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <path d="M 16 15 L 4 14" stroke={color} strokeWidth="0.8" strokeLinecap="round" />

    {/* Leaf 2 (Top Right) */}
    <path
      d="M 22 22 C 30 16, 38 16, 40 19 C 37 25, 29 28, 22 22 Z"
      fill="#FFF0F3"
      stroke={color}
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <path d="M 22 22 L 36 19" stroke={color} strokeWidth="0.8" strokeLinecap="round" />

    {/* Leaf 3 (Mid-low Left) */}
    <path
      d="M 30 33 C 20 27, 13 27, 11 30 C 14 36, 22 39, 30 33 Z"
      fill="#FCE4EC"
      stroke={color}
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <path d="M 30 33 L 14 30" stroke={color} strokeWidth="0.8" strokeLinecap="round" />

    {/* Leaf 4 (Mid-high Right) */}
    <path
      d="M 38 41 C 48 34, 56 34, 58 37 C 54 44, 45 47, 38 41 Z"
      fill="#FFF0F3"
      stroke={color}
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <path d="M 38 41 L 54 37" stroke={color} strokeWidth="0.8" strokeLinecap="round" />

    {/* Leaf 5 (Lower Left) */}
    <path
      d="M 48 51 C 38 46, 31 47, 30 51 C 33 57, 41 58, 48 51 Z"
      fill="#FCE4EC"
      stroke={color}
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <path d="M 48 51 L 33 51" stroke={color} strokeWidth="0.8" strokeLinecap="round" />

    {/* Leaf 6 (Lower Right) */}
    <path
      d="M 58 60 C 68 53, 76 54, 78 57 C 74 64, 65 67, 58 60 Z"
      fill="#FFF0F3"
      stroke={color}
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <path d="M 58 60 L 74 57" stroke={color} strokeWidth="0.8" strokeLinecap="round" />

    {/* Leaf 7 (Near Tip Left) */}
    <path
      d="M 66 68 C 58 64, 52 66, 52 70 C 56 75, 62 74, 66 68 Z"
      fill="#FCE4EC"
      stroke={color}
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <path d="M 66 68 L 54 69" stroke={color} strokeWidth="0.8" strokeLinecap="round" />

    {/* Terminal Leaf (Tip) */}
    <path
      d="M 76 76 C 83 76, 91 81, 92 87 C 87 91, 80 88, 76 76 Z"
      fill="#FCE4EC"
      stroke={color}
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <path d="M 76 76 L 89 85" stroke={color} strokeWidth="0.8" strokeLinecap="round" />
  </svg>
);

export const BotanicalBranchRight: React.FC<BotanicalProps> = ({
  className = "w-16 h-16",
  color = "#4A2C2A"
}) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g transform="translate(100, 0) scale(-1, 1)">
      {/* Main Gentle Curved Stem */}
      <path
        d="M 6 4 C 18 20, 34 46, 76 76"
        stroke={color}
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      {/* Leaf 1 (Top Left) */}
      <path
        d="M 16 15 C 8 11, 2 11, 1 14 C 4 19, 11 23, 16 15 Z"
        fill="#FCE4EC"
        stroke={color}
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M 16 15 L 4 14" stroke={color} strokeWidth="0.8" strokeLinecap="round" />

      {/* Leaf 2 (Top Right) */}
      <path
        d="M 22 22 C 30 16, 38 16, 40 19 C 37 25, 29 28, 22 22 Z"
        fill="#FFF0F3"
        stroke={color}
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M 22 22 L 36 19" stroke={color} strokeWidth="0.8" strokeLinecap="round" />

      {/* Leaf 3 (Mid-low Left) */}
      <path
        d="M 30 33 C 20 27, 13 27, 11 30 C 14 36, 22 39, 30 33 Z"
        fill="#FCE4EC"
        stroke={color}
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M 30 33 L 14 30" stroke={color} strokeWidth="0.8" strokeLinecap="round" />

      {/* Leaf 4 (Mid-high Right) */}
      <path
        d="M 38 41 C 48 34, 56 34, 58 37 C 54 44, 45 47, 38 41 Z"
        fill="#FFF0F3"
        stroke={color}
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M 38 41 L 54 37" stroke={color} strokeWidth="0.8" strokeLinecap="round" />

      {/* Leaf 5 (Lower Left) */}
      <path
        d="M 48 51 C 38 46, 31 47, 30 51 C 33 57, 41 58, 48 51 Z"
        fill="#FCE4EC"
        stroke={color}
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M 48 51 L 33 51" stroke={color} strokeWidth="0.8" strokeLinecap="round" />

      {/* Leaf 6 (Lower Right) */}
      <path
        d="M 58 60 C 68 53, 76 54, 78 57 C 74 64, 65 67, 58 60 Z"
        fill="#FFF0F3"
        stroke={color}
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M 58 60 L 74 57" stroke={color} strokeWidth="0.8" strokeLinecap="round" />

      {/* Leaf 7 (Near Tip Left) */}
      <path
        d="M 66 68 C 58 64, 52 66, 52 70 C 56 75, 62 74, 66 68 Z"
        fill="#FCE4EC"
        stroke={color}
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M 66 68 L 54 69" stroke={color} strokeWidth="0.8" strokeLinecap="round" />

      {/* Terminal Leaf */}
      <path
        d="M 76 76 C 83 76, 91 81, 92 87 C 87 91, 80 88, 76 76 Z"
        fill="#FCE4EC"
        stroke={color}
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M 76 76 L 89 85" stroke={color} strokeWidth="0.8" strokeLinecap="round" />
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
