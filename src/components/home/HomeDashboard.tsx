"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAppStore } from "@/stores/app-store";
import { useCatalogStore } from "@/stores/catalog-store";
import { CatalogLoader } from "@/components/ui/CatalogLoader";
import { t, topicLabel } from "@/lib/i18n/translations";
import { localized } from "@/lib/i18n/content";
import { getProgressPercent, cn } from "@/lib/utils";
import { AppHeader } from "@/components/layout/AppHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { VoiceDiagnostics } from "@/components/audio/VoiceDiagnostics";
import { QUICK_NAV, TOPIC_ACCENT } from "@/components/home/home-ui";
import type { Language } from "@/types";

const stagger = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: "easeOut" as const },
  }),
};

function progressMessage(language: Language, percent: number): string {
  if (percent >= 100) return t(language, "progressAllDone");
  if (percent > 0) return t(language, "progressKeepGoing");
  return t(language, "progressStartFirst");
}

export function HomeDashboard() {
  const {
    language,
    studentAlias,
    studentEmoji,
    moduleProgress,
    getCompletedModuleCount,
  } = useAppStore();

  const modules = useCatalogStore((s) => s.modules);
  const stories = useCatalogStore((s) => s.stories);
  const completed = getCompletedModuleCount();
  const total = modules.length;
  const progressPercent = getProgressPercent(completed, total || 1);

  return (
    <CatalogLoader>
      <AppHeader />
      <div className="mx-auto max-w-4xl px-4 pb-10 pt-4 md:px-8 md:pt-6">
        {/* Hero */}
        <motion.section
          custom={0}
          variants={stagger}
          initial="hidden"
          animate="show"
          className="relative overflow-hidden rounded-[1.75rem] border border-white/50 bg-gradient-to-br from-white/85 via-white/70 to-primary/10 p-6 shadow-[0_8px_40px_rgba(232,168,124,0.18)] backdrop-blur-md sm:p-8"
        >
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/20 blur-2xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-6 left-1/4 h-24 w-24 rounded-full bg-accent/25 blur-2xl"
            aria-hidden
          />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0.8, rotate: -8 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 280, damping: 18 }}
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/25 text-4xl shadow-inner ring-2 ring-white/80 sm:h-20 sm:w-20 sm:text-5xl"
              >
                {studentEmoji}
              </motion.div>
              <div>
                <Link
                  href="/choose-student?from=home"
                  className="mb-1 inline-flex items-center gap-1 rounded-full bg-white/60 px-2.5 py-0.5 text-xs font-medium text-primary ring-1 ring-primary/20 hover:bg-white/90"
                >
                  {t(language, "switchChild")} ↻
                </Link>
                <p className="text-sm font-medium text-muted">
                  {t(language, "greeting")} 👋
                </p>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {studentAlias}!
                </h1>
                <p className="mt-1 text-base text-muted sm:text-lg">
                  {t(language, "whatLearnToday")}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 self-start rounded-2xl border border-white/60 bg-white/50 px-4 py-2.5 backdrop-blur-sm sm:self-center">
              <span className="text-2xl font-bold tabular-nums text-primary">
                {progressPercent}%
              </span>
              <span className="text-xs leading-tight text-muted">
                {t(language, "percentComplete")}
              </span>
            </div>
          </div>
        </motion.section>

        {/* Quick nav */}
        <nav
          className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
          aria-label={t(language, "modules")}
        >
          {QUICK_NAV.map((item, i) => (
            <motion.div key={item.href} custom={i + 1} variants={stagger} initial="hidden" animate="show">
              <Link href={item.href} className="group block h-full">
                <div
                  className={cn(
                    "flex h-full min-h-[108px] flex-col rounded-2xl border border-white/60 bg-gradient-to-br p-4 shadow-[var(--safe-shadow)] backdrop-blur-sm transition-all duration-200",
                    "hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_12px_32px_rgba(74,55,40,0.12)]",
                    item.tile
                  )}
                >
                  <span
                    className={cn(
                      "mb-3 flex h-11 w-11 items-center justify-center rounded-xl text-2xl shadow-sm",
                      item.icon
                    )}
                  >
                    {item.emoji}
                  </span>
                  <p className="font-semibold leading-tight text-foreground">
                    {t(language, item.labelKey)}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted">
                    {language === "pa"
                      ? item.descPa
                      : localized(language, item.descHi, item.descEn)}
                  </p>
                  <span className="mt-auto pt-2 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    {t(language, "open")} →
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Progress */}
        <motion.section
          custom={5}
          variants={stagger}
          initial="hidden"
          animate="show"
          className="mt-6 rounded-2xl border border-white/50 bg-white/65 p-5 shadow-[var(--safe-shadow)] backdrop-blur-md sm:rounded-3xl sm:p-6"
        >
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
                {t(language, "yourProgress")}
              </h2>
              <p className="mt-0.5 text-lg font-bold text-foreground">
                {completed}/{total}{" "}
                <span className="font-medium text-muted">
                  {t(language, "modules").toLowerCase()}
                </span>
              </p>
            </div>
            <p className="max-w-[220px] text-right text-sm text-muted">
              {progressMessage(language, progressPercent)}
            </p>
          </div>
          <ProgressBar value={progressPercent} />
        </motion.section>

        {/* Modules */}
        <motion.div custom={6} variants={stagger} initial="hidden" animate="show" className="mt-8">
          <SectionHeader
            title={t(language, "todaysModules")}
            href="/learn"
            linkLabel={t(language, "allModulesLink")}
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4">
            {modules.map((mod, i) => {
              const prog = moduleProgress[mod.id];
              const isDone = prog?.completed;
              const inProgress = prog && !isDone;
              const title = localized(language, mod.titleHi, mod.titleEn);
              const accent = TOPIC_ACCENT[mod.topic] ?? TOPIC_ACCENT.peer_pressure;

              return (
                <motion.div
                  key={mod.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.05 }}
                >
                  <Link href={`/learn/${mod.slug}`} className="group block">
                    <article
                      className={cn(
                        "relative overflow-hidden rounded-2xl border border-white/60 bg-white/80 p-4 shadow-[var(--safe-shadow)] backdrop-blur-sm transition-all duration-200",
                        "hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(74,55,40,0.1)]",
                        `ring-1 ${accent.ring}`
                      )}
                    >
                      <div
                        className={cn(
                          "pointer-events-none absolute inset-y-3 left-0 w-1 rounded-full bg-gradient-to-b",
                          accent.bar
                        )}
                      />
                      <div className="flex items-start gap-3 pl-2">
                        <span
                          className={cn(
                            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl",
                            accent.icon
                          )}
                        >
                          {mod.emoji}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-foreground">{title}</p>
                            {isDone && (
                              <StatusChip variant="done">
                                {t(language, "statusDone")}
                              </StatusChip>
                            )}
                            {inProgress && (
                              <StatusChip variant="progress">
                                {t(language, "statusInProgress")}
                              </StatusChip>
                            )}
                          </div>
                          <p className="mt-0.5 text-sm text-muted">
                            {topicLabel(language, mod.topic)} · {mod.durationMinutes}{" "}
                            {t(language, "minutes")}
                          </p>
                          <span
                            className={cn(
                              "mt-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold transition-colors",
                              isDone
                                ? "bg-accent/15 text-accent"
                                : "bg-primary/15 text-primary group-hover:bg-primary/25"
                            )}
                          >
                            {isDone
                              ? "✓ " + t(language, "review")
                              : inProgress
                                ? t(language, "continue") + " →"
                                : t(language, "start") + " →"}
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Stories */}
        {stories.length > 0 && (
          <motion.div custom={7} variants={stagger} initial="hidden" animate="show" className="mt-8">
            <SectionHeader
              title={t(language, "stories")}
              href="/story"
              linkLabel={t(language, "viewAllLink")}
            />
            <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4">
              {stories.map((story, i) => {
                const isFeatured = story.slug === "do-raste";
                const title = localized(language, story.titleHi, story.titleEn);
                const desc = localized(
                  language,
                  story.descriptionHi,
                  story.descriptionEn
                );

                return (
                  <motion.div
                    key={story.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                    className={isFeatured ? "sm:col-span-2" : undefined}
                  >
                    <Link href={`/story/${story.slug}`} className="group block h-full">
                      <article
                        className={cn(
                          "relative h-full overflow-hidden rounded-2xl border p-4 shadow-[var(--safe-shadow)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5",
                          isFeatured
                            ? "border-primary/30 bg-gradient-to-br from-amber-50/95 via-white/90 to-violet-50/80 hover:shadow-[0_16px_40px_rgba(232,168,124,0.2)]"
                            : "border-white/60 bg-white/80 hover:shadow-[0_12px_28px_rgba(74,55,40,0.1)]"
                        )}
                      >
                        {isFeatured && (
                          <div
                            className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/15 blur-xl"
                            aria-hidden
                          />
                        )}
                        <div className="relative flex items-start gap-3">
                          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/80 text-2xl shadow-sm ring-1 ring-white/60">
                            {story.emoji}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-foreground">{title}</p>
                              {story.format === "interactive" && (
                                <StatusChip variant="featured">
                                  {t(language, "statusInteractive")}
                                </StatusChip>
                              )}
                            </div>
                            {isFeatured && desc && (
                              <p className="mt-1 line-clamp-2 text-sm text-muted">{desc}</p>
                            )}
                            <p className="mt-1 text-sm text-muted">
                              {topicLabel(language, story.topic)} · {story.durationMinutes}{" "}
                              {t(language, "minutes")}
                            </p>
                            <span className="mt-3 inline-flex text-sm font-semibold text-primary">
                              {t(language, "playStory")} →
                            </span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        <details className="mt-8 rounded-2xl border border-white/40 bg-white/40 px-4 py-3 backdrop-blur-sm">
          <summary className="cursor-pointer text-sm font-medium text-muted">
            {t(language, "voiceCheckOptional")}
          </summary>
          <VoiceDiagnostics className="mt-3" />
        </details>

        <div className="mt-6 flex justify-center">
          <LogoutButton />
        </div>
      </div>
    </CatalogLoader>
  );
}

function SectionHeader({
  title,
  href,
  linkLabel,
}: {
  title: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      <Link
        href={href}
        className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
      >
        {linkLabel}
      </Link>
    </div>
  );
}

function StatusChip({
  children,
  variant,
}: {
  children: ReactNode;
  variant: "done" | "progress" | "featured";
}) {
  const styles = {
    done: "bg-accent/20 text-emerald-800",
    progress: "bg-primary/15 text-amber-900",
    featured: "bg-secondary/20 text-violet-900",
  };
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide sm:text-xs",
        styles[variant]
      )}
    >
      {children}
    </span>
  );
}
