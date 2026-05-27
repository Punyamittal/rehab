"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function GameRoundHeader({
  current,
  total,
  streak,
  streakLabel,
}: {
  current: number;
  total: number;
  streak?: number;
  streakLabel?: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <GameProgressBar value={current} max={total} />
      {streak !== undefined && streak > 0 && (
        <motion.span
          key={streak}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-900 shadow-sm"
        >
          🔥 {streak}
          {streakLabel ? ` ${streakLabel}` : ""}
        </motion.span>
      )}
    </div>
  );
}

export function GameProgressBar({
  value,
  max,
  className,
}: {
  value: number;
  max: number;
  className?: string;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className={cn("h-2 flex-1 overflow-hidden rounded-full bg-white/50", className)}>
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      />
    </div>
  );
}

export function RoundDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-3 flex justify-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <motion.span
          key={i}
          animate={{
            scale: i < current ? 1.15 : 1,
            opacity: i < current ? 1 : i === current ? 0.9 : 0.35,
          }}
          className={cn(
            "h-2 w-2 rounded-full",
            i < current ? "bg-accent" : i === current ? "bg-primary" : "bg-white/60"
          )}
        />
      ))}
    </div>
  );
}

export function FeedbackBurst({
  type,
  message,
  onDone,
}: {
  type: "correct" | "wrong";
  message: string;
  onDone?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      onAnimationComplete={() => onDone?.()}
      className={cn(
        "relative mt-5 overflow-hidden rounded-2xl border-2 px-4 py-4 text-center",
        type === "correct"
          ? "border-accent/50 bg-accent/15"
          : "border-primary/30 bg-primary/10"
      )}
    >
      {type === "correct" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 opacity-40">
          {["✨", "⭐", "💫"].map((e, i) => (
            <motion.span
              key={e}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: -30, opacity: [0, 1, 0] }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              className="text-2xl"
            >
              {e}
            </motion.span>
          ))}
        </div>
      )}
      <p className="relative text-3xl">{type === "correct" ? "🎉" : "💭"}</p>
      <p
        className={cn(
          "relative mt-2 text-lg font-semibold",
          type === "correct" ? "text-emerald-900" : "text-foreground"
        )}
      >
        {message}
      </p>
    </motion.div>
  );
}

export function FloatingPoints({ show, points = 1 }: { show: boolean; points?: number }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.span
          initial={{ opacity: 0, y: 0, scale: 0.5 }}
          animate={{ opacity: 1, y: -28, scale: 1.2 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none absolute right-4 top-4 text-xl font-bold text-accent"
        >
          +{points}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

export function SwipeChoiceButtons({
  safeLabel,
  unsafeLabel,
  disabled,
  onSafe,
  onUnsafe,
}: {
  safeLabel: string;
  unsafeLabel: string;
  disabled?: boolean;
  onSafe: () => void;
  onUnsafe: () => void;
}) {
  return (
    <div className="mt-8 grid grid-cols-2 gap-3">
      <motion.button
        type="button"
        disabled={disabled}
        whileHover={{ scale: 1.03, x: 4 }}
        whileTap={{ scale: 0.96, x: 8 }}
        onClick={onSafe}
        className="touch-target flex flex-col items-center gap-2 rounded-2xl border-2 border-emerald-300/60 bg-gradient-to-br from-emerald-50 to-teal-100 px-4 py-5 shadow-md disabled:opacity-60"
      >
        <span className="text-4xl">🛡️</span>
        <span className="text-lg font-bold text-emerald-900">{safeLabel}</span>
        <span className="text-xs text-emerald-700/80">←</span>
      </motion.button>
      <motion.button
        type="button"
        disabled={disabled}
        whileHover={{ scale: 1.03, x: -4 }}
        whileTap={{ scale: 0.96, x: -8 }}
        onClick={onUnsafe}
        className="touch-target flex flex-col items-center gap-2 rounded-2xl border-2 border-rose-300/60 bg-gradient-to-br from-rose-50 to-orange-100 px-4 py-5 shadow-md disabled:opacity-60"
      >
        <span className="text-4xl">⚠️</span>
        <span className="text-lg font-bold text-rose-900">{unsafeLabel}</span>
        <span className="text-xs text-rose-700/80">→</span>
      </motion.button>
    </div>
  );
}

export function MatchCelebration({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
        >
          <motion.span
            animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.6 }}
            className="text-6xl drop-shadow-lg"
          >
            ✨
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
