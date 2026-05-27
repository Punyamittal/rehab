"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  buildNarrationScript,
  isSpeechSupported,
  loadVoices,
  speakText,
  stopSpeaking,
} from "@/lib/narration/speech";
import { useAppStore } from "@/stores/app-store";
import type { Language } from "@/types";
import type { VoiceGender } from "@/lib/narration/voice-profiles";

export function useNarration() {
  const { language, soundEnabled } = useAppStore();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const idRef = useRef(0);

  useEffect(() => {
    if (!isSpeechSupported()) return;
    loadVoices().then(() => setVoicesLoaded(true));
    return () => stopSpeaking();
  }, []);

  const speak = useCallback(
    async (
      text: string,
      lang: Language = language,
      opts?: { title?: string; body?: string; voiceGender?: VoiceGender }
    ) => {
      if (!soundEnabled || !text.trim()) return;

      const script = opts?.title
        ? buildNarrationScript(opts.title, opts.body ?? text)
        : text;

      const id = ++idRef.current;
      await speakText(script, {
        language: lang,
        voiceGender: opts?.voiceGender,
        onStart: () => {
          if (id === idRef.current) setIsSpeaking(true);
        },
        onEnd: () => {
          if (id === idRef.current) setIsSpeaking(false);
        },
        onError: () => {
          if (id === idRef.current) setIsSpeaking(false);
        },
      });
    },
    [language, soundEnabled]
  );

  const stop = useCallback(() => {
    idRef.current++;
    stopSpeaking();
    setIsSpeaking(false);
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    soundEnabled,
    voicesLoaded,
    supported: isSpeechSupported(),
  };
}

/** Auto-narrate when content key changes (e.g. new slide). */
export function useAutoNarrate(
  contentKey: string,
  text: string,
  title?: string,
  voiceGender?: VoiceGender
) {
  const { autoNarrate, soundEnabled, language } = useAppStore();
  const { speak, stop } = useNarration();

  useEffect(() => {
    if (!autoNarrate || !soundEnabled || !text.trim()) return;

    const timer = setTimeout(() => {
      void speak(text, language, {
        title,
        body: text,
        voiceGender,
      });
    }, 450);

    return () => {
      clearTimeout(timer);
      stop();
    };
  }, [
    contentKey,
    autoNarrate,
    soundEnabled,
    language,
    text,
    title,
    voiceGender,
    speak,
    stop,
  ]);
}

/** Read a question aloud when the key changes (respects selected language + auto-read). */
export function useReadQuestion(
  contentKey: string,
  narrationScript: string,
  voiceGender?: VoiceGender
) {
  useAutoNarrate(contentKey, narrationScript, undefined, voiceGender);
}
