"use client";

/**
 * Browsers require a user gesture before audio plays.
 * This banner appears on first visit and disappears after one tap —
 * that tap also "unlocks" the AudioContext and speechSynthesis.
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { loadVoices, isSpeechSupported, speakText } from "@/lib/narration/speech";
import { useAppStore } from "@/stores/app-store";
import { t } from "@/lib/i18n/translations";

export function AudioUnlockBanner() {
  const { soundEnabled, language } = useAppStore();
  const [needsUnlock, setNeedsUnlock] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!isSpeechSupported() || !soundEnabled) return;

    // If voices already loaded, no banner needed
    loadVoices().then((voices) => {
      if (voices.length === 0) {
        setNeedsUnlock(true);
      } else {
        // Try a silent utterance to see if it works without user gesture
        // (it won't on first page load in Chrome — we catch the error)
        const u = new SpeechSynthesisUtterance(" ");
        u.volume = 0;
        u.onstart = () => {
          window.speechSynthesis.cancel();
          setNeedsUnlock(false);
        };
        u.onerror = () => setNeedsUnlock(true);
        window.speechSynthesis.speak(u);
        // If nothing happens in 500ms, show banner
        setTimeout(() => setNeedsUnlock((n) => n), 500);
      }
    });
  }, [soundEnabled]);

  const unlock = async () => {
    // This tap IS the user gesture — voices load and a short sample plays
    await loadVoices();
    await speakText(t(language, "soundReady"), { language, rate: 1 });
    setDismissed(true);
    setNeedsUnlock(false);
  };

  if (!soundEnabled || dismissed || !needsUnlock) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 w-[min(92vw,400px)]"
      >
        <button
          type="button"
          onClick={unlock}
          className="flex w-full items-center gap-4 rounded-3xl bg-primary px-6 py-4 text-white shadow-xl"
        >
          <span className="text-3xl">🔊</span>
          <div className="flex-1 text-left">
            <p className="font-semibold text-base">
              {t(language, "tapToEnableSound")}
            </p>
            <p className="text-xs text-white/80 mt-0.5">
              {t(language, "browserNeedsTap")}
            </p>
          </div>
          <span className="text-xl">→</span>
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
