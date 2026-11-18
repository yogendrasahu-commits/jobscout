import React from 'react';
import { Mic, Volume2, Sparkles } from 'lucide-react';

export const AudioWaveformVisualizer = ({ 
  isSpeaking = false, 
  isListening = false,
  label = '' 
}) => {
  const isActive = isSpeaking || isListening;
  const barCount = 18;

  return (
    <div className="relative flex flex-col items-center justify-center py-4 my-2 select-none overflow-hidden">
      {/* Ambient Aurora Halo Pulse */}
      {isActive && (
        <div className={`absolute -inset-4 rounded-3xl blur-2xl opacity-60 transition-all duration-500 animate-pulse ${
          isSpeaking 
            ? 'bg-gradient-to-r from-violet-600/40 via-cyan-500/40 to-indigo-600/40' 
            : 'bg-gradient-to-r from-emerald-500/40 via-teal-400/40 to-cyan-500/40'
        }`} />
      )}

      {/* Floating Mode Status Pill */}
      <div className="relative z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 text-white backdrop-blur-xl border border-white/15 text-[11px] font-extrabold shadow-lg mb-3">
        {isSpeaking ? (
          <>
            <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
            <span className="text-cyan-300">AI Voice Assistant Speaking...</span>
          </>
        ) : isListening ? (
          <>
            <Mic className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-emerald-300">Listening to Your Answer... (बोलें)</span>
          </>
        ) : (
          <>
            <Sparkles className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">{label || 'Ready for Next Question'}</span>
          </>
        )}
      </div>

      {/* Fluid Dynamic Soundbars */}
      <div className="relative z-10 flex items-center justify-center gap-1 sm:gap-1.5 h-16 w-full max-w-sm px-4">
        {Array.from({ length: barCount }).map((_, i) => {
          // Compute variable heights & animation delay for dynamic wave curve
          const wavePhase = Math.sin((i / barCount) * Math.PI);
          const minHeight = 8;
          const maxHeight = isSpeaking ? 48 : isListening ? 56 : 10;
          const calculatedHeight = isActive ? Math.max(minHeight, Math.round(wavePhase * maxHeight)) : minHeight;
          const animationDelay = `${(i * 0.06).toFixed(2)}s`;

          return (
            <div
              key={i}
              className={`w-1.5 sm:w-2 rounded-full transition-all duration-150 ${
                isSpeaking
                  ? 'bg-gradient-to-t from-violet-600 via-indigo-500 to-cyan-400 animate-pulse'
                  : isListening
                  ? 'bg-gradient-to-t from-emerald-600 via-teal-500 to-cyan-300 animate-pulse'
                  : 'bg-slate-300 dark:bg-slate-700 opacity-40'
              }`}
              style={{
                height: `${calculatedHeight}px`,
                animationDelay: animationDelay,
                boxShadow: isActive ? '0 0 12px rgba(6, 182, 212, 0.45)' : 'none'
              }}
            />
          );
        })}
      </div>

      {/* Live Frequency Meter Subtitle */}
      <div className="relative z-10 mt-2 text-[10px] font-mono tracking-wider text-slate-500 dark:text-slate-400">
        {isActive ? '● Web Speech Real-time Synthesis & Audio Stream Active' : '○ Speech Engine Idle'}
      </div>
    </div>
  );
};
