import React from 'react';

/**
 * Premium Luxury Navigation Icons for JobScout Flagship UI
 * Designed with duotone layered geometry, specular highlights, and fluid micro-gradients.
 * Uses React.useId() for 100% collision-free SVG gradient IDs across Chrome/Chromium DOM trees.
 */

// 1. Feed (Home) Icon
export const NavFeedIcon = ({ active = false, className = "w-[18px] h-[18px]" }) => {
  const rawId = React.useId();
  const uid = 'feed_' + rawId.replace(/[^a-zA-Z0-9]/g, '');

  return (
    <svg 
      className={`${className} transition-all duration-300 ${active ? 'scale-105 drop-shadow-[0_2px_8px_rgba(99,102,241,0.35)]' : 'group-hover:scale-105'}`}
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`${uid}_roof`} x1="3" y1="3" x2="21" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor={active ? "#6366F1" : "#64748B"} />
          <stop offset="1" stopColor={active ? "#8B5CF6" : "#475569"} />
        </linearGradient>
        <linearGradient id={`${uid}_body`} x1="5" y1="10" x2="19" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor={active ? "#818CF8" : "#94A3B8"} stopOpacity={active ? "0.22" : "0.15"} />
          <stop offset="1" stopColor={active ? "#6366F1" : "#64748B"} stopOpacity={active ? "0.35" : "0.25"} />
        </linearGradient>
      </defs>
      {/* Roof Gable */}
      <path 
        d="M2.5 10.2L10.65 3.38C11.43 2.73 12.57 2.73 13.35 3.38L21.5 10.2" 
        stroke={`url(#${uid}_roof)`} 
        strokeWidth="2.2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      {/* House Body (Duotone fill + stroke) */}
      <path 
        d="M5 8.8V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V8.8" 
        fill={`url(#${uid}_body)`}
        stroke={active ? "#6366F1" : "#64748B"} 
        strokeWidth="2" 
        strokeLinejoin="round" 
      />
      {/* Smart Door / Archway */}
      <path 
        d="M10 21V15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15V21" 
        fill={active ? "#4F46E5" : "#475569"} 
        opacity={active ? "0.9" : "0.6"} 
      />
      {/* Chimney / Modern Skylight */}
      <path 
        d="M17 5.5V3H19V7.2" 
        stroke={`url(#${uid}_roof)`} 
        strokeWidth="1.8" 
        strokeLinecap="round" 
      />
    </svg>
  );
};

// 2. Network (Connections & People) Icon
export const NavNetworkIcon = ({ active = false, className = "w-[18px] h-[18px]" }) => {
  const rawId = React.useId();
  const uid = 'net_' + rawId.replace(/[^a-zA-Z0-9]/g, '');

  return (
    <svg 
      className={`${className} transition-all duration-300 ${active ? 'scale-105 drop-shadow-[0_2px_8px_rgba(79,70,229,0.35)]' : 'group-hover:scale-105'}`}
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`${uid}_prim`} x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor={active ? "#4F46E5" : "#64748B"} />
          <stop offset="1" stopColor={active ? "#06B6D4" : "#475569"} />
        </linearGradient>
      </defs>
      {/* Primary User Head */}
      <circle 
        cx="9" 
        cy="7" 
        r="3.5" 
        fill={active ? "#4F46E5" : "#64748B"} 
        fillOpacity={active ? "0.2" : "0.15"} 
        stroke={`url(#${uid}_prim)`} 
        strokeWidth="2" 
      />
      {/* Primary User Body */}
      <path 
        d="M2.5 19C2.5 15.68 5.41 13 9 13C12.59 13 15.5 15.68 15.5 19" 
        stroke={`url(#${uid}_prim)`} 
        strokeWidth="2" 
        strokeLinecap="round" 
      />
      {/* Secondary Linked Node / Avatar */}
      <circle 
        cx="17.5" 
        cy="8.5" 
        r="2.5" 
        fill={active ? "#06B6D4" : "#94A3B8"} 
        fillOpacity={active ? "0.3" : "0.2"} 
        stroke={active ? "#06B6D4" : "#64748B"} 
        strokeWidth="1.8" 
      />
      {/* Secondary Body Arc */}
      <path 
        d="M15 15C16.14 14.38 17.5 14 19 14C21.2 14 23 15.34 23 17" 
        stroke={active ? "#06B6D4" : "#64748B"} 
        strokeWidth="1.8" 
        strokeLinecap="round" 
      />
      {/* Quantum Bridge / Pulse Link */}
      <path 
        d="M12.5 7.5L15 8.5" 
        stroke={active ? "#06B6D4" : "#94A3B8"} 
        strokeWidth="1.6" 
        strokeDasharray="2 2" 
        strokeLinecap="round" 
      />
    </svg>
  );
};

// 3. Radar (Geospatial Sonar Map) Icon
export const NavRadarIcon = ({ active = false, className = "w-[18px] h-[18px]" }) => {
  const rawId = React.useId();
  const uid = 'radar_' + rawId.replace(/[^a-zA-Z0-9]/g, '');

  return (
    <svg 
      className={`${className} transition-all duration-300 ${active ? 'scale-105 drop-shadow-[0_2px_8px_rgba(6,182,212,0.4)]' : 'group-hover:scale-105'}`}
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`${uid}_beam`} x1="12" y1="12" x2="22" y2="4" gradientUnits="userSpaceOnUse">
          <stop stopColor={active ? "#06B6D4" : "#64748B"} />
          <stop offset="1" stopColor={active ? "#10B981" : "#475569"} />
        </linearGradient>
      </defs>
      {/* Outer Radar Scope Ring */}
      <circle 
        cx="12" 
        cy="12" 
        r="9" 
        stroke={active ? "#06B6D4" : "#64748B"} 
        strokeWidth="2" 
        strokeOpacity={active ? "1" : "0.8"}
      />
      {/* Inner Range Ring */}
      <circle 
        cx="12" 
        cy="12" 
        r="5" 
        stroke={active ? "#0EA5E9" : "#94A3B8"} 
        strokeWidth="1.5" 
        strokeDasharray="2 3" 
      />
      {/* Core Sonar Emitter */}
      <circle 
        cx="12" 
        cy="12" 
        r="2" 
        fill={active ? "#06B6D4" : "#64748B"} 
      />
      {/* Scanning Sweep Vector Beam */}
      <path 
        d="M12 12L19.5 5.5" 
        stroke={`url(#${uid}_beam)`} 
        strokeWidth="2" 
        strokeLinecap="round" 
      />
      {/* Radar Target Echo Ping - uses animate-pulse for perfect Chrome SVG origin centering */}
      <circle 
        cx="17" 
        cy="8" 
        r="2" 
        fill={active ? "#10B981" : "#0EA5E9"} 
        className={active ? "animate-pulse" : ""}
      />
    </svg>
  );
};

// 4. Jobs (Executive Briefcase & Portfolio) Icon
export const NavJobsIcon = ({ active = false, className = "w-[18px] h-[18px]" }) => {
  const rawId = React.useId();
  const uid = 'jobs_' + rawId.replace(/[^a-zA-Z0-9]/g, '');

  return (
    <svg 
      className={`${className} transition-all duration-300 ${active ? 'scale-105 drop-shadow-[0_2px_8px_rgba(124,58,237,0.35)]' : 'group-hover:scale-105'}`}
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`${uid}_case`} x1="2" y1="7" x2="22" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor={active ? "#8B5CF6" : "#64748B"} />
          <stop offset="1" stopColor={active ? "#6366F1" : "#475569"} />
        </linearGradient>
        <linearGradient id={`${uid}_fill`} x1="2" y1="7" x2="22" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor={active ? "#8B5CF6" : "#94A3B8"} stopOpacity={active ? "0.2" : "0.12"} />
          <stop offset="1" stopColor={active ? "#6366F1" : "#64748B"} stopOpacity={active ? "0.3" : "0.2"} />
        </linearGradient>
      </defs>
      {/* Portfolio Handle */}
      <path 
        d="M8.5 7V5C8.5 3.9 9.4 3 10.5 3H13.5C14.6 3 15.5 3.9 15.5 5V7" 
        stroke={`url(#${uid}_case)`} 
        strokeWidth="2" 
        strokeLinecap="round" 
      />
      {/* Briefcase Body with Rounded Luxury Edges */}
      <rect 
        x="2.5" 
        y="7" 
        width="19" 
        height="14" 
        rx="3" 
        fill={`url(#${uid}_fill)`}
        stroke={`url(#${uid}_case)`} 
        strokeWidth="2" 
      />
      {/* Executive Center Seam & Lock */}
      <path 
        d="M2.5 12H21.5" 
        stroke={active ? "#8B5CF6" : "#64748B"} 
        strokeWidth="1.6" 
        strokeOpacity={active ? "0.8" : "0.6"}
      />
      {/* Metallic Center Clasp / Buckle */}
      <rect 
        x="10" 
        y="10.5" 
        width="4" 
        height="3.5" 
        rx="1" 
        fill={active ? "#C084FC" : "#CBD5E1"} 
        stroke={active ? "#7C3AED" : "#475569"} 
        strokeWidth="1.2" 
      />
    </svg>
  );
};

// 5. Connect (Live Hub & Speed Signals) Icon
export const NavConnectIcon = ({ active = false, className = "w-[18px] h-[18px]" }) => {
  const rawId = React.useId();
  const uid = 'connect_' + rawId.replace(/[^a-zA-Z0-9]/g, '');

  return (
    <svg 
      className={`${className} transition-all duration-300 ${active ? 'scale-105 drop-shadow-[0_2px_8px_rgba(16,185,129,0.35)]' : 'group-hover:scale-105'}`}
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`${uid}_wave`} x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor={active ? "#10B981" : "#64748B"} />
          <stop offset="1" stopColor={active ? "#06B6D4" : "#475569"} />
        </linearGradient>
      </defs>
      {/* Central Signal Core */}
      <circle 
        cx="12" 
        cy="12" 
        r="2.5" 
        fill={active ? "#10B981" : "#64748B"} 
      />
      {/* Inner Wave Arcs */}
      <path 
        d="M8.5 8.5C6.55 10.45 6.55 13.55 8.5 15.5" 
        stroke={`url(#${uid}_wave)`} 
        strokeWidth="2" 
        strokeLinecap="round" 
      />
      <path 
        d="M15.5 8.5C17.45 10.45 17.45 13.55 15.5 15.5" 
        stroke={`url(#${uid}_wave)`} 
        strokeWidth="2" 
        strokeLinecap="round" 
      />
      {/* Outer Acoustic Broadcast Arcs */}
      <path 
        d="M5 5C1.1 8.9 1.1 15.1 5 19" 
        stroke={`url(#${uid}_wave)`} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeOpacity={active ? "0.9" : "0.6"}
      />
      <path 
        d="M19 5C22.9 8.9 22.9 15.1 19 19" 
        stroke={`url(#${uid}_wave)`} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeOpacity={active ? "0.9" : "0.6"}
      />
    </svg>
  );
};

// 6. Anon Talk (Incognito Ember Flame) Icon
export const NavAnonIcon = ({ active = false, className = "w-[18px] h-[18px]" }) => {
  const rawId = React.useId();
  const uid = 'anon_' + rawId.replace(/[^a-zA-Z0-9]/g, '');

  return (
    <svg 
      className={`${className} transition-all duration-300 ${active ? 'scale-105 drop-shadow-[0_2px_8px_rgba(249,115,22,0.4)]' : 'group-hover:scale-105'}`}
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`${uid}_outer`} x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor={active ? "#F97316" : "#64748B"} />
          <stop offset="1" stopColor={active ? "#EF4444" : "#475569"} />
        </linearGradient>
        <linearGradient id={`${uid}_inner`} x1="12" y1="11" x2="12" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor={active ? "#FBBF24" : "#94A3B8"} />
          <stop offset="1" stopColor={active ? "#F97316" : "#64748B"} />
        </linearGradient>
      </defs>
      {/* Main Stylized Flame Crown */}
      <path 
        d="M12 2C10.5 4.5 9 6.8 9 9.5C9 10.4 9.2 11.2 9.6 12C8.2 11.8 7.2 10.7 7 9.5C5.1 11.7 4 14.2 4 16.5C4 20.1 7.1 22 12 22C16.9 22 20 20.1 20 16.5C20 12.8 17 8.5 12 2Z" 
        fill={`url(#${uid}_outer)`} 
        fillOpacity={active ? "0.22" : "0.15"} 
        stroke={`url(#${uid}_outer)`} 
        strokeWidth="2" 
        strokeLinejoin="round" 
      />
      {/* Glowing Inner Ember Core */}
      <path 
        d="M12 13C10.9 13 10 14.1 10 15.5C10 17.5 11.5 19 12 19C12.5 19 14 17.5 14 15.5C14 14.1 13.1 13 12 13Z" 
        fill={`url(#${uid}_inner)`} 
      />
      {/* Subtle Mystery Sparkle */}
      <circle 
        cx="16.5" 
        cy="7.5" 
        r="1" 
        fill={active ? "#F59E0B" : "#94A3B8"} 
      />
    </svg>
  );
};

// 7. Messages (Floating Dual Chat Bubbles) Icon
export const NavMessagesIcon = ({ active = false, className = "w-[18px] h-[18px]" }) => {
  const rawId = React.useId();
  const uid = 'msg_' + rawId.replace(/[^a-zA-Z0-9]/g, '');

  return (
    <svg 
      className={`${className} transition-all duration-300 ${active ? 'scale-105 drop-shadow-[0_2px_8px_rgba(79,70,229,0.35)]' : 'group-hover:scale-105'}`}
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`${uid}_bubble`} x1="2" y1="3" x2="22" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor={active ? "#4F46E5" : "#64748B"} />
          <stop offset="1" stopColor={active ? "#06B6D4" : "#475569"} />
        </linearGradient>
      </defs>
      {/* Background Ambient Chat Bubble */}
      <path 
        d="M17 12V8C17 5.8 15.2 4 13 4H6C3.8 4 2 5.8 2 8V14C2 16.2 3.8 18 6 18H7V20.5L10 18H13" 
        stroke={active ? "#818CF8" : "#94A3B8"} 
        strokeWidth="1.8" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeOpacity={active ? "0.85" : "0.5"}
      />
      {/* Foreground Hero Capsule Bubble */}
      <path 
        d="M10 9H18C20.2 9 22 10.8 22 13V17C22 19.2 20.2 21 18 21H17L14 23V21H10C7.8 21 6 19.2 6 17V13C6 10.8 7.8 9 10 9Z" 
        fill={active ? "#4F46E5" : "#64748B"} 
        fillOpacity={active ? "0.2" : "0.12"} 
        stroke={`url(#${uid}_bubble)`} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      {/* Interactive Chat Dots */}
      <circle cx="11" cy="15" r="1.1" fill={active ? "#4F46E5" : "#64748B"} />
      <circle cx="14" cy="15" r="1.1" fill={active ? "#6366F1" : "#64748B"} />
      <circle cx="17" cy="15" r="1.1" fill={active ? "#06B6D4" : "#64748B"} />
    </svg>
  );
};
