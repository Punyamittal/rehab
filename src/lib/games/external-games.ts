import type { Language } from "@/types";
import { usesEnglishContent } from "@/lib/i18n/languages";

export interface ExternalGameEntry {
  id: string;
  slug: string;
  emoji: string;
  titleHi: string;
  titleEn: string;
  descriptionHi: string;
  descriptionEn: string;
  topicLabelHi: string;
  topicLabelEn: string;
  durationMinutes: number;
  skillsHi: string[];
  skillsEn: string[];
  url: string;
}

export const EXTERNAL_GAMES: ExternalGameEntry[] = [
  {
    id: "external-toothstars",
    slug: "toothstars",
    emoji: "🦷",
    titleHi: "टूथस्टार्स",
    titleEn: "ToothStars",
    descriptionHi: "दांतों की सफाई और हेल्दी खान-पान सीखने का गेम",
    descriptionEn: "A game for oral hygiene and healthy food habits",
    topicLabelHi: "स्वास्थ्य",
    topicLabelEn: "Health",
    durationMinutes: 5,
    skillsHi: ["मौखिक स्वच्छता", "स्वास्थ्य आदतें"],
    skillsEn: ["Oral hygiene", "Healthy habits"],
    url: "https://toothstars.itch.io/game",
  },
];

export function getExternalGameBySlug(slug: string): ExternalGameEntry | undefined {
  return EXTERNAL_GAMES.find((game) => game.slug === slug);
}

export function externalGameText(lang: Language, hi: string, en: string): string {
  return usesEnglishContent(lang) ? en : hi;
}
