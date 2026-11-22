import React from 'react';

interface BotanicalProps {
  className?: string;
  color?: string;
}

export const BotanicalBranchLeft: React.FC<BotanicalProps> = ({
  className = "w-12 h-12",
  color = "#4A2C2A"
}) => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M10 70 C 25 55, 45 40, 68 15"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    {/* Left Leaf 1 */}
    <path
      d="M22 58 C 12 56, 8 46, 14 42 C 22 45, 23 52, 22 58 Z"
      fill="#FCE4EC"
      stroke={color}
      strokeWidth="1.8"
    />
    {/* Right Leaf 1 */}
    <path
      d="M32 50 C 36 40, 48 40, 46 48 C 42 54, 35 53, 32 50 Z"
      fill="#FFF0F3"
      stroke={color}
      strokeWidth="1.8"
    />
    {/* Left Leaf 2 */}
    <path
      d="M40 42 C 30 38, 28 28, 36 26 C 42 30, 42 36, 40 42 Z"
      fill="#FCE4EC"
      stroke={color}
      strokeWidth="1.8"
    />
    {/* Right Leaf 2 */}
    <path
      d="M50 33 C 55 24, 65 26, 62 33 C 58 39, 52 37, 50 33 Z"
      fill="#FFF0F3"
      stroke={color}
      strokeWidth="1.8"
    />
    {/* Top Tip Leaf */}
    <path
      d="M68 15 C 64 6, 75 4, 76 10 C 77 15, 72 17, 68 15 Z"
      fill="#FCE4EC"
      stroke={color}
      strokeWidth="1.8"
    />
  </svg>
);

export const BotanicalBranchRight: React.FC<BotanicalProps> = ({
  className = "w-12 h-12",
  color = "#4A2C2A"
}) => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g transform="translate(80, 0) scale(-1, 1)">
      <path
        d="M10 70 C 25 55, 45 40, 68 15"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M22 58 C 12 56, 8 46, 14 42 C 22 45, 23 52, 22 58 Z"
        fill="#FCE4EC"
        stroke={color}
        strokeWidth="1.8"
      />
      <path
        d="M32 50 C 36 40, 48 40, 46 48 C 42 54, 35 53, 32 50 Z"
        fill="#FFF0F3"
        stroke={color}
        strokeWidth="1.8"
      />
      <path
        d="M40 42 C 30 38, 28 28, 36 26 C 42 30, 42 36, 40 42 Z"
        fill="#FCE4EC"
        stroke={color}
        strokeWidth="1.8"
      />
      <path
        d="M50 33 C 55 24, 65 26, 62 33 C 58 39, 52 37, 50 33 Z"
        fill="#FFF0F3"
        stroke={color}
        strokeWidth="1.8"
      />
      <path
        d="M68 15 C 64 6, 75 4, 76 10 C 77 15, 72 17, 68 15 Z"
        fill="#FCE4EC"
        stroke={color}
        strokeWidth="1.8"
      />
    </g>
  </svg>
);

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
