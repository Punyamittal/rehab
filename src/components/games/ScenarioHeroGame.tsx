"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GameDefinition } from "@/types";
import { SCENARIO_QUESTIONS } from "@/data/game-content";
import { useAppStore } from "@/stores/app-store";
import { localized } from "@/lib/i18n/content";
import { t } from "@/lib/i18n/translations";
import { useNarration, useReadQuestion } from "@/hooks/useNarration";
import { buildQuestionNarration } from "@/lib/narration/question-narration";
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

export function ScenarioHeroGame({ game }: { game: GameDefinition }) {
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
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [showPoints, setShowPoints] = useState(false);
  const [done, setDone] = useState(false);

  const q = SCENARIO_QUESTIONS[index];
  const maxScore = SCENARIO_QUESTIONS.length;

  const questionNarration = buildQuestionNarration(
    language,
    q.situationHi,
    q.situationEn,
    {
      choices: q.choices.map((c) => ({
        labelHi: c.labelHi,
        labelEn: c.labelEn,
      })),
    }
  );

  useReadQuestion(
    `${game.id}-q-${q.id}-${language}`,
    questionNarration,
    undefined,
    { force: true }
  );

  const handleChoice = (
    choiceId: string,
    correct: boolean,
    feedbackText: string
  ) => {
    if (feedback) return;
    setPickedId(choiceId);
    const nextStreak = correct ? streak + 1 : 0;
    const nextScore = correct ? score + 1 : score;
    setStreak(nextStreak);
    if (correct) setShowPoints(true);
    setFeedback({ text: feedbackText, type: correct ? "correct" : "wrong" });
    void speak(feedbackText, language);

    setTimeout(() => {
      setShowPoints(false);
      setFeedback(null);
      setPickedId(null);
      setScore(nextScore);
      if (index < maxScore - 1) {
        setIndex((i) => i + 1);
      } else {
        recordGameScore(game.id, nextScore, maxScore);
        setDone(true);
      }
    }, 2000);
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

  const situation = localized(language, q.situationHi, q.situationEn);

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
          key={q.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
        >
          <Card className="relative overflow-hidden">
            <FloatingPoints show={showPoints} />
            <motion.p
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-2 text-center text-5xl"
            >
              {q.emoji}
            </motion.p>
            <p className="text-center text-sm font-medium uppercase tracking-wide text-muted">
              {t(language, "round")} {index + 1}
            </p>
            <div className="mt-2 flex items-start justify-between gap-2">
              <p className="flex-1 text-xl font-medium leading-relaxed">{situation}</p>
              <NarrationButton text={questionNarration} size="sm" className="shrink-0" />
            </div>

            <div className="mt-6 flex flex-col gap-3">
              {q.choices.map((c, i) => {
                const label = localized(language, c.labelHi, c.labelEn);
                const isPicked = pickedId === c.id;
                const showResult = isPicked && feedback;

                return (
                  <motion.button
                    key={c.id}
                    type="button"
                    disabled={!!feedback}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={!feedback ? { scale: 1.02 } : undefined}
                    whileTap={!feedback ? { scale: 0.98 } : undefined}
                    onClick={() =>
                      handleChoice(
                        c.id,
                        c.correct,
                        localized(language, c.feedbackHi, c.feedbackEn)
                      )
                    }
                    className={cn(
                      "touch-target flex w-full items-center gap-3 rounded-2xl border-2 px-5 py-4 text-left text-lg transition-colors",
                      showResult && c.correct
                        ? "border-accent bg-accent/20 shadow-[0_0_20px_rgba(133,212,184,0.35)]"
                        : showResult && !c.correct
                          ? "border-primary/40 bg-primary/10"
                          : "border-primary/20 bg-white/70 hover:border-primary/40"
                    )}
                  >
                    <span className="text-2xl">
                      {showResult ? (c.correct ? "✅" : "🤔") : c.correct ? "💪" : "❓"}
                    </span>
                    <span className="flex-1">{label}</span>
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence>
              {feedback && (
                <FeedbackBurst type={feedback.type} message={feedback.text} />
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </AnimatePresence>
    </GameShell>
  );
}
