import React from 'react';

/**
 * JobScout Signature Luxury Binoculars Emblem
 * 
 * Masterwork Design Architecture:
 * - High-tech binoculars optics representing "Scouting" & active job discovery.
 * - Left Lens Chamber: Houses the illuminated Executive Job / Briefcase icon.
 * - Right Lens Chamber: Houses the Geospatial Radar Crosshair & Discovery Beacon Pin.
 * - Central Bridge: Features the precision knurled focus wheel with stamped "JOB" crest.
 * - Fluorite Anti-Reflective Optical Coating: Multi-chromatic cyan, violet & emerald glass sheens.
 * - Uses React.useId() to ensure 100% collision-free SVG gradient and filter IDs.
 */
export const JobScoutLogo = ({ 
  size = 40, 
  className = '', 
  withBadge = true, 
  animated = false 
}) => {
  const rawId = React.useId();
  const uid = 'js_bino_' + rawId.replace(/[^a-zA-Z0-9]/g, '');

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none flex-shrink-0 transition-all duration-300 ${className}`}
      aria-label="JobScout Binoculars Logo"
    >
      <defs>
        {/* Luxury Crystal Platinum Base */}
        <linearGradient id={`${uid}_base`} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#eef2f6" />
        </linearGradient>

        {/* Dual Specular Bevel Rim (Crisp Indigo-Cyan Metallic Chrome) */}
        <linearGradient id={`${uid}_rim`} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.9" />
          <stop offset="30%" stopColor="#818cf8" stopOpacity="0.85" />
          <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.9" />
        </linearGradient>

        {/* Outer Binoculars Chassis Gradient (Midnight Titanium & Deep Indigo) */}
        <linearGradient id={`${uid}_chassis`} x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="40%" stopColor="#312e81" />
          <stop offset="80%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        {/* Binocular Metallic Trim Gradient */}
        <linearGradient id={`${uid}_metal`} x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>

        {/* Optical Glass Deep Lens Wells (Deep Space Cyan/Sapphire) */}
        <radialGradient id={`${uid}_lens_well`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="65%" stopColor="#090d16" />
          <stop offset="100%" stopColor="#020617" />
        </radialGradient>

        {/* Fluorite Anti-Reflective Optical Coating (Cyan to Violet Shimmer) */}
        <linearGradient id={`${uid}_fluorite`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.75" />
        </linearGradient>

        {/* Glowing Job Briefcase Gold/Cyan Gradient */}
        <linearGradient id={`${uid}_job_briefcase`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>

        {/* Scout Compass / Crosshair Neon Gradient */}
        <linearGradient id={`${uid}_scout_cross`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>

        {/* "JOB" Stamped Crest Badge Gradient */}
        <linearGradient id={`${uid}_job_badge`} x1="32" y1="10" x2="68" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>

        {/* Central Focus Wheel Grip Gradient */}
        <linearGradient id={`${uid}_wheel`} x1="45" y1="36" x2="55" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="50%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>

        {/* Drop Shadow Filter */}
        <filter id={`${uid}_shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="3.5" floodColor="#312e81" floodOpacity="0.22" />
        </filter>

        {/* Neon Specular Glow */}
        <filter id={`${uid}_glow`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* ======================================================== */}
      {/* 1. OPTIONAL FOUNDATION BADGE SHELL                      */}
      {/* ======================================================== */}
      {withBadge && (
        <>
          {/* Base Squircle Shell */}
          <rect 
            x="3.5" 
            y="3.5" 
            width="93" 
            height="93" 
            rx="27" 
            fill={`url(#${uid}_base)`} 
            stroke={`url(#${uid}_rim)`} 
            strokeWidth="1.8" 
            filter={`url(#${uid}_shadow)`}
          />

          {/* Micro Radar Degree Calibration Marks */}
          <line x1="50" y1="4.5" x2="50" y2="8" stroke="#6366f1" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="50" y1="92" x2="50" y2="95.5" stroke="#6366f1" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="4.5" y1="50" x2="8" y2="50" stroke="#06b6d4" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="92" y1="50" x2="95.5" y2="50" stroke="#06b6d4" strokeWidth="1.6" strokeLinecap="round" />
        </>
      )}

      {/* ======================================================== */}
      {/* 2. TOP "JOB" BRAND PLATE (Engraved on Binoculars Bridge) */}
      {/* ======================================================== */}
      <g id="job-title-crest">
        {/* Pill background plate */}
        <rect 
          x="32" 
          y="10.5" 
          width="36" 
          height="12" 
          rx="6" 
          fill={`url(#${uid}_job_badge)`}
          stroke="#a5b4fc"
          strokeWidth="1"
          filter={`url(#${uid}_shadow)`}
        />
        {/* Micro Glowing Beacon Dots flanking "JOB" */}
        <circle cx="37" cy="16.5" r="1.3" fill="#38bdf8" className={animated ? "animate-pulse" : ""} />
        <circle cx="63" cy="16.5" r="1.3" fill="#34d399" className={animated ? "animate-pulse" : ""} />
        
        {/* Stamped "JOB" Text */}
        <text 
          x="50" 
          y="19" 
          textAnchor="middle" 
          fill="#ffffff" 
          fontSize="8" 
          fontWeight="900" 
          letterSpacing="1.8"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          JOB
        </text>
      </g>

      {/* ======================================================== */}
      {/* 3. BINOCULARS CHASSIS & OPTICAL BARRELS                  */}
      {/* ======================================================== */}
      <g id="binoculars-body" filter={`url(#${uid}_shadow)`}>
        
        {/* Central Structural Bridge Hinge (Connects Left & Right Barrels) */}
        <path 
          d="M 40 34 C 40 31 60 31 60 34 L 62 58 C 62 61 38 61 38 58 Z" 
          fill="#1e1b4b" 
          stroke={`url(#${uid}_metal)`} 
          strokeWidth="1.5" 
        />

        {/* Central Knurled Focusing Wheel Dial */}
        <rect 
          x="44.5" 
          y="35" 
          width="11" 
          height="17" 
          rx="3" 
          fill={`url(#${uid}_wheel)`} 
          stroke="#6366f1" 
          strokeWidth="1.2" 
        />
        {/* Knurled Grip Ridges on Dial */}
        <line x1="46" y1="38.5" x2="54" y2="38.5" stroke="#1e293b" strokeWidth="1" strokeLinecap="round" />
        <line x1="46" y1="43.5" x2="54" y2="43.5" stroke="#1e293b" strokeWidth="1" strokeLinecap="round" />
        <line x1="46" y1="48.5" x2="54" y2="48.5" stroke="#1e293b" strokeWidth="1" strokeLinecap="round" />

        {/* Dual Ocular Eyepieces (Top Viewers) */}
        {/* Left Eyepiece */}
        <rect 
          x="24" 
          y="23" 
          width="18" 
          height="8" 
          rx="3" 
          fill="#0f172a" 
          stroke="#4f46e5" 
          strokeWidth="1.5" 
        />
        <rect x="26.5" y="24.5" width="13" height="3" rx="1.5" fill="#38bdf8" fillOpacity="0.7" />

        {/* Right Eyepiece */}
        <rect 
          x="58" 
          y="23" 
          width="18" 
          height="8" 
          rx="3" 
          fill="#0f172a" 
          stroke="#4f46e5" 
          strokeWidth="1.5" 
        />
        <rect x="60.5" y="24.5" width="13" height="3" rx="1.5" fill="#38bdf8" fillOpacity="0.7" />

        {/* Left Barrel Body (Ergonomic contoured prism chamber) */}
        <path 
          d="M 23 31 C 23 29 43 29 43 31 L 49 58 C 49 61 17 61 17 58 Z" 
          fill={`url(#${uid}_chassis)`} 
          stroke={`url(#${uid}_metal)`} 
          strokeWidth="1.8" 
          strokeLinejoin="round" 
        />

        {/* Right Barrel Body */}
        <path 
          d="M 57 31 C 57 29 77 29 77 31 L 83 58 C 83 61 51 61 51 58 Z" 
          fill={`url(#${uid}_chassis)`} 
          stroke={`url(#${uid}_metal)`} 
          strokeWidth="1.8" 
          strokeLinejoin="round" 
        />

        {/* Ergonomic Textured Side Grips */}
        <path d="M 18.5 42 Q 17.5 49 19.5 54" stroke="#6366f1" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M 81.5 42 Q 82.5 49 80.5 54" stroke="#6366f1" strokeWidth="1.4" strokeLinecap="round" />

        {/* ======================================================== */}
        {/* 4. LARGE OBJECTIVE LENSES (The Dual Discovery Optics)    */}
        {/* ======================================================== */}
        
        {/* Left Objective Outer Armor Ring */}
        <circle 
          cx="33" 
          cy="67" 
          r="19" 
          fill="#0f172a" 
          stroke={`url(#${uid}_metal)`} 
          strokeWidth="2.4" 
        />
        {/* Left Fluorite Coated Bezel */}
        <circle 
          cx="33" 
          cy="67" 
          r="16.5" 
          stroke={`url(#${uid}_fluorite)`} 
          strokeWidth="1.2" 
          fillOpacity="0.1" 
        />
        {/* Left Lens Glass Well */}
        <circle 
          cx="33" 
          cy="67" 
          r="15" 
          fill={`url(#${uid}_lens_well)`} 
        />

        {/* Right Objective Outer Armor Ring */}
        <circle 
          cx="67" 
          cy="67" 
          r="19" 
          fill="#0f172a" 
          stroke={`url(#${uid}_metal)`} 
          strokeWidth="2.4" 
        />
        {/* Right Fluorite Coated Bezel */}
        <circle 
          cx="67" 
          cy="67" 
          r="16.5" 
          stroke={`url(#${uid}_fluorite)`} 
          strokeWidth="1.2" 
          fillOpacity="0.1" 
        />
        {/* Right Lens Glass Well */}
        <circle 
          cx="67" 
          cy="67" 
          r="15" 
          fill={`url(#${uid}_lens_well)`} 
        />
      </g>

      {/* ======================================================== */}
      {/* 5. INTERNAL OPTICAL SIGHTS: JOB (Left) & SCOUT (Right)   */}
      {/* ======================================================== */}

      {/* --- LEFT LENS: The "JOB" Executive Briefcase Icon --- */}
      <g id="lens-left-job">
        {/* Subtle Lens Reticle Ring */}
        <circle cx="33" cy="67" r="11" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="1.5 2.5" strokeOpacity="0.6" />
        
        {/* Briefcase Handle */}
        <path 
          d="M 30 61.5 L 30 59.5 C 30 58.8 30.6 58.2 31.3 58.2 L 34.7 58.2 C 35.4 58.2 36 58.8 36 59.5 L 36 61.5" 
          stroke="#38bdf8" 
          strokeWidth="1.4" 
          strokeLinecap="round" 
        />
        {/* Briefcase Main Body */}
        <rect 
          x="26" 
          y="61.5" 
          width="14" 
          height="10.5" 
          rx="2" 
          fill={`url(#${uid}_job_briefcase)`} 
          stroke="#e0f2fe" 
          strokeWidth="1.2" 
          filter={`url(#${uid}_glow)`}
        />
        {/* Briefcase Seam & Lock Clasp */}
        <line x1="26" y1="65.5" x2="40" y2="65.5" stroke="#0c4a6e" strokeWidth="0.8" />
        <rect x="31.8" y="64.5" width="2.4" height="2" rx="0.5" fill="#fde047" stroke="#b45309" strokeWidth="0.5" />
      </g>

      {/* --- RIGHT LENS: The "SCOUT" Radar & Location Pin Target --- */}
      <g id="lens-right-scout">
        {/* Targeting Radar Crosshair Circle */}
        <circle cx="67" cy="67" r="11" stroke="#10b981" strokeWidth="0.8" strokeDasharray="1.5 2.5" strokeOpacity="0.7" />
        
        {/* Micro Crosshair Ticks */}
        <line x1="67" y1="54" x2="67" y2="57" stroke="#34d399" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="67" y1="77" x2="67" y2="80" stroke="#34d399" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="54" y1="67" x2="57" y2="67" stroke="#34d399" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="77" y1="67" x2="80" y2="67" stroke="#34d399" strokeWidth="1.2" strokeLinecap="round" />

        {/* Scout Map Pin Beacon */}
        <path 
          d="M 67 60 C 64.2 60 62 62.2 62 65 C 62 68.5 67 74 67 74 C 67 74 72 68.5 72 65 C 72 62.2 69.8 60 67 60 Z" 
          fill={`url(#${uid}_scout_cross)`} 
          stroke="#ffffff" 
          strokeWidth="1.2"
          filter={`url(#${uid}_glow)`}
        />
        {/* Center Pin Quantum Dot */}
        <circle cx="67" cy="64.5" r="1.5" fill="#ffffff" />
      </g>

      {/* ======================================================== */}
      {/* 6. REALISTIC OPTICAL GLASS SPECULAR REFLECTIONS          */}
      {/* ======================================================== */}
      <g id="glass-specular-reflections" pointerEvents="none">
        {/* Left Lens Crescent Reflection */}
        <path 
          d="M 23 60 C 26 55 35 55 41 58 C 39 56 31 54 25 58 Z" 
          fill="#ffffff" 
          fillOpacity="0.45" 
        />
        {/* Right Lens Crescent Reflection */}
        <path 
          d="M 57 60 C 60 55 69 55 75 58 C 73 56 65 54 59 58 Z" 
          fill="#ffffff" 
          fillOpacity="0.45" 
        />

        {/* Small diagonal glints for pristine camera lens glass effect */}
        <ellipse cx="28" cy="72" rx="3" ry="1.2" transform="rotate(-35 28 72)" fill="#ffffff" fillOpacity="0.25" />
        <ellipse cx="62" cy="72" rx="3" ry="1.2" transform="rotate(-35 62 72)" fill="#ffffff" fillOpacity="0.25" />
      </g>
    </svg>
  );
};
