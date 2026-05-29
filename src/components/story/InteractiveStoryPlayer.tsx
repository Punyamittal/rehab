"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BranchingStory, StoryCharacter, StoryScene } from "@/types";
import { useAppStore } from "@/stores/app-store";
import { useNarration, useAutoNarrate, useSpeechThenAdvance } from "@/hooks/useNarration";
import { getCharacterVoiceGender } from "@/lib/narration/voice-profiles";
import { buildNarrationScript } from "@/lib/narration/speech";
import { buildChoicesNarration } from "@/lib/narration/question-narration";
import {
  CHOICE_ADVANCE_MS,
} from "@/lib/narration/story-timing";
import { localized } from "@/lib/i18n/content";
import { usesEnglishContent } from "@/lib/i18n/languages";
import { t } from "@/lib/i18n/translations";
import type { Language } from "@/types";
import { NarrationButton } from "@/components/audio/NarrationButton";
import Image from "next/image";
import { CharacterPortraitOrNull } from "@/components/story/CharacterPortrait";
import { GOOD_COP_IMAGE } from "@/components/story/story-characters";
import { isPortraitCharacter } from "@/components/story/story-characters";
import { StoryReactionMedia } from "@/components/story/StoryReactionMedia";
import {
  getChoiceEmoji,
  resolveSceneMedia,
} from "@/components/story/story-scene-media";
import { CinematicCorridorScene } from "@/components/story/CinematicCorridorScene";
import { AppControls } from "@/components/layout/AppControls";

interface InteractiveStoryPlayerProps {
  story: BranchingStory;
  onComplete: () => void;
  onExit: () => void;
}

const CHARACTER_META: Record<
  StoryCharacter,
  { labelHi: string; labelEn: string; emoji: string; className: string }
> = {
  narrator: {
    labelHi: "कहानी",
    labelEn: "Narrator",
    emoji: "🎙️",
    className: "border-white/20 bg-white/10 text-white/90",
  },
  asha: {
    labelHi: "आशा",
    labelEn: "Asha",
    emoji: "🙂",
    className: "border-sky-400/30 bg-sky-950/50 text-sky-100",
  },
  riya: {
    labelHi: "रिया",
    labelEn: "Riya",
    emoji: "💚",
    className: "border-emerald-400/30 bg-emerald-950/50 text-emerald-100",
  },
  tanya: {
    labelHi: "तान्या",
    labelEn: "Tanya",
    emoji: "😒",
    className: "border-stone-400/30 bg-stone-900/50 text-stone-200",
  },
};

export function InteractiveStoryPlayer({
  story,
  onComplete,
  onExit,
}: InteractiveStoryPlayerProps) {
  const { language, autoNarrate, soundEnabled } = useAppStore();
  const { stop, speak } = useNarration();
  const scenes = story.scenes ?? [];
  const [sceneIndex, setSceneIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<"correct" | "wrong" | null>(
    null
  );

  const scene = scenes[sceneIndex];
  const title = localized(language, story.titleHi, story.titleEn);
  const progress = scenes.length
    ? ((sceneIndex + 1) / scenes.length) * 100
    : 0;
  const isCinematic = scene?.type === "cinematic";

  const needsChoice = Boolean(
    scene &&
      (scene.type === "interactive" ||
        scene.type === "quiz" ||
        scene.type === "cinematic")
  );
  const canProceed =
    !needsChoice ||
    (scene?.type === "interactive" && selectedChoice !== null) ||
    (scene?.type === "quiz" && quizFeedback === "correct") ||
    (scene?.type === "cinematic" && selectedChoice !== null);

  const goNext = useCallback(() => {
    stop();
    setSelectedChoice(null);
    setQuizFeedback(null);
    setSceneIndex((i) => {
      if (i < scenes.length - 1) return i + 1;
      onComplete();
      return i;
    });
  }, [stop, scenes.length, onComplete]);

  const goBack = () => {
    stop();
    setSelectedChoice(null);
    setQuizFeedback(null);
    if (sceneIndex === 0) {
      onExit();
      return;
    }
    setSceneIndex((i) => i - 1);
  };

  const handleChoice = (choiceId: string, correct?: boolean) => {
    setSelectedChoice(choiceId);
    if (scene?.type === "quiz") {
      if (correct) {
        setQuizFeedback("correct");
        void speak(t(language, "correct"), language);
      } else {
        setQuizFeedback("wrong");
        void speak(t(language, "tryAgain"), language);
      }
    }
  };

  const nonCinematicNarration = (() => {
    if (!scene || scene.type === "cinematic" || scene.type === "ending") {
      return "";
    }
    const narrative = localized(language, scene.narrativeHi, scene.narrativeEn);
    const caption = scene.captionHi
      ? localized(language, scene.captionHi, scene.captionEn ?? "")
      : "";
    return buildNarrationScript(narrative, caption);
  })();

  useSpeechThenAdvance({
    contentKey: `${story.id}-${scene?.id ?? sceneIndex}-${sceneIndex}-${language}-auto`,
    text: nonCinematicNarration,
    enabled:
      Boolean(scene) &&
      scene.type !== "cinematic" &&
      scene.type !== "ending" &&
      !needsChoice &&
      nonCinematicNarration.length > 0,
    voiceGender: getCharacterVoiceGender(scene?.character),
    onAdvance: goNext,
  });

  // Auto-advance after choice scenes (quiz / interactive)
  useEffect(() => {
    if (!scene || scene.type === "cinematic" || scene.type === "ending") return;
    if (!needsChoice) return;
    if (!canProceed) return;
    if (scene.type === "quiz" && quizFeedback !== "correct") return;
    const timer = setTimeout(goNext, CHOICE_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [
    scene,
    sceneIndex,
    needsChoice,
    canProceed,
    quizFeedback,
    goNext,
  ]);

  // Auto-advance after cinematic choice
  useEffect(() => {
    if (scene?.type !== "cinematic" || !selectedChoice) return;
    const timer = setTimeout(goNext, CHOICE_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [scene?.type, sceneIndex, selectedChoice, goNext]);

  if (!scene) {
    return null;
  }

  if (scene.type === "ending") {
    return (
      <StoryViewportShell isCinematic>
        <StoryEndingContent
          story={story}
          scene={scene}
          title={title}
          language={language}
          onExit={() => {
            stop();
            onExit();
          }}
          onComplete={() => {
            stop();
            onComplete();
          }}
        />
      </StoryViewportShell>
    );
  }

  return (
    <StoryViewportShell isCinematic={isCinematic}>
      <div className="flex h-[min(82dvh,860px)] w-[min(92vw,1180px)] min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_0_80px_rgba(232,168,124,0.08),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl sm:rounded-3xl">
        <header className="flex shrink-0 items-center gap-2 border-b border-white/8 px-2 py-1.5 sm:gap-3 sm:px-4 sm:py-2">
          <button
            type="button"
            onClick={goBack}
            className="touch-target shrink-0 rounded-lg border border-white/10 bg-black/30 px-2.5 py-1 text-xs text-white/80 backdrop-blur-sm hover:bg-black/45 sm:rounded-xl sm:px-3 sm:py-1.5 sm:text-sm"
          >
            ←
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white/90 sm:text-sm">
              {title}
            </p>
            <div className="mt-0.5 flex items-center gap-2">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary/80 to-accent/80"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.35 }}
                />
              </div>
              <span className="shrink-0 text-[10px] tabular-nums text-white/45">
                {sceneIndex + 1}/{scenes.length}
              </span>
            </div>
          </div>
          <AppControls />
        </header>

        <div className="relative min-h-0 flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={scene.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="h-full"
            >
              {isCinematic ? (
                <CinematicCorridorScene
                  scene={scene}
                  storyId={story.id}
                  language={language}
                  selectedChoice={selectedChoice}
                  onChoice={(id) => handleChoice(id)}
                  sceneProgress={progress}
                />
              ) : (
                <CompactScenePanel
                  storyId={story.id}
                  scene={scene}
                  language={language}
                  selectedChoice={selectedChoice}
                  quizFeedback={quizFeedback}
                  onChoice={handleChoice}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </StoryViewportShell>
  );
}

function StoryViewportShell({
  children,
  isCinematic,
}: {
  children: ReactNode;
  isCinematic?: boolean;
}) {
  return (
    <div
      data-story-player
      data-no-hover-read
      className={`fixed inset-0 z-40 flex items-center justify-center overflow-hidden ${
        isCinematic ? "bg-[#141010]" : "bg-[#1a1410]"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-1/4 top-0 h-full w-1/2 rounded-full bg-primary/10 blur-[100px]"
          animate={{ opacity: [0.3, 0.5, 0.3], x: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute -right-1/4 bottom-0 h-2/3 w-1/2 rounded-full bg-secondary/10 blur-[90px]"
          animate={{ opacity: [0.2, 0.4, 0.2], x: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.55)_100%)]" />
      </div>
      <div className="relative flex h-dvh w-full items-center justify-center p-[max(8px,1.5vh)]">
        {children}
      </div>
    </div>
  );
}

function CompactScenePanel({
  storyId,
  scene,
  language,
  selectedChoice,
  quizFeedback,
  onChoice,
}: {
  storyId: string;
  scene: StoryScene;
  language: Language;
  selectedChoice: string | null;
  quizFeedback: "correct" | "wrong" | null;
  onChoice: (id: string, correct?: boolean) => void;
}) {
  const narrative = localized(language, scene.narrativeHi, scene.narrativeEn);
  const caption = scene.captionHi
    ? localized(language, scene.captionHi, scene.captionEn ?? "")
    : "";
  const facilitatorPrompt = scene.facilitatorPromptHi
    ? localized(
        language,
        scene.facilitatorPromptHi,
        scene.facilitatorPromptEn ?? ""
      )
    : "";
  const hasPortrait = isPortraitCharacter(scene.character);
  const media = resolveSceneMedia(scene);
  const hasChoices =
    (scene.type === "interactive" || scene.type === "quiz") && scene.choices;
  const choicesPart =
    hasChoices && scene.choices
      ? buildChoicesNarration(
          language,
          scene.choices.map((c) => ({
            labelHi: c.labelHi,
            labelEn: c.labelEn,
          }))
        )
      : "";
  const narrationText = buildNarrationScript(narrative, caption, choicesPart);

  useAutoNarrate(
    `${storyId}-${scene.id}-${language}`,
    narrationText,
    undefined,
    getCharacterVoiceGender(scene.character)
  );

  const dialogueTextClass =
    "text-lg font-semibold leading-snug text-white sm:text-xl lg:text-2xl";

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden px-3 py-2 sm:px-5 sm:py-3">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden">
        {scene.type === "caption" && (
          <div className="flex flex-col items-center justify-center text-center">
            <StoryReactionMedia
              emoji={media.emoji}
              reaction={media.reaction}
              gif={media.gif}
              size="lg"
            />
            {caption && (
              <p className="text-2xl font-bold leading-snug text-white sm:text-3xl lg:text-4xl">
                {caption}
              </p>
            )}
            {narrative && (
              <p className="mt-3 line-clamp-3 text-lg text-white/70 sm:text-xl">
                {narrative}
              </p>
            )}
          </div>
        )}

        {scene.type === "split" && scene.split && (
          <div className="flex w-full flex-col justify-center gap-2">
            <div className="flex justify-center">
              <StoryReactionMedia
                emoji={media.emoji}
                reaction={media.reaction}
                gif={media.gif}
                size="md"
              />
            </div>
            {narrative && (
              <p className={`mb-1 text-center ${dialogueTextClass}`}>
                {narrative}
              </p>
            )}
            <div className="grid gap-2 sm:grid-cols-2">
              <SplitPanel panel={scene.split.left} language={language} compact />
              <SplitPanel
                panel={scene.split.right}
                language={language}
                compact
              />
            </div>
          </div>
        )}

        {scene.type === "learning" && (
          <div className="flex w-full flex-col justify-center">
            <div className="mb-3 overflow-hidden rounded-2xl border border-emerald-400/25 ring-1 ring-emerald-400/20">
              <Image
                src={GOOD_COP_IMAGE}
                alt=""
                width={800}
                height={450}
                className="aspect-[16/9] w-full max-h-[min(28vh,200px)] object-cover object-center"
              />
            </div>
            <div className="mb-3 flex justify-center">
              <StoryReactionMedia
                emoji={media.emoji}
                reaction={media.reaction}
                gif={media.gif}
                size="md"
              />
            </div>
            {narrative && (
              <p className={`mb-3 text-center ${dialogueTextClass}`}>
                {narrative}
              </p>
            )}
            <ul className="flex flex-col gap-2">
              {(usesEnglishContent(language)
                ? scene.learningPointsEn
                : scene.learningPointsHi
              )?.map((point) => (
                <li
                  key={point}
                  className="rounded-xl border border-accent/20 bg-accent/10 px-4 py-3 text-base font-medium text-white/95 sm:rounded-2xl sm:px-5 sm:py-3.5 sm:text-lg"
                >
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {(scene.type === "scene" ||
          scene.type === "interactive" ||
          scene.type === "quiz") && (
          <div className="flex w-full flex-col items-center gap-3 sm:gap-4">
            {!hasPortrait && (
              <StoryReactionMedia
                emoji={media.emoji}
                reaction={media.reaction}
                gif={media.gif}
                size="md"
              />
            )}

            <CharacterPortraitOrNull
              character={scene.character}
              language={language}
              emoji={media.emoji}
              reaction={media.reaction}
              gif={media.gif}
              size="md"
            />

            {!hasPortrait && scene.character && (
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${CHARACTER_META[scene.character].className}`}
              >
                <span>{CHARACTER_META[scene.character].emoji}</span>
                <span>
                  {localized(
                    language,
                    CHARACTER_META[scene.character].labelHi,
                    CHARACTER_META[scene.character].labelEn
                  )}
                </span>
              </div>
            )}

            <div className="flex w-full items-start justify-between gap-3">
              <p
                className={`flex-1 text-center ${dialogueTextClass} ${
                  hasPortrait ? "line-clamp-4" : "line-clamp-5"
                }`}
              >
                {narrative}
              </p>
              <NarrationButton
                text={narrationText}
                size="sm"
                voiceGender={getCharacterVoiceGender(scene.character)}
                className="!min-h-9 shrink-0 !px-2.5 !py-1.5 !text-xs"
              />
            </div>

          </div>
        )}

        {facilitatorPrompt && !hasChoices && (
          <p className="mt-3 line-clamp-2 rounded-lg border border-dashed border-white/15 bg-white/5 px-3 py-2 text-xs italic text-white/50 sm:text-sm">
            {facilitatorPrompt}
          </p>
        )}
      </div>

      {hasChoices && scene.choices && (
        <div className="mt-2 shrink-0 border-t border-white/8 pt-2">
          <div
            className={`gap-1.5 sm:gap-2 ${
              scene.choices.length >= 3
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : "flex flex-col sm:flex-row"
            }`}
          >
            {scene.choices.map((choice, i) => {
              const label = localized(language, choice.labelHi, choice.labelEn);
              const choiceEmoji = getChoiceEmoji(choice.id, choice.emoji);
              const isSelected = selectedChoice === choice.id;
              const showCorrect =
                scene.type === "quiz" &&
                isSelected &&
                choice.correct &&
                quizFeedback === "correct";
              const showWrong =
                scene.type === "quiz" &&
                isSelected &&
                !choice.correct &&
                quizFeedback === "wrong";

              return (
                <motion.button
                  key={choice.id}
                  type="button"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onChoice(choice.id, choice.correct)}
                  className={`touch-target min-h-[44px] flex-1 rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition-all sm:min-h-[48px] sm:rounded-2xl sm:px-4 sm:text-base ${
                    showCorrect
                      ? "border-accent/50 bg-accent/20 text-white shadow-[0_0_16px_rgba(133,212,184,0.25)]"
                      : showWrong
                        ? "border-primary/40 bg-primary/10 text-white/80"
                        : isSelected
                          ? "border-white/30 bg-white/10 text-white"
                          : "border-white/10 bg-white/5 text-white/85 hover:border-white/25 hover:shadow-[0_0_12px_rgba(255,255,255,0.06)]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {choiceEmoji && (
                      <span className="text-lg sm:text-xl">{choiceEmoji}</span>
                    )}
                    <span className="line-clamp-2">{label}</span>
                  </span>
                </motion.button>
              );
            })}
          </div>
          {quizFeedback === "correct" && (
            <p className="mt-1.5 text-center text-xs font-semibold text-accent sm:text-sm">
              ⭐ {t(language, "greatChoice")}
            </p>
          )}
          {facilitatorPrompt && (
            <p className="mt-1.5 line-clamp-1 text-[10px] italic text-white/40">
              {facilitatorPrompt}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function SplitPanel({
  panel,
  language,
  compact,
}: {
  panel: NonNullable<StoryScene["split"]>["left"];
  language: Language;
  compact?: boolean;
}) {
  const title = localized(language, panel.titleHi, panel.titleEn);
  const items = usesEnglishContent(language) ? panel.itemsEn : panel.itemsHi;
  const isRisky = panel.tone === "risky";

  return (
    <div
      className={`rounded-xl border p-2.5 sm:rounded-2xl sm:p-3 ${
        isRisky
          ? "border-stone-500/30 bg-stone-900/40 text-stone-200"
          : "border-emerald-500/30 bg-emerald-950/40 text-emerald-100"
      }`}
    >
      <p className={`font-semibold ${compact ? "text-xs sm:text-sm" : ""}`}>
        {title}
      </p>
      <ul
        className={`mt-1.5 space-y-1 ${compact ? "text-[11px] sm:text-xs" : "text-sm"}`}
      >
        {items.map((item) => (
          <li key={item} className="flex items-start gap-1.5">
            <span>{isRisky ? "⚠️" : "✓"}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StoryEndingContent({
  story,
  scene,
  title,
  language,
  onExit,
  onComplete,
}: {
  story: BranchingStory;
  scene: StoryScene;
  title: string;
  language: Language;
  onExit: () => void;
  onComplete: () => void;
}) {
  const narrative = localized(language, scene.narrativeHi, scene.narrativeEn);
  const badge = scene.badge;
  const endingMedia = resolveSceneMedia(scene);
  const facilitatorPrompts = usesEnglishContent(language)
    ? story.facilitatorPromptsEn
    : story.facilitatorPromptsHi;

  useAutoNarrate(`${story.id}-ending`, narrative, title);

  useEffect(() => {
    const timer = setTimeout(onComplete, 5000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onComplete}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onComplete();
      }}
      className="flex h-[min(82dvh,720px)] w-[min(92vw,640px)] cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl sm:rounded-3xl sm:p-6"
    >
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden text-center">
        <StoryReactionMedia
          emoji={badge?.emoji ?? endingMedia.emoji}
          reaction={endingMedia.reaction}
          gif={endingMedia.gif}
          size="lg"
        />
        {badge && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-3 rounded-2xl border border-accent/30 bg-accent/10 px-6 py-4 sm:mb-4 sm:px-8 sm:py-5"
          >
            <p className="text-lg font-bold text-white sm:text-xl">
              {localized(language, badge.labelHi, badge.labelEn)}
            </p>
          </motion.div>
        )}
        <h2 className="text-lg font-semibold text-white sm:text-xl">
          {t(language, "storyComplete")}
        </h2>
        <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-white/75 sm:text-base">
          {narrative}
        </p>
        {facilitatorPrompts && facilitatorPrompts.length > 0 && (
          <ul className="mt-3 max-h-[20vh] space-y-1 overflow-hidden text-left text-[11px] text-white/50 sm:text-xs">
            {facilitatorPrompts.slice(0, 3).map((prompt) => (
              <li key={prompt} className="flex gap-1.5">
                <span>•</span>
                <span className="line-clamp-2">{prompt}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="shrink-0 pt-3 text-center text-[10px] text-white/35 sm:text-xs">
        {usesEnglishContent(language)
          ? "Continuing automatically… tap to finish"
          : "अपने आप आगे बढ़ रहा है… tap करें"}
      </p>
    </div>
  );
}
