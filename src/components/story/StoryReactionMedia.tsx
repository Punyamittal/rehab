"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { StoryReactionMotion } from "@/types";

const MOTION: Record<
  StoryReactionMotion,
  {
    animate: Record<string, number[]>;
    transition: {
      duration: number;
      repeat: number;
      ease?: "easeInOut" | "easeOut";
    };
  }
> = {
  float: {
    animate: { y: [0, -8, 0] },
    transition: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
  },
  pulse: {
    animate: { scale: [1, 1.18, 1] },
    transition: { duration: 1.4, repeat: Infinity, ease: "easeInOut" },
  },
  shake: {
    animate: { x: [0, -4, 4, -3, 3, 0], rotate: [0, -6, 6, 0] },
    transition: { duration: 0.9, repeat: Infinity, ease: "easeInOut" },
  },
  sparkle: {
    animate: {
      scale: [1, 1.12, 1],
      rotate: [0, 8, -8, 0],
      opacity: [1, 0.85, 1],
    },
    transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
  },
  bounce: {
    animate: { y: [0, -10, 0], scale: [1, 1.05, 1] },
    transition: { duration: 1.1, repeat: Infinity, ease: "easeOut" },
  },
  wobble: {
    animate: { rotate: [0, -5, 5, -3, 0] },
    transition: { duration: 1.6, repeat: Infinity, ease: "easeInOut" },
  },
};

const SIZE_CLASS = {
  sm: "text-2xl",
  md: "text-4xl sm:text-5xl",
  lg: "text-5xl sm:text-6xl",
};

interface StoryReactionMediaProps {
  emoji: string;
  reaction?: StoryReactionMotion;
  gif?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  showParticles?: boolean;
}

export function StoryReactionMedia({
  emoji,
  reaction = "pulse",
  gif,
  size = "md",
  className = "",
  showParticles = true,
}: StoryReactionMediaProps) {
  const motionCfg = MOTION[reaction];
  const isFileGif = gif?.match(/\.(gif|webp|apng)$/i);

  return (
    <div
      className={`relative inline-flex flex-col items-center gap-1 ${className}`}
    >
      {showParticles && (
        <div className="pointer-events-none absolute inset-0 -z-10">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="absolute text-sm opacity-40"
              style={{ left: `${20 + i * 28}%`, top: `${10 + i * 15}%` }}
              animate={{
                y: [0, -18, 0],
                opacity: [0.2, 0.6, 0.2],
                scale: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 2.5 + i * 0.4,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            >
              {emoji}
            </motion.span>
          ))}
        </div>
      )}

      <motion.span
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className={`inline-block leading-none drop-shadow-[0_0_12px_rgba(255,255,255,0.35)] ${SIZE_CLASS[size]}`}
        aria-hidden
      >
        <motion.span
          className="inline-block"
          animate={motionCfg.animate}
          transition={motionCfg.transition}
        >
          {emoji}
        </motion.span>
      </motion.span>

      {isFileGif && gif && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="overflow-hidden rounded-xl border border-white/20 shadow-lg"
        >
          <Image
            src={gif}
            alt=""
            width={120}
            height={120}
            unoptimized
            className="h-16 w-16 object-cover sm:h-20 sm:w-20"
          />
        </motion.div>
      )}
    </div>
  );
}

interface DialogueBubbleProps {
  emoji: string;
  reaction?: StoryReactionMotion;
  gif?: string;
  text: string;
  accentClass: string;
  glowClass: string;
}

export function DialogueBubbleWithReaction({
  emoji,
  reaction,
  gif,
  text,
  accentClass,
  glowClass,
}: DialogueBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex items-start gap-2.5 rounded-xl border px-3 py-2.5 backdrop-blur-md sm:rounded-2xl sm:px-4 sm:py-3 ${accentClass} ${glowClass}`}
    >
      <StoryReactionMedia
        emoji={emoji}
        reaction={reaction}
        gif={gif}
        size="sm"
        showParticles={false}
        className="shrink-0"
      />
      <p className="min-w-0 flex-1 text-sm leading-snug sm:text-base lg:text-lg">
        {text}
      </p>
    </motion.div>
  );
}
