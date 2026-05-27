import type { Language } from "@/types";

export interface LanguageConfig {
  id: Language;
  /** Label shown in language picker */
  nativeLabel: string;
  shortLabel: string;
  /** BCP-47 tag for SpeechSynthesisUtterance */
  speechLang: string;
  /** UI strings locale (dialects use Hindi UI except Punjabi) */
  uiLocale: "hi" | "en" | "pa";
  /** Preferred voice.lang prefixes, highest priority first */
  speechPrefixes: string[];
  /** Match voice.name when OS installs regional voices */
  voiceNamePatterns: RegExp[];
  /** Fallback prefixes if no dedicated voice (e.g. Bhojpuri → Hindi) */
  speechFallbacks: string[];
  /** Shown once when dialect shares Hindi TTS voice */
  usesSharedVoice?: boolean;
}

export const LANGUAGE_CONFIGS: LanguageConfig[] = [
  {
    id: "hi",
    nativeLabel: "हिंदी",
    shortLabel: "हिं",
    speechLang: "hi-IN",
    uiLocale: "hi",
    speechPrefixes: ["hi-in", "hi", "en-in"],
    voiceNamePatterns: [/hindi|हिंदी|हिन्दी|google.*hindi|microsoft.*hindi/i],
    speechFallbacks: ["en-in"],
  },
  {
    id: "pa",
    nativeLabel: "ਪੰਜਾਬੀ",
    shortLabel: "ਪੰ",
    speechLang: "pa-IN",
    uiLocale: "pa",
    speechPrefixes: ["pa-in", "pa", "hi-in", "hi"],
    voiceNamePatterns: [/punjabi|ਪੰਜਾਬੀ|gurmukhi|vaani|ojas/i],
    speechFallbacks: ["hi-in", "hi", "en-in"],
    usesSharedVoice: true,
  },
  {
    id: "bho",
    nativeLabel: "भोजपुरी",
    shortLabel: "भो",
    speechLang: "hi-IN",
    uiLocale: "hi",
    speechPrefixes: ["bho", "hi-in", "hi", "en-in"],
    voiceNamePatterns: [/bhojpuri|भोजपुरी|बोजपुरी/i],
    speechFallbacks: ["hi-in", "hi"],
    usesSharedVoice: true,
  },
  {
    id: "hr",
    nativeLabel: "हरियाणवी",
    shortLabel: "हर",
    speechLang: "hi-IN",
    uiLocale: "hi",
    speechPrefixes: ["hi-in", "hi", "en-in"],
    voiceNamePatterns: [/haryanvi|हरियाणवी|हरियाणी/i],
    speechFallbacks: ["hi-in", "hi"],
    usesSharedVoice: true,
  },
  {
    id: "en",
    nativeLabel: "English",
    shortLabel: "EN",
    speechLang: "en-IN",
    uiLocale: "en",
    speechPrefixes: ["en-in", "en-gb", "en-us", "en"],
    voiceNamePatterns: [/english|india.*english/i],
    speechFallbacks: ["en-us", "en"],
  },
];

export function getLanguageConfig(lang: Language): LanguageConfig {
  return (
    LANGUAGE_CONFIGS.find((c) => c.id === lang) ??
    LANGUAGE_CONFIGS[0]
  );
}

export function getUiLocale(lang: Language): "hi" | "en" | "pa" {
  return getLanguageConfig(lang).uiLocale;
}

/** Learning content: English only for `en`; Indic languages use Hindi text. */
export function usesEnglishContent(lang: Language): boolean {
  return lang === "en";
}

export function pickContent<T>(lang: Language, hindi: T, english: T): T {
  return usesEnglishContent(lang) ? english : hindi;
}
