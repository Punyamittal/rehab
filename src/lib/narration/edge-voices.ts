import type { Language } from "@/types";
import type { VoiceGender } from "@/lib/narration/voice-profiles";
import { resolveVoiceGender } from "@/lib/narration/voice-profiles";

/**
 * Microsoft Edge neural voices — used server-side via edge-tts.
 * Bhojpuri / Haryanvi use Hindi neural voices (no separate TTS locale).
 */
export const EDGE_VOICES: Record<
  Language,
  { female: string; male: string; labelFemale: string; labelMale: string }
> = {
  hi: {
    female: "hi-IN-SwaraNeural",
    male: "hi-IN-MadhurNeural",
    labelFemale: "Hindi (Swara)",
    labelMale: "Hindi (Madhur)",
  },
  en: {
    female: "en-IN-NeerjaNeural",
    male: "en-IN-PrabhatNeural",
    labelFemale: "English India (Neerja)",
    labelMale: "English India (Prabhat)",
  },
  /** Edge read-aloud API has no pa-IN voices; Hindi neural reads Hindi-script content. */
  pa: {
    female: "hi-IN-SwaraNeural",
    male: "hi-IN-MadhurNeural",
    labelFemale: "Punjabi UI · Hindi voice (Swara)",
    labelMale: "Punjabi UI · Hindi voice (Madhur)",
  },
  bho: {
    female: "hi-IN-SwaraNeural",
    male: "hi-IN-MadhurNeural",
    labelFemale: "Hindi (Swara)",
    labelMale: "Hindi (Madhur)",
  },
  hr: {
    female: "hi-IN-SwaraNeural",
    male: "hi-IN-MadhurNeural",
    labelFemale: "Hindi (Swara)",
    labelMale: "Hindi (Madhur)",
  },
};

/** @deprecated use getEdgeVoiceId(language, gender) */
export const EDGE_VOICE_BY_LANGUAGE = Object.fromEntries(
  Object.entries(EDGE_VOICES).map(([lang, v]) => [
    lang,
    { voice: v.female, label: v.labelFemale },
  ])
) as Record<Language, { voice: string; label: string }>;

export function getEdgeVoiceId(
  language: Language,
  gender: VoiceGender = "female"
): string {
  const entry = EDGE_VOICES[language] ?? EDGE_VOICES.hi;
  const resolved = resolveVoiceGender(gender);
  if (resolved === "male") return entry.male;
  return entry.female;
}

export function getEdgeVoiceLabel(
  language: Language,
  gender: VoiceGender = "female"
): string {
  const entry = EDGE_VOICES[language] ?? EDGE_VOICES.hi;
  const resolved = resolveVoiceGender(gender);
  if (resolved === "male") return entry.labelMale;
  return entry.labelFemale;
}
