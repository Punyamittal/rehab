"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GAMES } from "@/data/games";
import { useAppStore } from "@/stores/app-store";
import { localized } from "@/lib/i18n/content";
import { usesEnglishContent } from "@/lib/i18n/languages";
import { t, topicLabel } from "@/lib/i18n/translations";
import { AppHeader } from "@/components/layout/AppHeader";
import { cn } from "@/lib/utils";

const GAME_TILE: Record<string, string> = {
  "game-scenario-hero": "from-violet-50/95 via-white to-purple-50/80",
  "game-emotion-match": "from-sky-50/95 via-white to-cyan-50/80",
  "game-safe-or-not": "from-emerald-50/95 via-white to-teal-50/80",
  "game-calm-breath": "from-amber-50/95 via-white to-orange-50/80",
  "game-habit-match": "from-pink-50/95 via-white to-rose-50/80",
};

export default function GamesPage() {
  const { language, gameScores } = useAppStore();

  return (
    <>
      <AppHeader showBack backHref="/home" title={t(language, "games")} />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-lg text-muted"
        >
          {t(language, "gamesPageIntro")}
        </motion.p>

        <div className="grid gap-4 sm:grid-cols-2">
          {GAMES.map((game, i) => {
            const title = localized(language, game.titleHi, game.titleEn);
            const desc = localized(language, game.descriptionHi, game.descriptionEn);
            const skills = usesEnglishContent(language)
              ? game.skillsEn
              : game.skillsHi;
            const best = gameScores[game.id]?.bestScore;
            const tile = GAME_TILE[game.id] ?? "from-white to-white/80";

            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link href={`/games/${game.slug}`} className="group block h-full">
                  <article
                    className={cn(
                      "flex h-full flex-col rounded-2xl border border-white/60 bg-gradient-to-br p-5 shadow-[var(--safe-shadow)] backdrop-blur-sm transition-all duration-200",
                      "hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(74,55,40,0.12)]",
                      tile
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <motion.span
                        whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-4xl shadow-sm"
                      >
                        {game.emoji}
                      </motion.span>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-xl font-bold">{title}</h2>
                        <p className="mt-1 text-sm text-muted">{desc}</p>
                        <p className="mt-2 text-xs text-muted">
                          {topicLabel(language, game.topic)} · {game.durationMinutes}{" "}
                          {t(language, "minutes")}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {skills.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                        {best !== undefined && best > 0 && (
                          <p className="mt-2 text-sm font-semibold text-amber-800">
                            ⭐ {t(language, "bestScore")}: {best}%
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-secondary group-hover:gap-2 transition-all">
                      {t(language, "playGame")} →
                    </span>
                  </article>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </>
  );
}
