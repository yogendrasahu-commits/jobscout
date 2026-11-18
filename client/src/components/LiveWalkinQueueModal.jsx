import React, { useState, useEffect } from 'react';
import { 
  X, 
  Zap, 
  Video, 
  Clock, 
  Users, 
  Sparkles, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  PhoneCall,
  Radio
} from 'lucide-react';

export const LiveWalkinQueueModal = ({
  isOpen,
  onClose,
  job,
  employerName = 'Acme Corp',
  user,
  onStartVideoCall
}) => {
  if (!isOpen || !job) return null;

  // Queue simulation state
  const [inQueue, setInQueue] = useState(false);
  const [queuePosition, setQueuePosition] = useState(2);
  const [estimatedWaitMins, setEstimatedWaitMins] = useState(4);
  const [admitted, setAdmitted] = useState(false);

  // When in queue, simulate queue progression every few seconds
  useEffect(() => {
    let timer;
    if (inQueue && queuePosition > 1) {
      timer = setTimeout(() => {
        setQueuePosition(prev => {
          const next = prev - 1;
          setEstimatedWaitMins(next * 2);
          if (next === 1) {
            // Almost ready
          }
          return next;
        });
      }, 5000);
    } else if (inQueue && queuePosition === 1 && !admitted) {
      timer = setTimeout(() => {
        setAdmitted(true);
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([100, 50, 100, 50, 200]);
        }
      }, 3500);
    }
    return () => clearTimeout(timer);
  }, [inQueue, queuePosition, admitted]);

  const handleJoinQueue = () => {
    setInQueue(true);
    setQueuePosition(2);
    setEstimatedWaitMins(4);
    setAdmitted(false);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(25);
    }
  };

  const handleLeaveQueue = () => {
    setInQueue(false);
    setAdmitted(false);
  };

  const handleEnterInterview = () => {
    if (onStartVideoCall) {
      onStartVideoCall({
        targetUserId: job.employerId || job.userId || 'emp-live-booth',
        targetName: job.company || employerName,
        isEmployer: false,
        job
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200/90 dark:border-white/10 flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white">Live Walk-in Interview Booth</h3>
                <span className="flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                  Live Now
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">
                {job.title} • {job.company || employerName}
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
          
          {/* Admitted State: Ready to enter */}
          {admitted ? (
            <div className="text-center py-6 px-4 rounded-3xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 shadow-inner">
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/30 animate-bounce">
                <Video className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-black text-emerald-800 dark:text-emerald-300">
                You're Admitted! Hiring Team is Ready
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 max-w-sm mx-auto">
                The hiring manager at {job.company || employerName} is in the interview room. Step in now!
              </p>
              
              <button
                type="button"
                onClick={handleEnterInterview}
                className="mt-5 w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 active:scale-98 transition-all cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Start Live WebRTC Interview Now</span>
              </button>
            </div>
          ) : inQueue ? (
            /* Waiting in Queue State */
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-400 to-indigo-500 animate-pulse" />
                
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Your Turn in Line
                </span>
                
                <div className="my-3 flex items-center justify-center gap-3">
                  <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
                    #{queuePosition}
                  </div>
                  <div className="text-left text-xs text-slate-600 dark:text-slate-400">
                    <p className="font-extrabold text-indigo-600 dark:text-cyan-400">
                      {queuePosition === 1 ? 'Up Next!' : 'In Line'}
                    </p>
                    <p className="flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>~{estimatedWaitMins} mins wait</span>
                    </p>
                  </div>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: queuePosition === 1 ? '85%' : '45%' }}
                  />
                </div>
                
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3">
                  Please keep this screen open. Your video call will automatically chime when you're called in.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleLeaveQueue}
                  className="w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
                >
                  Leave Queue
                </button>
              </div>
            </div>
          ) : (
            /* Welcome / Join Queue State */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <span className="font-bold text-slate-900 dark:text-white">Zero Wait Virtual Walk-In:</span> Instead of waiting weeks for resume reviews, pitch directly to the hiring manager for 5-10 minutes with screen-sharing and code sandbox.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700">
                  <Users className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                  <span className="text-lg font-black text-slate-900 dark:text-white">1</span>
                  <span className="text-[10px] text-slate-500 block font-bold">Candidates Ahead</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700">
                  <Clock className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                  <span className="text-lg font-black text-slate-900 dark:text-white">~3-5</span>
                  <span className="text-[10px] text-slate-500 block font-bold">Avg Wait (Mins)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleJoinQueue}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/25 active:scale-98 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Join Walk-in Queue</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
