import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Navigation, 
  ExternalLink, 
  Clock, 
  IndianRupee, 
  Sparkles, 
  TrendingUp, 
  Leaf, 
  ShieldCheck, 
  Car, 
  Bike, 
  Footprints, 
  TrainTrack,
  CheckCircle2
} from 'lucide-react';
import { estimateCommuteProfile } from '../utils/commuteService';

export const SmartCommuteModal = ({ 
  isOpen, 
  onClose, 
  job, 
  userCoords, 
  userAddress = 'My Location' 
}) => {
  if (!isOpen || !job) return null;

  const [originInput, setOriginInput] = useState(userAddress || 'My Current Location');
  const [selectedModeId, setSelectedModeId] = useState('metro');

  // Compute profile
  const profile = estimateCommuteProfile({
    userCoords: userCoords || { lat: 19.076, lng: 72.8777 },
    jobCoords: { lat: job.lat || 19.082, lng: job.lng || 72.885 },
    userAddress: originInput,
    jobAddress: job.address || job.company
  });

  const selectedMode = profile.modes.find((m) => m.id === selectedModeId) || profile.modes[0];

  // Extract gross monthly salary from job.salary
  const parseMonthlySalary = (salaryStr) => {
    if (!salaryStr) return 50000;
    const digits = salaryStr.replace(/[^0-9]/g, '');
    const num = parseInt(digits, 10);
    if (!num) return 50000;
    if (num < 150) {
      return Math.round((num * 100000) / 12);
    }
    if (num > 200000) {
      return Math.round(num / 12);
    }
    return num;
  };

  const grossMonthlySalary = parseMonthlySalary(job.salary);
  const transitCost = selectedMode.monthlyCostNum || 0;
  const netInHand = Math.max(0, grossMonthlySalary - transitCost);
  const netSavingsPercent = Math.round((netInHand / Math.max(grossMonthlySalary, 1)) * 100);

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200/90 flex flex-col">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/70 via-white to-emerald-50/40 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Smart Commute & Transit Radar</h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Live
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Accurate travel times, monthly costs & route estimation to office
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Route Details (Origin -> Destination) */}
        <div className="p-4 sm:p-5 space-y-4">
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center gap-1 mt-1">
                <div className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                <div className="w-0.5 h-7 bg-slate-300 border-dashed" />
                <div className="w-3 h-3 rounded-full bg-indigo-600 ring-4 ring-indigo-100" />
              </div>
              <div className="flex-1 space-y-2 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Starting Point (From):</span>
                  <div className="font-semibold text-slate-800 mt-0.5 flex items-center justify-between">
                    <span className="truncate">{originInput}</span>
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                      GPS Lock
                    </span>
                  </div>
                </div>
                <div className="pt-1 border-t border-slate-200/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Destination (Job Office):</span>
                  <div className="font-bold text-indigo-700 mt-0.5 flex items-center justify-between">
                    <span className="truncate">{job.title} • {job.company}</span>
                    <span className="text-[10px] font-bold text-slate-500">
                      {profile.distanceKm} km away
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{job.address || 'Central Business District'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics (Distance, Work-Life Score, Eco Savings) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-center">
              <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Distance</div>
              <div className="text-lg font-black text-slate-900 mt-0.5">{profile.distanceKm} <span className="text-xs font-semibold text-slate-500">km</span></div>
              <div className="text-[10px] text-slate-500 mt-0.5">Road Network</div>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-center">
              <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Work-Life Score</div>
              <div className="text-lg font-black text-slate-900 mt-0.5">{profile.workLifeScore}<span className="text-xs font-semibold text-slate-500">/100</span></div>
              <div className="text-[10px] text-emerald-700 font-bold mt-0.5">
                {profile.workLifeScore >= 80 ? '🌟 Excellent' : profile.workLifeScore >= 60 ? '👍 Manageable' : '⚠️ Long Trip'}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-teal-50/60 border border-teal-100 text-center">
              <div className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">CO₂ Saved</div>
              <div className="text-lg font-black text-slate-900 mt-0.5">{profile.co2SavedKg} <span className="text-xs font-semibold text-slate-500">kg</span></div>
              <div className="text-[10px] text-teal-700 font-semibold mt-0.5">via Metro / Green</div>
            </div>
          </div>

          {/* AI Recommendation Pill */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-200/80 flex items-start gap-3">
            <span className="text-2xl">{profile.recommendation.icon}</span>
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>{profile.recommendation.title}</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                {profile.recommendation.desc}
              </p>
            </div>
          </div>

          {/* Multi-Modal Transit Selector Tabs */}
          <div>
            <div className="text-xs font-bold text-slate-900 mb-2 flex items-center justify-between">
              <span>Choose Travel Mode:</span>
              <span className="text-[11px] text-slate-400">Door-to-door estimation</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {profile.modes.map((mode) => {
                const isSelected = selectedModeId === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedModeId(mode.id)}
                    className={`p-3 rounded-2xl border text-left transition-all relative ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/25 scale-[1.02]'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xl">{mode.icon}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div className={`text-xs font-bold line-clamp-1 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                      {mode.name}
                    </div>
                    <div className={`text-sm font-extrabold mt-1 ${isSelected ? 'text-indigo-100' : 'text-indigo-600'}`}>
                      ~{mode.timeMins} min
                    </div>
                    <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`}>
                      {mode.oneWayFare} / trip
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Deep-Dive Card for Selected Transit Mode */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{selectedMode.icon}</span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{selectedMode.name} Full Estimate</h4>
                  <span className="text-[10px] text-slate-500">{selectedMode.reliability}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                {selectedMode.badge}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-200/60 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Estimated Time</span>
                <p className="font-extrabold text-slate-900 text-sm mt-0.5">~{selectedMode.timeMins} mins</p>
                <span className="text-[10px] text-slate-500">Each way</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Ticket / Fuel</span>
                <p className="font-extrabold text-emerald-600 text-sm mt-0.5">{selectedMode.oneWayFare}</p>
                <span className="text-[10px] text-slate-500">One-way cost</span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Monthly Budget</span>
                <p className="font-extrabold text-slate-900 text-sm mt-0.5">{selectedMode.monthlyCost}</p>
                <span className="text-[10px] text-slate-500">22 work days</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
              <span>Traffic Sensitivity:</span>
              <span className="font-bold text-slate-800">{selectedMode.trafficSensitivity}</span>
            </div>
          </div>

          {/* 2026 Net Take-Home Salary Calculator */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-indigo-500/15 border border-emerald-300 dark:border-emerald-700/60 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                <span>💡 Net Take-Home In-Hand</span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">
                  {netSavingsPercent}% Retained
                </span>
              </span>
              <span className="text-xs font-black text-emerald-700">
                ₹{netInHand.toLocaleString('en-IN')} / mo
              </span>
            </div>

            <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
              <div className="flex justify-between">
                <span>Gross Monthly Salary:</span>
                <span className="font-mono font-bold text-slate-900">₹{grossMonthlySalary.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>- Monthly {selectedMode.name} Transit:</span>
                <span className="font-mono font-bold">-₹{transitCost.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-emerald-200/60 font-bold text-slate-900">
                <span>Annual Net In-Hand Savings:</span>
                <span className="text-emerald-700 font-mono">₹{(netInHand * 12).toLocaleString('en-IN')} / yr</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2 flex items-center">
            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all"
            >
              <span>Done</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
