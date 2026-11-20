import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Video, 
  VideoOff, 
  Mic, 
  Square, 
  Play, 
  RotateCcw, 
  Check, 
  Sparkles, 
  Clock, 
  AlertCircle,
  Camera
} from 'lucide-react';

export const VideoPitchRecorderModal = ({
  isOpen,
  onClose,
  onSavePitch,
  existingPitchUrl = null
}) => {
  if (!isOpen) return null;

  const [stream, setStream] = useState(null);
  const [recordingState, setRecordingState] = useState('idle'); // 'idle' | 'recording' | 'preview'
  const [countdown, setCountdown] = useState(30);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState(existingPitchUrl);
  const [cameraError, setCameraError] = useState(null);

  const videoPreviewRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerIntervalRef = useRef(null);

  // Initialize Camera Stream on Modal Open
  useEffect(() => {
    let activeStream = null;
    const startCamera = async () => {
      try {
        setCameraError(null);
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          activeStream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 720 }, height: { ideal: 1280 }, facingMode: 'user' },
            audio: true
          });
          setStream(activeStream);
          if (videoPreviewRef.current) {
            videoPreviewRef.current.srcObject = activeStream;
            videoPreviewRef.current.play().catch(() => {});
          }
        } else {
          setCameraError('Camera API is not supported in this browser environment.');
        }
      } catch (err) {
        console.warn('Webcam permission error:', err);
        setCameraError('Camera or microphone permission was denied. You can record using mock simulator.');
      }
    };

    if (recordingState !== 'preview') {
      startCamera();
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [recordingState]);

  // Start 30s Recording
  const startRecording = () => {
    chunksRef.current = [];
    setCountdown(30);
    setRecordingState('recording');

    if (stream && typeof MediaRecorder !== 'undefined') {
      try {
        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        mediaRecorderRef.current = recorder;
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
        };
        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          setRecordedBlobUrl(url);
          setRecordingState('preview');
        };
        recorder.start(500);
      } catch (e) {
        console.warn('MediaRecorder error:', e);
      }
    }

    // Timer countdown
    timerIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          stopRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Stop Recording
  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    } else {
      // Simulator fallback
      setRecordedBlobUrl('mock_pitch_saved');
      setRecordingState('preview');
    }
  };

  // Retake Pitch
  const handleRetake = () => {
    setRecordedBlobUrl(null);
    setRecordingState('idle');
    setCountdown(30);
  };

  // Close modal safely terminating media stream
  const handleCloseModal = () => {
    if (stream) {
      try {
        stream.getTracks().forEach(track => track.stop());
      } catch {}
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    onClose();
  };

  // Save to Profile
  const handleSave = () => {
    if (onSavePitch) {
      onSavePitch(recordedBlobUrl || 'saved_video_pitch');
    }
    handleCloseModal();
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 text-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-white/10 flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-black tracking-wide">30-Second Elevator Pitch</h3>
          </div>
          <button
            onClick={handleCloseModal}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewport Area */}
        <div className="relative aspect-[9/14] w-full bg-slate-950 overflow-hidden flex items-center justify-center">
          
          {recordingState === 'preview' && recordedBlobUrl && recordedBlobUrl !== 'mock_pitch_saved' ? (
            <video
              src={recordedBlobUrl}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              ref={videoPreviewRef}
              muted
              playsInline
              className="w-full h-full object-cover -scale-x-100"
            />
          )}

          {/* Camera Error or Mock Overlay */}
          {cameraError && recordingState !== 'preview' && (
            <div className="absolute inset-0 bg-slate-950/90 p-6 flex flex-col items-center justify-center text-center">
              <VideoOff className="w-12 h-12 text-rose-400 mb-3" />
              <p className="text-xs text-slate-300 max-w-xs">{cameraError}</p>
              <button
                type="button"
                onClick={startRecording}
                className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold active:scale-95"
              >
                Simulate 30s Recording
              </button>
            </div>
          )}

          {/* Recording Status HUD Overlay */}
          {recordingState === 'recording' && (
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-600/90 text-white text-xs font-black tracking-wider animate-pulse shadow-lg">
                <span className="w-2 h-2 rounded-full bg-white" />
                <span>REC</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-amber-300 text-xs font-black border border-white/20">
                <Clock className="w-3.5 h-3.5" />
                <span>{countdown}s remaining</span>
              </div>
            </div>
          )}

          {/* Tips Overlay on Idle */}
          {recordingState === 'idle' && (
            <div className="absolute bottom-20 left-4 right-4 p-3 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-xs text-slate-300 text-center">
              💡 Introduce yourself, highlight your top 2 skills, and explain what roles you're excited for.
            </div>
          )}

        </div>

        {/* Action Controls Bar */}
        <div className="p-4 bg-slate-950 flex items-center justify-center gap-3">
          {recordingState === 'idle' && (
            <button
              type="button"
              onClick={startRecording}
              className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 active:scale-95 transition-all cursor-pointer"
            >
              <span className="w-3.5 h-3.5 rounded-full bg-white" />
              <span>Record 30-Second Pitch</span>
            </button>
          )}

          {recordingState === 'recording' && (
            <button
              type="button"
              onClick={stopRecording}
              className="w-full py-3 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-sm flex items-center justify-center gap-2 border border-white/20 active:scale-95 transition-all cursor-pointer"
            >
              <Square className="w-4 h-4 fill-rose-500 text-rose-500" />
              <span>Finish & Preview</span>
            </button>
          )}

          {recordingState === 'preview' && (
            <div className="w-full flex items-center gap-2">
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-white/10 active:scale-95 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save to Profile</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
