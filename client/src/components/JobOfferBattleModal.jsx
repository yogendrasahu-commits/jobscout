import React, { useState } from 'react';
import { 
  X, 
  Swords, 
  Sparkles, 
  Building2, 
  IndianRupee, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  TrendingUp, 
  Award,
  ArrowRight
} from 'lucide-react';

export const JobOfferBattleModal = ({
  isOpen,
  onClose,
  jobs = []
}) => {
  if (!isOpen) return null;

  // Initial Offers A and B
  const [offerA, setOfferA] = useState({
    company: jobs[0]?.company || 'TechCorp Global',
    title: jobs[0]?.title || 'Senior Software Engineer',
    ctcLpa: 24,
    monthlyInHand: 165000,
    wfhDays: 3,
    commuteMins: 25,
    medicalInsuranceLakhs: 10,
    joiningBonus: 100000
  });

  const [offerB, setOfferB] = useState({
    company: jobs[1]?.company || 'NextGen FinTech',
    title: jobs[1]?.title || 'Lead Frontend Architect',
    ctcLpa: 28,
    monthlyInHand: 190000,
    wfhDays: 2,
    commuteMins: 38,
    medicalInsuranceLakhs: 15,
    joiningBonus: 200000
  });

  // Calculate Net Annual Value Score with defensive NaN protections
  const monthlyInHandA = Number(offerA.monthlyInHand) || 0;
  const monthlyInHandB = Number(offerB.monthlyInHand) || 0;
  const bonusA = Number(offerA.joiningBonus) || 0;
  const bonusB = Number(offerB.joiningBonus) || 0;
  const wfhA = Math.max(0, Math.min(5, Number(offerA.wfhDays) || 0));
  const wfhB = Math.max(0, Math.min(5, Number(offerB.wfhDays) || 0));
  const commuteA = Math.max(0, Number(offerA.commuteMins) || 0);
  const commuteB = Math.max(0, Number(offerB.commuteMins) || 0);
  const insuranceA = Math.max(0, Number(offerA.medicalInsuranceLakhs) || 0);
  const insuranceB = Math.max(0, Number(offerB.medicalInsuranceLakhs) || 0);

  const annualCommuteHoursA = (5 - wfhA) * (commuteA * 2 / 60) * 48;
  const annualCommuteHoursB = (5 - wfhB) * (commuteB * 2 / 60) * 48;

  const scoreA = Math.round(
    (monthlyInHandA * 12 + bonusA) / 100000 - 
    annualCommuteHoursA * 0.4 + 
    wfhA * 4 + 
    insuranceA * 0.5
  );

  const scoreB = Math.round(
    (monthlyInHandB * 12 + bonusB) / 100000 - 
    annualCommuteHoursB * 0.4 + 
    wfhB * 4 + 
    insuranceB * 0.5
  );

  const winner = scoreB >= scoreA ? 'B' : 'A';
  const diffPercent = Math.abs(Math.round(((scoreB - scoreA) / Math.max(scoreA, 1)) * 100));

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200/90 dark:border-white/10 flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-violet-500/20">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Job Offer Battle & AI Decider</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-400 border border-violet-300 dark:border-violet-800">
                  Matrix
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Side-by-Side In-Hand, Commute & Work-Life Value Analysis
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

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6">
          
          {/* AI Decision Verdict Banner */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-indigo-500/15 border border-emerald-400/30 flex items-start gap-3 shadow-inner">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-black text-emerald-700 dark:text-emerald-400 text-sm">
                  🏆 AI Verdict: Offer {winner} is Superior (+{diffPercent}% Value)
                </span>
              </div>
              <p className="leading-relaxed">
                {winner === 'B' 
                  ? `${offerB.company} yields ₹${((offerB.monthlyInHand - offerA.monthlyInHand) * 12 / 100000).toFixed(1)} Lakh higher annual in-hand salary and higher joining bonus, which comfortably outweighs the extra ${offerB.commuteMins - offerA.commuteMins} min daily transit time.`
                  : `${offerA.company} delivers significantly better work-life balance (${offerA.wfhDays} WFH days/week) and saves ~${Math.round(annualCommuteHoursB - annualCommuteHoursA)} hours of annual traffic fatigue.`}
              </p>
            </div>
          </div>

          {/* Side-by-Side Comparison Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            
            {/* Offer A Column */}
            <div className={`p-4 rounded-3xl border transition-all ${
              winner === 'A' 
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-400/50 ring-2 ring-emerald-500/20' 
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-white/10'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Offer A</span>
                {winner === 'A' && <span className="text-[10px] bg-emerald-500 text-white font-black px-2 py-0.5 rounded-full">Top Value</span>}
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">{offerA.company}</h4>
              <p className="text-[11px] text-slate-500 truncate">{offerA.title}</p>

              <div className="mt-4 space-y-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Annual CTC</span>
                  <span className="font-black text-slate-900 dark:text-white text-sm">₹{offerA.ctcLpa} LPA</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Monthly In-Hand</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">₹{offerA.monthlyInHand.toLocaleString('en-IN')}/mo</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Work Flexibility</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{offerA.wfhDays} WFH Days/wk</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">One-way Commute</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{offerA.commuteMins} mins</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Joining Bonus</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">₹{(offerA.joiningBonus / 1000).toFixed(0)}k</span>
                </div>
              </div>
            </div>

            {/* Offer B Column */}
            <div className={`p-4 rounded-3xl border transition-all ${
              winner === 'B' 
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-400/50 ring-2 ring-emerald-500/20' 
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-white/10'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Offer B</span>
                {winner === 'B' && <span className="text-[10px] bg-emerald-500 text-white font-black px-2 py-0.5 rounded-full">Top Value</span>}
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">{offerB.company}</h4>
              <p className="text-[11px] text-slate-500 truncate">{offerB.title}</p>

              <div className="mt-4 space-y-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Annual CTC</span>
                  <span className="font-black text-slate-900 dark:text-white text-sm">₹{offerB.ctcLpa} LPA</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Monthly In-Hand</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">₹{offerB.monthlyInHand.toLocaleString('en-IN')}/mo</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Work Flexibility</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{offerB.wfhDays} WFH Days/wk</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">One-way Commute</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{offerB.commuteMins} mins</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Joining Bonus</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">₹{(offerB.joiningBonus / 1000).toFixed(0)}k</span>
                </div>
              </div>
            </div>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-xs active:scale-98 transition-all cursor-pointer shadow-lg shadow-indigo-600/25"
          >
            Accept Recommendation & Close
          </button>

        </div>

      </div>
    </div>
  );
};
