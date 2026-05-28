"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAppStore } from "@/stores/app-store";
import { t } from "@/lib/i18n/translations";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { SoundToggle } from "@/components/audio/SoundToggle";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { cn } from "@/lib/utils";

export function ChooseChildScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromHome = searchParams.get("from") === "home";

  const {
    language,
    role,
    studentId,
    managedStudents,
    selectStudentProfile,
  } = useAppStore();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (role === null) router.replace("/");
    else if (role !== "student") router.replace("/");
  }, [role, router]);

  if (role !== "student") {
    return null;
  }

  const handleSelect = async (id: string) => {
    const ok = await selectStudentProfile(id);
    if (ok) router.push("/home");
  };

  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return managedStudents;
    return managedStudents.filter((row) =>
      row.student.alias.toLowerCase().includes(q)
    );
  }, [managedStudents, query]);

  const lastActive = managedStudents.find((row) => row.student.id === studentId);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-primary/5 via-background to-secondary/10 px-4 py-8">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col">
        <div className="mb-6 flex items-center justify-between gap-2">
          {fromHome ? (
            <Link
              href="/home"
              className="touch-target rounded-2xl bg-white/70 px-4 py-2 text-lg shadow-sm"
              aria-label={t(language, "back")}
            >
              ←
            </Link>
          ) : (
            <Link
              href="/"
              className="touch-target rounded-2xl bg-white/70 px-4 py-2 text-lg shadow-sm"
              aria-label={t(language, "back")}
            >
              ←
            </Link>
          )}
          <div className="flex items-center gap-2">
            <LogoutButton variant="icon" />
            <SoundToggle />
            <LanguageSelector />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <span className="text-5xl" aria-hidden>
            👋
          </span>
          <h1 className="mt-4 text-2xl font-bold text-primary md:text-3xl">
            {t(language, "chooseChildTitle")}
          </h1>
          <p className="mt-2 text-muted">{t(language, "chooseChildHint")}</p>
        </motion.div>

        {lastActive && (
          <button
            type="button"
            onClick={() => handleSelect(lastActive.student.id)}
            className="mt-5 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-left text-sm font-medium text-primary hover:bg-primary/15"
          >
            ↺ Quick resume: {lastActive.student.avatarEmoji} {lastActive.student.alias}
          </button>
        )}

        {managedStudents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-10 rounded-2xl border border-amber-200/80 bg-amber-50/90 p-6 text-center text-amber-950 shadow-sm"
          >
            <p className="text-lg font-medium">
              {t(language, "noChildrenForStudent")}
            </p>
            <p className="mt-3 text-sm text-amber-900/80">
              {t(language, "askFacilitator")}
            </p>
          </motion.div>
        ) : (
          <>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search child"
              className="mt-6 w-full rounded-2xl border border-primary/20 bg-white/90 px-4 py-3 text-sm outline-none ring-primary/30 focus:ring-2"
            />
            <ul className="mt-4 flex flex-col gap-3">
            {filteredStudents.map((row, index) => {
              const { id, alias, avatarEmoji } = row.student;
              const isCurrent = id === studentId;
              return (
                <motion.li
                  key={id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <button
                    type="button"
                    onClick={() => handleSelect(id)}
                    className={cn(
                      "touch-target flex w-full items-center gap-4 rounded-2xl border-2 bg-white/90 p-4 text-left shadow-md transition hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]",
                      isCurrent
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-white/80"
                    )}
                  >
                    <span
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 text-4xl"
                      aria-hidden
                    >
                      {avatarEmoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xl font-semibold">{alias}</p>
                      {row.modulesCompleted > 0 && (
                        <p className="text-sm text-muted">
                          {row.modulesCompleted} {t(language, "modules")}
                        </p>
                      )}
                    </div>
                    <span className="text-2xl text-primary" aria-hidden>
                      →
                    </span>
                  </button>
                </motion.li>
              );
            })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
