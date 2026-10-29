import React from 'react';
import emblemPng from '../assets/jobscout-emblem.png';
import fullLogoPng from '../assets/jobscout-logo.png';

/**
 * JobScout Official Brand Logo
 * 
 * Features:
 * - 3D Precision Binoculars with Specular Blue Lenses
 * - Vibrant Red Geospatial Location Marker Pin
 * - Dynamic Blue Speed Discovery Swooshes
 * - Dual Variants:
 *    - 'emblem' (default): Square emblem with binoculars + location pin (ideal for icons, navbars, buttons)
 *    - 'full': Complete brand lockup with stylized italicized "JOBSCOUT" typography
 */
export const JobScoutLogo = ({ 
  size = 40, 
  className = '', 
  withBadge = false, 
  animated = false,
  variant = 'emblem',
  full = false,
  alt = 'JobScout Logo'
}) => {
  const isFull = full || variant === 'full';
  const imageSrc = isFull ? fullLogoPng : emblemPng;

  // If size is a number, calculate inline dimensions when className does not specify them
  const hasWidthClass = /\bw-\S+/.test(className);
  const hasHeightClass = /\bh-\S+/.test(className);

  const style = {};
  if (!hasHeightClass && size) {
    style.height = typeof size === 'number' ? `${size}px` : size;
  }
  if (!hasWidthClass && size) {
    const widthVal = isFull 
      ? (typeof size === 'number' ? Math.round(size * 2.21) : `calc(${size} * 2.21)`)
      : size;
    style.width = typeof widthVal === 'number' ? `${widthVal}px` : widthVal;
  }

  return (
    <div 
      className={`relative inline-flex items-center justify-center select-none flex-shrink-0 transition-transform duration-300 ${className}`}
      style={style}
    >
      <img
        src={imageSrc}
        alt={alt}
        className={`w-full h-full object-contain select-none pointer-events-none drop-shadow-[0_2px_8px_rgba(2,132,199,0.18)] ${
          animated ? 'animate-pulse scale-105' : ''
        }`}
        loading="eager"
        decoding="async"
        draggable={false}
      />

      {withBadge && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-gradient-to-tr from-emerald-500 to-cyan-500 border-2 border-white shadow-xs" />
        </span>
      )}
    </div>
  );
};

export default JobScoutLogo;
