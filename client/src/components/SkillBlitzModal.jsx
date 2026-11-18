import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Zap, 
  Clock, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  RotateCcw,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

const SKILL_QUIZZES = {
  react: {
    title: 'React & Frontend Architecture',
    questions: [
      {
        q: 'What is the primary benefit of React Server Components (RSCs)?',
        options: [
          'They eliminate the need for any CSS',
          'Zero client-side bundle size for server-only dependencies',
          'They replace WebRTC protocols',
          'They make JavaScript execute synchronously'
        ],
        ans: 1
      },
      {
        q: 'Which hook should be used to synchronize with an external system without re-rendering?',
        options: ['useMemo', 'useRef', 'useEffect', 'useId'],
        ans: 1
      },
      {
        q: 'What prevents unnecessary recalculations of heavy computational values?',
        options: ['useCallback', 'useMemo', 'useState', 'useTransition'],
        ans: 1
      },
      {
        q: 'In React 19, what does the new useActionState hook manage?',
        options: ['Canvas 2D contexts', 'Form actions and pending submission state', 'WebSocket ping intervals', 'IndexedDB transactions'],
        ans: 1
      },
      {
        q: 'How does React Fiber achieve time slicing and responsive UI?',
        options: ['By running on multi-core WebAssembly threads', 'By breaking render work into incremental prioritized units', 'By compiling JSX to C++', 'By ignoring DOM updates'],
        ans: 1
      }
    ]
  },
  python: {
    title: 'Python, FastAPI & Backend',
    questions: [
      {
        q: 'What Python keyword is used to pause execution and yield values lazily?',
        options: ['return', 'yield', 'await', 'defer'],
        ans: 1
      },
      {
        q: 'How does FastAPI achieve high asynchronous performance?',
        options: ['Using Java runtime', 'Built on Starlette and Pydantic with async/await', 'By disabling type checks', 'Using Apache HTTPD'],
        ans: 1
      },
      {
        q: 'What is the Global Interpreter Lock (GIL) primarily designed for in CPython?',
        options: ['To speed up HTTP requests', 'Thread-safe CPython memory management', 'To encrypt source code', 'To compile code to machine code'],
        ans: 1
      },
      {
        q: 'Which data structure in Python offers O(1) average lookup time?',
        options: ['List', 'Tuple', 'Dictionary / Set', 'Deque'],
        ans: 2
      },
      {
        q: 'What is a Python decorator fundamentally?',
        options: ['A CSS style wrapper', 'A callable that takes another function and extends its behavior', 'A database ORM model', 'A garbage collector hook'],
        ans: 1
      }
    ]
  },
  sales: {
    title: 'Enterprise Sales & Closing',
    questions: [
      {
        q: 'In the BANT qualification framework, what does the "A" stand for?',
        options: ['Action', 'Authority', 'Agreement', 'Allocation'],
        ans: 1
      },
      {
        q: 'What is the most effective approach when addressing a client pricing objection?',
        options: ['Immediately offer a 50% discount', 'Uncover value gap and quantify ROI vs cost of inaction', 'Argue that competitor is worse', 'Walk away from the call'],
        ans: 1
      },
      {
        q: 'What does CAC to LTV ratio measure in SaaS business metrics?',
        options: ['Employee turnover', 'Customer Acquisition Cost vs Lifetime Value efficiency', 'Server bandwidth usage', 'Daily active clicks'],
        ans: 1
      },
      {
        q: 'What is the primary objective of a Discovery Call?',
        options: ['Show all 50 product features in a slide deck', 'Diagnose client pain points, timeline, and decision criteria', 'Send an invoice immediately', 'Collect credit card details'],
        ans: 1
      },
      {
        q: 'Which technique involves proposing a trial or milestone to eliminate buyer hesitation?',
        options: ['Hard close', 'Puppy dog / Pilot proof of value close', 'Threat close', 'Silent treatment'],
        ans: 1
      }
    ]
  }
};

export const SkillBlitzModal = ({
  isOpen,
  onClose,
  onAwardBadge,
  user
}) => {
  if (!isOpen) return null;

  const [selectedSkill, setSelectedSkill] = useState('react');
  const [quizState, setQuizState] = useState('intro'); // 'intro' | 'active' | 'complete'
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const timerRef = useRef(null);

  const quiz = SKILL_QUIZZES[selectedSkill] || SKILL_QUIZZES.react;
  const currentQuestion = quiz.questions[currentQIndex];

  // Timer Countdown
  useEffect(() => {
    if (quizState === 'active') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleFinishQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [quizState, selectedAnswers]);

  const handleStart = (skillKey) => {
    setSelectedSkill(skillKey);
    setQuizState('active');
    setCurrentQIndex(0);
    setSelectedAnswers([]);
    setTimeLeft(60);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(20);
    }
  };

  const handleSelectOption = (optIndex) => {
    const updated = [...selectedAnswers, optIndex];
    setSelectedAnswers(updated);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }

    if (currentQIndex < quiz.questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      // Completed all questions
      handleFinishQuiz(updated);
    }
  };

  const handleFinishQuiz = (answers = selectedAnswers) => {
    clearInterval(timerRef.current);
    setQuizState('complete');

    // Calculate score
    let correct = 0;
    quiz.questions.forEach((q, idx) => {
      if (answers[idx] === q.ans) correct += 1;
    });

    const scorePct = Math.round((correct / quiz.questions.length) * 100);
    if (scorePct >= 80) {
      const badgeTitle = `⚡ Verified ${selectedSkill.toUpperCase()} Top 5%`;
      if (onAwardBadge) {
        onAwardBadge({
          skill: selectedSkill,
          badgeTitle,
          score: scorePct,
          timestamp: new Date().toISOString()
        });
      }
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 200]);
      }
    }
  };

  // Score calculation
  let correctCount = 0;
  if (quizState === 'complete') {
    quiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.ans) correctCount += 1;
    });
  }
  const scorePercent = Math.round((correctCount / quiz.questions.length) * 100);
  const passed = scorePercent >= 80;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200/90 dark:border-white/10 flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>60-Second AI Skill Blitz</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
                  Verified Badge
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                5 Rapid-Fire Questions • Earn Top Candidate Rank
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
          
          {/* INTRO STATE: Select Skill */}
          {quizState === 'intro' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Select your core superpower. Score 80%+ to stamp a permanent verified badge on your radar profile:
              </p>

              <div className="grid grid-cols-1 gap-2.5">
                {[
                  { key: 'react', label: 'React & Frontend Architecture', desc: 'RSCs, Fiber, Hooks & State Performance', icon: '⚛️' },
                  { key: 'python', label: 'Python & High-Scale Backend', desc: 'FastAPI, Concurrency, Asyncio & Memory', icon: '🐍' },
                  { key: 'sales', label: 'Enterprise Sales & Deal Closing', desc: 'BANT, ROI Justification & Negotiation', icon: '💼' }
                ].map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => handleStart(s.key)}
                    className="p-3.5 rounded-2xl text-left bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-white/10 flex items-center justify-between group active:scale-98 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{s.icon}</span>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-cyan-400 transition-colors">
                          {s.label}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{s.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ACTIVE QUIZ STATE */}
          {quizState === 'active' && currentQuestion && (
            <div className="space-y-4">
              
              {/* Progress and Timer Strip */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>Question {currentQIndex + 1} of 5</span>
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-mono font-black">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{timeLeft}s</span>
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-indigo-500 h-full transition-all duration-300"
                  style={{ width: `${((currentQIndex + 1) / 5) * 100}%` }}
                />
              </div>

              {/* Question Text */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10">
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                  {currentQuestion.q}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2">
                {currentQuestion.options.map((opt, oIdx) => (
                  <button
                    key={oIdx}
                    type="button"
                    onClick={() => handleSelectOption(oIdx)}
                    className="w-full p-3 rounded-xl text-left bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-800 dark:text-slate-200 text-xs font-medium border border-slate-200/80 dark:border-slate-700 hover:border-indigo-400 transition-all active:scale-98 cursor-pointer flex items-center justify-between group"
                  >
                    <span>{opt}</span>
                    <span className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600 group-hover:border-indigo-500 flex items-center justify-center text-[10px] text-slate-400 font-bold">
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                  </button>
                ))}
              </div>

            </div>
          )}

          {/* COMPLETE STATE */}
          {quizState === 'complete' && (
            <div className="text-center py-4 space-y-4">
              {passed ? (
                <div className="p-6 rounded-3xl bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-300 dark:border-amber-700">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center mx-auto mb-3 shadow-xl shadow-amber-500/30 animate-bounce">
                    <Award className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white">
                    Congratulations! Blitz Passed
                  </h4>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-bold mt-1">
                    Score: {scorePercent}% ({correctCount}/5 correct)
                  </p>
                  
                  {/* Stamped Badge */}
                  <div className="mt-4 p-3 rounded-2xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center gap-2 text-xs font-black text-amber-800 dark:text-amber-300">
                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                    <span>⚡ Verified {selectedSkill.toUpperCase()} Top 5% Stamped</span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3">
                    Your profile now carries a verified gold ring and ranks on top of employer radar searches.
                  </p>
                </div>
              ) : (
                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                  <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                    Score: {scorePercent}% ({correctCount}/5 correct)
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Needs 80% to earn the Verified Top 5% badge. Feel free to review and retry anytime!
                  </p>
                  <button
                    type="button"
                    onClick={() => handleStart(selectedSkill)}
                    className="mt-4 py-2 px-4 rounded-xl bg-indigo-600 text-white text-xs font-bold active:scale-95 cursor-pointer"
                  >
                    Retry Blitz
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black text-xs active:scale-98 transition-all cursor-pointer"
              >
                Close & Return
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
