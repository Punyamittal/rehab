import type { StudentSession } from "@/types";
import type { ModuleProgress } from "@/types";

export function emptyStudentSession(): StudentSession {
  return {
    moduleProgress: {},
    emotionLogs: [],
    gameScores: {},
  };
}

/** Coerce DB / JSON session blobs into a safe shape (null fields → defaults). */
export function normalizeStudentSession(
  session: Partial<StudentSession> | null | undefined
): StudentSession {
  if (!session) return emptyStudentSession();

  const moduleProgress =
    session.moduleProgress &&
    typeof session.moduleProgress === "object" &&
    !Array.isArray(session.moduleProgress)
      ? session.moduleProgress
      : {};

  const gameScores =
    session.gameScores &&
    typeof session.gameScores === "object" &&
    !Array.isArray(session.gameScores)
      ? session.gameScores
      : {};

  return {
    moduleProgress,
    emotionLogs: Array.isArray(session.emotionLogs) ? session.emotionLogs : [],
    gameScores,
  };
}

export function countCompletedModules(
  moduleProgress: Record<string, ModuleProgress> | null | undefined
): number {
  if (!moduleProgress || typeof moduleProgress !== "object") return 0;
  return Object.values(moduleProgress).filter((p) => p?.completed).length;
}

export function snapshotActiveSession(state: {
  moduleProgress: Record<string, ModuleProgress> | null | undefined;
  emotionLogs: StudentSession["emotionLogs"] | null | undefined;
  gameScores: StudentSession["gameScores"] | null | undefined;
}): StudentSession {
  return normalizeStudentSession({
    moduleProgress: state.moduleProgress ?? {},
    emotionLogs: state.emotionLogs ?? [],
    gameScores: state.gameScores ?? {},
  });
}
