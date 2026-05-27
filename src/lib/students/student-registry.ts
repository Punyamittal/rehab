import { LEARNING_MODULES } from "@/data/modules";
import type { FacilitatorStudentRow, Student } from "@/types";

export const DEFAULT_CENTRE_ID = "centre-1";

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

export function createStudentId(): string {
  return `student-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createStudentRow(
  alias: string,
  avatarEmoji: string,
  centreId = DEFAULT_CENTRE_ID
): FacilitatorStudentRow {
  const student: Student = {
    id: createStudentId(),
    alias: alias.trim(),
    avatarEmoji,
    centreId,
  };
  return {
    student,
    modulesCompleted: 0,
    totalModules: LEARNING_MODULES.length,
    presentToday: true,
    note: "",
    assessmentPoints: 0,
    gamePoints: 0,
    totalPoints: 0,
  };
}

export function isValidStudentAlias(alias: string): boolean {
  const trimmed = alias.trim();
  return trimmed.length >= 1 && trimmed.length <= 32;
}
