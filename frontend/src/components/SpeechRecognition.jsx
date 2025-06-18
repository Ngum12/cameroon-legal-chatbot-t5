import { useState, useEffect } from 'react';

const useSpeechRecognition = (language = 'en-US') => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  useEffect(() => {
    if (!SpeechRecognition) {
      setError(new Error('Speech recognition not supported in this browser'));
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'en' ? 'en-US' : 'fr-FR';
    recognition.continuous = false;
    recognition.interimResults = true;
    
    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };
    
    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      setTranscript(transcript);
    };
    
    recognition.onerror = (event) => {
      setError(new Error(event.error));
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    if (isListening) {
      recognition.start();
      return () => {
        recognition.stop();
      };
    }
  }, [isListening, language]);
  
  const startListening = () => {
    setError(null);
    setIsListening(true);
  };
  
  const stopListening = () => {
    setIsListening(false);
  };
  
  return {
    transcript,
    isListening,
    error,
    startListening,
    stopListening,
    isSupported: !!SpeechRecognition
  };
};

export default useSpeechRecognition;