"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAppStore } from "@/stores/app-store";
import { t } from "@/lib/i18n/translations";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { SoundToggle } from "@/components/audio/SoundToggle";
import { Card } from "@/components/ui/Card";
import type { UserRole } from "@/types";

const ROLES: { role: UserRole; emoji: string; href: string }[] = [
  { role: "student", emoji: "🌸", href: "/choose-student" },
  { role: "facilitator", emoji: "📋", href: "/dashboard" },
];

export default function LandingPage() {
  const router = useRouter();
  const {
    language,
    role,
    setRole,
    studentProfileChosen,
    studentId,
    isManagedStudent,
  } = useAppStore();

  useEffect(() => {
    if (role === "student") {
      if (
        studentProfileChosen &&
        studentId &&
        isManagedStudent(studentId)
      ) {
        router.replace("/home");
      } else {
        router.replace("/choose-student");
      }
    } else if (role === "facilitator") router.replace("/dashboard");
    else if (role === "volunteer") router.replace("/");
  }, [
    role,
    router,
    studentProfileChosen,
    studentId,
    isManagedStudent,
  ]);

  const roleLabel = (r: UserRole) => {
    if (r === "student") return t(language, "roleStudent");
    if (r === "facilitator") return t(language, "roleFacilitator");
    return t(language, "roleVolunteer");
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-white/55 bg-gradient-to-r from-white/80 via-white/70 to-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-2.5 md:px-6">
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-primary md:text-lg">
              🌸 {t(language, "appName")}
            </p>
            <p className="truncate text-[11px] text-muted md:text-xs">
              {t(language, "tagline")}
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-2xl border border-white/70 bg-white/55 p-1 shadow-[0_6px_22px_rgba(74,55,40,0.08)]">
            <SoundToggle />
            <LanguageSelector />
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-72px)] flex-col items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <motion.span
            className="mb-4 inline-block text-6xl"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            🌸
          </motion.span>
          <h1 className="text-3xl font-bold text-primary md:text-4xl">
            {t(language, "appName")}
          </h1>
          <p className="mt-2 text-muted">{t(language, "tagline")}</p>

          <p className="mb-6 mt-10 text-lg font-medium">
            {t(language, "selectRole")}
          </p>

          <div className="flex flex-col gap-4">
            {ROLES.map(({ role: r, emoji, href }) => (
              <Card
                key={r}
                hover
                onClick={() => {
                  setRole(r);
                  router.push(href);
                }}
                className="flex items-center gap-4"
              >
                <span className="text-4xl">{emoji}</span>
                <div className="flex-1 text-left">
                  <p className="text-xl font-semibold">{roleLabel(r)}</p>
                </div>
                <span className="text-2xl text-primary">→</span>
              </Card>
            ))}
          </div>

          <p className="mt-8 text-xs text-muted">
            {t(language, "humanSupportNote")}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
