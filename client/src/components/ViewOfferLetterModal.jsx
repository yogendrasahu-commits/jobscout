import React, { useState } from 'react';
import { 
  X, 
  ArrowLeft, 
  Printer, 
  CheckCircle, 
  XCircle, 
  Building2, 
  Calendar, 
  MapPin, 
  DollarSign, 
  FileText, 
  Award, 
  ShieldCheck,
  Mail,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { triggerConfetti } from '../utils/confetti';
import { playSuccessChime } from '../utils/soundEffects';

export const ViewOfferLetterModal = ({ 
  application, 
  isOpen, 
  onClose, 
  onAccepted, 
  onDeclined 
}) => {
  const { user, token, isSeeker } = useAuth();
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (!isOpen || !application) return null;

  const offer = application.offerLetter || {
    refNo: `JS-OFFER-${application.id?.slice(-6) || '2026'}`,
    designation: application.jobTitle,
    salary: application.jobSalary || '₹12,00,000 / yr',
    joiningDate: 'Immediate (Within 7 Days)',
    location: application.jobLocation || 'Bandra Kurla Complex (BKC), Mumbai',
    terms: 'Standard company employment policies, 3 months probation period, 30 days notice period.',
    customNote: 'We are thrilled to welcome you to our growing team!',
    companyName: application.employerName || 'JobScout Enterprise Partners',
    employerName: application.employerName || 'Hiring Manager',
    issuedAt: application.updatedAt || new Date().toISOString()
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAcceptOffer = async () => {
    if (!token) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/applications/${application.id}/accept-offer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        triggerConfetti();
        playSuccessChime();
        setFeedback({ type: 'success', text: '🎉 बधाई हो! आपने आधिकारिक ऑफर लेटर स्वीकार कर लिया है और आप आधिकारिक तौर पर नियुक्त हो चुके हैं!' });
        if (onAccepted) onAccepted(data.application || { ...application, status: 'hired' });
      } else {
        setFeedback({ type: 'error', text: data.error || 'ऑफर स्वीकार करने में विफल।' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'नेटवर्क त्रुटि।' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineOffer = async () => {
    if (!token) return;
    if (!window.confirm('क्या आप वाकई इस ऑफर लेटर को अस्वीकार (Decline) करना चाहते हैं?')) {
      return;
    }
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/applications/${application.id}/decline-offer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: 'info', text: 'आपने यह ऑफर लेटर अस्वीकार कर दिया है।' });
        if (onDeclined) onDeclined(data.application || { ...application, status: 'rejected' });
      } else {
        setFeedback({ type: 'error', text: data.error || 'प्रक्रिया विफल रही।' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'नेटवर्क त्रुटि।' });
    } finally {
      setActionLoading(false);
    }
  };

  const isOffered = application.status === 'offered';
  const isHired = application.status === 'hired';
  const isRejected = application.status === 'rejected';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-150">
      
      {/* Print-specific style overrides */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #official-offer-letter-doc, #official-offer-letter-doc * {
            visibility: visible;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #official-offer-letter-doc {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            padding: 24px !important;
            box-shadow: none !important;
            border: 1px solid #cbd5e1 !important;
          }
          .company-watermark {
            display: flex !important;
            opacity: 0.08 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-3xl bg-white border border-slate-200/90 rounded-3xl shadow-2xl flex flex-col max-h-[94dvh] overflow-hidden my-auto animate-in zoom-in-95 duration-150 text-slate-900">
        
        {/* Top Bar with Responsive Back and Close Buttons */}
        <div className="no-print px-4 sm:px-6 py-3.5 bg-slate-50/90 border-b border-slate-200/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-semibold border border-slate-200 transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
              title="Back / Close"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-600" />
              <span>Back (वापस)</span>
            </button>
            <span className="text-xs font-bold text-slate-900 hidden sm:inline">
              Official Employment Offer Letter
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Print / Save PDF Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white text-xs font-bold border border-indigo-200 transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
              title="Close modal"
            >
              <span className="text-[11px] font-semibold hidden sm:inline">Close</span>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Letter Document Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-slate-50/60 text-slate-900">
          
          {feedback && (
            <div className={`no-print mb-4 p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 ${
              feedback.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : feedback.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-indigo-50 border-indigo-200 text-indigo-800'
            }`}>
              {feedback.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-600" /> : <XCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Letterhead Container */}
          <div 
            id="official-offer-letter-doc"
            className="bg-white text-slate-900 rounded-2xl p-6 sm:p-8 md:p-10 shadow-lg border border-slate-200 relative overflow-hidden font-sans"
          >
            {/* Background Security Watermark with Company Name */}
            <div className="company-watermark absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none overflow-hidden z-0">
              <div className="rotate-[-28deg] text-center space-y-16 sm:space-y-24 opacity-[0.06] sm:opacity-[0.07] select-none pointer-events-none">
                <div className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-[0.25em] text-slate-900 whitespace-nowrap">
                  {offer.companyName || application.employerName || 'OFFICIAL OFFER'}
                </div>
                <div className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-[0.25em] text-indigo-900 whitespace-nowrap">
                  {offer.companyName || application.employerName || 'OFFICIAL OFFER'}
                </div>
                <div className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-[0.25em] text-slate-900 whitespace-nowrap">
                  {offer.companyName || application.employerName || 'OFFICIAL OFFER'}
                </div>
              </div>
            </div>

            {/* Foreground Content */}
            <div className="relative z-10 space-y-5">

              {/* Letterhead Top Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-indigo-900/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-900 text-white flex items-center justify-center font-black text-xl shadow-md">
                  {offer.companyName?.slice(0, 2).toUpperCase() || 'JS'}
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                    {offer.companyName}
                  </h1>
                  <p className="text-xs font-semibold text-indigo-700 tracking-wide">
                    CORPORATE TALENT & EMPLOYMENT SERVICES
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right space-y-0.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-900 text-[10px] font-extrabold border border-indigo-200 uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-700" />
                  <span>Verified Offer Letter</span>
                </div>
                <p className="text-[11px] font-mono text-slate-500 mt-1">Ref: <strong>{offer.refNo}</strong></p>
                <p className="text-[11px] text-slate-500">
                  Date: {new Date(offer.issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Candidate Address Block */}
            <div className="mt-6 mb-4 text-xs sm:text-sm text-slate-700 space-y-1">
              <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">To (उम्मीदवार):</p>
              <h2 className="font-extrabold text-base text-slate-900">{application.seekerName}</h2>
              <p className="flex items-center gap-1.5 text-slate-600">
                <Mail className="w-3.5 h-3.5 text-indigo-600" />
                <span>{application.seekerEmail || offer.candidateEmail || 'Candidate Verified Email'}</span>
              </p>
              {application.seekerPhone && (
                <p className="text-slate-500 text-xs">Phone: +91 {application.seekerPhone}</p>
              )}
            </div>

            {/* Salutation & Body */}
            <div className="my-5 space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p className="font-bold text-slate-900">
                Dear {application.seekerName},
              </p>
              <p>
                Following your recent job application and interview evaluations for the opening of 
                <strong className="text-indigo-900"> "{offer.designation}"</strong>, we are pleased to extend this formal offer of employment with 
                <strong className="text-slate-900"> {offer.companyName}</strong>.
              </p>
              {offer.customNote && (
                <div className="p-3 bg-indigo-50/70 border-l-4 border-indigo-600 rounded-r-xl italic text-slate-800 text-xs sm:text-sm">
                  "{offer.customNote}"
                </div>
              )}
            </div>

            {/* Employment Terms Table */}
            <div className="my-6 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Summary of Employment Terms (रोजगार की मुख्य शर्तें)
              </div>
              <div className="divide-y divide-slate-200 text-xs sm:text-sm">
                
                <div className="grid grid-cols-1 sm:grid-cols-3 p-3 bg-white">
                  <span className="font-bold text-slate-500">Designation / Role:</span>
                  <span className="sm:col-span-2 font-black text-indigo-950">{offer.designation}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 p-3 bg-slate-50/60">
                  <span className="font-bold text-slate-500">Compensation (CTC):</span>
                  <span className="sm:col-span-2 font-black text-emerald-700 text-sm">{offer.salary}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 p-3 bg-white">
                  <span className="font-bold text-slate-500">Date of Joining:</span>
                  <span className="sm:col-span-2 font-bold text-slate-800">{offer.joiningDate}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 p-3 bg-slate-50/60">
                  <span className="font-bold text-slate-500">Work Hub / Location:</span>
                  <span className="sm:col-span-2 font-semibold text-slate-800">{offer.location}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 p-3 bg-white">
                  <span className="font-bold text-slate-500">Probation & Policies:</span>
                  <span className="sm:col-span-2 text-slate-600 leading-normal">{offer.terms}</span>
                </div>

              </div>
            </div>

            {/* Signatures & Seal Block */}
            <div className="mt-8 pt-6 border-t-2 border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
              
              {/* Employer Signature */}
              <div className="space-y-1">
                <div className="w-36 h-12 border-b-2 border-slate-800 flex items-center justify-center font-serif text-xl italic font-bold text-indigo-900 select-none">
                  {offer.employerName}
                </div>
                <p className="font-extrabold text-xs text-slate-900">{offer.employerName}</p>
                <p className="text-[11px] text-slate-500">Authorized Signatory • {offer.companyName}</p>
                <div className="pt-1 flex items-center gap-1 text-[10px] text-emerald-700 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Digitally Authorized Document</span>
                </div>
              </div>

              {/* Candidate Acceptance / Stamp */}
              <div className="space-y-1 sm:text-right">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Candidate Acceptance Status
                </div>
                {isHired ? (
                  <div className="inline-block p-2.5 rounded-xl bg-emerald-50 border-2 border-emerald-600 text-emerald-800 font-black text-xs">
                    <div className="flex items-center gap-1.5 justify-end">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>OFFICIALLY ACCEPTED & HIRED</span>
                    </div>
                    <div className="text-[10px] font-mono text-emerald-700 font-semibold mt-0.5">
                      Accepted: {offer.acceptedAt ? new Date(offer.acceptedAt).toLocaleDateString() : 'Confirmed'}
                    </div>
                  </div>
                ) : isRejected ? (
                  <div className="inline-block p-2.5 rounded-xl bg-rose-50 border-2 border-rose-400 text-rose-800 font-black text-xs">
                    <div className="flex items-center gap-1.5 justify-end">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>OFFER DECLINED</span>
                    </div>
                  </div>
                ) : (
                  <div className="inline-block p-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 font-bold text-xs">
                    ⏳ Awaiting Candidate Acceptance
                  </div>
                )}
              </div>

              </div>

            </div>

          </div>

          {/* Action Callouts for Seeker (Only visible when status is 'offered' and user is candidate) */}
          {isSeeker && isOffered && (
            <div className="no-print mt-6 p-4 sm:p-5 rounded-2xl bg-indigo-50/80 border border-indigo-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <span>क्या आप इस जॉब ऑफर को स्वीकार करना चाहते हैं?</span>
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  स्वीकार करने पर आपकी नियुक्ति फाइनल हो जाएगी और नियोक्ता को तुरंत सूचित कर दिया जाएगा।
                </p>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleDeclineOffer}
                  disabled={actionLoading}
                  className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-bold text-xs border border-slate-200 transition-all shadow-sm"
                >
                  Decline
                </button>
                <button
                  type="button"
                  onClick={handleAcceptOffer}
                  disabled={actionLoading}
                  className="w-1/2 sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Accept Offer (स्वीकार करें)</span>
                </button>
              </div>
            </div>
          )}

          {/* If already hired */}
          {isHired && (
            <div className="no-print mt-5 p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900">Officially Hired & Joined!</h4>
                  <p className="text-[11px] text-slate-600">यह ऑफर लेटर दोनों पक्षों द्वारा सत्यापित है। आप इसे कभी भी डाउनलोड या प्रिंट कर सकते हैं।</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Document</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
