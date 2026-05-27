import type { Language, StoryCharacter } from "@/types";
import { localized } from "@/lib/i18n/content";

export const STORY_CHARACTER_IMAGES: Record<
  Exclude<StoryCharacter, "narrator">,
  string
> = {
  asha: "/AASHA.png",
  tanya: "/TANNYA.png",
  riya: "/riya.png",
};

export const STORY_CHARACTER_STYLES: Record<
  Exclude<StoryCharacter, "narrator">,
  {
    labelHi: string;
    labelEn: string;
    accent: string;
    glow: string;
    ring: string;
  }
> = {
  asha: {
    labelHi: "आशा",
    labelEn: "Aasha",
    accent: "border-sky-400/50 bg-sky-950/80 text-sky-50",
    glow: "shadow-[0_0_24px_rgba(56,189,248,0.3)]",
    ring: "ring-sky-400/40",
  },
  tanya: {
    labelHi: "तान्या",
    labelEn: "Tannya",
    accent: "border-stone-400/40 bg-stone-900/80 text-stone-200",
    glow: "shadow-[0_0_16px_rgba(120,113,108,0.2)]",
    ring: "ring-stone-400/30",
  },
  riya: {
    labelHi: "रिया",
    labelEn: "Riya",
    accent: "border-emerald-400/50 bg-emerald-950/80 text-emerald-50",
    glow: "shadow-[0_0_24px_rgba(52,211,153,0.3)]",
    ring: "ring-emerald-400/40",
  },
};

export function isPortraitCharacter(
  character?: StoryCharacter
): character is Exclude<StoryCharacter, "narrator"> {
  return (
    character === "asha" || character === "riya" || character === "tanya"
  );
}

export function getCharacterLabel(
  language: Language,
  character: Exclude<StoryCharacter, "narrator">
): string {
  const meta = STORY_CHARACTER_STYLES[character];
  return localized(language, meta.labelHi, meta.labelEn);
}
