"use client";

import { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GameDefinition } from "@/types";
import { HABIT_PAIRS } from "@/data/game-content";
import { useAppStore } from "@/stores/app-store";
import { localized } from "@/lib/i18n/content";
import { t } from "@/lib/i18n/translations";
import { useNarration, useReadQuestion } from "@/hooks/useNarration";
import { Card } from "@/components/ui/Card";
import { GameShell } from "./GameShell";
import { GameComplete } from "./GameComplete";
import { GameProgressBar, MatchCelebration } from "./game-ui";
import { cn } from "@/lib/utils";

interface CardState {
  pairId: string;
  instance: number;
  emoji: string;
  labelHi: string;
  labelEn: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function HabitMatchGame({ game }: { game: GameDefinition }) {
  const language = useAppStore((s) => s.language);
  const recordGameScore = useAppStore((s) => s.recordGameScore);
  const { speak } = useNarration();

  const deck = useMemo(() => {
    const picked = HABIT_PAIRS.slice(0, 4);
    const cards: CardState[] = [];
    picked.forEach((p) => {
      cards.push(
        {
          pairId: p.id,
          instance: 0,
          emoji: p.emoji,
          labelHi: p.labelHi,
          labelEn: p.labelEn,
        },
        {
          pairId: p.id,
          instance: 1,
          emoji: p.emoji,
          labelHi: p.labelHi,
          labelEn: p.labelEn,
        }
      );
    });
    return shuffle(cards);
  }, []);

  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [lock, setLock] = useState(false);
  const [moves, setMoves] = useState(0);
  const [done, setDone] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [wrongShake, setWrongShake] = useState<number[]>([]);

  const maxPairs = 4;
  const score = matched.size;

  useReadQuestion(
    `${game.id}-intro-${language}`,
    t(language, "habitMatchHint")
  );

  const finish = useCallback(() => {
    recordGameScore(game.id, maxPairs, maxPairs);
    void speak(t(language, "correct"), language);
    setCelebrate(true);
    setTimeout(() => {
      setCelebrate(false);
      setDone(true);
    }, 700);
  }, [game.id, language, maxPairs, recordGameScore, speak]);

  const flip = (index: number) => {
    if (lock || flipped.includes(index) || matched.has(deck[index].pairId)) return;

    const next = [...flipped, index];
    setFlipped(next);

    if (next.length === 2) {
      setLock(true);
      setMoves((m) => m + 1);
      const [a, b] = next;
      if (deck[a].pairId === deck[b].pairId) {
        const newMatched = new Set(matched).add(deck[a].pairId);
        setMatched(newMatched);
        void speak(t(language, "matchFound"), language);
        setFlipped([]);
        setLock(false);
        if (newMatched.size >= maxPairs) {
          setTimeout(finish, 500);
        }
      } else {
        setWrongShake([a, b]);
        setTimeout(() => {
          setWrongShake([]);
          setFlipped([]);
          setLock(false);
        }, 900);
      }
    }
  };

  if (done) {
    return (
      <GameShell game={game} score={score} maxScore={maxPairs}>
        <GameComplete
          gameId={game.id}
          score={score}
          maxScore={maxPairs}
          gameSlug={game.slug}
        />
      </GameShell>
    );
  }

  return (
    <GameShell game={game} score={score} maxScore={maxPairs}>
      <MatchCelebration show={celebrate} />
      <div className="mb-4 flex items-center justify-between gap-3">
        <GameProgressBar value={score} max={maxPairs} />
        <span className="text-sm font-medium text-muted">
          {t(language, "moves")}: {moves}
        </span>
      </div>
      <p className="mb-4 text-center text-muted">{t(language, "matchPairs")}</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {deck.map((card, i) => {
          const isOpen = flipped.includes(i) || matched.has(card.pairId);
          const isMatched = matched.has(card.pairId);
          const isShaking = wrongShake.includes(i);

          return (
            <motion.button
              key={`${card.pairId}-${card.instance}-${i}`}
              type="button"
              whileTap={{ scale: 0.95 }}
              animate={
                isShaking
                  ? { x: [0, -8, 8, -6, 6, 0] }
                  : isMatched
                    ? { scale: [1, 1.05, 1] }
                    : {}
              }
              onClick={() => flip(i)}
              className={cn(
                "touch-target aspect-square [perspective:800px]",
                isMatched && "pointer-events-none"
              )}
            >
              <motion.div
                className="relative h-full w-full"
                initial={false}
                animate={{ rotateY: isOpen ? 0 : 180 }}
                transition={{ duration: 0.45, type: "spring", stiffness: 260, damping: 22 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <div
                  className={cn(
                    "absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-2 p-2 backface-hidden",
                    isMatched
                      ? "border-accent/60 bg-accent/20"
                      : "border-white/80 bg-white/70 shadow-sm"
                  )}
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <span className="text-3xl">{card.emoji}</span>
                  <span className="mt-1 text-center text-xs font-medium">
                    {localized(language, card.labelHi, card.labelEn)}
                  </span>
                </div>
                <div
                  className="absolute inset-0 flex items-center justify-center rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/15 to-secondary/15 text-3xl font-bold text-primary/50"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  ?
                </div>
              </motion.div>
            </motion.button>
          );
        })}
      </div>

      <Card className="mt-6 text-center text-sm text-muted">
        {t(language, "habitMatchHint")}
      </Card>
    </GameShell>
  );
}
