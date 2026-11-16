import React from 'react';
import { AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProfileCompletionAlert = ({ onOpenCompleteProfile }) => {
  const { user } = useAuth();

  if (!user) return null;

  // Check if profile is incomplete
  const isIncomplete = user.isProfileComplete === false || 
    !user.name || 
    user.name.startsWith('User ') || 
    (user.role === 'seeker' && !user.title) || 
    (user.role === 'emp' && !user.companyName && !user.company);

  if (!isIncomplete) return null;

  return (
    <div className="w-full bg-gradient-to-r from-amber-500/15 via-indigo-600/15 to-amber-500/15 border-b border-amber-500/30 px-3 sm:px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-amber-200 shadow-sm animate-fadeIn">
      <div className="flex items-center gap-2.5 text-center sm:text-left">
        <div className="p-1 rounded-md bg-amber-500/20 text-amber-400 shrink-0">
          <AlertCircle size={15} className="animate-pulse" />
        </div>
        <div>
          <span className="font-bold text-white">Your profile is incomplete! </span>
          <span className="text-amber-200/90 hidden sm:inline">
            Add your {user.role === 'emp' ? 'company details' : 'title & skills'} to appear on the live radar and unlock instant interviews.
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenCompleteProfile}
        className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 active:scale-95 text-slate-950 font-bold rounded-xl text-xs transition shadow-md shadow-amber-500/20 flex items-center gap-1.5 shrink-0"
      >
        <Sparkles size={13} />
        Complete Profile Now
        <ArrowRight size={13} />
      </button>
    </div>
  );
};

export default ProfileCompletionAlert;
