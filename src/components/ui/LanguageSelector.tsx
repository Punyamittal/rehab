"use client";

import { useRef } from "react";
import { useAppStore } from "@/stores/app-store";
import type { Language } from "@/types";
import {
  LANGUAGE_CONFIGS,
  getLanguageConfig,
} from "@/lib/i18n/languages";
import { stopSpeaking, speakText } from "@/lib/narration/speech";
import { getEdgeVoiceLabel } from "@/lib/narration/edge-voices";
import { getUiLocale, t } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

const VOICE_SAMPLES: Record<Language, string> = {
  hi: "नमस्ते, यह हिंदी आवाज़ है।",
  /** Devanagari sample — Edge TTS cannot synthesize Gurmukhi script. */
  pa: "सत श्री अकाल, यह पंजाबी आवाज़ है।",
  bho: "प्रणाम, ई भोजपुरी आवाज़ बा।",
  hr: "राम राम, यो हरियाणवी आवाज़ सै।",
  en: "Hello, this is the English voice.",
};

export function LanguageSelector({ className }: { className?: string }) {
  const { language, setLanguage, soundEnabled } = useAppStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const uiLocale = getUiLocale(language);
  const current = getLanguageConfig(language);

  const handleSelect = (value: Language) => {
    stopSpeaking();
    setLanguage(value);
    if (soundEnabled) {
      const sample = VOICE_SAMPLES[value];
      void speakText(sample, { language: value, rate: 0.95 });
    }
  };

  return (
    <div className={cn("flex flex-col items-end gap-1", className)}>
      <div
        ref={scrollRef}
        className="flex max-w-[min(100vw-10rem,300px)] gap-1 overflow-x-auto rounded-xl border border-primary/10 bg-white/75 p-1 shadow-sm scrollbar-thin"
        role="listbox"
        aria-label={t(uiLocale, "selectLanguage")}
      >
        {LANGUAGE_CONFIGS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            role="option"
            aria-selected={language === opt.id}
            onClick={() => handleSelect(opt.id)}
            className={cn(
              "touch-target shrink-0 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap",
              language === opt.id
                ? "bg-primary text-white shadow-sm"
                : "text-muted hover:bg-white/80"
            )}
            title={opt.nativeLabel}
          >
            {opt.shortLabel}
          </button>
        ))}
      </div>
      <p className="max-w-[260px] text-right text-[10px] leading-tight text-muted">
        {current.nativeLabel} · ☁️ {getEdgeVoiceLabel(current.id)}
      </p>
      {current.usesSharedVoice && (
        <p className="max-w-[280px] text-right text-[10px] leading-tight text-amber-800/80">
          {t(uiLocale, "dialectVoiceNote")}
        </p>
      )}
    </div>
  );
}

/** @deprecated Use LanguageSelector */
export const LanguageToggle = LanguageSelector;
