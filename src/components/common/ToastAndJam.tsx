import React from 'react';

interface ToastAndJamProps {
  className?: string;
}

export const ToastAndJam: React.FC<ToastAndJamProps> = ({
  className = "h-[72px] w-auto"
}) => {
  return (
    <svg
      viewBox="0 0 140 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Floating Sparkles & Hearts */}
      {/* Sparkle 1 (Top left) */}
      <path
        d="M 16 14 Q 16 20 10 20 Q 16 20 16 26 Q 16 20 22 20 Q 16 20 16 14 Z"
        fill="#FFE599"
      />
      {/* Small Floating Heart (Center top) */}
      <path
        d="M 68 8 C 64 3, 58 6, 60 11 C 62 15, 68 19, 68 19 C 68 19, 74 15, 76 11 C 78 6, 72 3, 68 8 Z"
        fill="#FF8FA3"
      />
      {/* Sparkle 2 (Top right) */}
      <path
        d="M 126 12 Q 126 17 121 17 Q 126 17 126 22 Q 126 17 131 17 Q 126 17 126 12 Z"
        fill="#FF8FA3"
      />
      {/* Little Heart (Far right) */}
      <path
        d="M 132 30 C 129 26, 124 28, 125 32 C 127 35, 132 38, 132 38 C 132 38, 137 35, 139 32 C 140 28, 135 26, 132 30 Z"
        fill="#FF8FA3"
        opacity="0.8"
      />

      {/* --- TOAST (Left) --- */}
      <g transform="translate(18, 14)">
        {/* Toast Crust (Drop Shadow / Base) */}
        <path
          d="M 10 14 C 10 6, 20 2, 28 6 C 36 2, 46 6, 46 14 C 48 24, 47 48, 44 54 C 43 56, 13 56, 12 54 C 9 48, 8 24, 10 14 Z"
          fill="#E6B88A"
          stroke="#4A2C2A"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />

        {/* Toast Crumb (Inner Warm Texture) */}
        <path
          d="M 13 15 C 13 9, 21 5, 28 9 C 35 5, 43 9, 43 15 C 44 24, 44 47, 41 51 C 40 53, 16 53, 15 51 C 12 47, 12 24, 13 15 Z"
          fill="#FFF3CC"
        />

        {/* Melting Butter Pat on top */}
        <rect
          x="22"
          y="18"
          width="13"
          height="10"
          rx="3"
          fill="#FFE599"
          stroke="#4A2C2A"
          strokeWidth="1.5"
          transform="rotate(-6 28 23)"
        />
        {/* Butter drip */}
        <path
          d="M 28 26 C 28 30, 26 31, 26 33 C 26 34.5, 27.5 35, 28.5 35 C 29.5 35, 30.5 34, 30 32 C 29.5 30, 31 28, 31 26 Z"
          fill="#FFE599"
        />

        {/* Cheerful Smiling Face */}
        {/* Left eye */}
        <ellipse cx="21" cy="34" rx="2" ry="2.5" fill="#4A2C2A" />
        {/* Right eye */}
        <ellipse cx="35" cy="33" rx="2" ry="2.5" fill="#4A2C2A" />
        {/* Eye highlights */}
        <circle cx="20.3" cy="33" r="0.7" fill="#FFFFFF" />
        <circle cx="34.3" cy="32" r="0.7" fill="#FFFFFF" />

        {/* Rosy blush cheeks */}
        <ellipse cx="17.5" cy="38" rx="2.5" ry="1.6" fill="#FF8FA3" opacity="0.75" />
        <ellipse cx="38.5" cy="37" rx="2.5" ry="1.6" fill="#FF8FA3" opacity="0.75" />

        {/* Happy smile */}
        <path
          d="M 25 38 C 26.5 42, 29.5 42, 31 38"
          stroke="#4A2C2A"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Tiny cute feet */}
        <path
          d="M 20 56 C 20 59, 17 59, 17 56"
          stroke="#4A2C2A"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M 36 56 C 36 59, 39 59, 39 56"
          stroke="#4A2C2A"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>

      {/* --- JAM JAR (Right) --- */}
      <g transform="translate(74, 18)">
        {/* Cute Spoon sticking out */}
        <path
          d="M 32 1 C 34 -4, 40 -2, 42 2 L 31 16 L 27 13 Z"
          fill="#E0D5CE"
          stroke="#4A2C2A"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        {/* Jam dollop on spoon */}
        <ellipse cx="37" cy="1" rx="2" ry="3" fill="#FF8FA3" transform="rotate(30 37 1)" />

        {/* Glass Jar Body */}
        <rect
          x="6"
          y="15"
          width="36"
          height="37"
          rx="10"
          fill="#FF8FA3"
          stroke="#4A2C2A"
          strokeWidth="2.2"
        />

        {/* Glass base reflection / shine */}
        <path
          d="M 10 20 Q 9 35 12 47"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* Fabric / Gingham Lid */}
        <path
          d="M 3 13 C 3 9, 12 7, 24 7 C 36 7, 45 9, 45 13 L 43 17 C 41 18, 38 16, 36 17 C 33 18, 31 16, 28 17 C 25 18, 23 16, 20 17 C 17 18, 15 16, 12 17 C 10 18, 7 16, 5 17 Z"
          fill="#FFE599"
          stroke="#4A2C2A"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        {/* Ribbon / Twine around lid */}
        <path
          d="M 7 15 Q 24 18 41 15"
          stroke="#4A2C2A"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="24" cy="16" r="1.5" fill="#FF8FA3" />

        {/* Strawberry Label on the Jar */}
        <rect
          x="12"
          y="25"
          width="24"
          height="20"
          rx="6"
          fill="#FFFFFF"
          stroke="#4A2C2A"
          strokeWidth="1.5"
        />
        {/* Strawberry icon on label */}
        <path
          d="M 24 30 C 20 30, 19 35, 24 40 C 29 35, 28 30, 24 30 Z"
          fill="#FF8FA3"
        />
        {/* Strawberry leafy cap */}
        <path
          d="M 22 29 Q 24 31 26 29 M 24 29 L 24 28"
          stroke="#4A2C2A"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Cute Face on the Jam Jar */}
        {/* Left eye */}
        <ellipse cx="18" cy="22" rx="1.6" ry="2" fill="#4A2C2A" />
        {/* Right eye */}
        <ellipse cx="30" cy="22" rx="1.6" ry="2" fill="#4A2C2A" />
        {/* Highlights */}
        <circle cx="17.5" cy="21.5" r="0.5" fill="#FFFFFF" />
        <circle cx="29.5" cy="21.5" r="0.5" fill="#FFFFFF" />
        {/* Smile */}
        <path
          d="M 22 23.5 Q 24 25.5 26 23.5"
          stroke="#4A2C2A"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
};
