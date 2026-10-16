import React from 'react';

/**
 * JobScout Signature Luxury Emblem
 * 
 * Masterwork Design Architecture:
 * - Obsidian Crystal Squircle Foundation (#07090e -> #111827) with Dual Chamfer Specular Rim
 * - Precision Orbital Reticle Ring with Micro-Degree Calibrations
 * - Continuous Prismatic Möbius Crest (Electric Indigo, Vivid Violet, Deep Sapphire, and Neon Cyan)
 * - 45° NE Velocity Discovery Arrowhead with Prismatic Specular Facet
 * - Diamond Core Quantum Beacon with 4-Point Star Flare and Crystalline Center
 * - Dynamic Ambient Pulsing Halo
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
      className={`select-none flex-shrink-0 transition-all duration-300 ${className}`}
    >
      <defs>
        {/* Luxury Crystal Platinum Base for Light Mode */}
        <linearGradient id="luxe_base" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#eef2f6" />
        </linearGradient>

        {/* Dual Specular Bevel Rim (Crisp Indigo-Cyan Metallic Chrome) */}
        <linearGradient id="luxe_rim" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.9" />
          <stop offset="30%" stopColor="#818cf8" stopOpacity="0.8" />
          <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.9" />
        </linearGradient>

        {/* Inner Glass Specular Sheen */}
        <linearGradient id="luxe_sheen" x1="10" y1="10" x2="90" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        {/* Primary Prismatic Ribbon (Electric Indigo to Vivid Violet) */}
        <linearGradient id="luxe_ribbon_primary" x1="15" y1="80" x2="55" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3730a3" />
          <stop offset="25%" stopColor="#4f46e5" />
          <stop offset="60%" stopColor="#6366f1" />
          <stop offset="85%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#d946ef" />
        </linearGradient>

        {/* Secondary Discovery Ribbon (Cyan to Mint Ice) */}
        <linearGradient id="luxe_ribbon_cyan" x1="85" y1="80" x2="45" y2="15" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0369a1" />
          <stop offset="30%" stopColor="#0284c7" />
          <stop offset="65%" stopColor="#06b6d4" />
          <stop offset="90%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#7dd3fc" />
        </linearGradient>

        {/* Velocity Arrowhead Gradient */}
        <linearGradient id="luxe_arrow" x1="60" y1="35" x2="78" y2="15" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>

        {/* Diamond Core Crystal Gradient */}
        <linearGradient id="luxe_crystal" x1="42" y1="42" x2="58" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor="#e0f2fe" />
          <stop offset="70%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>

        {/* Core Ambient Volumetric Glow */}
        <radialGradient id="luxe_ambient_glow" cx="50" cy="50" r="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.14" />
          <stop offset="50%" stopColor="#0284c7" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#f8fafc" stopOpacity="0" />
        </radialGradient>

        {/* Luxury Drop Shadow Filter */}
        <filter id="luxe_shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3.5" floodColor="#4f46e5" floodOpacity="0.15" />
        </filter>

        {/* Luminous Bloom Filter */}
        <filter id="luxe_bloom" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.8" result="glow" />
          <feComposite in="SourceGraphic" in2="glow" operator="over" />
        </filter>
      </defs>

      {/* 1. Base Squircle Badge Shell */}
      {withBadge && (
        <>
          {/* Ambient Glow behind base */}
          <rect 
            x="3" 
            y="3" 
            width="94" 
            height="94" 
            rx="27" 
            fill="url(#luxe_base)" 
            stroke="url(#luxe_rim)" 
            strokeWidth="1.75" 
            filter="url(#luxe_shadow)"
          />

          {/* Top Glass Refraction Arc */}
          <path
            d="M 12 30 C 12 18 20 10 32 6 L 68 6 C 80 10 88 18 88 30 C 65 36 35 36 12 30 Z"
            fill="url(#luxe_sheen)"
          />

          {/* Core Radial Atmosphere */}
          <circle cx="50" cy="50" r="36" fill="url(#luxe_ambient_glow)" />

          {/* Precision Micro-Tick Reticle Calibrations */}
          <line x1="50" y1="4" x2="50" y2="8" stroke="#0284c7" strokeWidth="1.75" strokeOpacity="0.9" strokeLinecap="round" />
          <line x1="50" y1="92" x2="50" y2="96" stroke="#4f46e5" strokeWidth="1.75" strokeOpacity="0.9" strokeLinecap="round" />
          <line x1="4" y1="50" x2="8" y2="50" stroke="#4f46e5" strokeWidth="1.75" strokeOpacity="0.9" strokeLinecap="round" />
          <line x1="92" y1="50" x2="96" y2="50" stroke="#0284c7" strokeWidth="1.75" strokeOpacity="0.9" strokeLinecap="round" />
        </>
      )}

      {/* 2. Concentric Precision Orbital Ring */}
      <circle 
        cx="50" 
        cy="50" 
        r="30" 
        stroke="#0284c7" 
        strokeWidth="1" 
        strokeDasharray="2.5 4.5" 
        strokeOpacity="0.35" 
      />
      <circle 
        cx="50" 
        cy="50" 
        r="20" 
        stroke="#8b5cf6" 
        strokeWidth="0.8" 
        strokeDasharray="1.5 3.5" 
        strokeOpacity="0.3" 
      />

      {/* 3. Left Continuous Velocity Ribbon (Electric Indigo / Violet) */}
      <path
        d="M 50 84 C 32 73 21 57 21 42 C 21 26 34 16 50 16"
        stroke="url(#luxe_ribbon_primary)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* Precision Specular Inner Bevel Line */}
      <path
        d="M 32 63 C 28 54 28 43 32 34 C 37 25 43 21 50 21"
        stroke="#e879f9"
        strokeWidth="2.2"
        strokeOpacity="0.85"
        strokeLinecap="round"
      />

      {/* 4. Right Continuous Discovery Ribbon (Neon Cyan / Sky) */}
      <path
        d="M 50 84 C 68 73 79 57 79 42 C 79 28 68 17 54 16"
        stroke="url(#luxe_ribbon_cyan)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* Precision Specular Cyan Highlight */}
      <path
        d="M 68 63 C 72 54 72 43 68 34 C 63 25 57 21 50 21"
        stroke="#a5f3fc"
        strokeWidth="2.2"
        strokeOpacity="0.9"
        strokeLinecap="round"
      />

      {/* 5. Geolocation Anchor Pin (Bottom Convergence) */}
      <polygon 
        points="50,88 42,77 58,77" 
        fill="url(#luxe_ribbon_primary)" 
      />

      {/* 6. Precision 45° NE Discovery Arrowhead */}
      <g transform="translate(71, 23) rotate(28)">
        <polygon 
          points="0,-11 -6.5,6 0,2 6.5,6" 
          fill="url(#luxe_arrow)" 
          filter="url(#luxe_bloom)"
        />
        <polygon 
          points="0,-8 -4,4 0,1.5 4,4" 
          fill="#ffffff" 
        />
      </g>

      {/* 7. Quantum Diamond Core Beacon */}
      <g transform="translate(50, 48)">
        {/* Diamond Outer Specular Frame */}
        <polygon 
          points="0,-11 11,0 0,11 -11,0" 
          fill="url(#luxe_crystal)" 
          filter="url(#luxe_bloom)"
        />
        {/* Diamond High-Contrast Inner Facet */}
        <polygon 
          points="0,-7.5 7.5,0 0,7.5 -7.5,0" 
          fill="#1e1b4b" 
        />
        {/* Central Pure Radiant Star Point */}
        <circle 
          cx="0" 
          cy="0" 
          r="3.2" 
          fill="#ffffff" 
        />
      </g>

      {/* 8. Starburst Discovery Spark (Top Right Luxury Lens Flare) */}
      <path
        d="M 78 17 L 79.5 21 L 83.5 22.5 L 79.5 24 L 78 28 L 76.5 24 L 72.5 22.5 L 76.5 21 Z"
        fill="#ffffff"
        opacity="0.95"
        filter="url(#luxe_bloom)"
      />

      {/* 9. Live Radar Pulse Wave */}
      {animated && (
        <circle 
          cx="50" 
          cy="48" 
          r="13" 
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
