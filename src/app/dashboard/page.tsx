"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/stores/app-store";
import { t } from "@/lib/i18n/translations";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/Button";
import { FacilitatorTable } from "@/components/dashboard/FacilitatorTable";
import { StudentManagePanel } from "@/components/dashboard/StudentManagePanel";

export default function FacilitatorDashboardPage() {
  const router = useRouter();
  const language = useAppStore((s) => s.language);
  const role = useAppStore((s) => s.role);
  const facilitatorUnlocked = useAppStore((s) => s.facilitatorUnlocked);
  const unlockFacilitatorDashboard = useAppStore(
    (s) => s.unlockFacilitatorDashboard
  );
  const managedStudents = useAppStore((s) => s.managedStudents);
  const toggleStudentAttendance = useAppStore((s) => s.toggleStudentAttendance);
  const removeManagedStudent = useAppStore((s) => s.removeManagedStudent);
  const updateManagedStudentNote = useAppStore((s) => s.updateManagedStudentNote);
  const awardStudentPoints = useAppStore((s) => s.awardStudentPoints);
  const loadManagedStudents = useAppStore((s) => s.loadManagedStudents);
  const studentsLoading = useAppStore((s) => s.studentsLoading);
  const studentsError = useAppStore((s) => s.studentsError);

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (role !== "facilitator") {
      router.replace("/");
    }
  }, [role, router]);

  useEffect(() => {
    if (!facilitatorUnlocked) return;
    void loadManagedStudents();
  }, [facilitatorUnlocked, loadManagedStudents]);

  const presentCount = managedStudents.filter((s) => s.presentToday).length;
  const total = managedStudents.length;

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  const handleDeleteFromTable = async (studentId: string) => {
    if (pendingDeleteId === studentId) {
      await removeManagedStudent(studentId);
      setPendingDeleteId(null);
      return;
    }
    setPendingDeleteId(studentId);
  };

  if (role !== "facilitator") return null;

  if (!facilitatorUnlocked) {
    return (
      <>
        <AppHeader
          showBack
          backHref="/"
          title={t(language, "facilitatorDashboard")}
        />
        <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center px-4 py-10">
          <div className="w-full rounded-3xl border border-white/60 bg-white/80 p-6 shadow-[var(--safe-shadow)] backdrop-blur-sm">
            <h2 className="text-xl font-bold text-foreground">Enter Password</h2>
            <p className="mt-2 text-sm text-muted">
              Facilitator dashboard is protected.
            </p>
            <form
              className="mt-5 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const ok = unlockFacilitatorDashboard(password);
                if (!ok) {
                  setPasswordError("Incorrect password");
                  return;
                }
                setPasswordError(null);
                setPassword("");
              }}
            >
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError(null);
                }}
                placeholder="Password"
                className="w-full rounded-2xl border border-primary/20 bg-white px-4 py-3 text-base outline-none ring-primary/30 transition focus:ring-2"
                autoComplete="current-password"
                autoFocus
              />
              {passwordError && (
                <p className="text-sm font-medium text-red-700">{passwordError}</p>
              )}
              <Button type="submit" className="w-full">
                Unlock Dashboard
              </Button>
            </form>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader
        showBack
        backHref="/"
        title={t(language, "facilitatorDashboard")}
      />
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
        <div className="no-print mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="rounded-3xl bg-white/70 px-6 py-4">
            <p className="text-sm text-muted">{t(language, "attendance")}</p>
            <p className="text-2xl font-bold">
              {presentCount}/{total}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                managedStudents.forEach((row) => {
                  if (!row.presentToday) {
                    toggleStudentAttendance(row.student.id);
                  }
                });
              }}
              disabled={total === 0}
            >
              {t(language, "markAllPresent")}
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              📄 {t(language, "printReport")}
            </Button>
          </div>
        </div>

        {studentsError && (
          <p className="no-print mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
            {studentsError}
          </p>
        )}

        <StudentManagePanel />

        {studentsLoading && total === 0 && (
          <p className="mb-4 text-center text-sm text-muted">Loading…</p>
        )}

        {pendingDeleteId && (
          <p className="no-print mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-900">
            {t(language, "confirmDeleteChild")}{" "}
            <button
              type="button"
              className="ml-2 font-bold underline"
              onClick={() => setPendingDeleteId(null)}
            >
              {t(language, "cancel")}
            </button>
          </p>
        )}

        <FacilitatorTable
          rows={managedStudents}
          onToggleAttendance={toggleStudentAttendance}
          onRequestDelete={handleDeleteFromTable}
          onUpdateNote={updateManagedStudentNote}
          onAwardPoints={awardStudentPoints}
        />

        <p className="no-print mt-8 text-center text-sm text-muted">
          {t(language, "childrenSavedToCloud")}
        </p>
      </div>
    </>
  );
}
