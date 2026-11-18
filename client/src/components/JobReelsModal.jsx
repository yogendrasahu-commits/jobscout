import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronUp, 
  ChevronDown, 
  Phone, 
  MessageSquare, 
  FileText, 
  Bookmark, 
  Volume2, 
  VolumeX, 
  MapPin, 
  Sparkles, 
  Building2, 
  Share2,
  CheckCircle2,
  Video
} from 'lucide-react';

export const JobReelsModal = ({
  isOpen,
  onClose,
  seekers = [],
  jobs = [],
  onStartVideoCall,
  onOpenChat,
  onSelectSeeker
}) => {
  if (!isOpen) return null;

  // Curate sample video pitches from candidates & jobs
  const samplePitches = [
    {
      id: 'reel-1',
      type: 'seeker',
      name: 'Aarav Sharma',
      role: 'Full Stack WebRTC & React Lead',
      company: 'Ex-Razorpay',
      location: 'Bengaluru, Koramangala',
      skills: ['React', 'WebRTC', 'Node.js', 'Redis'],
      bio: "Hey there! I specialize in ultra low-latency WebRTC streaming and collaborative multi-user canvases. Excited to build real-time communication tools.",
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Aarav',
      videoBg: 'from-violet-950 via-slate-900 to-indigo-950',
      matchScore: '96%'
    },
    {
      id: 'reel-2',
      type: 'job',
      name: 'TechFlow Systems',
      role: 'Senior Frontend Architect',
      company: 'TechFlow Systems',
      location: 'Mumbai, BKC (Hybrid)',
      skills: ['React 19', 'Tailwind', 'GraphQL', 'Next.js'],
      bio: "We are scaling our financial dashboard to 2M concurrent users. Looking for a passionate frontend architect who loves 60fps animations.",
      avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=TechFlow',
      videoBg: 'from-emerald-950 via-slate-900 to-teal-950',
      matchScore: '₹28-36 LPA'
    },
    {
      id: 'reel-3',
      type: 'seeker',
      name: 'Priya Iyer',
      role: 'Mobile AI & Flutter Engineer',
      company: 'Ex-Swiggy',
      location: 'Gurugram, Cyber City',
      skills: ['Flutter', 'Android', 'TensorFlow Lite', 'Kotlin'],
      bio: "Passionate about on-device machine learning models and fluid gesture-driven UX. Open for high-impact mobile leadership roles.",
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Priya',
      videoBg: 'from-pink-950 via-slate-900 to-purple-950',
      matchScore: '94%'
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const currentReel = samplePitches[currentIndex] || samplePitches[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % samplePitches.length);
    setBookmarked(false);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + samplePitches.length) % samplePitches.length);
    setBookmarked(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') handleNext();
      if (e.key === 'ArrowUp') handlePrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
      
      {/* Mobile/Desktop Reels Container */}
      <div className="relative w-full sm:max-w-md h-full sm:h-[90vh] sm:rounded-3xl overflow-hidden shadow-2xl border-0 sm:border border-white/10 flex flex-col justify-between bg-slate-950 select-none">
        
        {/* Animated Background Simulation of Video Pitch */}
        <div className={`absolute inset-0 bg-gradient-to-b ${currentReel.videoBg} opacity-90 transition-all duration-500`}>
          {/* Subtle Aurora Lighting Effect */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-cyan-500/20 blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full bg-violet-500/20 blur-3xl animate-pulse" />
        </div>

        {/* Top Header Controls */}
        <div className="relative z-20 p-4 flex items-center justify-between text-white bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-rose-400 flex items-center gap-1">
              <Video className="w-3.5 h-3.5" />
              <span>Job Reels • 30s Pitch</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center Video Pitch Avatar & Sound Waves */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 my-auto">
          <div className="relative mb-4 group cursor-pointer">
            <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 opacity-70 blur-md animate-pulse" />
            <img
              src={currentReel.avatar}
              alt={currentReel.name}
              className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-white/60 shadow-2xl bg-slate-900"
            />
            <span className="absolute bottom-1 right-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black border border-white/40 shadow-xs">
              {currentReel.matchScore}
            </span>
          </div>

          {/* Sound Wave Animation Bars */}
          <div className="flex items-center gap-1 my-3">
            {[16, 28, 40, 20, 36, 12, 32, 44, 24, 18].map((h, i) => (
              <span
                key={i}
                className="w-1 bg-gradient-to-t from-cyan-400 to-violet-400 rounded-full animate-pulse"
                style={{ height: `${h}px`, animationDelay: `${i * 120}ms` }}
              />
            ))}
          </div>

          <p className="text-sm sm:text-base text-slate-100 font-medium max-w-xs leading-relaxed italic bg-black/30 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
            "{currentReel.bio}"
          </p>
        </div>

        {/* Right Floating Actions (TikTok/Instagram style) */}
        <div className="absolute right-3.5 bottom-28 z-20 flex flex-col items-center gap-4 text-white">
          <button
            onClick={() => {
              if (onStartVideoCall) {
                onStartVideoCall({
                  targetUserId: currentReel.id,
                  targetName: currentReel.name,
                  isEmployer: false
                });
              }
              onClose();
            }}
            className="flex flex-col items-center gap-1 group active:scale-95"
            title="Instant Speed Video Call"
          >
            <div className="w-11 h-11 rounded-full bg-emerald-500/90 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 backdrop-blur-md">
              <Phone className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black">Call</span>
          </button>

          <button
            onClick={() => {
              if (onOpenChat) onOpenChat(currentReel);
              onClose();
            }}
            className="flex flex-col items-center gap-1 group active:scale-95"
            title="Send Message"
          >
            <div className="w-11 h-11 rounded-full bg-indigo-600/90 hover:bg-indigo-600 text-white flex items-center justify-center shadow-lg backdrop-blur-md">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black">Chat</span>
          </button>

          <button
            onClick={() => setBookmarked(!bookmarked)}
            className="flex flex-col items-center gap-1 group active:scale-95"
            title="Bookmark"
          >
            <div className={`w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center shadow-lg transition-colors ${
              bookmarked ? 'bg-amber-500 text-white' : 'bg-black/40 hover:bg-black/60 text-white'
            }`}>
              <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-white' : ''}`} />
            </div>
            <span className="text-[10px] font-black">{bookmarked ? 'Saved' : 'Save'}</span>
          </button>
        </div>

        {/* Bottom Candidate & Skills Info Overlay */}
        <div className="relative z-20 p-5 pt-8 bg-gradient-to-t from-black via-black/80 to-transparent text-white">
          <div className="max-w-[80%]">
            <h4 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-1.5">
              <span>{currentReel.name}</span>
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            </h4>
            <p className="text-xs text-slate-300 font-semibold">{currentReel.role} • {currentReel.company}</p>
            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-cyan-400" />
              <span>{currentReel.location}</span>
            </p>

            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {currentReel.skills.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[10px] font-bold text-white border border-white/20"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Swipe Next/Prev Pill Controls */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
            <span className="text-[10px] text-slate-400 font-bold">
              Reel {currentIndex + 1} of {samplePitches.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white"
                title="Previous Reel"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white"
                title="Next Reel"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
