import { localized } from "@/lib/i18n/content";
import { t } from "@/lib/i18n/translations";
import { buildNarrationScript } from "@/lib/narration/speech";
import type { Language } from "@/types";

export interface BilingualLine {
  labelHi: string;
  labelEn: string;
}

/** Read-aloud script for multiple-choice options in the active language. */
export function buildChoicesNarration(
  language: Language,
  choices: BilingualLine[]
): string {
  if (choices.length === 0) return "";
  const labels = choices.map(
    (c, i) => `${i + 1}. ${localized(language, c.labelHi, c.labelEn)}`
  );
  return `${t(language, "optionsLabel")}. ${labels.join(". ")}`;
}

/**
 * Full question narration: prompt + optional lead-in + numbered choices.
 * Uses Hindi copy for Indic languages, English when UI language is en.
 */
export function buildQuestionNarration(
  language: Language,
  questionHi: string,
  questionEn: string,
  options?: {
    choices?: BilingualLine[];
    leadHi?: string;
    leadEn?: string;
  }
): string {
  const question = localized(language, questionHi, questionEn);
  const lead =
    options?.leadHi != null
      ? localized(language, options.leadHi, options.leadEn ?? "")
      : "";
  const choicesPart = options?.choices?.length
    ? buildChoicesNarration(language, options.choices)
    : "";
  return buildNarrationScript(question, lead, choicesPart);
}

/** Join already-localized strings into one narration script. */
export function buildLocalizedNarration(
  ...parts: (string | undefined)[]
): string {
  return parts.filter((p) => p?.trim()).join(". ");
}
