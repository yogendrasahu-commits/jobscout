import React, { useState } from 'react';
import { X, Phone, Video, MessageSquare, MapPin, Briefcase, Award, Sparkles, User, ArrowLeft, Mail, Edit3 } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { UpdateEmailModal } from './UpdateEmailModal';

export const SeekerProfileModal = ({ seeker, isOpen, onClose }) => {
  const { user } = useAuth();
  const { setActiveChatUser, startCall } = useSocket();
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

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
    <div className="fixed inset-0 z-[950] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[92dvh] overflow-y-auto my-auto text-slate-900">
        
        {/* Top-Left Back Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold border border-slate-200 transition-all flex items-center gap-1 shadow-xs active:scale-95"
          title="Back / Close"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-600" />
          <span>Back</span>
        </button>

        {/* Top-Right Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all flex items-center gap-1 active:scale-95"
          title="Close dialog"
        >
          <span className="text-[11px] font-semibold hidden sm:inline">Close</span>
          <X className="w-4 h-4" />
        </button>

        {/* Profile Header */}
        <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100">
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-emerald-500 shadow-md bg-slate-100 flex items-center justify-center">
              {seeker.avatar ? (
                <img src={seeker.avatar} alt={seeker.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-emerald-600" />
              )}
            </div>
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-xs" />
          </div>

          <h3 className="font-extrabold text-xl text-slate-900">{seeker.name}</h3>
          <p className="text-xs font-semibold text-emerald-700 mt-0.5">{seeker.title || 'Job Seeker'}</p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 mt-1.5">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{seeker.address || 'Active Nearby'}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-indigo-700">
              <Mail className="w-3.5 h-3.5 text-indigo-600" />
              <span>{seeker.email || (user?.id === seeker.id ? 'No email linked' : 'Verified email')}</span>
            </span>
            {user?.id === seeker.id && (
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(true)}
                className="px-2 py-0.5 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white text-[11px] font-bold border border-indigo-200 transition-all flex items-center gap-1 active:scale-95 shadow-xs"
                title="Update Email"
              >
                <Edit3 className="w-3 h-3" />
                <span>{seeker.email ? 'Edit' : 'Add Email'}</span>
              </button>
            )}
            {seeker.phone && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-600">
                  <Phone className="w-3 h-3 text-emerald-600" />
                  <span>+91 {seeker.phone}</span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 my-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Experience</span>
            <span className="text-sm font-bold text-slate-800">{seeker.experience || '2+ Years'}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Expected Salary</span>
            <span className="text-sm font-bold text-emerald-700">{seeker.expectedSalary || 'Negotiable'}</span>
          </div>
        </div>

        {/* Skills */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-700 mb-2">Verified Skills</label>
          <div className="flex flex-wrap gap-1.5">
            {seeker.skills && seeker.skills.length > 0 ? (
              seeker.skills.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200 shadow-xs"
                >
                  {s}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">General Candidate</span>
            )}
          </div>
        </div>

        {/* Instant Connect Buttons (Instant Spot Calling) */}
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            {/* Audio Call */}
            <button
              onClick={() => handleCall(false)}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95"
            >
              <Phone className="w-4 h-4" />
              Voice Call
            </button>

            {/* Video Call */}
            <button
              onClick={() => handleCall(true)}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all active:scale-95"
            >
              <Video className="w-4 h-4" />
              Video Call
            </button>
          </div>

          {/* Send Message */}
          <button
            onClick={handleChat}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-semibold text-xs border border-slate-200 transition-colors shadow-xs"
          >
            <MessageSquare className="w-4 h-4" />
            Send Direct Message
          </button>

          {/* Close Profile Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold border border-transparent hover:border-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
            <span>Close (प्रोफाइल बंद करें)</span>
          </button>
        </div>

        {/* Update Email Modal */}
        <UpdateEmailModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          onUpdated={(newEmail) => {
            if (seeker) seeker.email = newEmail;
          }}
        />

      </div>
    </div>
  );
};
