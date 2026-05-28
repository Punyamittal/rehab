"use client";

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
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-white/95 to-white/80 p-1.5 shadow-[0_8px_20px_rgba(74,55,40,0.12)] backdrop-blur-sm">
        <div className="relative">
          <span
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm"
            aria-hidden
          >
            🌐
          </span>
          <span
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-muted"
            aria-hidden
          >
            ▾
          </span>
        <select
          value={language}
          onChange={(e) => handleSelect(e.target.value as Language)}
          aria-label={t(uiLocale, "selectLanguage")}
          className="touch-target min-w-[132px] appearance-none rounded-xl border border-white/60 bg-white/90 py-1.5 pl-8 pr-7 text-[11px] font-semibold text-foreground outline-none ring-primary/30 transition focus:ring-2 sm:min-w-[170px] sm:py-2 sm:text-sm"
        >
          {LANGUAGE_CONFIGS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.shortLabel} - {opt.nativeLabel}
            </option>
          ))}
        </select>
        </div>
      </div>
      <p className="hidden max-w-[260px] text-right text-[10px] leading-tight text-muted sm:block">
        {current.nativeLabel} · ☁️ {getEdgeVoiceLabel(current.id)}
      </p>
      {current.usesSharedVoice && (
        <p className="hidden max-w-[280px] text-right text-[10px] leading-tight text-amber-800/80 sm:block">
          {t(uiLocale, "dialectVoiceNote")}
        </p>
      )}
    </div>
  );
}

/** @deprecated Use LanguageSelector */
export const LanguageToggle = LanguageSelector;
