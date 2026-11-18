import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  Star, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  TrendingUp, 
  DollarSign, 
  ShieldCheck, 
  ThumbsUp, 
  ThumbsDown,
  Search
} from 'lucide-react';

const COMPANY_INTEL = {
  default: {
    name: 'Top Tech Tier 1',
    overallRating: 4.5,
    wlbRating: 4.2,
    compRating: 4.7,
    growthRating: 4.4,
    recommendPercent: 88,
    greenFlags: [
      '100% comprehensive medical insurance for employee & parents',
      'Flexible hybrid schedule (2 office / 3 WFH)',
      'Annual learning & conference allowance of ₹75,000',
      'Free gourmet meals and late-night cab reimbursement'
    ],
    redFlags: [
      'Occasional weekend on-call duty during quarterly releases',
      'Appraisal ratings follow a normalized bell curve'
    ],
    interviewTips: [
      'Round 1: DSA (Focus on HashMaps, Two-Pointers, and Sliding Window).',
      'Round 2: Live Collaborative Coding (WebRTC & state management deep-dive).',
      'Round 3: System Design (Designing Uber-like real-time geospatial driver locator).'
    ]
  }
};

export const CompanyPulseModal = ({
  isOpen,
  onClose,
  companyName = 'TechFlow Systems',
  job
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('flags'); // 'flags' | 'interview'
  const intel = COMPANY_INTEL[companyName.toLowerCase()] || {
    ...COMPANY_INTEL.default,
    name: companyName || 'Company'
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200/90 dark:border-white/10 flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-cyan-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white truncate max-w-xs">{intel.name}</h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-800">
                  Pulse 2026
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-black text-slate-900 dark:text-white">{intel.overallRating}</span>
                <span>• {intel.recommendPercent}% Recommend to a Friend</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ratings Breakdown Grid */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-white/10 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 font-bold block">Work-Life</span>
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">{intel.wlbRating} / 5.0</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 font-bold block">Comp & Perks</span>
            <span className="text-sm font-black text-indigo-600 dark:text-cyan-400 mt-0.5 block">{intel.compRating} / 5.0</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 font-bold block">Career Growth</span>
            <span className="text-sm font-black text-amber-600 dark:text-amber-400 mt-0.5 block">{intel.growthRating} / 5.0</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-4 flex items-center gap-2 border-b border-slate-100 dark:border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('flags')}
            className={`pb-2.5 text-xs font-black transition-all border-b-2 ${
              activeTab === 'flags'
                ? 'border-indigo-600 text-indigo-600 dark:text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Green & Red Flags (Culture)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('interview')}
            className={`pb-2.5 text-xs font-black transition-all border-b-2 ${
              activeTab === 'interview'
                ? 'border-indigo-600 text-indigo-600 dark:text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Interview Intel & Questions
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6 space-y-4">
          
          {activeTab === 'flags' && (
            <div className="space-y-4">
              
              {/* Green Flags */}
              <div className="space-y-2">
                <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide">
                  <span>🟢</span>
                  <span>Green Flags (Verified Perks)</span>
                </span>
                <div className="space-y-1.5">
                  {intel.greenFlags.map((flag, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{flag}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Red Flags */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-black text-rose-700 dark:text-rose-400 flex items-center gap-1.5 uppercase tracking-wide">
                  <span>🚩</span>
                  <span>Things to Watch Out For</span>
                </span>
                <div className="space-y-1.5">
                  {intel.redFlags.map((flag, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/50 text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span>{flag}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {activeTab === 'interview' && (
            <div className="space-y-3">
              <span className="text-xs font-black text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5 uppercase tracking-wide">
                <Sparkles className="w-4 h-4" />
                <span>Verified Interview Rounds & Real Questions</span>
              </span>
              <div className="space-y-2">
                {intel.interviewTips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium"
                  >
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
