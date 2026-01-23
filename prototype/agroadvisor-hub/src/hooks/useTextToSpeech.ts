import { useRef, useCallback, useState, useEffect } from "react";
import { Language } from "@/contexts/LanguageContext";

// Map language codes to SpeechSynthesis language codes
const languageCodeMap: Record<Language, string> = {
  en: "en-IN",
  hi: "hi-IN",
  mr: "mr-IN",
  ta: "ta-IN",
  te: "te-IN",
};

export function useTextToSpeech(language: Language) {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isSpeakingRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback(
    (text: string) => {
      // Stop any ongoing speech
      if (isSpeakingRef.current) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        isSpeakingRef.current = false;
      }

      // Check if SpeechSynthesis is available
      if (!("speechSynthesis" in window)) {
        console.warn("SpeechSynthesis is not supported in this browser");
        return;
      }

      // Create a new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = languageCodeMap[language] || "en-IN";
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Handle speech end
      utterance.onend = () => {
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        utteranceRef.current = null;
      };

      // Handle speech error
      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        utteranceRef.current = null;
      };

      // Store reference and mark as speaking
      utteranceRef.current = utterance;
      setIsSpeaking(true);
      isSpeakingRef.current = true;

      // Start speaking
      window.speechSynthesis.speak(utterance);
    },
    [language]
  );

  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      utteranceRef.current = null;
    }
  }, []);

  return { speak, stop, isSpeaking };
}

