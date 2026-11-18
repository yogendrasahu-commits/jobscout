import React, { useState } from 'react';
import { 
  X, 
  Gift, 
  Share2, 
  Copy, 
  Check, 
  IndianRupee, 
  Users, 
  CheckCircle2, 
  Sparkles,
  ExternalLink,
  MessageCircle
} from 'lucide-react';

export const ReferralBountyModal = ({
  isOpen,
  onClose,
  job,
  user
}) => {
  if (!isOpen) return null;

  const bountyAmount = job?.bounty || 5000;
  const referralCode = user?.referralCode || `SCOUT-${(user?.name || 'USER').slice(0, 3).toUpperCase()}-77`;
  const referralLink = `${window.location.origin}/?ref=${referralCode}&jobId=${job?.id || 'featured'}`;
  
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15);
    }
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `🔥 Hey! Check out this opening for ${job?.title || 'Software Engineer'} at ${job?.company || 'JobScout'}: ${referralLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${job?.title || 'Job Opportunity'} • JobScout`,
          text: `Apply to ${job?.title} at ${job?.company} on JobScout!`,
          url: referralLink
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200/90 dark:border-white/10 flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-amber-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Gift className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Refer & Earn Bounty</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                  ₹{bountyAmount.toLocaleString('en-IN')}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Share with a friend. Earn cash bounty upon their successful hire.
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
        <div className="p-5 sm:p-6 space-y-5">
          
          {/* Target Job Card Summary */}
          {job && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-white/10">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Target Job</span>
              <h4 className="text-xs font-black text-slate-900 dark:text-white mt-0.5">{job.title}</h4>
              <p className="text-[11px] text-slate-500">{job.company} • {job.salary || 'Competitive'}</p>
            </div>
          )}

          {/* Unique Referral Link Box */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Your Personalized Referral Link
            </label>
            <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-200 font-mono focus:outline-none px-2"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 active:scale-95 transition-all shrink-0 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Direct Share Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 active:scale-95 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Share to WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleNativeShare}
              className="py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-black flex items-center justify-center gap-2 border border-white/10 active:scale-95 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>More Apps...</span>
            </button>
          </div>

          {/* Referral Stats Ledger */}
          <div className="pt-2 border-t border-slate-100 dark:border-white/10">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
              Live Bounty Tracker
            </span>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700">
                <span className="text-base font-black text-slate-900 dark:text-white">14</span>
                <span className="text-[10px] text-slate-500 block font-bold">Clicks</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700">
                <span className="text-base font-black text-indigo-600 dark:text-cyan-400">3</span>
                <span className="text-[10px] text-slate-500 block font-bold">Applied</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700">
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">₹5,000</span>
                <span className="text-[10px] text-slate-500 block font-bold">Earned</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
