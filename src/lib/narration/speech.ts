import type { Language } from "@/types";
import { getLanguageConfig } from "@/lib/i18n/languages";
import { getEdgeVoiceLabel, getEdgeVoiceId } from "@/lib/narration/edge-voices";
import type { VoiceGender } from "@/lib/narration/voice-profiles";
import {
  getDefaultVoiceGender,
  resolveVoiceGender,
  scoreVoiceForGender,
} from "@/lib/narration/voice-profiles";

let voicesCache: SpeechSynthesisVoice[] = [];
let voicesReady = false;

let currentAudio: HTMLAudioElement | null = null;
let currentBlobUrl: string | null = null;
let lastEngine: "cloud" | "browser" | "none" = "none";

let keepAliveInterval: ReturnType<typeof setInterval> | null = null;

function applyPunjabiFallbackTransliteration(text: string): string {
  // Hindi-friendly phonetics when Punjabi voice is unavailable.
  return text
    .replaceAll("ੱ", "")
    .replaceAll("ں", "ं")
    .replaceAll("ਅੱਜ", "अज्ज")
    .replaceAll("ਸਿਖ", "सिख")
    .replaceAll("ਚਾਹ", "चाह")
    .replaceAll("ਦਾ", "दा")
    .replaceAll("ਦੀ", "दी")
    .replaceAll("ਤੇ", "ते")
    .replaceAll("ਦੋਸਤਾਂ", "दोस्तां")
    .replaceAll("ਸਫਾਈ", "सफाई")
    .replaceAll("ਕਹਾਣ", "कहाण");
}

function startKeepAlive() {
  if (keepAliveInterval) return;
  keepAliveInterval = setInterval(() => {
    if (typeof window !== "undefined" && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    }
  }, 10_000);
}

function stopKeepAlive() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
  }
}

function cleanupAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.onplay = null;
    currentAudio.onended = null;
    currentAudio.onerror = null;
    currentAudio = null;
  }
  if (currentBlobUrl) {
    URL.revokeObjectURL(currentBlobUrl);
    currentBlobUrl = null;
  }
}

export function getLastTtsEngine(): "cloud" | "browser" | "none" {
  return lastEngine;
}

export function getActiveVoiceLabel(
  language: Language,
  voiceGender?: VoiceGender
): string {
  const gender = resolveVoiceGender(voiceGender ?? getDefaultVoiceGender(language));
  if (lastEngine === "cloud") {
    return getEdgeVoiceLabel(language, gender);
  }
  const v = pickVoice(language, gender);
  return v ? `${v.name} (${v.lang})` : "Browser default";
}

/** Cloud + browser playback available in the browser. */
export function isSpeechSupported(): boolean {
  return typeof window !== "undefined";
}

export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return Promise.resolve([]);
  }

  const synth = window.speechSynthesis;
  const existing = synth.getVoices();
  if (existing.length > 0) {
    voicesCache = existing;
    voicesReady = true;
    return Promise.resolve(existing);
  }

  return new Promise((resolve) => {
    const finish = () => {
      voicesCache = synth.getVoices();
      voicesReady = voicesCache.length > 0;
      resolve(voicesCache);
    };
    synth.onvoiceschanged = finish;
    setTimeout(finish, 1200);
  });
}

function normalizeLang(tag: string): string {
  return tag.toLowerCase().replace("_", "-");
}

function voiceMatchesPrefix(
  voice: SpeechSynthesisVoice,
  prefix: string
): boolean {
  const lang = normalizeLang(voice.lang);
  const p = normalizeLang(prefix);
  return lang === p || lang.startsWith(`${p}-`) || lang.startsWith(p);
}

export function pickVoice(
  language: Language,
  voiceGender?: VoiceGender
): SpeechSynthesisVoice | undefined {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return undefined;
  }

  const gender = resolveVoiceGender(
    voiceGender ?? getDefaultVoiceGender(language)
  );
  const config = getLanguageConfig(language);
  const voices = voicesCache.length ? voicesCache : window.speechSynthesis.getVoices();
  if (voices.length === 0) return undefined;

  const rank = (voice: SpeechSynthesisVoice) => {
    let score = scoreVoiceForGender(voice, gender);
    for (const pattern of config.voiceNamePatterns) {
      if (pattern.test(voice.name)) score += 5;
    }
    const tryPrefixes = [...config.speechPrefixes, ...config.speechFallbacks];
    for (let i = 0; i < tryPrefixes.length; i++) {
      if (voiceMatchesPrefix(voice, tryPrefixes[i]!)) {
        score += 3 - i * 0.5;
        break;
      }
    }
    return score;
  };

  const sorted = [...voices].sort((a, b) => rank(b) - rank(a));
  const best = sorted[0];
  if (best && rank(best) > -5) return best;

  for (const pattern of config.voiceNamePatterns) {
    const match = voices.find((v) => pattern.test(v.name));
    if (match) return match;
  }

  const tryPrefixes = [...config.speechPrefixes, ...config.speechFallbacks];
  for (const prefix of tryPrefixes) {
    const match = voices.find((v) => voiceMatchesPrefix(v, prefix));
    if (match) return match;
  }

  if (language !== "en") {
    const hindi = voices.find((v) => voiceMatchesPrefix(v, "hi-in"));
    if (hindi) return hindi;
  }

  return voices[0];
}

export function stopSpeaking(): void {
  cleanupAudio();
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  stopKeepAlive();
  lastEngine = "none";
}

export interface SpeakOptions {
  language: Language;
  voiceGender?: VoiceGender;
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
}

async function speakViaCloud(
  text: string,
  language: Language,
  options: SpeakOptions
): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const voiceGender = resolveVoiceGender(
    options.voiceGender ?? getDefaultVoiceGender(language)
  );

  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language, voiceGender }),
    });

    if (!res.ok) return false;

    let blob = await res.blob();
    if (!blob.size) {
      const fallback = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: "hi", voiceGender }),
      });
      if (fallback.ok) blob = await fallback.blob();
    }
    if (!blob.size) return false;

    cleanupAudio();
    currentBlobUrl = URL.createObjectURL(blob);
    currentAudio = new Audio(currentBlobUrl);

    return await new Promise<boolean>((resolve) => {
      if (!currentAudio) {
        resolve(false);
        return;
      }

      const audio = currentAudio;

      audio.onplay = () => {
        lastEngine = "cloud";
        options.onStart?.();
      };

      audio.onended = () => {
        cleanupAudio();
        options.onEnd?.();
        resolve(true);
      };

      audio.onerror = () => {
        cleanupAudio();
        resolve(false);
      };

      void audio.play().catch(() => {
        cleanupAudio();
        resolve(false);
      });
    });
  } catch {
    return false;
  }
}

async function speakViaBrowser(
  text: string,
  options: SpeakOptions
): Promise<void> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    options.onError?.();
    return;
  }

  if (!voicesReady) await loadVoices();

  window.speechSynthesis.cancel();

  const config = getLanguageConfig(options.language);
  const voiceGender = resolveVoiceGender(
    options.voiceGender ?? getDefaultVoiceGender(options.language)
  );
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = config.speechLang;
  utterance.rate = options.rate ?? 0.9;
  utterance.pitch =
    options.pitch ?? (voiceGender === "female" ? 1.05 : voiceGender === "male" ? 0.92 : 1);
  utterance.volume = 1;

  const voice = pickVoice(options.language, voiceGender);
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang || config.speechLang;
  }

  return new Promise((resolve) => {
    let started = false;

    utterance.onstart = () => {
      started = true;
      lastEngine = "browser";
      startKeepAlive();
      options.onStart?.();
    };

    utterance.onend = () => {
      stopKeepAlive();
      options.onEnd?.();
      resolve();
    };

    utterance.onerror = (e) => {
      stopKeepAlive();
      if ((e as SpeechSynthesisErrorEvent).error !== "interrupted") {
        options.onError?.();
      }
      resolve();
    };

    setTimeout(() => window.speechSynthesis.speak(utterance), 50);

    setTimeout(() => {
      if (!started) {
        stopKeepAlive();
        options.onError?.();
        resolve();
      }
    }, 5000);
  });
}

/**
 * Speak text: tries cloud TTS first (all languages), then browser fallback.
 */
export async function speakText(
  text: string,
  options: SpeakOptions
): Promise<void> {
  if (!text.trim()) {
    options.onError?.();
    return;
  }

  stopSpeaking();
  const paVoice = options.language === "pa" ? pickVoice("pa", options.voiceGender) : undefined;
  const hasNativePaVoice = (paVoice?.lang?.toLowerCase() ?? "").startsWith("pa");
  const preparedText =
    options.language === "pa" && !hasNativePaVoice
      ? applyPunjabiFallbackTransliteration(text)
      : text;

  // Prefer browser voice first for Punjabi when a native pa voice exists locally.
  // This prevents immediate cloud fallback to Hindi voice for Punjabi UI text.
  if (options.language === "pa") {
    if (hasNativePaVoice) {
      await speakViaBrowser(preparedText, options);
      return;
    }
  }

  const useCloud =
    typeof window !== "undefined" &&
    (navigator.onLine === undefined || navigator.onLine);

  if (useCloud) {
    const ok = await speakViaCloud(preparedText, options.language, options);
    if (ok) return;
  }

  await speakViaBrowser(preparedText, options);
}

export function buildNarrationScript(
  title: string,
  body: string,
  extra?: string
): string {
  const parts = [title, body, extra].filter(Boolean);
  return parts.join(". ");
}

export function getAllVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return [];
  }
  return voicesCache.length ? voicesCache : window.speechSynthesis.getVoices();
}
