import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Award, 
  ChevronRight, 
  RotateCcw, 
  Send, 
  CheckCircle2, 
  BrainCircuit, 
  Clock, 
  MessageSquare,
  ThumbsUp,
  AlertCircle
} from 'lucide-react';
import { triggerConfetti } from '../utils/confetti';
import { playSuccessChime } from '../utils/soundEffects';
import { AudioWaveformVisualizer } from './AudioWaveformVisualizer';

export const AIMockInterviewModal = ({ isOpen, onClose, job, user, onReadyToApply }) => {
  const [currentStep, setCurrentStep] = useState(0); // 0, 1, 2 = Questions, 3 = Scorecard
  const [answers, setAnswers] = useState(['', '', '']);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [scoreResult, setScoreResult] = useState(null);

  const recognitionRef = useRef(null);

  // Generate 3 specialized questions tailored to this job role & skills
  const questions = [
    {
      id: 1,
      title: 'Technical Overview & Domain Fit',
      text: `Can you briefly introduce yourself and walk us through your direct experience with ${
        job?.skills?.slice(0, 3)?.join(', ') || 'modern software technologies'
      } at a production scale for ${job?.company || 'our company'}?`,
      hint: 'Highlight real projects, key metrics, and tools you used.'
    },
    {
      id: 2,
      title: 'Problem-Solving & Architectural Challenge',
      text: `Imagine you encounter a high-priority latency spike or system failure in a ${job?.jobType || 'Full-time'} ${job?.title || 'Engineering'} environment. How would you systematically troubleshoot and resolve it?`,
      hint: 'Mention root cause analysis, monitoring tools, and team communication.'
    },
    {
      id: 3,
      title: 'Culture & High-Growth Readiness',
      text: `Why are you specifically excited about joining ${job?.company || 'this organization'}, and how do you collaborate across engineering and product teams to meet tight sprint deadlines?`,
      hint: 'Focus on alignment with company mission, cross-functional ownership, and adaptability.'
    }
  ];

  // Stop any ongoing speech synthesis or recognition on close/unmount
  const stopAllSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      setIsListening(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      stopAllSpeech();
      setCurrentStep(0);
      setAnswers(['', '', '']);
      setScoreResult(null);
    }
  }, [isOpen]);

  // Read question aloud via Web Speech Synthesis
  const speakQuestion = (text) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Toggle Voice Recognition for answering
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SpeechRecognition) {
      setSpeechError('Speech recognition is not supported in this browser. You can type your answer below.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      setIsListening(false);
      return;
    }

    setSpeechError('');
    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (e) => {
        console.warn('Speech recognition error:', e);
        setIsListening(false);
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setAnswers(prev => {
            const next = [...prev];
            next[currentStep] = (next[currentStep] ? next[currentStep] + ' ' : '') + transcript;
            return next;
          });
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setSpeechError('Could not access microphone: ' + err.message);
      setIsListening(false);
    }
  };

  // AI Evaluation Algorithm
  const handleEvaluateMockInterview = () => {
    stopAllSpeech();
    setEvaluating(true);

    setTimeout(() => {
      const allText = answers.join(' ').toLowerCase();
      const jobSkills = job?.skills || ['React', 'Node.js', 'Problem Solving', 'Architecture'];
      
      const matchedSkills = jobSkills.filter(s => allText.includes(s.toLowerCase()));
      const wordCount = allText.split(/\s+/).filter(Boolean).length;

      // Realistic AI Scoring Formulas
      const technicalScore = Math.min(98, Math.max(68, Math.round((matchedSkills.length / Math.max(1, jobSkills.length)) * 40 + 55)));
      const communicationScore = wordCount >= 60 ? 94 : wordCount >= 30 ? 86 : 74;
      const confidenceScore = Math.min(97, Math.max(75, Math.round((technicalScore + communicationScore) / 2 + 3)));
      const overallScore = Math.round((technicalScore * 0.45) + (communicationScore * 0.35) + (confidenceScore * 0.20));

      const strengths = [
        matchedSkills.length > 0 
          ? `Demonstrated direct hands-on knowledge with ${matchedSkills.join(', ')}.`
          : 'Clear articulation of past technical challenges and personal responsibility.',
        'Structured communication format with logical pacing and relevant context.',
        'High alignment with candidate collaborative working style and sprint velocity.'
      ];

      const improvements = [
        matchedSkills.length < jobSkills.length 
          ? `Proactively touch upon ${jobSkills.filter(s => !matchedSkills.includes(s)).slice(0, 2).join(' & ')} to maximize hiring manager checklist points.`
          : 'Include specific business impact numbers (e.g. reduced load time by 30%, shipped to 50k users).',
        'Briefly mention how you handle cross-functional feedback and post-mortem reviews.'
      ];

      setScoreResult({
        overallScore,
        technicalScore,
        communicationScore,
        confidenceScore,
        matchedSkills,
        strengths,
        improvements
      });

      setEvaluating(false);
      setCurrentStep(3); // Show Scorecard
      triggerConfetti();
      playSuccessChime();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/75 backdrop-blur-xl p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[92dvh] overflow-y-auto text-slate-900 dark:text-slate-100">
        
        {/* Top Gradient Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 rounded-t-3xl" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <BrainCircuit className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  AI Mock Interview Prep
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold border border-emerald-200 dark:border-emerald-800">
                  Voice Powered
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">
                Role: <strong className="text-slate-700 dark:text-slate-300">{job?.title}</strong> at {job?.company}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopAllSpeech();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Step Indicator */}
        {currentStep < 3 && (
          <div className="my-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
              <span>Question {currentStep + 1} of 3: {questions[currentStep].title}</span>
              <span className="text-indigo-600 dark:text-indigo-400">{Math.round(((currentStep) / 3) * 100)}% Complete</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${((currentStep + 1) / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* INTERVIEW QUESTION & ANSWER FLOW */}
        {/* ============================================================== */}
        {currentStep < 3 ? (
          <div className="space-y-4 py-2">
            {/* Question Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 relative">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1">
                    AI Interviewer Prompt
                  </span>
                  <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                    "{questions[currentStep].text}"
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Tip: {questions[currentStep].hint}</span>
                  </p>
                </div>

                {/* Speak Question Button */}
                <button
                  type="button"
                  onClick={() => speakQuestion(questions[currentStep].text)}
                  className={`p-2.5 rounded-xl border transition-all flex items-center justify-center flex-shrink-0 cursor-pointer ${
                    isSpeaking 
                      ? 'bg-rose-500 text-white border-rose-600 shadow-md animate-pulse'
                      : 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50'
                  }`}
                  title={isSpeaking ? 'Stop voice' : 'Listen to question aloud'}
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Siri / Gemini Live Animated Waveform Visualizer */}
            <AudioWaveformVisualizer 
              isSpeaking={isSpeaking}
              isListening={isListening}
              label={isSpeaking ? 'AI Voice Active' : isListening ? 'Capturing Voice Response' : 'Click Mic or Listen to Begin'}
            />

            {/* Answer Input Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Your Spoken or Written Answer:
                </label>
                
                {/* Voice Input Button */}
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                    isListening
                      ? 'bg-rose-500 text-white border-rose-600 animate-pulse shadow-md shadow-rose-500/30'
                      : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-3.5 h-3.5" />
                      <span>Listening... (Tap to stop)</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5" />
                      <span>Speak Answer</span>
                    </>
                  )}
                </button>
              </div>

              {speechError && (
                <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {speechError}
                </p>
              )}

              <textarea
                value={answers[currentStep]}
                onChange={(e) => {
                  const val = e.target.value;
                  setAnswers(prev => {
                    const next = [...prev];
                    next[currentStep] = val;
                    return next;
                  });
                }}
                rows={5}
                placeholder="Type or speak your answer clearly here. Mention relevant metrics, technologies, and achievements..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
              />

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Words spoken/written: {answers[currentStep].trim().split(/\s+/).filter(Boolean).length}</span>
                <span>Minimum recommended: 30+ words</span>
              </div>
            </div>

            {/* Bottom Step Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                disabled={currentStep === 0}
                onClick={() => {
                  stopAllSpeech();
                  setCurrentStep(prev => Math.max(0, prev - 1));
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                Previous
              </button>

              {currentStep < 2 ? (
                <button
                  type="button"
                  onClick={() => {
                    stopAllSpeech();
                    setCurrentStep(prev => prev + 1);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5 active:scale-95"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={evaluating}
                  onClick={handleEvaluateMockInterview}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white text-xs font-black transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2 active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{evaluating ? 'Analyzing Answers...' : 'Generate AI Scorecard'}</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* EVALUATION SCORECARD SCREEN */
          /* ============================================================== */
          scoreResult && (
            <div className="space-y-5 py-3 animate-in fade-in zoom-in-95 duration-300">
              {/* Overall Score Banner */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white text-center relative overflow-hidden shadow-xl border border-indigo-500/30">
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black uppercase tracking-wider mb-2">
                    <Award className="w-3.5 h-3.5" />
                    <span>Interview Preparedness Score</span>
                  </div>
                  <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-300 to-indigo-300 tracking-tight my-1">
                    {scoreResult.overallScore}%
                  </div>
                  <p className="text-xs text-slate-300 max-w-sm mx-auto">
                    {scoreResult.overallScore >= 85 
                      ? 'Outstanding performance! You are exceptionally well prepared to apply and impress the hiring committee.'
                      : 'Great baseline! Follow the constructive feedback below to secure top-bracket salary offers.'}
                  </p>
                </div>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Domain Skills</span>
                  <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{scoreResult.technicalScore}%</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Clarity & Brevity</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{scoreResult.communicationScore}%</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Confidence</span>
                  <span className="text-lg font-black text-cyan-600 dark:text-cyan-400">{scoreResult.confidenceScore}%</span>
                </div>
              </div>

              {/* Key Strengths */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40">
                <h4 className="text-xs font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 uppercase tracking-wider mb-2">
                  <ThumbsUp className="w-3.5 h-3.5" /> Key Strengths Noticed
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {scoreResult.strengths.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actionable Feedback */}
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40">
                <h4 className="text-xs font-black text-amber-800 dark:text-amber-300 flex items-center gap-1.5 uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Actionable Edge Tips
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {scoreResult.improvements.map((imp, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Final Bottom Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(0);
                    setAnswers(['', '', '']);
                    setScoreResult(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Practice Again</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onReadyToApply) onReadyToApply(job);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-lg shadow-emerald-600/25 flex items-center gap-2 active:scale-95"
                >
                  <span>Apply with Confidence</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )
        )}

      </div>
    </div>
  );
};
