import React from 'react';

/**
 * Premium Luxury & Catchy Colorful Navigation Icons for JobScout Flagship UI
 * Designed with Apple / Linear / Figma inspired multi-chromatic micro-gradients,
 * specular highlights, energetic hues, and luminous glow drop-shadows.
 * Uses React.useId() for 100% collision-free SVG gradient IDs across all DOM trees.
 */

// 1. Feed (Home) Icon - Royal Indigo & Electric Violet with Warm Golden Amber Skylight
export const NavFeedIcon = ({ active = false, className = "w-[19px] h-[19px]" }) => {
  const rawId = React.useId();
  const uid = 'feed_' + rawId.replace(/[^a-zA-Z0-9]/g, '');

  return (
    <svg 
      className={`${className} transition-all duration-300 ${
        active 
          ? 'scale-110 drop-shadow-[0_3px_10px_rgba(99,102,241,0.55)]' 
          : 'hover:scale-105 drop-shadow-[0_1px_4px_rgba(99,102,241,0.2)]'
      }`}
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`${uid}_roof`} x1="3" y1="3" x2="21" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor={active ? "#4F46E5" : "#6366F1"} />
          <stop offset="0.5" stopColor={active ? "#7C3AED" : "#8B5CF6"} />
          <stop offset="1" stopColor={active ? "#9333EA" : "#A855F7"} />
        </linearGradient>
        <linearGradient id={`${uid}_body`} x1="5" y1="10" x2="19" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#818CF8" stopOpacity={active ? "0.35" : "0.22"} />
          <stop offset="1" stopColor="#6366F1" stopOpacity={active ? "0.5" : "0.3"} />
        </linearGradient>
        <linearGradient id={`${uid}_door`} x1="10" y1="13" x2="14" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor={active ? "#F59E0B" : "#FBBF24"} />
          <stop offset="1" stopColor={active ? "#D97706" : "#F59E0B"} />
        </linearGradient>
      </defs>
      {/* Roof Gable */}
      <path 
        d="M2.5 10.2L10.65 3.38C11.43 2.73 12.57 2.73 13.35 3.38L21.5 10.2" 
        stroke={`url(#${uid}_roof)`} 
        strokeWidth="2.4" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      {/* House Body (Duotone fill + stroke) */}
      <path 
        d="M5 8.8V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V8.8" 
        fill={`url(#${uid}_body)`}
        stroke={`url(#${uid}_roof)`} 
        strokeWidth="2" 
        strokeLinejoin="round" 
      />
      {/* Catchy Warm Amber Door with glow */}
      <path 
        d="M10 21V15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15V21" 
        fill={`url(#${uid}_door)`}
        opacity={active ? "1" : "0.9"} 
      />
      {/* Chimney / Modern Skylight */}
      <path 
        d="M17 5.5V3H19V7.2" 
        stroke={`url(#${uid}_roof)`} 
        strokeWidth="2" 
        strokeLinecap="round" 
      />
    </svg>
  );
};

// 2. Network (Connections & People) Icon - Electric Cyan, Sky Blue & Emerald Nodes
export const NavNetworkIcon = ({ active = false, className = "w-[19px] h-[19px]" }) => {
  const rawId = React.useId();
  const uid = 'net_' + rawId.replace(/[^a-zA-Z0-9]/g, '');

  return (
    <svg 
      className={`${className} transition-all duration-300 ${
        active 
          ? 'scale-110 drop-shadow-[0_3px_10px_rgba(6,182,212,0.55)]' 
          : 'hover:scale-105 drop-shadow-[0_1px_4px_rgba(6,182,212,0.25)]'
      }`}
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`${uid}_primary`} x1="2" y1="2" x2="16" y2="19" gradientUnits="userSpaceOnUse">
          <stop stopColor={active ? "#0284C7" : "#0EA5E9"} />
          <stop offset="1" stopColor={active ? "#06B6D4" : "#22D3EE"} />
        </linearGradient>
        <linearGradient id={`${uid}_secondary`} x1="15" y1="6" x2="23" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor={active ? "#10B981" : "#34D399"} />
          <stop offset="1" stopColor={active ? "#06B6D4" : "#38BDF8"} />
        </linearGradient>
      </defs>
      {/* Primary User Head */}
      <circle 
        cx="9" 
        cy="7" 
        r="3.5" 
        fill="#0EA5E9" 
        fillOpacity={active ? "0.35" : "0.25"} 
        stroke={`url(#${uid}_primary)`} 
        strokeWidth="2.2" 
      />
      {/* Primary User Body */}
      <path 
        d="M2.5 19C2.5 15.68 5.41 13 9 13C12.59 13 15.5 15.68 15.5 19" 
        stroke={`url(#${uid}_primary)`} 
        strokeWidth="2.2" 
        strokeLinecap="round" 
      />
      {/* Secondary Linked Node / Avatar (Catchy Emerald) */}
      <circle 
        cx="17.5" 
        cy="8.5" 
        r="2.5" 
        fill="#10B981" 
        fillOpacity={active ? "0.4" : "0.3"} 
        stroke={`url(#${uid}_secondary)`} 
        strokeWidth="2" 
      />
      {/* Secondary Body Arc */}
      <path 
        d="M15 15C16.14 14.38 17.5 14 19 14C21.2 14 23 15.34 23 17" 
        stroke={`url(#${uid}_secondary)`} 
        strokeWidth="2" 
        strokeLinecap="round" 
      />
      {/* Quantum Bridge / Pulse Link */}
      <path 
        d="M12.5 7.5L15 8.5" 
        stroke="#F59E0B" 
        strokeWidth="2" 
        strokeDasharray="2 2" 
        strokeLinecap="round" 
      />
    </svg>
  );
};

// 3. Radar (Geospatial Sonar Map) Icon - Neon Cyber Emerald, Mint & Glowing Pulse
export const NavRadarIcon = ({ active = false, className = "w-[19px] h-[19px]" }) => {
  const rawId = React.useId();
  const uid = 'radar_' + rawId.replace(/[^a-zA-Z0-9]/g, '');

  return (
    <svg 
      className={`${className} transition-all duration-300 ${
        active 
          ? 'scale-110 drop-shadow-[0_3px_10px_rgba(16,185,129,0.6)]' 
          : 'hover:scale-105 drop-shadow-[0_1px_4px_rgba(16,185,129,0.25)]'
      }`}
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`${uid}_beam`} x1="12" y1="12" x2="22" y2="4" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10B981" />
          <stop offset="0.6" stopColor="#06B6D4" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id={`${uid}_scope`} x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor={active ? "#059669" : "#10B981"} />
          <stop offset="1" stopColor={active ? "#06B6D4" : "#0EA5E9"} />
        </linearGradient>
      </defs>
      {/* Outer Radar Scope Ring */}
      <circle 
        cx="12" 
        cy="12" 
        r="9" 
        stroke={`url(#${uid}_scope)`} 
        strokeWidth="2.2" 
        strokeOpacity={active ? "1" : "0.9"}
      />
      {/* Inner Range Ring */}
      <circle 
        cx="12" 
        cy="12" 
        r="5" 
        stroke="#22D3EE" 
        strokeWidth="1.6" 
        strokeDasharray="2 3" 
      />
      {/* Core Sonar Emitter */}
      <circle 
        cx="12" 
        cy="12" 
        r="2.2" 
        fill="#10B981" 
      />
      {/* Scanning Sweep Vector Beam */}
      <path 
        d="M12 12L19.5 5.5" 
        stroke={`url(#${uid}_beam)`} 
        strokeWidth="2.4" 
        strokeLinecap="round" 
      />
      {/* Radar Target Echo Ping */}
      <circle 
        cx="17" 
        cy="8" 
        r="2.4" 
        fill="#F43F5E" 
        className={active ? "animate-ping" : ""}
      />
      <circle 
        cx="17" 
        cy="8" 
        r="1.8" 
        fill="#F43F5E" 
      />
    </svg>
  );
};

// 4. Jobs (Executive Briefcase & Portfolio) Icon - Royal Purple, Hot Fuchsia & 24K Gold Clasp
export const NavJobsIcon = ({ active = false, className = "w-[19px] h-[19px]" }) => {
  const rawId = React.useId();
  const uid = 'jobs_' + rawId.replace(/[^a-zA-Z0-9]/g, '');

  return (
    <svg 
      className={`${className} transition-all duration-300 ${
        active 
          ? 'scale-110 drop-shadow-[0_3px_10px_rgba(168,85,247,0.6)]' 
          : 'hover:scale-105 drop-shadow-[0_1px_4px_rgba(168,85,247,0.25)]'
      }`}
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`${uid}_case`} x1="2" y1="7" x2="22" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor={active ? "#7C3AED" : "#8B5CF6"} />
          <stop offset="0.6" stopColor={active ? "#9333EA" : "#A855F7"} />
          <stop offset="1" stopColor={active ? "#C026D3" : "#D946EF"} />
        </linearGradient>
        <linearGradient id={`${uid}_fill`} x1="2" y1="7" x2="22" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A855F7" stopOpacity={active ? "0.35" : "0.22"} />
          <stop offset="1" stopColor="#EC4899" stopOpacity={active ? "0.45" : "0.28"} />
        </linearGradient>
        <linearGradient id={`${uid}_gold`} x1="10" y1="10" x2="14" y2="14" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDE047" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      {/* Portfolio Handle */}
      <path 
        d="M8.5 7V5C8.5 3.9 9.4 3 10.5 3H13.5C14.6 3 15.5 3.9 15.5 5V7" 
        stroke={`url(#${uid}_case)`} 
        strokeWidth="2.2" 
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
        strokeWidth="2.2" 
      />
      {/* Executive Center Seam */}
      <path 
        d="M2.5 12H21.5" 
        stroke={`url(#${uid}_case)`} 
        strokeWidth="1.8" 
      />
      {/* 24K Gold Clasp / Buckle */}
      <rect 
        x="10" 
        y="10.5" 
        width="4" 
        height="3.5" 
        rx="1" 
        fill={`url(#${uid}_gold)`} 
        stroke="#D97706" 
        strokeWidth="1.2" 
      />
    </svg>
  );
};

// 5. Connect (Live Hub & Speed Signals) Icon - Radiant Jade, Neon Cyan & Ultrasonic Waves
export const NavConnectIcon = ({ active = false, className = "w-[19px] h-[19px]" }) => {
  const rawId = React.useId();
  const uid = 'connect_' + rawId.replace(/[^a-zA-Z0-9]/g, '');

  return (
    <svg 
      className={`${className} transition-all duration-300 ${
        active 
          ? 'scale-110 drop-shadow-[0_3px_10px_rgba(20,184,166,0.6)]' 
          : 'hover:scale-105 drop-shadow-[0_1px_4px_rgba(20,184,166,0.25)]'
      }`}
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`${uid}_wave`} x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor={active ? "#059669" : "#10B981"} />
          <stop offset="0.5" stopColor={active ? "#0D9488" : "#14B8A6"} />
          <stop offset="1" stopColor={active ? "#0284C7" : "#06B6D4"} />
        </linearGradient>
      </defs>
      {/* Central Signal Core with Energetic Glow */}
      <circle 
        cx="12" 
        cy="12" 
        r="3" 
        fill="#10B981" 
        stroke="#34D399"
        strokeWidth="1.5"
      />
      {/* Inner Wave Arcs */}
      <path 
        d="M8.5 8.5C6.55 10.45 6.55 13.55 8.5 15.5" 
        stroke={`url(#${uid}_wave)`} 
        strokeWidth="2.2" 
        strokeLinecap="round" 
      />
      <path 
        d="M15.5 8.5C17.45 10.45 17.45 13.55 15.5 15.5" 
        stroke={`url(#${uid}_wave)`} 
        strokeWidth="2.2" 
        strokeLinecap="round" 
      />
      {/* Outer Acoustic Broadcast Arcs */}
      <path 
        d="M5 5C1.1 8.9 1.1 15.1 5 19" 
        stroke={`url(#${uid}_wave)`} 
        strokeWidth="2.2" 
        strokeLinecap="round" 
        strokeOpacity={active ? "1" : "0.85"}
      />
      <path 
        d="M19 5C22.9 8.9 22.9 15.1 19 19" 
        stroke={`url(#${uid}_wave)`} 
        strokeWidth="2.2" 
        strokeLinecap="round" 
        strokeOpacity={active ? "1" : "0.85"}
      />
    </svg>
  );
};

// 6. Anon Talk (Incognito Ember Flame) Icon - Fiery Sunset Orange, Molten Gold & Crimson
export const NavAnonIcon = ({ active = false, className = "w-[19px] h-[19px]" }) => {
  const rawId = React.useId();
  const uid = 'anon_' + rawId.replace(/[^a-zA-Z0-9]/g, '');

  return (
    <svg 
      className={`${className} transition-all duration-300 ${
        active 
          ? 'scale-110 drop-shadow-[0_3px_10px_rgba(249,115,22,0.65)]' 
          : 'hover:scale-105 drop-shadow-[0_1px_4px_rgba(249,115,22,0.25)]'
      }`}
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`${uid}_outer`} x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor={active ? "#EA580C" : "#F97316"} />
          <stop offset="0.5" stopColor={active ? "#DC2626" : "#EF4444"} />
          <stop offset="1" stopColor={active ? "#C026D3" : "#E11D48"} />
        </linearGradient>
        <linearGradient id={`${uid}_inner`} x1="12" y1="11" x2="12" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDE047" />
          <stop offset="0.6" stopColor="#F59E0B" />
          <stop offset="1" stopColor="#EA580C" />
        </linearGradient>
      </defs>
      {/* Main Stylized Flame Crown */}
      <path 
        d="M12 2C10.5 4.5 9 6.8 9 9.5C9 10.4 9.2 11.2 9.6 12C8.2 11.8 7.2 10.7 7 9.5C5.1 11.7 4 14.2 4 16.5C4 20.1 7.1 22 12 22C16.9 22 20 20.1 20 16.5C20 12.8 17 8.5 12 2Z" 
        fill={`url(#${uid}_outer)`} 
        fillOpacity={active ? "0.35" : "0.22"} 
        stroke={`url(#${uid}_outer)`} 
        strokeWidth="2.2" 
        strokeLinejoin="round" 
      />
      {/* Glowing Inner Molten Gold Ember Core */}
      <path 
        d="M12 13C10.9 13 10 14.1 10 15.5C10 17.5 11.5 19 12 19C12.5 19 14 17.5 14 15.5C14 14.1 13.1 13 12 13Z" 
        fill={`url(#${uid}_inner)`} 
      />
      {/* Mystery Cosmic Sparkle */}
      <circle 
        cx="16.5" 
        cy="7.5" 
        r="1.4" 
        fill="#FBBF24" 
      />
    </svg>
  );
};

// 7. Messages (Floating Dual Chat Bubbles) Icon - Vibrant Indigo, Royal Blue & Cyber Cyan
export const NavMessagesIcon = ({ active = false, className = "w-[19px] h-[19px]" }) => {
  const rawId = React.useId();
  const uid = 'msg_' + rawId.replace(/[^a-zA-Z0-9]/g, '');

  return (
    <svg 
      className={`${className} transition-all duration-300 ${
        active 
          ? 'scale-110 drop-shadow-[0_3px_10px_rgba(79,70,229,0.55)]' 
          : 'hover:scale-105 drop-shadow-[0_1px_4px_rgba(79,70,229,0.25)]'
      }`}
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`${uid}_bubble`} x1="2" y1="3" x2="22" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor={active ? "#4338CA" : "#6366F1"} />
          <stop offset="0.6" stopColor={active ? "#6366F1" : "#8B5CF6"} />
          <stop offset="1" stopColor={active ? "#0284C7" : "#06B6D4"} />
        </linearGradient>
      </defs>
      {/* Background Ambient Chat Bubble */}
      <path 
        d="M17 12V8C17 5.8 15.2 4 13 4H6C3.8 4 2 5.8 2 8V14C2 16.2 3.8 18 6 18H7V20.5L10 18H13" 
        stroke="#A855F7" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeOpacity={active ? "0.95" : "0.75"}
      />
      {/* Foreground Hero Capsule Bubble */}
      <path 
        d="M10 9H18C20.2 9 22 10.8 22 13V17C22 19.2 20.2 21 18 21H17L14 23V21H10C7.8 21 6 19.2 6 17V13C6 10.8 7.8 9 10 9Z" 
        fill="#6366F1" 
        fillOpacity={active ? "0.3" : "0.2"} 
        stroke={`url(#${uid}_bubble)`} 
        strokeWidth="2.2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      {/* Triple Candy Chat Dots (Catchy Color Trio: Indigo, Pink, Cyan) */}
      <circle cx="11" cy="15" r="1.3" fill="#6366F1" />
      <circle cx="14" cy="15" r="1.3" fill="#EC4899" />
      <circle cx="17" cy="15" r="1.3" fill="#06B6D4" />
    </svg>
  );
};
