"use client";

import { useNarration } from "@/hooks/useNarration";
import { useAppStore } from "@/stores/app-store";
import { t } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";
import type { VoiceGender } from "@/lib/narration/voice-profiles";
import type { Language } from "@/types";

interface NarrationButtonProps {
  /** Full text to read aloud */
  text: string;
  /** Optional override language for speech synthesis */
  speakLanguage?: Language;
  className?: string;
  size?: "sm" | "md" | "lg";
  voiceGender?: VoiceGender;
}

export function NarrationButton({
  text,
  speakLanguage,
  className,
  size = "md",
  voiceGender,
}: NarrationButtonProps) {
  const language = useAppStore((s) => s.language);
  const { speak, stop, isSpeaking, supported, soundEnabled } = useNarration();

  if (!supported) return null;

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-3 text-base",
  };

  const handleClick = () => {
    if (!soundEnabled) return;
    if (isSpeaking) {
      stop();
    } else {
      const lang = speakLanguage ?? language;
      void speak(text, lang, { voiceGender });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!soundEnabled}
      className={cn(
        "touch-target shrink-0 rounded-2xl font-medium transition-colors",
        soundEnabled
          ? isSpeaking
            ? "bg-primary text-white animate-pulse"
            : "bg-accent/40 hover:bg-accent/60"
          : "cursor-not-allowed bg-gray-200/80 text-muted opacity-60",
        sizeClasses[size],
        className
      )}
      aria-label={
        isSpeaking
          ? t(language, "stopListening")
          : t(language, "listen")
      }
      aria-pressed={isSpeaking}
    >
      {isSpeaking ? `⏹ ${t(language, "stopListening")}` : `🔊 ${t(language, "listen")}`}
    </button>
  );
}
