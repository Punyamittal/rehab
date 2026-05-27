"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { Language, StoryCharacter } from "@/types";
import {
  STORY_CHARACTER_IMAGES,
  STORY_CHARACTER_STYLES,
  getCharacterLabel,
  isPortraitCharacter,
} from "@/components/story/story-characters";
import {
  DialogueBubbleWithReaction,
  StoryReactionMedia,
} from "@/components/story/StoryReactionMedia";
import type { StoryReactionMotion } from "@/types";
import { CHARACTER_DEFAULT_EMOJI } from "@/components/story/story-scene-media";

interface CharacterPortraitProps {
  character: Exclude<StoryCharacter, "narrator">;
  language: Language;
  bubbleText?: string;
  emoji?: string;
  reaction?: StoryReactionMotion;
  gif?: string;
  size?: "md" | "lg";
  className?: string;
}

export function CharacterPortrait({
  character,
  language,
  bubbleText,
  emoji,
  reaction,
  gif,
  size = "md",
  className = "",
}: CharacterPortraitProps) {
  const meta = STORY_CHARACTER_STYLES[character];
  const defaults = CHARACTER_DEFAULT_EMOJI[character];
  const displayEmoji = emoji ?? defaults.emoji;
  const displayReaction = reaction ?? defaults.reaction;
  const image = STORY_CHARACTER_IMAGES[character];
  const maxH =
    size === "lg"
      ? "max-h-[min(40vh,300px)]"
      : "max-h-[min(32vh,220px)]";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className={`relative w-full max-w-[min(520px,92%)] ${className}`}
    >
      {bubbleText && (
        <div className="absolute -top-1 left-1/2 z-20 w-[94%] max-w-md -translate-x-1/2 sm:-top-2">
          <DialogueBubbleWithReaction
            emoji={displayEmoji}
            reaction={displayReaction}
            gif={gif}
            text={bubbleText}
            accentClass={meta.accent}
            glowClass={meta.glow}
          />
        </div>
      )}

      <div
        className={`relative overflow-hidden rounded-xl border border-white/25 ring-1 sm:rounded-2xl ${meta.ring} ${meta.glow}`}
      >
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
        <div className="absolute right-2 top-2 z-20">
          <StoryReactionMedia
            emoji={displayEmoji}
            reaction={displayReaction}
            gif={gif}
            size="sm"
            showParticles={false}
          />
        </div>
        <Image
          src={image}
          alt={getCharacterLabel(language, character)}
          width={640}
          height={360}
          className={`aspect-[16/10] w-full object-cover object-[center_18%] ${maxH}`}
          priority
        />
        <p className="absolute bottom-2 left-3 z-20 text-xs font-bold uppercase tracking-wider text-white/90 sm:text-sm">
          {getCharacterLabel(language, character)}
        </p>
      </div>
    </motion.div>
  );
}

export function CharacterPortraitOrNull({
  character,
  language,
  bubbleText,
  emoji,
  reaction,
  gif,
  size,
  className,
}: {
  character?: StoryCharacter;
  language: Language;
  bubbleText?: string;
  emoji?: string;
  reaction?: StoryReactionMotion;
  gif?: string;
  size?: "md" | "lg";
  className?: string;
}) {
  if (!isPortraitCharacter(character)) return null;
  return (
    <CharacterPortrait
      character={character}
      language={language}
      bubbleText={bubbleText}
      emoji={emoji}
      reaction={reaction}
      gif={gif}
      size={size}
      className={className}
    />
  );
}
