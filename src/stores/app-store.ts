"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  createStudent as apiCreateStudent,
  fetchStudentSession,
  fetchStudents,
  postEmotionLog,
  postModuleProgress,
  removeStudent as apiRemoveStudent,
  saveStudentSession,
  updateStudent as apiUpdateStudent,
} from "@/lib/api/rehab-api";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCentreId } from "@/lib/supabase/env";
import {
  countCompletedModules,
  emptyStudentSession,
  snapshotActiveSession,
} from "@/lib/students/student-sessions";
import type {
  EmotionLog,
  FacilitatorStudentRow,
  GameScore,
  Language,
  ModuleProgress,
  StudentSession,
  UserRole,
} from "@/types";

interface AppState {
  language: Language;
  role: UserRole | null;
  studentId: string;
  studentAlias: string;
  studentEmoji: string;
  studentProfileChosen: boolean;
  soundEnabled: boolean;
  autoNarrate: boolean;
  moduleProgress: Record<string, ModuleProgress>;
  emotionLogs: EmotionLog[];
  gameScores: Record<string, GameScore>;
  studentSessions: Record<string, StudentSession>;
  managedStudents: FacilitatorStudentRow[];
  studentsLoading: boolean;
  studentsError: string | null;
  setLanguage: (lang: Language) => void;
  setRole: (role: UserRole) => void;
  logout: () => void;
  setStudent: (id: string, alias: string, emoji: string) => void;
  selectStudentProfile: (studentId: string) => Promise<boolean>;
  clearStudentProfileChoice: () => void;
  isManagedStudent: (studentId: string) => boolean;
  setSoundEnabled: (enabled: boolean) => void;
  setAutoNarrate: (enabled: boolean) => void;
  loadManagedStudents: () => Promise<void>;
  updateModuleProgress: (progress: ModuleProgress) => void;
  addEmotionLog: (log: Omit<EmotionLog, "timestamp">) => void;
  recordGameScore: (gameId: string, score: number, maxScore: number) => void;
  getCompletedModuleCount: () => number;
  addManagedStudent: (alias: string, avatarEmoji: string) => Promise<void>;
  removeManagedStudent: (studentId: string) => Promise<void>;
  toggleStudentAttendance: (studentId: string) => void;
  updateManagedStudentNote: (studentId: string, note: string) => Promise<void>;
  awardStudentPoints: (
    studentId: string,
    bucket: "assessment" | "game",
    points: number
  ) => Promise<void>;
}

function withTotalPoints(row: FacilitatorStudentRow): FacilitatorStudentRow {
  const assessmentPoints = row.assessmentPoints ?? 0;
  const gamePoints = row.gamePoints ?? 0;
  return {
    ...row,
    assessmentPoints,
    gamePoints,
    totalPoints: assessmentPoints + gamePoints,
  };
}

function syncManagedModulesCompleted(
  rows: FacilitatorStudentRow[],
  studentId: string,
  moduleProgress: Record<string, ModuleProgress>
): FacilitatorStudentRow[] {
  const modulesCompleted = countCompletedModules(moduleProgress);
  return rows.map((row) =>
    row.student.id === studentId ? { ...row, modulesCompleted } : row
  );
}

function persistActiveSessionForStudent(
  state: AppState,
  studentId: string
): Record<string, StudentSession> {
  return {
    ...state.studentSessions,
    [studentId]: snapshotActiveSession(state),
  };
}

function pushSessionToServer(studentId: string, state: AppState) {
  if (!isSupabaseConfigured() || !studentId) return;
  const session = snapshotActiveSession(state);
  void saveStudentSession(studentId, session).catch(() => {});
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      language: "hi",
      role: null,
      studentId: "",
      studentAlias: "",
      studentEmoji: "",
      studentProfileChosen: false,
      soundEnabled: true,
      autoNarrate: true,
      moduleProgress: {},
      emotionLogs: [],
      gameScores: {},
      studentSessions: {},
      managedStudents: [],
      studentsLoading: false,
      studentsError: null,

      setLanguage: (language) => set({ language }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setAutoNarrate: (autoNarrate) => set({ autoNarrate }),

      loadManagedStudents: async () => {
        if (!isSupabaseConfigured()) return;
        set({ studentsLoading: true, studentsError: null });
        try {
          const { students } = await fetchStudents();
          set({
            managedStudents: students.map(withTotalPoints),
            studentsLoading: false,
          });
        } catch (e) {
          set({
            studentsError:
              e instanceof Error ? e.message : "Failed to load students",
            studentsLoading: false,
          });
        }
      },

      setRole: (role) =>
        set({
          role,
          ...(role === "student" ? { studentProfileChosen: false } : {}),
        }),

      logout: () =>
        set({
          role: null,
          studentProfileChosen: false,
        }),

      setStudent: (studentId, studentAlias, studentEmoji) =>
        set({ studentId, studentAlias, studentEmoji }),

      isManagedStudent: (studentId) =>
        get().managedStudents.some((row) => row.student.id === studentId),

      clearStudentProfileChoice: () => set({ studentProfileChosen: false }),

      selectStudentProfile: async (studentId) => {
        const state = get();
        const row = state.managedStudents.find(
          (r) => r.student.id === studentId
        );
        if (!row) return false;

        if (
          state.studentProfileChosen &&
          state.studentId &&
          state.isManagedStudent(state.studentId)
        ) {
          pushSessionToServer(state.studentId, state);
        }

        let loaded = emptyStudentSession();
        if (isSupabaseConfigured()) {
          try {
            loaded = await fetchStudentSession(studentId);
          } catch {
            loaded =
              state.studentSessions[studentId] ?? emptyStudentSession();
          }
        } else {
          loaded = state.studentSessions[studentId] ?? emptyStudentSession();
        }

        const sessions = {
          ...state.studentSessions,
          [studentId]: loaded,
        };

        const managedStudents = syncManagedModulesCompleted(
          state.managedStudents,
          studentId,
          loaded.moduleProgress
        );

        set({
          studentSessions: sessions,
          studentId,
          studentAlias: row.student.alias,
          studentEmoji: row.student.avatarEmoji,
          studentProfileChosen: true,
          moduleProgress: { ...loaded.moduleProgress },
          emotionLogs: [...loaded.emotionLogs],
          gameScores: { ...loaded.gameScores },
          managedStudents,
        });
        return true;
      },

      updateModuleProgress: (progress) =>
        set((state) => {
          const moduleProgress = {
            ...state.moduleProgress,
            [progress.moduleId]: progress,
          };
          const studentSessions =
            state.studentProfileChosen && state.studentId
              ? persistActiveSessionForStudent(
                  { ...state, moduleProgress },
                  state.studentId
                )
              : state.studentSessions;
          const managedStudents =
            state.studentProfileChosen && state.studentId
              ? syncManagedModulesCompleted(
                  state.managedStudents,
                  state.studentId,
                  moduleProgress
                )
              : state.managedStudents;

          if (state.studentProfileChosen && state.studentId) {
            void postModuleProgress(progress.moduleId, {
              studentId: state.studentId,
              checkpointIndex: progress.checkpointIndex,
              completed: progress.completed,
              score: progress.score,
            }).catch(() => {});
            pushSessionToServer(state.studentId, {
              ...state,
              moduleProgress,
              studentSessions,
            });
          }

          return { moduleProgress, studentSessions, managedStudents };
        }),

      addEmotionLog: (log) =>
        set((state) => {
          const emotionLogs = [
            ...state.emotionLogs,
            { ...log, timestamp: new Date().toISOString() },
          ];
          const studentSessions =
            state.studentProfileChosen && state.studentId
              ? persistActiveSessionForStudent(
                  { ...state, emotionLogs },
                  state.studentId
                )
              : state.studentSessions;

          if (state.studentProfileChosen && state.studentId) {
            void postEmotionLog({
              studentId: state.studentId,
              checkType: log.checkType,
              emotion: log.emotion,
              moduleId: log.moduleId,
            }).catch(() => {});
            pushSessionToServer(state.studentId, {
              ...state,
              emotionLogs,
              studentSessions,
            });
          }

          return { emotionLogs, studentSessions };
        }),

      recordGameScore: (gameId, score, maxScore) =>
        set((state) => {
          const prev = state.gameScores[gameId];
          const normalized = Math.round((score / maxScore) * 100);
          const gameScores = {
            ...state.gameScores,
            [gameId]: {
              gameId,
              bestScore: Math.max(prev?.bestScore ?? 0, normalized),
              lastScore: normalized,
              plays: (prev?.plays ?? 0) + 1,
              lastPlayedAt: new Date().toISOString(),
            },
          };
          const studentSessions =
            state.studentProfileChosen && state.studentId
              ? persistActiveSessionForStudent(
                  { ...state, gameScores },
                  state.studentId
                )
              : state.studentSessions;

          if (state.studentProfileChosen && state.studentId) {
            pushSessionToServer(state.studentId, {
              ...state,
              gameScores,
              studentSessions,
            });
          }

          return { gameScores, studentSessions };
        }),

      getCompletedModuleCount: () =>
        Object.values(get().moduleProgress).filter((p) => p.completed).length,

      addManagedStudent: async (alias, avatarEmoji) => {
        const row = await apiCreateStudent(alias, avatarEmoji);
        set((state) => ({
          managedStudents: [...state.managedStudents, withTotalPoints(row)],
        }));
      },

      removeManagedStudent: async (studentId) => {
        await apiRemoveStudent(studentId);
        set((state) => {
          const { [studentId]: _removed, ...studentSessions } =
            state.studentSessions;
          const wasActive = state.studentId === studentId;
          return {
            managedStudents: state.managedStudents.filter(
              (row) => row.student.id !== studentId
            ),
            studentSessions,
            ...(wasActive
              ? {
                  studentId: "",
                  studentAlias: "",
                  studentEmoji: "",
                  studentProfileChosen: false,
                  moduleProgress: {},
                  emotionLogs: [],
                  gameScores: {},
                }
              : {}),
          };
        });
      },

      toggleStudentAttendance: (studentId) => {
        const row = get().managedStudents.find(
          (r) => r.student.id === studentId
        );
        if (!row) return;
        const presentToday = !row.presentToday;
        set((state) => ({
          managedStudents: state.managedStudents.map((r) =>
            r.student.id === studentId ? { ...r, presentToday } : r
          ),
        }));
        void apiUpdateStudent(studentId, { presentToday }).catch(() => {});
      },

      updateManagedStudentNote: async (studentId, note) => {
        await apiUpdateStudent(studentId, { note });
        set((state) => ({
          managedStudents: state.managedStudents.map((row) =>
            row.student.id === studentId ? { ...row, note } : row
          ),
        }));
      },

      awardStudentPoints: async (studentId, bucket, points) => {
        const result = await apiUpdateStudent(studentId, {
          awardBucket: bucket,
          awardPoints: points,
        });
        set((state) => ({
          managedStudents: state.managedStudents.map((row) => {
            if (row.student.id !== studentId) return row;
            const assessmentPoints =
              result.assessmentPoints ?? row.assessmentPoints ?? 0;
            const gamePoints = result.gamePoints ?? row.gamePoints ?? 0;
            return {
              ...row,
              assessmentPoints,
              gamePoints,
              totalPoints: assessmentPoints + gamePoints,
            };
          }),
        }));
      },
    }),
    {
      name: "rehab-app-storage",
      partialize: (state) => ({
        language: state.language,
        role: state.role,
        studentId: state.studentId,
        studentAlias: state.studentAlias,
        studentEmoji: state.studentEmoji,
        studentProfileChosen: state.studentProfileChosen,
        soundEnabled: state.soundEnabled,
        autoNarrate: state.autoNarrate,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<AppState>),
        studentProfileChosen:
          (persisted as Partial<AppState>)?.studentProfileChosen ??
          current.studentProfileChosen,
      }),
    }
  )
);
