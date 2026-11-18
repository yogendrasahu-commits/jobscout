import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Briefcase, 
  Zap, 
  Sun, 
  Moon, 
  Compass, 
  ChevronDown, 
  ChevronUp, 
  X, 
  Radio, 
  Mic, 
  Activity 
} from 'lucide-react';

export const DynamicIslandPill = ({
  activeLocationName = 'Bandra Kurla Complex (BKC)',
  jobsCount = 0,
  seekersCount = 0,
  isOnline = true,
  currentTab = 'feed',
  setCurrentTab,
  theme = 'light',
  onToggleTheme,
  onStartMockInterview,
  onQuickFilterChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);
  const pillRef = useRef(null);

  // Dynamic status tickers rotating every 4.5 seconds when compact
  const tickers = [
    { text: `⚡ ${jobsCount} Live Tech Openings`, sub: 'Verified Salaries' },
    { text: `📍 ${activeLocationName || 'Mumbai BKC'}`, sub: 'Local Talent Radar' },
    { text: `👥 ${seekersCount} Candidates Active`, sub: 'Real-time GPS' },
    { text: `🎙️ AI Mock Interview Ready`, sub: 'Practice in 1-Click' }
  ];

  useEffect(() => {
    if (isExpanded) return;
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickers.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isExpanded, tickers.length]);

  // Click outside listener to collapse
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pillRef.current && !pillRef.current.contains(e.target)) {
        setIsExpanded(false);
      }
    };
    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isExpanded]);

  const activeTicker = tickers[tickerIndex] || tickers[0];

  return (
    <div 
      ref={pillRef}
      className="fixed top-2 sm:top-2.5 left-1/2 -translate-x-1/2 z-[1050] transition-all duration-300 ease-out select-none"
    >
      {!isExpanded ? (
        /* ================= COMPACT FLOATING CAPSULE ================= */
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="group flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-slate-950/85 hover:bg-slate-950 text-white backdrop-blur-2xl border border-white/20 hover:border-cyan-400/50 shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-all duration-200 active:scale-95 cursor-pointer"
          title="Click to expand JobScout Dynamic Activity Island"
          aria-label="Dynamic Island Status Bar"
        >
          {/* Glowing Beacon Indicator */}
          <span className="relative flex h-2 sm:h-2.5 w-2 sm:w-2.5 flex-shrink-0">
            {isOnline ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 sm:h-2.5 w-2 sm:w-2.5 bg-gradient-to-tr from-emerald-500 to-cyan-400" />
              </>
            ) : (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 sm:h-2.5 w-2 sm:w-2.5 bg-amber-500" />
              </>
            )}
          </span>

          {/* Scrolling Ticker Text */}
          <div className="flex items-center gap-1.5 min-w-0 text-left">
            {!isOnline ? (
              <span className="text-[11px] font-extrabold text-amber-300 tracking-tight whitespace-nowrap">
                📡 Offline Radar Active
              </span>
            ) : (
              <span className="text-[11px] sm:text-xs font-black tracking-tight text-slate-100 group-hover:text-cyan-300 transition-colors whitespace-nowrap">
                {activeTicker.text}
              </span>
            )}
            <span className="hidden md:inline-block text-[10px] text-slate-400 font-medium whitespace-nowrap">
              • {activeTicker.sub}
            </span>
          </div>

          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300 transition-transform group-hover:translate-y-0.5 ml-0.5" />
        </button>
      ) : (
        /* ================= EXPANDED DYNAMIC ISLAND ================= */
        <div className="w-[92vw] sm:w-[480px] max-w-lg bg-slate-950/95 text-white backdrop-blur-3xl border border-white/20 rounded-3xl p-4 sm:p-5 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.6)] animate-in zoom-in-95 duration-200">
          
          {/* Header Row */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
              </span>
              <span className="font-extrabold text-xs tracking-wider uppercase text-cyan-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                <span>JobScout Dynamic Island</span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Metrics Bento Grid */}
          <div className="grid grid-cols-2 gap-2.5 mb-3.5">
            {/* Location Pill */}
            <div 
              onClick={() => {
                if (setCurrentTab) setCurrentTab('map');
                setIsExpanded(false);
              }}
              className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer group"
            >
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block flex items-center gap-1">
                <MapPin className="w-3 h-3 text-cyan-400" /> Active Hub
              </span>
              <span className="text-xs font-black text-white group-hover:text-cyan-300 transition-colors truncate block mt-0.5">
                {activeLocationName || 'Mumbai BKC'}
              </span>
            </div>

            {/* Live Openings */}
            <div 
              onClick={() => {
                if (setCurrentTab) setCurrentTab('jobs');
                setIsExpanded(false);
              }}
              className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer group"
            >
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block flex items-center gap-1">
                <Briefcase className="w-3 h-3 text-indigo-400" /> Open Roles
              </span>
              <span className="text-xs font-black text-white group-hover:text-indigo-300 transition-colors block mt-0.5">
                {jobsCount} Openings Available
              </span>
            </div>
          </div>

          {/* Quick Interactive Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Instant Shift Shortcut */}
            <button
              type="button"
              onClick={() => {
                if (onQuickFilterChange) onQuickFilterChange('instant_shift');
                if (setCurrentTab) setCurrentTab('jobs');
                setIsExpanded(false);
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Instant Shift (24h)</span>
            </button>

            {/* Voice Mock Interview Shortcut */}
            <button
              type="button"
              onClick={() => {
                if (onStartMockInterview) onStartMockInterview(null);
                setIsExpanded(false);
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Voice AI Mock</span>
            </button>

            {/* Theme Toggle Shortcut */}
            {onToggleTheme && (
              <button
                type="button"
                onClick={() => {
                  onToggleTheme();
                }}
                className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                title="Toggle Dark / Light Theme"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-slate-300" />}
                <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
              </button>
            )}
          </div>

        </div>
      )}
    </div>
  );
};
