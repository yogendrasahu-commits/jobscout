import React from 'react';
import { X, Phone, Video, MessageSquare, MapPin, Briefcase, Award, Sparkles, User, ArrowLeft } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export const SeekerProfileModal = ({ seeker, isOpen, onClose }) => {
  const { setActiveChatUser, startCall } = useSocket();

  if (!isOpen || !seeker) return null;

  const handleCall = (isVideo) => {
    startCall(seeker, isVideo);
    onClose();
  };

  const handleChat = () => {
    setActiveChatUser(seeker);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[950] flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[92dvh] overflow-y-auto my-auto">
        
        {/* Top-Left Back Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/60 transition-all flex items-center gap-1 shadow-md active:scale-95"
          title="Back / Close"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          <span>Back</span>
        </button>

        {/* Top-Right Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 transition-all flex items-center gap-1 active:scale-95"
          title="Close dialog"
        >
          <span className="text-[11px] font-semibold hidden sm:inline">Close</span>
          <X className="w-4 h-4" />
        </button>

        {/* Profile Header */}
        <div className="flex flex-col items-center text-center pb-4 border-b border-slate-800">
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-emerald-400 shadow-xl bg-slate-800 flex items-center justify-center">
              {seeker.avatar ? (
                <img src={seeker.avatar} alt={seeker.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-emerald-300" />
              )}
            </div>
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full" />
          </div>

          <h3 className="font-extrabold text-xl text-white">{seeker.name}</h3>
          <p className="text-xs font-semibold text-emerald-400 mt-0.5">{seeker.title || 'Job Seeker'}</p>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>{seeker.address || 'Active Nearby'}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 my-4">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 font-semibold block uppercase">Experience</span>
            <span className="text-sm font-bold text-white">{seeker.experience || '2+ Years'}</span>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 font-semibold block uppercase">Expected Salary</span>
            <span className="text-sm font-bold text-emerald-400">{seeker.expectedSalary || 'Negotiable'}</span>
          </div>
        </div>

        {/* Skills */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-300 mb-2">Verified Skills</label>
          <div className="flex flex-wrap gap-1.5">
            {seeker.skills && seeker.skills.length > 0 ? (
              seeker.skills.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-800/80 text-indigo-300 rounded-lg border border-indigo-500/20"
                >
                  {s}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500">General Candidate</span>
            )}
          </div>
        </div>

        {/* Instant Connect Buttons (Instant Spot Calling) */}
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            {/* Audio Call */}
            <button
              onClick={() => handleCall(false)}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
            >
              <Phone className="w-4 h-4" />
              Voice Call
            </button>

            {/* Video Call */}
            <button
              onClick={() => handleCall(true)}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
            >
              <Video className="w-4 h-4" />
              Video Call
            </button>
          </div>

          {/* Send Message */}
          <button
            onClick={handleChat}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Send Direct Message
          </button>

          {/* Close Profile Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold border border-transparent hover:border-slate-700/60 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
            <span>Close (प्रोफाइल बंद करें)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
