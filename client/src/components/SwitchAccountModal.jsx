import React, { useState, useEffect } from 'react';
import { X, Building2, User, Check, ArrowRight, Sparkles, Phone, MapPin, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SwitchAccountModal = ({ isOpen, onClose }) => {
  const { user, login } = useAuth();
  const [employers, setEmployers] = useState([]);
  const [seekers, setSeekers] = useState([]);
  const [selectedRoleTab, setSelectedRoleTab] = useState('emp'); // 'emp' | 'seeker'
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const fetchDemoUsers = async () => {
      try {
        const res = await fetch('/api/auth/demo-users');
        if (res.ok) {
          const data = await res.json();
          setEmployers(data.employers || []);
          setSeekers(data.seekers || []);
        }
      } catch (err) {
        console.error('Failed to load demo accounts:', err);
      }
    };
    fetchDemoUsers();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSwitchUser = async (targetUser) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/switch-user/${targetUser.id}`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('jobradar_token', data.token);
        localStorage.setItem('jobradar_user', JSON.stringify(data.user));
        window.location.reload(); // Hard refresh to reset socket & stream bindings clean
      }
    } catch (err) {
      console.error('Failed to switch user:', err);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[950] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/90 rounded-3xl p-5 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[92dvh] overflow-y-auto my-auto">
        
        {/* Top Header Row with Back, Title, and Close */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4 gap-2">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/60 transition-all flex items-center gap-1 shadow-md active:scale-95"
              title="Back / Close"
            >
              <ArrowLeft className="w-4 h-4 text-indigo-400" />
              <span>Back</span>
            </button>
            <div className="p-2 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white">Multi-User Directory & Switcher</h3>
              <p className="text-[11px] sm:text-xs text-slate-400 hidden sm:block">Select any Employer or Seeker to test real-time calling and messaging</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 transition-all flex items-center gap-1 active:scale-95 flex-shrink-0"
            title="Close dialog"
          >
            <span className="text-[11px] font-semibold hidden sm:inline">Close (बंद करें)</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Role Segmented Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 mb-4">
          <button
            onClick={() => setSelectedRoleTab('emp')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              selectedRoleTab === 'emp'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Multiple Employers ({employers.length})</span>
          </button>

          <button
            onClick={() => setSelectedRoleTab('seeker')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              selectedRoleTab === 'seeker'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Multiple Job Seekers ({seekers.length})</span>
          </button>
        </div>

        {/* Users List Grid */}
        <div className="max-h-[55vh] overflow-y-auto pr-1 space-y-2.5">
          {selectedRoleTab === 'emp' ? (
            employers.map((emp) => {
              const isCurrent = user?.id === emp.id;
              return (
                <div
                  key={emp.id}
                  onClick={() => handleSwitchUser(emp)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isCurrent
                      ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={emp.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${emp.name}`}
                      alt={emp.name}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-700 bg-slate-800 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-white truncate">{emp.companyName || emp.name}</h4>
                        {isCurrent && (
                          <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-400 px-1.5 py-0.2 rounded border border-indigo-500/30">
                            Current Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-indigo-400 truncate">{emp.industry || 'Business'}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span className="truncate">{emp.address}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={isCurrent || loading}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-bold transition-colors whitespace-nowrap disabled:opacity-40"
                  >
                    {isCurrent ? 'Logged In' : 'Login As'}
                  </button>
                </div>
              );
            })
          ) : (
            seekers.map((seek) => {
              const isCurrent = user?.id === seek.id;
              return (
                <div
                  key={seek.id}
                  onClick={() => handleSwitchUser(seek)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isCurrent
                      ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={seek.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${seek.name}`}
                      alt={seek.name}
                      className="w-11 h-11 rounded-full object-cover border border-slate-700 bg-slate-800 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-white truncate">{seek.name}</h4>
                        {isCurrent && (
                          <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500/30">
                            Current Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-emerald-400 truncate font-semibold">{seek.title || 'Candidate'}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>{seek.experience || 'Experienced'}</span>
                        <span>•</span>
                        <span className="text-slate-300 font-medium">{seek.expectedSalary || 'Negotiable'}</span>
                        <span>•</span>
                        <span className="truncate">{seek.address}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={isCurrent || loading}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white text-xs font-bold transition-colors whitespace-nowrap disabled:opacity-40"
                  >
                    {isCurrent ? 'Logged In' : 'Login As'}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Close Button */}
        <div className="pt-4 mt-3 border-t border-slate-800 flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400">
            Switching updates live sockets, radar position & chat persona.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/80 transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
            <span>Close (बंद करें)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
