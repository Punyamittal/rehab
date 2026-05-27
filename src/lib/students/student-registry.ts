import type { FacilitatorStudentRow, Student } from "@/types";

export const DEFAULT_CENTRE_ID = "00000000-0000-4000-8000-000000000001";

export const STUDENT_AVATAR_EMOJIS = [
  "🌸",
  "🌹",
  "🌼",
  "🪷",
  "🦋",
  "⭐",
  "🌻",
  "💫",
  "🐣",
  "🌺",
] as const;

export function isValidStudentAlias(alias: string): boolean {
  const trimmed = alias.trim();
  return trimmed.length >= 1 && trimmed.length <= 32;
}
