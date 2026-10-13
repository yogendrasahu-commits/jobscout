import React from 'react';

/**
 * JobScout Official Emblem Logo
 * Features:
 * - Squircle dark badge with subtle border & gradient
 * - Map pin base with indigo-purple gradient
 * - Concentric radar vortex arc with upward-right directional discovery arrow (cyan to electric blue)
 * - Luminous white center beacon dot
 */
export const JobScoutLogo = ({ 
  size = 40, 
  className = '', 
  withBadge = true, 
  animated = false 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none flex-shrink-0 ${className}`}
    >
      <defs>
        {/* Background dark squircle gradient */}
        <linearGradient id="js_bg_grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#111827" />
          <stop offset="50%" stopColor="#0b1120" />
          <stop offset="100%" stopColor="#060911" />
        </linearGradient>

        {/* Squircle border highlight */}
        <linearGradient id="js_border_grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#6366f1" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#1e293b" stopOpacity="0.8" />
        </linearGradient>

        {/* Pin base gradient (purple to indigo) */}
        <linearGradient id="js_pin_grad" x1="20" y1="40" x2="80" y2="86" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>

        {/* Outer radar arc gradient (purple -> electric blue -> cyan) */}
        <linearGradient id="js_radar_outer" x1="20" y1="80" x2="80" y2="25" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="35%" stopColor="#6366f1" />
          <stop offset="70%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>

        {/* Inner radar arc gradient */}
        <linearGradient id="js_radar_inner" x1="30" y1="65" x2="70" y2="35" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>

        {/* Beacon glow filter */}
        <filter id="js_glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* 1. Optional Squircle Badge Container */}
      {withBadge && (
        <>
          <rect 
            x="3" 
            y="3" 
            width="94" 
            height="94" 
            rx="24" 
            fill="url(#js_bg_grad)" 
            stroke="url(#js_border_grad)" 
            strokeWidth="1.5" 
          />
          {/* Subtle inner ambient glow */}
          <circle cx="50" cy="48" r="28" fill="#3b82f6" fillOpacity="0.06" />
        </>
      )}

      {/* 2. Bottom Pin Point Shape (Purple Gradient) */}
      <path
        d="M26 52 C26 68 38 78 50 87 C62 78 74 68 74 52"
        stroke="url(#js_pin_grad)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Pin downward point fill accent */}
      <path
        d="M42 75 L50 86 L58 75 Q50 78 42 75 Z"
        fill="url(#js_pin_grad)"
      />

      {/* 3. Outer Concentric Radar Arc sweeping to 2 o'clock */}
      <path
        d="M26 48 C26 34.7 36.7 24 50 24 C62.5 24 72.8 33.6 73.9 46"
        stroke="url(#js_radar_outer)"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />

      {/* 4. Directional Discovery Arrow (at ~ 2 o'clock, pointing NE) */}
      <g transform="translate(73.5, 41) rotate(-18)">
        <path
          d="M0 6 L0 -10 M-5.5 -4 L0 -11 L5.5 -4"
          stroke="#38bdf8"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Solid arrow head fill */}
        <polygon 
          points="0,-12 -6,-3 6,-3" 
          fill="#38bdf8" 
        />
      </g>

      {/* 5. Inner Swirling Vortex Arc */}
      <path
        d="M36 50 C36 42.3 42.3 36 50 36 C57.2 36 63.1 41.4 63.9 48.5"
        stroke="url(#js_radar_inner)"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />

      {/* Inner lower curve continuing spiral */}
      <path
        d="M37 53 C38 60 44 64 50 64 C55 64 59.5 61.5 61.5 57.5"
        stroke="url(#js_radar_inner)"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
        strokeOpacity="0.75"
      />

      {/* 6. Center White Luminous Beacon Dot */}
      <circle 
        cx="50" 
        cy="49" 
        r="6.5" 
        fill="#ffffff" 
        filter="url(#js_glow)"
      />
      {/* Center dot pinhole highlight */}
      <circle 
        cx="50" 
        cy="49" 
        r="3" 
        fill="#f8fafc" 
      />

      {/* Optional gentle pulse animation */}
      {animated && (
        <circle 
          cx="50" 
          cy="49" 
          r="9" 
          stroke="#38bdf8" 
          strokeWidth="1.5" 
          fill="none"
          className="animate-ping"
          style={{ transformOrigin: '50px 49px', animationDuration: '3s' }}
        />
      )}
    </svg>
  );
};

export default JobScoutLogo;
