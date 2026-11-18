import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Zap, 
  Mic, 
  Plus, 
  X, 
  Palette,
  Briefcase 
} from 'lucide-react';
import { getThemeById, getNextTheme } from '../utils/theme';

export const FloatingSpeedDial = ({
  onOpenPostJob,
  onOpenVoiceSearch,
  onToggleTheme,
  theme = 'light',
  onInstantShift,
  onStartMockInterview
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close on outside tap
  useEffect(() => {
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('touchstart', handleOutside);
      document.addEventListener('mousedown', handleOutside);
    }
    return () => {
      document.removeEventListener('touchstart', handleOutside);
      document.removeEventListener('mousedown', handleOutside);
    };
  }, [isOpen]);

  return (
    <div 
      ref={menuRef}
      className="md:hidden fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] right-4 z-[850] select-none"
    >
      {/* Expanded Radial Speed-Dial Actions */}
      {isOpen && (
        <div className="flex flex-col items-end gap-2.5 mb-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* Action 1: Instant Shift Filter */}
          <button
            type="button"
            onClick={() => {
              if (onInstantShift) onInstantShift();
              setIsOpen(false);
            }}
            className="flex items-center gap-2 pl-3.5 pr-2.5 py-1.5 rounded-full bg-slate-900/90 text-white backdrop-blur-xl border border-emerald-500/50 shadow-xl active:scale-95 transition-transform"
          >
            <span className="text-[11px] font-black text-emerald-300">⚡ Instant Shift (24h)</span>
            <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
            </div>
          </button>

          {/* Action 2: Voice AI Mock Interview */}
          <button
            type="button"
            onClick={() => {
              if (onStartMockInterview) onStartMockInterview(null);
              setIsOpen(false);
            }}
            className="flex items-center gap-2 pl-3.5 pr-2.5 py-1.5 rounded-full bg-slate-900/90 text-white backdrop-blur-xl border border-violet-500/50 shadow-xl active:scale-95 transition-transform"
          >
            <span className="text-[11px] font-black text-violet-300">🎙️ Voice AI Mock</span>
            <div className="w-7 h-7 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold">
              <Mic className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Action 3: 4-Theme Engine Palette Switcher */}
          {onToggleTheme && (() => {
            const currentThemeInfo = getThemeById(theme);
            const nextThemeId = getNextTheme(theme);
            const nextThemeInfo = getThemeById(nextThemeId);
            return (
              <button
                type="button"
                onClick={() => {
                  onToggleTheme();
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 pl-3.5 pr-2.5 py-1.5 rounded-full bg-slate-900/90 text-white backdrop-blur-xl border border-white/20 shadow-xl active:scale-95 transition-transform"
              >
                <span className="text-[11px] font-black text-slate-200">
                  {currentThemeInfo.icon} {currentThemeInfo.name} → {nextThemeInfo.label}
                </span>
                <div 
                  className="w-7 h-7 rounded-full text-white flex items-center justify-center font-bold shadow-xs"
                  style={{ backgroundColor: currentThemeInfo.color }}
                >
                  <Palette className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })()}

          {/* Action 4: Post Opportunity */}
          {onOpenPostJob && (
            <button
              type="button"
              onClick={() => {
                onOpenPostJob();
                setIsOpen(false);
              }}
              className="flex items-center gap-2 pl-3.5 pr-2.5 py-1.5 rounded-full bg-slate-900/90 text-white backdrop-blur-xl border border-indigo-500/50 shadow-xl active:scale-95 transition-transform"
            >
              <span className="text-[11px] font-black text-indigo-300">➕ Post Job / Update</span>
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                <Briefcase className="w-3.5 h-3.5" />
              </div>
            </button>
          )}

        </div>
      )}

      {/* Main Elevated Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-12 h-12 rounded-2xl flex items-center justify-center shadow-[0_8px_25px_rgba(79,70,229,0.4)] active:scale-90 transition-all duration-300 border ${
          isOpen
            ? 'bg-rose-600 text-white border-rose-400 rotate-90 scale-105'
            : 'bg-gradient-to-tr from-indigo-600 via-indigo-700 to-cyan-500 text-white border-white/30 rotate-0 hover:scale-105'
        }`}
        title="JobScout Fast Speed-Dial Actions"
        aria-label="Speed Dial Menu"
      >
        {/* Glow halo */}
        <span className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-400 blur-md opacity-50 animate-pulse pointer-events-none" />
        
        <span className="relative z-10">
          {isOpen ? <X className="w-5 h-5 text-white" /> : <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />}
        </span>
      </button>
    </div>
  );
};
