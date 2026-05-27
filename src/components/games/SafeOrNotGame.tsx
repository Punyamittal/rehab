"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GameDefinition } from "@/types";
import { SAFE_OR_NOT_ITEMS } from "@/data/game-content";
import { useAppStore } from "@/stores/app-store";
import { localized } from "@/lib/i18n/content";
import { t } from "@/lib/i18n/translations";
import { useNarration, useReadQuestion } from "@/hooks/useNarration";
import { NarrationButton } from "@/components/audio/NarrationButton";
import { GameShell } from "./GameShell";
import { GameComplete } from "./GameComplete";
import {
  FeedbackBurst,
  FloatingPoints,
  GameRoundHeader,
  SwipeChoiceButtons,
} from "./game-ui";

export function SafeOrNotGame({ game }: { game: GameDefinition }) {
  const language = useAppStore((s) => s.language);
  const recordGameScore = useAppStore((s) => s.recordGameScore);
  const { speak } = useNarration();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<{
    text: string;
    type: "correct" | "wrong";
  } | null>(null);
  const [showPoints, setShowPoints] = useState(false);
  const [done, setDone] = useState(false);

  const item = SAFE_OR_NOT_ITEMS[index];
  const maxScore = SAFE_OR_NOT_ITEMS.length;
  const nextItem = SAFE_OR_NOT_ITEMS[index + 1];
  const itemNarration = localized(language, item.textHi, item.textEn);

  useReadQuestion(`${game.id}-safe-${item.id}-${language}`, itemNarration);

  const answer = (pickedSafe: boolean) => {
    if (feedback) return;
    const correct = pickedSafe === item.safe;
    const text = localized(language, item.explainHi, item.explainEn);
    if (correct) {
      setStreak((s) => s + 1);
      setShowPoints(true);
    } else {
      setStreak(0);
    }
    setFeedback({ text, type: correct ? "correct" : "wrong" });
    void speak(text, language);

    setTimeout(() => {
      setFeedback(null);
      setShowPoints(false);
      const nextScore = correct ? score + 1 : score;
      setScore(nextScore);
      if (index < maxScore - 1) {
        setIndex((i) => i + 1);
      } else {
        recordGameScore(game.id, nextScore, maxScore);
        setDone(true);
      }
    }, 1800);
  };

  if (done) {
    return (
      <GameShell game={game} score={score} maxScore={maxScore}>
        <GameComplete
          gameId={game.id}
          score={score}
          maxScore={maxScore}
          gameSlug={game.slug}
        />
      </GameShell>
    );
  }

  const text = itemNarration;

  return (
    <GameShell game={game} score={score} maxScore={maxScore}>
      <GameRoundHeader
        current={index + 1}
        total={maxScore}
        streak={streak}
        streakLabel={t(language, "streak")}
      />

      <div className="relative mx-auto max-w-md">
        {nextItem && (
          <motion.div
            className="absolute inset-x-4 top-3 rounded-3xl border border-white/40 bg-white/40 p-6 opacity-60"
            style={{ transform: "translateY(8px) scale(0.96)" }}
          >
            <p className="text-center text-sm text-muted/80">⋯</p>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 24, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, y: -24, rotate: 2 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="relative rounded-3xl border border-white/60 bg-white/85 p-6 shadow-[var(--safe-shadow)] backdrop-blur-sm"
          >
            <FloatingPoints show={showPoints} />
            <motion.p
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="mb-4 text-center text-5xl"
            >
              {item.safe ? "🛡️" : "⚠️"}
            </motion.p>
            <div className="flex items-start justify-center gap-2">
              <p className="text-center text-xl font-semibold leading-snug">{text}</p>
              <NarrationButton text={text} size="sm" className="shrink-0" />
            </div>

            {!feedback && (
              <SwipeChoiceButtons
                safeLabel={t(language, "safe")}
                unsafeLabel={t(language, "notSafe")}
                onSafe={() => answer(true)}
                onUnsafe={() => answer(false)}
              />
            )}

            <AnimatePresence>
              {feedback && (
                <FeedbackBurst type={feedback.type} message={feedback.text} />
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </GameShell>
  );
}
