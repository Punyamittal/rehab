import type { Language } from "@/types";
import type { StoryCharacter } from "@/types";

export type VoiceGender = "female" | "male" | "neutral";

const FEMALE_VOICE_PATTERNS =
  /female|woman|girl|swara|neerja|vaani|veena|lekha|zira|samantha|karen|heera|paulina|priya|aditi|kajal/i;

const MALE_VOICE_PATTERNS =
  /male|man|boy|madhur|prabhat|ravi|david|james|ojas|mark|daniel|aaron|deep/i;

/** Female voice for story characters (Asha, Riya, Tannya). */
export function getCharacterVoiceGender(
  character?: StoryCharacter
): VoiceGender | undefined {
  if (character === "asha" || character === "riya" || character === "tanya") {
    return "female";
  }
  return undefined;
}

export function isLikelyFemaleVoice(voice: SpeechSynthesisVoice): boolean {
  const name = voice.name.toLowerCase();
  if (MALE_VOICE_PATTERNS.test(name)) return false;
  return FEMALE_VOICE_PATTERNS.test(name);
}

export function isLikelyMaleVoice(voice: SpeechSynthesisVoice): boolean {
  return MALE_VOICE_PATTERNS.test(voice.name.toLowerCase());
}

export function scoreVoiceForGender(
  voice: SpeechSynthesisVoice,
  gender: VoiceGender
): number {
  if (gender === "neutral") return 0;
  if (gender === "female") {
    if (isLikelyFemaleVoice(voice)) return 10;
    if (isLikelyMaleVoice(voice)) return -10;
    return 0;
  }
  if (isLikelyMaleVoice(voice)) return 10;
  if (isLikelyFemaleVoice(voice)) return -10;
  return 0;
}

export function resolveVoiceGender(
  gender?: VoiceGender
): VoiceGender {
  return gender ?? "neutral";
}

export const DEFAULT_VOICE_GENDER: VoiceGender = "female";

/** Default platform voice is warm female (student-centred content). */
export function getDefaultVoiceGender(_language: Language): VoiceGender {
  return DEFAULT_VOICE_GENDER;
}
