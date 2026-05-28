"use client";

import { useAppStore } from "@/stores/app-store";
import { t } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";
import { isSpeechSupported } from "@/lib/narration/speech";
import { getLanguageConfig } from "@/lib/i18n/languages";
import { useNarration } from "@/hooks/useNarration";

export function SoundToggle({ className }: { className?: string }) {
  const {
    language,
    soundEnabled,
    autoNarrate,
    narrationRate,
    setSoundEnabled,
    setAutoNarrate,
    setNarrationRate,
  } = useAppStore();
  const { replayLast, hasReplay, isSpeaking } = useNarration();

  if (!isSpeechSupported()) return null;

  const voiceLabel = getLanguageConfig(language).shortLabel;

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
          "touch-target rounded-lg px-2.5 py-2 text-base transition-colors",
          soundEnabled ? "bg-primary/20 text-primary" : "opacity-50"
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
            "touch-target rounded-lg px-2 py-2 text-[11px] font-semibold transition-colors",
            autoNarrate
              ? "bg-accent/40 text-foreground"
              : "text-muted hover:bg-white/80"
          )}
          title={t(language, "autoRead")}
          aria-label={t(language, "autoRead")}
          aria-pressed={autoNarrate}
        >
          {autoNarrate ? `▶ ${voiceLabel}` : "▶ Auto"}
        </button>
      )}
      {soundEnabled && (
        <>
          <button
            type="button"
            onClick={() => setNarrationRate(narrationRate - 0.05)}
            className="touch-target rounded-lg px-2 py-2 text-xs font-medium text-muted hover:bg-white/80"
            title="Slower narration"
            aria-label="Slower narration"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => setNarrationRate(narrationRate + 0.05)}
            className="touch-target rounded-lg px-2 py-2 text-xs font-medium text-muted hover:bg-white/80"
            title="Faster narration"
            aria-label="Faster narration"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => void replayLast()}
            disabled={!hasReplay || isSpeaking}
            className={cn(
              "touch-target rounded-lg px-2 py-2 text-xs font-medium",
              hasReplay && !isSpeaking
                ? "text-foreground hover:bg-white/80"
                : "cursor-not-allowed text-muted/50"
            )}
            title="Replay last narration"
            aria-label="Replay last narration"
          >
            ↺
          </button>
        </>
      )}
    </div>
  );
}
