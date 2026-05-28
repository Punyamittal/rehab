"use client";

import { useAppStore } from "@/stores/app-store";
import { t } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";
import { isSpeechSupported } from "@/lib/narration/speech";

export function SoundToggle({ className }: { className?: string }) {
  const { language, soundEnabled, setSoundEnabled } = useAppStore();

  if (!isSpeechSupported()) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-xl border border-primary/10 bg-white/75 px-1 py-1 shadow-sm",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setSoundEnabled(!soundEnabled)}
        className={cn(
          "touch-target rounded-lg px-2 py-1.5 text-sm transition-colors sm:px-2.5 sm:py-2 sm:text-base",
          soundEnabled ? "bg-primary/20 text-primary" : "opacity-50"
        )}
        title={soundEnabled ? t(language, "soundOn") : t(language, "soundOff")}
        aria-label={soundEnabled ? t(language, "soundOn") : t(language, "soundOff")}
        aria-pressed={soundEnabled}
      >
        {soundEnabled ? "🔊" : "🔇"}
      </button>
    </div>
  );
}
