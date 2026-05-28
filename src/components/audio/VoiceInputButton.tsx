"use client";

import { useEffect, useRef, useState } from "react";
import type { Language } from "@/types";
import { getLanguageConfig } from "@/lib/i18n/languages";
import { cn } from "@/lib/utils";

interface RecognitionAlternative {
  transcript: string;
}

interface RecognitionResultLike {
  0: RecognitionAlternative;
}

interface RecognitionEventLike {
  results: ArrayLike<RecognitionResultLike>;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: RecognitionEventLike) => void) | null;
  start: () => void;
}

type RecognitionCtor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    webkitSpeechRecognition?: RecognitionCtor;
    SpeechRecognition?: RecognitionCtor;
  }
}

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

interface VoiceInputButtonProps {
  language: Language;
  onResult: (transcript: string) => void;
  autoStartKey?: string | number;
  autoStartDelayMs?: number;
  className?: string;
}

export function VoiceInputButton({
  language,
  onResult,
  autoStartKey,
  autoStartDelayMs = 40,
  className,
}: VoiceInputButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const shouldAutoListenRef = useRef(false);
  const autoStartTokenRef = useRef<string | number | undefined>(undefined);
  const Recognition = getRecognitionCtor();

  const startListening = () => {
    if (!Recognition || isListening) return;
    const recognition = new Recognition();
    recognition.lang = getLanguageConfig(language).speechLang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      if (!shouldAutoListenRef.current) {
        setIsListening(false);
        return;
      }
      // Keep UI stable while we immediately re-arm recognition.
      setIsListening(true);
      window.setTimeout(() => {
        startListening();
      }, 250);
    };
    recognition.onerror = () => {
      if (shouldAutoListenRef.current) {
        setIsListening(true);
        window.setTimeout(() => {
          startListening();
        }, 250);
      } else {
        setIsListening(false);
      }
    };
    recognition.onresult = (event) => {
      const latest = event.results?.[event.results.length - 1];
      const transcript = latest?.[0]?.transcript?.trim();
      if (transcript) onResult(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  useEffect(() => {
    if (autoStartKey === undefined) return;
    if (autoStartTokenRef.current === autoStartKey) return;
    autoStartTokenRef.current = autoStartKey;
    shouldAutoListenRef.current = true;
    if (!Recognition) return;
    const timer = window.setTimeout(() => {
      startListening();
    }, autoStartDelayMs);
    return () => {
      window.clearTimeout(timer);
      shouldAutoListenRef.current = false;
      setIsListening(false);
      recognitionRef.current = null;
    };
  }, [Recognition, autoStartDelayMs, autoStartKey]);

  return (
    <button
      type="button"
      onClick={startListening}
      disabled={!Recognition || isListening}
      className={cn(
        "touch-target rounded-xl border border-primary/20 bg-white/70 px-3 py-2 text-xs font-semibold text-primary transition-colors",
        isListening
          ? "animate-pulse border-primary/40 bg-primary/15"
          : "hover:bg-white",
        !Recognition ? "cursor-not-allowed opacity-60" : "",
        className
      )}
      title={!Recognition ? "Voice input not supported" : "Use voice input"}
      aria-label={!Recognition ? "Voice input not supported" : "Use voice input"}
    >
      {isListening ? "🎙 Listening..." : "🎤 Voice"}
    </button>
  );
}
