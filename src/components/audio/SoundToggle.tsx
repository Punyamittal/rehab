"use client";

import { useAppStore } from "@/stores/app-store";
import { t } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";
import { isSpeechSupported } from "@/lib/narration/speech";
import { getLanguageConfig } from "@/lib/i18n/languages";

export function SoundToggle({ className }: { className?: string }) {
  const {
    language,
    soundEnabled,
    autoNarrate,
    setSoundEnabled,
    setAutoNarrate,
  } = useAppStore();

  if (!isSpeechSupported()) return null;

  const voiceLabel = getLanguageConfig(language).shortLabel;

  return (
    <div className={cn("flex items-center gap-1 rounded-2xl bg-white/70 p-1 shadow-sm", className)}>
      <button
        type="button"
        onClick={() => setSoundEnabled(!soundEnabled)}
        className={cn(
          "touch-target rounded-xl px-3 py-2 text-lg transition-colors",
          soundEnabled ? "bg-primary/20" : "opacity-50"
        )}
        title={soundEnabled ? t(language, "soundOn") : t(language, "soundOff")}
        aria-label={soundEnabled ? t(language, "soundOn") : t(language, "soundOff")}
        aria-pressed={soundEnabled}
      >
        {soundEnabled ? "🔊" : "🔇"}
      </button>
      {soundEnabled && (
        <button
          type="button"
          onClick={() => setAutoNarrate(!autoNarrate)}
          className={cn(
            "touch-target rounded-xl px-2 py-2 text-xs font-medium transition-colors",
            autoNarrate
              ? "bg-accent/40 text-foreground"
              : "text-muted hover:bg-white/80"
          )}
          title={t(language, "autoRead")}
          aria-label={t(language, "autoRead")}
          aria-pressed={autoNarrate}
        >
          {autoNarrate ? `▶ ${voiceLabel}` : "▶"}
        </button>
      )}
    </div>
  );
}
