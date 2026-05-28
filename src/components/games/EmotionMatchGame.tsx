"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GameDefinition, EmotionType } from "@/types";
import { EMOTION_MATCH_ROUNDS } from "@/data/game-content";
import { EMOTION_OPTIONS } from "@/data/emotions";
import { useAppStore } from "@/stores/app-store";
import { localized } from "@/lib/i18n/content";
import { t } from "@/lib/i18n/translations";
import { useNarration, useReadQuestion } from "@/hooks/useNarration";
import {
  buildChoicesNarration,
  buildLocalizedNarration,
} from "@/lib/narration/question-narration";
import { NarrationButton } from "@/components/audio/NarrationButton";
import { Card } from "@/components/ui/Card";
import { GameShell } from "./GameShell";
import { GameComplete } from "./GameComplete";
import {
  FeedbackBurst,
  FloatingPoints,
  GameRoundHeader,
  RoundDots,
} from "./game-ui";
import { cn } from "@/lib/utils";

export function EmotionMatchGame({ game }: { game: GameDefinition }) {
  const language = useAppStore((s) => s.language);
  const recordGameScore = useAppStore((s) => s.recordGameScore);
  const { speak } = useNarration();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [flash, setFlash] = useState<"correct" | "wrong" | null>(null);
  const [picked, setPicked] = useState<EmotionType | null>(null);
  const [showPoints, setShowPoints] = useState(false);
  const [done, setDone] = useState(false);

  const round = EMOTION_MATCH_ROUNDS[index];
  const maxScore = EMOTION_MATCH_ROUNDS.length;
  const correctOpt = EMOTION_OPTIONS.find((o) => o.id === round.correctEmotion);

  const questionNarration = buildLocalizedNarration(
    localized(language, round.situationHi, round.situationEn),
    t(language, "howFeeling"),
    buildChoicesNarration(
      language,
      EMOTION_OPTIONS.map((o) => ({
        labelHi: o.labelHi,
        labelEn: o.labelEn,
      }))
    )
  );

  useReadQuestion(
    `${game.id}-e-${round.id}-${language}`,
    questionNarration,
    undefined,
    { force: true }
  );

  const pick = (emotion: EmotionType) => {
    if (flash) return;
    setPicked(emotion);
    const correct = emotion === round.correctEmotion;
    if (correct) {
      void speak(t(language, "correct"), language);
      setFlash("correct");
      setStreak((s) => s + 1);
      setShowPoints(true);
    } else {
      void speak(t(language, "tryAgain"), language);
      setFlash("wrong");
      setStreak(0);
    }

    setTimeout(() => {
      setFlash(null);
      setPicked(null);
      setShowPoints(false);
      const nextScore = correct ? score + 1 : score;
      setScore(nextScore);
      if (index < maxScore - 1) {
        setIndex((i) => i + 1);
      } else {
        recordGameScore(game.id, nextScore, maxScore);
        setDone(true);
      }
    }, 1400);
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

  const situation = localized(language, round.situationHi, round.situationEn);

  return (
    <GameShell game={game} score={score} maxScore={maxScore}>
      <GameRoundHeader
        current={index + 1}
        total={maxScore}
        streak={streak}
        streakLabel={t(language, "streak")}
      />
      <RoundDots current={index} total={maxScore} />

      <AnimatePresence mode="wait">
        <motion.div
          key={round.id}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
        >
          <Card
            className={cn(
              "relative transition-shadow",
              flash === "correct" && "ring-2 ring-accent shadow-lg",
              flash === "wrong" && "ring-2 ring-primary/40"
            )}
          >
            <FloatingPoints show={showPoints} />
            <div className="flex items-start justify-between gap-2">
              <p className="flex-1 text-lg font-medium leading-relaxed">{situation}</p>
              <NarrationButton text={questionNarration} size="sm" className="shrink-0" />
            </div>
            <p className="mt-4 text-center text-muted">{t(language, "howFeeling")}</p>

            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
              {EMOTION_OPTIONS.map((opt) => {
                const isCorrect = opt.id === round.correctEmotion;
                const isPicked = picked === opt.id;
                const showHint = flash === "wrong" && isCorrect;

                return (
                  <motion.button
                    key={opt.id}
                    type="button"
                    disabled={!!flash}
                    animate={
                      isPicked && flash === "wrong"
                        ? { x: [0, -6, 6, -4, 4, 0] }
                        : isPicked && flash === "correct"
                          ? { scale: [1, 1.15, 1] }
                          : showHint
                            ? { scale: [1, 1.08, 1] }
                            : {}
                    }
                    whileHover={!flash ? { scale: 1.06, y: -2 } : undefined}
                    whileTap={!flash ? { scale: 0.95 } : undefined}
                    onClick={() => pick(opt.id)}
                    className={cn(
                      "touch-target flex flex-col items-center gap-1 rounded-2xl border-2 p-3 transition-colors",
                      isPicked && flash === "correct"
                        ? "border-accent bg-accent/30"
                        : isPicked && flash === "wrong"
                          ? "border-primary/50 bg-primary/15"
                          : showHint
                            ? "border-accent/50 ring-2 ring-accent/40"
                            : "border-transparent hover:border-white/60"
                    )}
                    style={{ backgroundColor: `${opt.color}99` }}
                  >
                    <span className="text-3xl">{opt.emoji}</span>
                    <span className="text-xs font-medium">
                      {localized(language, opt.labelHi, opt.labelEn)}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence>
              {flash === "correct" && (
                <FeedbackBurst type="correct" message={t(language, "correct")} />
              )}
              {flash === "wrong" && correctOpt && (
                <FeedbackBurst
                  type="wrong"
                  message={`${correctOpt.emoji} ${localized(language, correctOpt.labelHi, correctOpt.labelEn)}`}
                />
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </AnimatePresence>
    </GameShell>
  );
}
