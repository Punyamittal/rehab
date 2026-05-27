"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/stores/app-store";
import { t } from "@/lib/i18n/translations";
import {
  isValidStudentAlias,
  STUDENT_AVATAR_EMOJIS,
} from "@/lib/students/student-registry";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export function StudentManagePanel() {
  const language = useAppStore((s) => s.language);
  const managedStudents = useAppStore((s) => s.managedStudents);
  const addManagedStudent = useAppStore((s) => s.addManagedStudent);
  const removeManagedStudent = useAppStore((s) => s.removeManagedStudent);

  const [alias, setAlias] = useState("");
  const [emoji, setEmoji] = useState<string>(STUDENT_AVATAR_EMOJIS[0]);
  const [error, setError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    const trimmed = alias.trim();
    if (!isValidStudentAlias(trimmed)) {
      setError(t(language, "studentNameRequired"));
      return;
    }
    const duplicate = managedStudents.some(
      (row) => row.student.alias.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      setError(t(language, "studentNameDuplicate"));
      return;
    }
    setIsAdding(true);
    setError(null);
    try {
      await addManagedStudent(trimmed, emoji);
      setAlias("");
      setEmoji(STUDENT_AVATAR_EMOJIS[0]);
    } catch (e) {
      const message = e instanceof Error ? e.message : "";
      if (message.toLowerCase().includes("already")) {
        setError(t(language, "studentNameDuplicate"));
      } else if (message.includes("not configured") || message.includes("503")) {
        setError(t(language, "supabaseNotConfigured"));
      } else {
        setError(message || t(language, "addChildFailed"));
      }
    } finally {
      setIsAdding(false);
    }
  };

  const confirmDelete = async (studentId: string) => {
    try {
      await removeManagedStudent(studentId);
      setPendingDeleteId(null);
    } catch {
      setPendingDeleteId(null);
    }
  };

  return (
    <Card className="no-print mb-8 border border-primary/15 bg-white/80">
      <h2 className="text-lg font-bold text-foreground">
        {t(language, "manageChildren")}
      </h2>
      <p className="mt-1 text-sm text-muted">{t(language, "manageChildrenHint")}</p>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label
            htmlFor="student-alias"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            {t(language, "studentName")}
          </label>
          <input
            id="student-alias"
            type="text"
            value={alias}
            onChange={(e) => {
              setAlias(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
            }}
            placeholder={t(language, "studentNamePlaceholder")}
            className="touch-target w-full rounded-2xl border border-primary/20 bg-white px-4 py-3 text-base outline-none ring-primary/30 focus:border-primary/40 focus:ring-2"
            maxLength={32}
          />
        </div>

        <div>
          <p className="mb-1.5 text-sm font-medium text-foreground">
            {t(language, "pickEmoji")}
          </p>
          <div className="flex flex-wrap gap-2">
            {STUDENT_AVATAR_EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-xl border-2 text-xl transition-all",
                  emoji === e
                    ? "border-primary bg-primary/15 scale-105 shadow-sm"
                    : "border-white/80 bg-white/90 hover:border-primary/30"
                )}
                aria-label={e}
                aria-pressed={emoji === e}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <Button
          size="lg"
          onClick={() => void handleAdd()}
          disabled={isAdding}
          className="shrink-0 sm:min-w-[140px]"
        >
          {isAdding ? "…" : `+ ${t(language, "addChild")}`}
        </Button>
      </div>

      {error && (
        <p className="mt-2 text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      )}

      {managedStudents.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-primary/20 bg-primary/5 px-4 py-6 text-center text-sm text-muted">
          {t(language, "noChildrenYet")}
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {managedStudents.map((row) => (
              <motion.li
                key={row.student.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/60 bg-white/60 px-4 py-3">
                  <span className="flex items-center gap-2 font-medium">
                    <span className="text-2xl">{row.student.avatarEmoji}</span>
                    {row.student.alias}
                  </span>

                  {pendingDeleteId === row.student.id ? (
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="hidden text-xs text-muted sm:inline">
                        {t(language, "confirmDeleteChild")}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPendingDeleteId(null)}
                      >
                        {t(language, "cancel")}
                      </Button>
                      <Button
                        size="sm"
                        className="border-red-200 bg-red-50 text-red-800 hover:bg-red-100"
                        onClick={() => confirmDelete(row.student.id)}
                      >
                        {t(language, "delete")}
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPendingDeleteId(row.student.id)}
                      className="touch-target shrink-0 rounded-xl border border-red-200/80 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800 transition-colors hover:bg-red-100"
                      aria-label={`${t(language, "delete")} ${row.student.alias}`}
                    >
                      {t(language, "delete")}
                    </button>
                  )}
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </Card>
  );
}
