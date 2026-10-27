import React from 'react';
import { Sparkles, CheckCircle, AlertCircle } from 'lucide-react';

export const AIMatchBadge = ({ matchResult, onClick, compact = false }) => {
  if (!matchResult) return null;

  const { score, tier, label } = matchResult;

  let bgClass = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotClass = 'bg-slate-400';

  if (score >= 82) {
    bgClass = 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/20';
    dotClass = 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]';
  } else if (score >= 68) {
    bgClass = 'bg-indigo-500/10 text-indigo-700 border-indigo-500/30 hover:bg-indigo-500/20';
    dotClass = 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.7)]';
  } else if (score >= 50) {
    bgClass = 'bg-amber-500/10 text-amber-800 border-amber-500/30 hover:bg-amber-500/20';
    dotClass = 'bg-amber-500';
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (onClick) onClick();
        }}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${bgClass}`}
        title={`AI Fit Score: ${score}% • Click for full skill gap breakdown`}
      >
        <Sparkles className="w-2.5 h-2.5 flex-shrink-0" />
        <span>{score}% Fit</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick();
      }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all duration-200 cursor-pointer shadow-xs active:scale-95 ${bgClass}`}
      title="View AI Skill Gap & Interview Probability Breakdown"
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotClass} animate-pulse`} />
      <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{label || `${score}% Match`}</span>
    </button>
  );
};

export default AIMatchBadge;
