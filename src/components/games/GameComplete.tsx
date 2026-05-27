"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useAppStore } from "@/stores/app-store";
import { localized } from "@/lib/i18n/content";
import { t } from "@/lib/i18n/translations";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface GameCompleteProps {
  gameId: string;
  score: number;
  maxScore: number;
  gameSlug: string;
  messageHi?: string;
  messageEn?: string;
}

export function GameComplete({
  gameId,
  score,
  maxScore,
  gameSlug,
  messageHi,
  messageEn,
}: GameCompleteProps) {
  const language = useAppStore((s) => s.language);
  const stored = useAppStore((s) => s.gameScores[gameId]);
  const stars = Math.min(3, Math.ceil((score / maxScore) * 3));
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  const msg = localized(
    language,
    messageHi ?? t(language, "gameWellDone"),
    messageEn ?? t(language, "gameWellDone")
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      <Card className="relative overflow-hidden text-center">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {["🎉", "✨", "⭐", "💫", "🌟"].map((e, i) => (
            <motion.span
              key={e}
              className="absolute text-xl opacity-60"
              style={{ left: `${10 + i * 18}%`, top: `${5 + (i % 3) * 12}%` }}
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: [0, -12, 0], opacity: [0, 0.7, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.25 }}
            >
              {e}
            </motion.span>
          ))}
        </div>

        <div className="relative flex justify-center gap-1 py-2">
          {[1, 2, 3].map((n) => (
            <motion.span
              key={n}
              initial={{ scale: 0, rotate: -30 }}
              animate={{
                scale: n <= stars ? 1 : 0.6,
                rotate: 0,
                opacity: n <= stars ? 1 : 0.25,
              }}
              transition={{ delay: n * 0.15, type: "spring", stiffness: 400 }}
              className="text-4xl"
            >
              ⭐
            </motion.span>
          ))}
        </div>

        <h2 className="relative mt-2 text-2xl font-bold">
          {t(language, "gameComplete")}
        </h2>
        <p className="relative mt-2 text-lg">{msg}</p>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          className="relative mx-auto mt-6 max-w-xs"
        >
          <div className="h-3 overflow-hidden rounded-full bg-white/60">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ delay: 0.3, duration: 0.8 }}
            />
          </div>
          <p className="mt-2 text-muted">
            {t(language, "yourScore")}: {score}/{maxScore} ({pct}%)
          </p>
        </motion.div>

        {stored && (
          <p className="relative mt-2 text-sm font-medium text-primary">
            {t(language, "bestScore")}: {stored.bestScore}%
          </p>
        )}

        <div className="relative mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href={`/games/${gameSlug}`}>
            <Button variant="secondary">{t(language, "playAgain")}</Button>
          </Link>
          <Link href="/games">
            <Button variant="outline">{t(language, "games")}</Button>
          </Link>
          <Link href="/home">
            <Button>{t(language, "home")}</Button>
          </Link>
        </div>
      </Card>
    </motion.div>
  );
}
