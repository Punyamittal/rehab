import type { StudentSession } from "@/types";
import type { ModuleProgress } from "@/types";

export function emptyStudentSession(): StudentSession {
  return {
    moduleProgress: {},
    emotionLogs: [],
    gameScores: {},
  };
}

export function countCompletedModules(
  moduleProgress: Record<string, ModuleProgress>
): number {
  return Object.values(moduleProgress).filter((p) => p.completed).length;
}

export function snapshotActiveSession(state: {
  moduleProgress: Record<string, ModuleProgress>;
  emotionLogs: StudentSession["emotionLogs"];
  gameScores: StudentSession["gameScores"];
}): StudentSession {
  return {
    moduleProgress: { ...state.moduleProgress },
    emotionLogs: [...state.emotionLogs],
    gameScores: { ...state.gameScores },
  };
}
