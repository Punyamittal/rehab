"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Language, StoryScene, StorySceneChoice } from "@/types";
import { localized } from "@/lib/i18n/content";
import { usesEnglishContent } from "@/lib/i18n/languages";
import { estimateDwellMs } from "@/lib/narration/story-timing";
import { buildChoicesNarration } from "@/lib/narration/question-narration";
import { useAppStore } from "@/stores/app-store";
import { useAutoNarrate } from "@/hooks/useNarration";
import { NarrationButton } from "@/components/audio/NarrationButton";
import { CharacterPortrait } from "@/components/story/CharacterPortrait";
import { getCharacterLabel } from "@/components/story/story-characters";
import { StoryReactionMedia } from "@/components/story/StoryReactionMedia";
import {
  CHARACTER_DEFAULT_EMOJI,
  getChoiceEmoji,
} from "@/components/story/story-scene-media";

interface CinematicCorridorSceneProps {
  scene: StoryScene;
  storyId: string;
  language: Language;
  selectedChoice: string | null;
  onChoice: (id: string) => void;
  sceneProgress: number;
}

export function CinematicCorridorScene({
  scene,
  storyId,
  language,
  selectedChoice,
  onChoice,
  sceneProgress,
}: CinematicCorridorSceneProps) {
  const config = scene.cinematic;
  const dialogues = config?.dialogues ?? [];
  const choices = scene.choices ?? [];

  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [showChoices, setShowChoices] = useState(false);
  const { autoNarrate, soundEnabled } = useAppStore();

  const activeDialogue = dialogues[dialogueIndex];
  const activeCharacter = activeDialogue?.character;
  const subtitle = activeDialogue
    ? localized(language, activeDialogue.textHi, activeDialogue.textEn)
    : "";
  const setting = config
    ? localized(language, config.settingHi, config.settingEn)
    : "";

  const lineProgress =
    dialogues.length > 0
      ? showChoices
        ? 100
        : ((dialogueIndex + 1) / dialogues.length) * 100
      : 0;

  const tension =
    activeCharacter === "tanya"
      ? 78
      : activeCharacter === "asha"
        ? 62
        : activeCharacter === "riya"
          ? 28
          : 50;

  const lineMedia = activeCharacter
    ? {
        emoji:
          activeDialogue?.emoji ??
          CHARACTER_DEFAULT_EMOJI[activeCharacter].emoji,
        reaction:
          activeDialogue?.reaction ??
          CHARACTER_DEFAULT_EMOJI[activeCharacter].reaction,
        gif: activeDialogue?.gif,
      }
    : null;

  const choiceNarration =
    showChoices && choices.length > 0
      ? buildChoicesNarration(
          language,
          choices.map((c) => ({
            labelHi: c.labelHi,
            labelEn: c.labelEn,
          }))
        )
      : "";

  useAutoNarrate(
    showChoices
      ? `${storyId}-${scene.id}-choices-${language}`
      : `${storyId}-${scene.id}-line-${dialogueIndex}-${language}`,
    showChoices ? choiceNarration : subtitle,
    undefined,
    activeCharacter ? "female" : undefined
  );

  useEffect(() => {
    setDialogueIndex(0);
    setShowChoices(false);
  }, [scene.id]);

  const advanceDialogue = () => {
    if (showChoices) return;
    if (dialogueIndex < dialogues.length - 1) {
      setDialogueIndex((i) => i + 1);
    } else {
      setShowChoices(true);
    }
  };

  useEffect(() => {
    if (showChoices || !subtitle) return;
    const dwell = estimateDwellMs(subtitle, autoNarrate && soundEnabled);
    const timer = setTimeout(() => {
      if (dialogueIndex < dialogues.length - 1) {
        setDialogueIndex((i) => i + 1);
      } else {
        setShowChoices(true);
      }
    }, dwell);
    return () => clearTimeout(timer);
  }, [
    dialogueIndex,
    showChoices,
    subtitle,
    autoNarrate,
    soundEnabled,
    dialogues.length,
  ]);

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
      <CorridorBackdrop />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />
      <LightParticles />

      {/* Scene meta strip */}
      <div className="relative z-20 flex shrink-0 items-center justify-between gap-2 px-3 py-1.5 sm:px-4">
        <span className="truncate rounded-full border border-white/10 bg-black/40 px-2.5 py-0.5 text-[10px] uppercase tracking-widest text-amber-100/80 backdrop-blur-md sm:text-[11px]">
          {setting}
        </span>
        <EmotionIndicator tension={tension} language={language} />
      </div>

      {/* Character + dialogue — flex-1, no overflow */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center px-3 pb-1 pt-0 sm:px-5">
        <AnimatePresence mode="wait">
          {!showChoices && activeCharacter ? (
            <CharacterPortrait
              key={activeCharacter}
              character={activeCharacter}
              language={language}
              bubbleText={subtitle}
              emoji={lineMedia?.emoji}
              reaction={lineMedia?.reaction}
              gif={lineMedia?.gif}
              size="lg"
            />
          ) : showChoices ? (
            <motion.div
              key="choice-prompt"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center gap-2 text-center"
            >
              <StoryReactionMedia
                emoji="🎯"
                reaction="bounce"
                size="md"
              />
              <p className="text-sm font-semibold text-amber-100/90 sm:text-base">
                {usesEnglishContent(language)
                  ? "What would you do?"
                  : "आप क्या करेंगे?"}
              </p>
              <p className="text-[11px] text-white/45">
                {usesEnglishContent(language)
                  ? "Choose one option below"
                  : "नीचे एक विकल्प चुनें"}
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Bottom zone: dialogue bar OR choices — always visible, no scroll */}
      <div className="relative z-30 shrink-0 px-2 pb-2 sm:px-3 sm:pb-3">
        <AnimatePresence mode="wait">
          {!showChoices ? (
            <motion.div
              key="subtitle"
              role="button"
              tabIndex={0}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              onClick={advanceDialogue}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  advanceDialogue();
                }
              }}
              className="cursor-pointer rounded-xl border border-white/10 bg-black/55 px-3 py-2.5 backdrop-blur-xl sm:rounded-2xl sm:px-5 sm:py-3"
            >
              <div className="mb-1.5 flex items-center gap-2">
                <div className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400/80 to-emerald-400/70"
                    animate={{ width: `${lineProgress}%` }}
                    transition={{ duration: 0.35 }}
                  />
                </div>
                <span className="text-[10px] tabular-nums text-white/40">
                  {Math.round(sceneProgress)}%
                </span>
                <div onClick={(e) => e.stopPropagation()}>
                  <NarrationButton
                    text={subtitle}
                    size="sm"
                    voiceGender="female"
                    className="!min-h-8 !px-2.5 !py-1 !text-xs"
                  />
                </div>
              </div>
              {activeCharacter && lineMedia && (
                <div className="mb-2 flex items-center gap-3">
                  <StoryReactionMedia
                    emoji={lineMedia.emoji}
                    reaction={lineMedia.reaction}
                    gif={lineMedia.gif}
                    size="sm"
                    showParticles={false}
                  />
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-200/80 sm:text-sm">
                    {getCharacterLabel(language, activeCharacter)}
                  </p>
                </div>
              )}
              <p className="line-clamp-3 text-lg font-semibold leading-snug text-white sm:text-xl lg:text-2xl">
                {subtitle}
              </p>
              <p className="mt-1 text-center text-[10px] text-white/35">
                {usesEnglishContent(language)
                  ? "Tap to skip"
                  : "Tap → छोड़ें"}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="choices"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-white/10 bg-black/55 p-2 backdrop-blur-xl sm:rounded-2xl sm:p-3"
            >
              <div className="flex flex-col gap-1.5 sm:flex-row sm:gap-2">
                {choices.map((choice, i) => (
                  <ChoiceButton
                    key={choice.id}
                    choice={choice}
                    language={language}
                    index={i}
                    selected={selectedChoice === choice.id}
                    onSelect={() => onChoice(choice.id)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ChoiceButton({
  choice,
  language,
  index,
  selected,
  onSelect,
}: {
  choice: StorySceneChoice;
  language: Language;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const label = localized(language, choice.labelHi, choice.labelEn);
  const choiceEmoji = getChoiceEmoji(choice.id, choice.emoji);
  const isRisky = choice.id === "pressure";

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`touch-target relative min-h-[44px] flex-1 overflow-hidden rounded-xl border px-3 py-2 text-center text-xs font-semibold transition-all sm:min-h-[48px] sm:rounded-2xl sm:px-4 sm:text-sm ${
        selected
          ? isRisky
            ? "border-stone-400/50 bg-stone-800/90 text-stone-100 shadow-[0_0_20px_rgba(168,162,158,0.2)]"
            : "border-emerald-400/60 bg-emerald-900/60 text-emerald-50 shadow-[0_0_24px_rgba(52,211,153,0.3)]"
          : isRisky
            ? "border-white/10 bg-white/5 text-white/75 hover:border-white/25 hover:shadow-[0_0_12px_rgba(255,255,255,0.08)]"
            : "border-emerald-400/15 bg-white/5 text-white hover:border-emerald-400/35 hover:shadow-[0_0_16px_rgba(52,211,153,0.12)]"
      }`}
    >
      {!isRisky && !selected && (
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/5 to-transparent" />
      )}
      <span className="relative flex items-center justify-center gap-1.5">
        {choiceEmoji && (
          <span className="text-lg sm:text-xl">{choiceEmoji}</span>
        )}
        <span className="line-clamp-2 text-sm sm:text-base">{label}</span>
      </span>
      {selected && !isRisky && (
        <span className="relative ml-1 text-emerald-300">✓</span>
      )}
    </motion.button>
  );
}

function EmotionIndicator({
  tension,
  language,
}: {
  tension: number;
  language: Language;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-2 py-0.5 backdrop-blur-md">
      <motion.span
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ duration: 1.4, repeat: Infinity }}
        className="text-xs"
      >
        {tension > 60 ? "💭" : tension > 40 ? "😟" : "💚"}
      </motion.span>
      <div className="hidden w-12 sm:block">
        <div className="h-1 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className={`h-full rounded-full ${
              tension > 60
                ? "bg-gradient-to-r from-amber-500 to-orange-600"
                : tension > 40
                  ? "bg-gradient-to-r from-amber-400 to-amber-500"
                  : "bg-gradient-to-r from-emerald-400 to-teal-500"
            }`}
            animate={{ width: `${tension}%` }}
            transition={{ duration: 0.45 }}
          />
        </div>
      </div>
      <span className="text-[9px] text-white/50 sm:text-[10px]">
        {usesEnglishContent(language) ? "Mood" : "भावना"}
      </span>
    </div>
  );
}

function CorridorBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-[linear-gradient(145deg,#2a1f18_0%,#4a3728_40%,#6b5344_70%,#2a1f18_100%)]"
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_25%_15%,rgba(255,190,110,0.28),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_20%,rgba(255,160,80,0.12),transparent_45%)]" />
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="absolute top-[8%] h-[50%] w-[12%] rounded-sm bg-amber-950/25 blur-[0.5px]"
          style={{ left: `${10 + i * 17}%` }}
        />
      ))}
    </div>
  );
}

function LightParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-px w-12 bg-gradient-to-r from-transparent via-amber-200/30 to-transparent"
          style={{ top: `${20 + i * 18}%`, left: `${8 + i * 20}%` }}
          animate={{ x: [0, 30, 0], opacity: [0, 0.5, 0] }}
          transition={{
            duration: 5 + i,
            repeat: Infinity,
            delay: i * 0.8,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
