"use client";



import { create } from "zustand";

import { persist } from "zustand/middleware";

import { DEMO_FACILITATOR_STUDENTS } from "@/data/facilitator-demo";

import { createStudentRow } from "@/lib/students/student-registry";

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

  /** True after the learner picks themselves on the choose-child screen */

  studentProfileChosen: boolean;

  soundEnabled: boolean;

  autoNarrate: boolean;

  moduleProgress: Record<string, ModuleProgress>;

  emotionLogs: EmotionLog[];

  gameScores: Record<string, GameScore>;

  studentSessions: Record<string, StudentSession>;

  managedStudents: FacilitatorStudentRow[];

  setLanguage: (lang: Language) => void;

  setRole: (role: UserRole) => void;

  logout: () => void;

  setStudent: (id: string, alias: string, emoji: string) => void;

  selectStudentProfile: (studentId: string) => boolean;

  clearStudentProfileChoice: () => void;

  isManagedStudent: (studentId: string) => boolean;

  setSoundEnabled: (enabled: boolean) => void;

  setAutoNarrate: (enabled: boolean) => void;

  updateModuleProgress: (progress: ModuleProgress) => void;

  addEmotionLog: (log: Omit<EmotionLog, "timestamp">) => void;

  recordGameScore: (gameId: string, score: number, maxScore: number) => void;

  getCompletedModuleCount: () => number;

  addManagedStudent: (alias: string, avatarEmoji: string) => void;

  removeManagedStudent: (studentId: string) => void;

  toggleStudentAttendance: (studentId: string) => void;

  updateManagedStudentNote: (studentId: string, note: string) => void;

  awardStudentPoints: (

    studentId: string,

    bucket: "assessment" | "game",

    points: number

  ) => void;

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

      managedStudents: DEMO_FACILITATOR_STUDENTS.map(withTotalPoints),

      setLanguage: (language) => set({ language }),

      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),

      setAutoNarrate: (autoNarrate) => set({ autoNarrate }),

      setRole: (role) =>

        set({

          role,

          ...(role === "student"

            ? { studentProfileChosen: false }

            : {}),

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

      clearStudentProfileChoice: () =>

        set({ studentProfileChosen: false }),

      selectStudentProfile: (studentId) => {

        const state = get();

        const row = state.managedStudents.find(

          (r) => r.student.id === studentId

        );

        if (!row) return false;



        let sessions = { ...state.studentSessions };

        if (

          state.studentProfileChosen &&

          state.studentId &&

          state.isManagedStudent(state.studentId)

        ) {

          sessions = persistActiveSessionForStudent(state, state.studentId);

        }



        let loaded = sessions[studentId] ?? emptyStudentSession();
        if (
          !sessions[studentId] &&
          Object.keys(state.moduleProgress).length > 0 &&
          (!state.studentProfileChosen || !state.studentId)
        ) {
          loaded = snapshotActiveSession(state);
          sessions = { ...sessions, [studentId]: loaded };
        }

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

          return { gameScores, studentSessions };

        }),

      getCompletedModuleCount: () =>

        Object.values(get().moduleProgress).filter((p) => p.completed).length,

      addManagedStudent: (alias, avatarEmoji) =>

        set((state) => ({

          managedStudents: [

            ...state.managedStudents,

            createStudentRow(alias, avatarEmoji),

          ],

        })),

      removeManagedStudent: (studentId) =>

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

        }),

      toggleStudentAttendance: (studentId) =>

        set((state) => ({

          managedStudents: state.managedStudents.map((row) =>

            row.student.id === studentId

              ? { ...row, presentToday: !row.presentToday }

              : row

          ),

        })),

      updateManagedStudentNote: (studentId, note) =>

        set((state) => ({

          managedStudents: state.managedStudents.map((row) =>

            row.student.id === studentId ? { ...row, note } : row

          ),

        })),

      awardStudentPoints: (studentId, bucket, points) =>

        set((state) => ({

          managedStudents: state.managedStudents.map((row) => {

            if (row.student.id !== studentId) return row;

            const assessmentPoints = row.assessmentPoints ?? 0;

            const gamePoints = row.gamePoints ?? 0;

            const nextAssessment =

              bucket === "assessment"

                ? Math.max(0, assessmentPoints + points)

                : assessmentPoints;

            const nextGame =

              bucket === "game" ? Math.max(0, gamePoints + points) : gamePoints;

            return {

              ...row,

              assessmentPoints: nextAssessment,

              gamePoints: nextGame,

              totalPoints: nextAssessment + nextGame,

            };

          }),

        })),

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

        moduleProgress: state.moduleProgress,

        emotionLogs: state.emotionLogs,

        gameScores: state.gameScores,

        studentSessions: state.studentSessions,

        managedStudents: state.managedStudents,

      }),

      merge: (persisted, current) => {

        const saved = persisted as Partial<AppState> | undefined;

        return {

          ...current,

          ...saved,

          studentSessions: saved?.studentSessions ?? current.studentSessions,

          studentProfileChosen:

            saved?.studentProfileChosen ?? current.studentProfileChosen,

          managedStudents:

            saved?.managedStudents?.length

              ? saved.managedStudents.map(withTotalPoints)

              : current.managedStudents,

        };

      },

    }

  )

);

