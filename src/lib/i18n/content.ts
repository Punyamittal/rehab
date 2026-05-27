import type { Language } from "@/types";
import { pickContent } from "@/lib/i18n/languages";

/** Pick Hindi or English field from bilingual content objects. */
export function localized(
  lang: Language,
  hi: string,
  en: string
): string {
  return pickContent(lang, hi, en);
}
