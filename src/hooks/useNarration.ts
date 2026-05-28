"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  buildNarrationScript,
  isSpeechSupported,
  loadVoices,
  speakText,
  stopSpeaking,
} from "@/lib/narration/speech";
import {
  estimateDwellMs,
  LINE_PAUSE_MS,
  SPEECH_FALLBACK_BUFFER_MS,
} from "@/lib/narration/story-timing";
import { applySpokenOverrides } from "@/lib/narration/spoken-overrides";
import { useAppStore } from "@/stores/app-store";
import type { Language } from "@/types";
import type { VoiceGender } from "@/lib/narration/voice-profiles";

export function useNarration() {
  const {
    language,
    soundEnabled,
    narrationRate,
    setLastNarration,
    lastNarrationText,
    lastNarrationLanguage,
  } = useAppStore();
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
      const spokenScript = applySpokenOverrides(lang, script);
      setLastNarration(spokenScript, lang);

      const id = ++idRef.current;
      await speakText(spokenScript, {
        language: lang,
        voiceGender: opts?.voiceGender,
        rate: narrationRate,
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
    [language, narrationRate, setLastNarration, soundEnabled]
  );

  const stop = useCallback(() => {
    idRef.current++;
    stopSpeaking();
    setIsSpeaking(false);
  }, []);

  const replayLast = useCallback(async () => {
    if (!lastNarrationText.trim() || !lastNarrationLanguage) return;
    await speak(lastNarrationText, lastNarrationLanguage);
  }, [lastNarrationLanguage, lastNarrationText, speak]);

  return {
    speak,
    replayLast,
    stop,
    isSpeaking,
    narrationRate,
    hasReplay: Boolean(lastNarrationText.trim() && lastNarrationLanguage),
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
  voiceGender?: VoiceGender,
  options?: { force?: boolean }
) {
  const { autoNarrate, soundEnabled, language } = useAppStore();
  const { speak } = useNarration();
  const force = options?.force ?? false;

  useEffect(() => {
    const shouldAutoNarrate = force || autoNarrate;
    if (!shouldAutoNarrate || !soundEnabled || !text.trim()) return;

    const timer = setTimeout(() => {
      void speak(text, language, {
        title,
        body: text,
        voiceGender,
      });
    }, 450);

    return () => {
      clearTimeout(timer);
    };
  }, [
    contentKey,
    autoNarrate,
    force,
    soundEnabled,
    language,
    text,
    title,
    voiceGender,
    speak,
  ]);
}

/**
 * Speak a line, then call onAdvance after audio ends (or fallback timer).
 * Use for cinematic dialogues so lines are not cut off mid-sentence.
 */
export function useSpeechThenAdvance({
  contentKey,
  text,
  enabled,
  onAdvance,
  advanceOnComplete = true,
  voiceGender,
  pauseAfterMs = LINE_PAUSE_MS,
}: {
  contentKey: string;
  text: string;
  enabled: boolean;
  onAdvance: () => void;
  /** When false, only narrates (e.g. choice list) without advancing. */
  advanceOnComplete?: boolean;
  voiceGender?: VoiceGender;
  pauseAfterMs?: number;
}) {
  const { autoNarrate, soundEnabled, language } = useAppStore();
  const narrationRate = useAppStore((s) => s.narrationRate);
  const setLastNarration = useAppStore((s) => s.setLastNarration);
  const onAdvanceRef = useRef(onAdvance);
  onAdvanceRef.current = onAdvance;

  useEffect(() => {
    if (!enabled || !text.trim()) return;

    let cancelled = false;
    let advanced = false;

    const fireAdvance = () => {
      if (!advanceOnComplete || cancelled || advanced) return;
      advanced = true;
      window.setTimeout(() => {
        if (!cancelled) onAdvanceRef.current();
      }, pauseAfterMs);
    };

    const useVoice = autoNarrate && soundEnabled;
    const fallbackMs =
      estimateDwellMs(text, useVoice) +
      (useVoice ? SPEECH_FALLBACK_BUFFER_MS : 0);

    const fallbackTimer = window.setTimeout(fireAdvance, fallbackMs);

    if (useVoice) {
      const startTimer = window.setTimeout(() => {
        if (cancelled) return;
        const spokenText = applySpokenOverrides(language, text);
        setLastNarration(spokenText, language);
        void speakText(spokenText, {
          language,
          voiceGender,
          rate: narrationRate,
          onEnd: () => {
            window.clearTimeout(fallbackTimer);
            fireAdvance();
          },
          onError: () => {
            /* fallback timer still runs */
          },
        });
      }, 300);

      return () => {
        cancelled = true;
        window.clearTimeout(startTimer);
        window.clearTimeout(fallbackTimer);
      };
    }

    return () => {
      cancelled = true;
      window.clearTimeout(fallbackTimer);
    };
  }, [
    contentKey,
    text,
    enabled,
    advanceOnComplete,
    autoNarrate,
    soundEnabled,
    language,
    narrationRate,
    voiceGender,
    pauseAfterMs,
    setLastNarration,
  ]);
}

/** Read a question aloud when the key changes (respects selected language + auto-read). */
export function useReadQuestion(
  contentKey: string,
  narrationScript: string,
  voiceGender?: VoiceGender,
  options?: { force?: boolean }
) {
  useAutoNarrate(
    contentKey,
    narrationScript,
    undefined,
    voiceGender,
    options
  );
}
