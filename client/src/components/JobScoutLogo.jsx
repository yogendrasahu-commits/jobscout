import React from 'react';

/**
 * JobScout Ultra-Premium Executive Logo Emblem
 * 
 * Design Concept:
 * - Luxury Obsidian Squircle with Specular Chamfer Highlight
 * - Dynamic Geometric "Prism Radar & Discovery Crest" (Intertwined Electric Indigo & Neon Cyan Wings)
 * - Diamond-cut Hexagonal Core Beacon with Radiant Lens Flare
 * - Concentric Precision Orbital Reticles
 * - Micro Starburst Accent (Top-Right Discovery Spark)
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
      className={`select-none flex-shrink-0 transition-transform duration-300 ${className}`}
    >
      <defs>
        {/* Luxury Obsidian Badge Base */}
        <linearGradient id="prem_bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="40%" stopColor="#090d16" />
          <stop offset="100%" stopColor="#04060a" />
        </linearGradient>

        {/* Specular Chamfer Rim (Top-Left light reflection) */}
        <linearGradient id="prem_rim" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
          <stop offset="25%" stopColor="#818cf8" stopOpacity="0.6" />
          <stop offset="60%" stopColor="#6366f1" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#1e293b" stopOpacity="0.8" />
        </linearGradient>

        {/* Electric Indigo Wing Gradient (Left Crest) */}
        <linearGradient id="prem_indigo_wing" x1="18" y1="78" x2="52" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4338ca" />
          <stop offset="45%" stopColor="#6366f1" />
          <stop offset="80%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>

        {/* Neon Cyan Wing Gradient (Right Crest) */}
        <linearGradient id="prem_cyan_wing" x1="82" y1="78" x2="48" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="45%" stopColor="#0ea5e9" />
          <stop offset="80%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#a5f3fc" />
        </linearGradient>

        {/* Central Core Radiant Glow */}
        <radialGradient id="prem_core_glow" cx="50" cy="50" r="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#6366f1" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>

        {/* Diamond Core Shimmer */}
        <linearGradient id="prem_diamond" x1="42" y1="42" x2="58" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#e0f2fe" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>

        {/* Glow Filter */}
        <filter id="prem_bloom" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="glow" />
          <feComposite in="SourceGraphic" in2="glow" operator="over" />
        </filter>
      </defs>

      {/* 1. Squircle Badge Shell */}
      {withBadge && (
        <>
          {/* Drop shadow backplate */}
          <rect 
            x="3" 
            y="3" 
            width="94" 
            height="94" 
            rx="26" 
            fill="url(#prem_bg)" 
            stroke="url(#prem_rim)" 
            strokeWidth="1.5" 
          />
          {/* Subtle Ambient Radial Glow */}
          <circle cx="50" cy="50" r="32" fill="url(#prem_core_glow)" />

          {/* Precision Micro-Tick Reticle Marks on the border */}
          <line x1="50" y1="4" x2="50" y2="8" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round" />
          <line x1="50" y1="92" x2="50" y2="96" stroke="#6366f1" strokeWidth="1.5" strokeOpacity="0.4" strokeLinecap="round" />
          <line x1="4" y1="50" x2="8" y2="50" stroke="#818cf8" strokeWidth="1.5" strokeOpacity="0.4" strokeLinecap="round" />
          <line x1="92" y1="50" x2="96" y2="50" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round" />
        </>
      )}

      {/* 2. Precision Concentric Radar Guides */}
      <circle 
        cx="50" 
        cy="50" 
        r="28" 
        stroke="#38bdf8" 
        strokeWidth="1" 
        strokeDasharray="2 4" 
        strokeOpacity="0.25" 
      />
      <circle 
        cx="50" 
        cy="50" 
        r="18" 
        stroke="#818cf8" 
        strokeWidth="1" 
        strokeOpacity="0.2" 
      />

      {/* 3. Left Dynamic Falcon / Pin Arc (Electric Indigo) */}
      <path
        d="M 50 82 C 34 72 23 58 23 44 C 23 29 35 18 50 18"
        stroke="url(#prem_indigo_wing)"
        strokeWidth="5.5"
        strokeLinecap="round"
      />
      {/* Left Wing Facet Line */}
      <path
        d="M 33 60 C 30 52 30 42 34 34 C 38 27 44 24 50 24"
        stroke="#a855f7"
        strokeWidth="2.5"
        strokeOpacity="0.75"
        strokeLinecap="round"
      />

      {/* 4. Right Dynamic Falcon / Discovery Arc (Neon Cyan) */}
      <path
        d="M 50 82 C 66 72 77 58 77 44 C 77 31 67 20 54 18.5"
        stroke="url(#prem_cyan_wing)"
        strokeWidth="5.5"
        strokeLinecap="round"
      />
      {/* Right Wing Facet Line */}
      <path
        d="M 67 60 C 70 52 70 42 66 34 C 62 27 56 24 50 24"
        stroke="#38bdf8"
        strokeWidth="2.5"
        strokeOpacity="0.8"
        strokeLinecap="round"
      />

      {/* 5. Downward Point Anchor (Location Pin Base) */}
      <polygon 
        points="50,86 43,76 57,76" 
        fill="url(#prem_indigo_wing)" 
      />

      {/* 6. Upward Forward Discovery Arrow (45° NE Vector) */}
      <g transform="translate(68, 25) rotate(24)">
        <polygon 
          points="0,-9 -5.5,5 0,2 5.5,5" 
          fill="#38bdf8" 
          filter="url(#prem_bloom)"
        />
        <polygon 
          points="0,-7 -4,4 0,1.5 4,4" 
          fill="#ffffff" 
        />
      </g>

      {/* 7. Precision Diamond Core (The Radar Beacon Crystal) */}
      <g transform="translate(50, 48) scale(1)">
        {/* Diamond Outer Frame */}
        <polygon 
          points="0,-10 10,0 0,10 -10,0" 
          fill="url(#prem_diamond)" 
          filter="url(#prem_bloom)"
        />
        {/* High-Gloss Diamond Inner Facet */}
        <polygon 
          points="0,-7 7,0 0,7 -7,0" 
          fill="#0f172a" 
        />
        {/* Diamond Center Light Point */}
        <circle 
          cx="0" 
          cy="0" 
          r="3" 
          fill="#ffffff" 
        />
      </g>

      {/* 8. Starburst Discovery Spark (Top Right Luxury Flare) */}
      <path
        d="M 76 19 L 77.5 22.5 L 81 24 L 77.5 25.5 L 76 29 L 74.5 25.5 L 71 24 L 74.5 22.5 Z"
        fill="#ffffff"
        opacity="0.9"
        filter="url(#prem_bloom)"
      />

      {/* 9. Optional Subtle Pulse Radar Beacon Wave */}
      {animated && (
        <circle 
          cx="50" 
          cy="48" 
          r="12" 
          stroke="#38bdf8" 
          strokeWidth="1.5" 
          fill="none"
          className="animate-ping"
          style={{ transformOrigin: '50px 48px', animationDuration: '2.5s' }}
        />
      )}
    </svg>
  );
};

export default JobScoutLogo;
