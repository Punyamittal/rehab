"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { GameDefinition } from "@/types";
import { useAppStore } from "@/stores/app-store";
import { t } from "@/lib/i18n/translations";
import { useNarration } from "@/hooks/useNarration";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { GameShell } from "./GameShell";
import { GameComplete } from "./GameComplete";
import { GameProgressBar } from "./game-ui";

const CYCLES = 3;
const IN_MS = 4000;
const OUT_MS = 4000;

export function CalmBreathGame({ game }: { game: GameDefinition }) {
  const language = useAppStore((s) => s.language);
  const recordGameScore = useAppStore((s) => s.recordGameScore);
  const { speak } = useNarration();
  const [phase, setPhase] = useState<"in" | "out">("in");
  const [cycle, setCycle] = useState(0);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [tapBoost, setTapBoost] = useState(false);

  useEffect(() => {
    if (!started || done) return;

    const label = phase === "in" ? t(language, "breatheIn") : t(language, "breatheOut");
    void speak(label, language);

    const duration = phase === "in" ? IN_MS : OUT_MS;
    const timer = setTimeout(() => {
      if (phase === "in") {
        setPhase("out");
      } else {
        const next = cycle + 1;
        if (next >= CYCLES) {
          recordGameScore(game.id, CYCLES, CYCLES);
          setDone(true);
        } else {
          setCycle(next);
          setPhase("in");
        }
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [started, phase, cycle, done, language, speak, game.id, recordGameScore]);

  const handleTap = () => {
    if (!started || done) return;
    setTapBoost(true);
    setTimeout(() => setTapBoost(false), 300);
  };

  if (done) {
    return (
      <GameShell game={game} score={CYCLES} maxScore={CYCLES}>
        <GameComplete
          gameId={game.id}
          score={CYCLES}
          maxScore={CYCLES}
          gameSlug={game.slug}
          messageHi={t(language, "wellDoneCalm")}
          messageEn={t(language, "wellDoneCalm")}
        />
      </GameShell>
    );
  }

  if (!started) {
    return (
      <GameShell game={game}>
        <Card className="text-center">
          <motion.p
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-5xl"
          >
            🌬️
          </motion.p>
          <p className="mt-4 text-lg">{t(language, "calmBreathIntro")}</p>
          <Button size="lg" className="mt-8" onClick={() => setStarted(true)}>
            {t(language, "start")}
          </Button>
        </Card>
      </GameShell>
    );
  }

  const scale = phase === "in" ? 1.2 : 0.7;
  const label = phase === "in" ? t(language, "breatheIn") : t(language, "breatheOut");
  const progressStep = cycle * 2 + (phase === "out" ? 1 : 0);
  const progressMax = CYCLES * 2;

  return (
    <GameShell game={game} score={cycle + 1} maxScore={CYCLES}>
      <div className="mb-4">
        <GameProgressBar value={progressStep + 1} max={progressMax} />
        <p className="mt-2 text-center text-sm text-muted">
          {t(language, "followTheCircle")} · {cycle + 1}/{CYCLES}
        </p>
      </div>

      <Card
        className="flex cursor-pointer flex-col items-center py-10"
        onClick={handleTap}
      >
        <div className="relative flex h-52 w-52 items-center justify-center">
          {[0, 1, 2].map((ring) => (
            <motion.div
              key={ring}
              className="absolute inset-0 rounded-full border-2 border-accent/30"
              animate={{
                scale: phase === "in" ? [0.6 + ring * 0.15, 1 + ring * 0.12] : [1 + ring * 0.12, 0.6 + ring * 0.15],
                opacity: [0.5, 0.15, 0.5],
              }}
              transition={{
                duration: (phase === "in" ? IN_MS : OUT_MS) / 1000,
                ease: "easeInOut",
                delay: ring * 0.12,
              }}
            />
          ))}

          <motion.div
            animate={{
              scale: tapBoost ? scale * 1.08 : scale,
              boxShadow:
                phase === "in"
                  ? "0 0 40px rgba(133, 212, 184, 0.5)"
                  : "0 0 24px rgba(232, 168, 124, 0.35)",
            }}
            transition={{
              duration: (phase === "in" ? IN_MS : OUT_MS) / 1000,
              ease: "easeInOut",
            }}
            className="relative z-10 flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br from-accent/50 via-secondary/40 to-primary/35"
          >
            <motion.span
              animate={{ rotate: phase === "in" ? 0 : 180 }}
              transition={{ duration: 0.4 }}
              className="text-5xl"
            >
              {phase === "in" ? "🌸" : "🍃"}
            </motion.span>
          </motion.div>
        </div>

        <motion.p
          key={label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 text-2xl font-bold text-foreground"
        >
          {label}
        </motion.p>
      </Card>
    </GameShell>
  );
}
