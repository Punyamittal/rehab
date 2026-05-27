"use client";

import { useEffect, useState } from "react";
import { EMOTION_OPTIONS } from "@/data/emotions";
import type { FacilitatorStudentRow } from "@/types";
import { useAppStore } from "@/stores/app-store";
import { t } from "@/lib/i18n/translations";

function emotionEmoji(emotion?: string) {
  return EMOTION_OPTIONS.find((e) => e.id === emotion)?.emoji ?? "—";
}

interface FacilitatorTableProps {
  rows: FacilitatorStudentRow[];
  onToggleAttendance?: (studentId: string) => void;
  onRequestDelete?: (studentId: string) => void;
  onUpdateNote?: (studentId: string, note: string) => void;
  onAwardPoints?: (
    studentId: string,
    bucket: "assessment" | "game",
    points: number
  ) => void;
}

export function FacilitatorTable({
  rows,
  onToggleAttendance,
  onRequestDelete,
  onUpdateNote,
  onAwardPoints,
}: FacilitatorTableProps) {
  const language = useAppStore((s) => s.language);
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    setDraftNotes((prev) => {
      const next: Record<string, string> = {};
      rows.forEach((row) => {
        const key = row.student.id;
        next[key] = prev[key] ?? row.note ?? "";
      });
      return next;
    });
  }, [rows]);

  return (
    <div className="overflow-x-auto rounded-3xl bg-white/80 shadow-[var(--safe-shadow)]">
      <table className="w-full min-w-[860px] text-left">
        <thead>
          <tr className="border-b border-primary/10">
            <th className="p-4 font-semibold">{t(language, "students")}</th>
            <th className="p-4 font-semibold">{t(language, "moduleProgress")}</th>
            <th className="p-4 font-semibold">{t(language, "score")}</th>
            <th className="p-4 font-semibold">{t(language, "emotionalTrend")}</th>
            <th className="p-4 font-semibold">{t(language, "attendance")}</th>
            <th className="p-4 font-semibold">{t(language, "notes")}</th>
            {(onToggleAttendance || onRequestDelete) && (
              <th className="no-print p-4 font-semibold">{t(language, "actions")}</th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.student.id}
              className="border-b border-primary/5 hover:bg-primary/5"
            >
              <td className="p-4">
                <span className="mr-2 text-xl">{row.student.avatarEmoji}</span>
                {row.student.alias}
              </td>
              <td className="p-4">
                {row.modulesCompleted}/{row.totalModules}
              </td>
              <td className="p-4">
                <p className="text-lg font-bold text-primary">
                  {row.totalPoints ?? 0}
                </p>
                <p className="text-xs text-muted">
                  {t(language, "assessmentPoints")}: {row.assessmentPoints ?? 0}
                </p>
                <p className="text-xs text-muted">
                  {t(language, "gamePoints")}: {row.gamePoints ?? 0}
                </p>
                {onAwardPoints && (
                  <div className="no-print mt-2 flex gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        onAwardPoints(row.student.id, "assessment", 5)
                      }
                      className="touch-target rounded-lg border border-primary/20 bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary hover:bg-primary/20"
                    >
                      +5A
                    </button>
                    <button
                      type="button"
                      onClick={() => onAwardPoints(row.student.id, "game", 5)}
                      className="touch-target rounded-lg border border-accent/30 bg-accent/10 px-2 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-accent/20"
                    >
                      +5G
                    </button>
                  </div>
                )}
              </td>
              <td className="p-4 text-lg">
                {emotionEmoji(row.preEmotion)} → {emotionEmoji(row.lastEmotion)}
              </td>
              <td className="p-4">
                <span
                  className={
                    row.presentToday
                      ? "text-accent font-medium"
                      : "text-muted"
                  }
                >
                  {row.presentToday
                    ? t(language, "present")
                    : t(language, "absent")}
                </span>
              </td>
              <td className="p-4">
                {onUpdateNote ? (
                  <div className="no-print flex flex-col gap-2">
                    <textarea
                      value={draftNotes[row.student.id] ?? ""}
                      onChange={(e) =>
                        setDraftNotes((prev) => ({
                          ...prev,
                          [row.student.id]: e.target.value,
                        }))
                      }
                      rows={2}
                      placeholder={t(language, "notesPlaceholder")}
                      className="w-52 rounded-xl border border-primary/15 bg-white/80 px-3 py-2 text-sm outline-none focus:border-primary/35"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateNote(
                          row.student.id,
                          (draftNotes[row.student.id] ?? "").trim()
                        )
                      }
                      className="touch-target self-start rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
                    >
                      {t(language, "saveNote")}
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-muted">{row.note ?? "—"}</p>
                )}
              </td>
              {(onToggleAttendance || onRequestDelete) && (
                <td className="no-print p-4">
                  <div className="flex flex-col gap-2 sm:flex-row">
                    {onToggleAttendance && (
                      <button
                        type="button"
                        onClick={() => onToggleAttendance(row.student.id)}
                        className="touch-target rounded-xl border border-primary/20 bg-white px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/5"
                      >
                        {row.presentToday
                          ? t(language, "markAbsent")
                          : t(language, "markPresent")}
                      </button>
                    )}
                    {onRequestDelete && (
                      <button
                        type="button"
                        onClick={() => onRequestDelete(row.student.id)}
                        className="touch-target rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-800 hover:bg-red-100"
                      >
                        {t(language, "delete")}
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
