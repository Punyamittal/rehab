"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAppStore } from "@/stores/app-store";
import { useCatalogStore } from "@/stores/catalog-store";
import { localized } from "@/lib/i18n/content";
import { usesEnglishContent } from "@/lib/i18n/languages";
import { t, topicLabel } from "@/lib/i18n/translations";
import { AppHeader } from "@/components/layout/AppHeader";
import { CatalogLoader } from "@/components/ui/CatalogLoader";
import { NarrationButton } from "@/components/audio/NarrationButton";
import { cn } from "@/lib/utils";
import type { Language } from "@/types";

const GAME_TILE: Record<string, string> = {
  "game-scenario-hero": "from-violet-50/95 via-white to-purple-50/80",
  "game-emotion-match": "from-sky-50/95 via-white to-cyan-50/80",
  "game-safe-or-not": "from-emerald-50/95 via-white to-teal-50/80",
  "game-calm-breath": "from-amber-50/95 via-white to-orange-50/80",
  "game-habit-match": "from-pink-50/95 via-white to-rose-50/80",
  "external-toothstars": "from-lime-50/95 via-white to-emerald-50/80",
};

const EXTERNAL_GAMES = [
  {
    id: "external-toothstars",
    slug: "toothstars",
    emoji: "🦷",
    titleHi: "टूथस्टार्स",
    titleEn: "ToothStars",
    descriptionHi:
      "दांतों की देखभाल और स्वस्थ खान-पान सीखने का मजेदार गेम",
    descriptionEn:
      "A fun game to learn oral hygiene and healthy food habits",
    topicLabelHi: "स्वास्थ्य",
    topicLabelEn: "Health",
    durationMinutes: 5,
    skillsHi: ["मौखिक स्वच्छता", "स्वास्थ्य आदतें"],
    skillsEn: ["Oral hygiene", "Healthy habits"],
  },
] as const;

function externalTopicLabel(
  language: Language,
  hi: string,
  en: string
): string {
  return usesEnglishContent(language) ? en : hi;
}

export default function GamesPage() {
  const { language, gameScores } = useAppStore();
  const games = useCatalogStore((s) => s.games);

  return (
    <CatalogLoader>
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
          {games.map((game, i) => {
            const title = localized(language, game.titleHi, game.titleEn);
            const desc = localized(language, game.descriptionHi, game.descriptionEn);
            const skills = usesEnglishContent(language)
              ? game.skillsEn
              : game.skillsHi;
            const score = gameScores[game.id];
            const narrationText = `${title}. ${desc}`;
            const tile =
              GAME_TILE[game.id] ??
              "from-white/95 via-white to-primary/10";

            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  href={`/games/${game.slug}`}
                  className="group block h-full"
                >
                  <article
                    className={cn(
                      "flex h-full flex-col rounded-2xl border border-white/60 bg-gradient-to-br p-5 shadow-[var(--safe-shadow)] transition-transform hover:-translate-y-0.5",
                      tile
                    )}
                  >
                    <span className="text-4xl">{game.emoji}</span>
                    <div className="mt-3 flex items-center gap-2">
                      <h2 className="text-xl font-bold">{title}</h2>
                      <div
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <NarrationButton text={narrationText} size="sm" />
                      </div>
                    </div>
                    <p className="mt-1 flex-1 text-sm text-muted">{desc}</p>
                    <p className="mt-2 text-xs text-muted">
                      {topicLabel(language, game.topic)} · {game.durationMinutes}{" "}
                      {t(language, "minutes")}
                    </p>
                    {skills.length > 0 && (
                      <p className="mt-2 text-xs font-medium text-primary/80">
                        {skills.join(" · ")}
                      </p>
                    )}
                    {score && (
                      <p className="mt-3 text-sm font-semibold text-accent">
                        {t(language, "bestScore")}: {score.bestScore}%
                      </p>
                    )}
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                      {t(language, "playGame")} →
                    </span>
                  </article>
                </Link>
              </motion.div>
            );
          })}
          {EXTERNAL_GAMES.map((game, i) => {
            const title = usesEnglishContent(language) ? game.titleEn : game.titleHi;
            const desc = usesEnglishContent(language)
              ? game.descriptionEn
              : game.descriptionHi;
            const skills = usesEnglishContent(language)
              ? game.skillsEn
              : game.skillsHi;
            const narrationText = `${title}. ${desc}`;
            const tile = GAME_TILE[game.id] ?? "from-white/95 via-white to-primary/10";

            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (games.length + i) * 0.06 }}
              >
                <Link href={`/games/${game.slug}`} className="group block h-full">
                  <article
                    className={cn(
                      "flex h-full flex-col rounded-2xl border border-white/60 bg-gradient-to-br p-5 shadow-[var(--safe-shadow)] transition-transform hover:-translate-y-0.5",
                      tile
                    )}
                  >
                    <span className="text-4xl">{game.emoji}</span>
                    <div className="mt-3 flex items-center gap-2">
                      <h2 className="text-xl font-bold">{title}</h2>
                      <div
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <NarrationButton text={narrationText} size="sm" />
                      </div>
                    </div>
                    <p className="mt-1 flex-1 text-sm text-muted">{desc}</p>
                    <p className="mt-2 text-xs text-muted">
                      {externalTopicLabel(language, game.topicLabelHi, game.topicLabelEn)} ·{" "}
                      {game.durationMinutes} {t(language, "minutes")}
                    </p>
                    <p className="mt-2 text-xs font-medium text-primary/80">
                      {skills.join(" · ")}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                      {t(language, "playGame")} →
                    </span>
                  </article>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </CatalogLoader>
  );
}
