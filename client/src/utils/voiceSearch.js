/**
 * Web Speech API Voice Recognition Service for JobScout
 * Converts spoken voice input (English, Hindi, Marathi) into text for instant job search.
 */

export function isVoiceRecognitionSupported() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function startVoiceRecognition({
  language = 'en',
  onResult,
  onError,
  onStart,
  onEnd
}) {
  if (!isVoiceRecognitionSupported()) {
    if (onError) onError('Voice recognition not supported in this browser.');
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  // Language mapping
  const langMap = {
    en: 'en-IN',
    hi: 'hi-IN',
    mr: 'mr-IN'
  };

  recognition.lang = langMap[language] || 'en-IN';
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    if (onStart) onStart();
  };

  recognition.onresult = (event) => {
    if (event.results && event.results[0] && event.results[0][0]) {
      const transcript = event.results[0][0].transcript;
      if (onResult) onResult(transcript);
    }
  };

  recognition.onerror = (event) => {
    console.warn('Speech recognition error:', event.error);
    if (onError) onError(event.error);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  try {
    recognition.start();
    return recognition;
  } catch (err) {
    console.warn('Failed to start speech recognition:', err);
    if (onError) onError(err.message);
    return null;
  }
}
