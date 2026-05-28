"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LearningModule, ModuleSlide } from "@/types";
import { useAppStore } from "@/stores/app-store";
import { t } from "@/lib/i18n/translations";
import { useNarration, useAutoNarrate } from "@/hooks/useNarration";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AmbientBackground } from "@/components/ambient/AmbientBackground";
import { NarrationButton } from "@/components/audio/NarrationButton";
import { VoiceInputButton } from "@/components/audio/VoiceInputButton";
import { AppControls } from "@/components/layout/AppControls";
import { buildNarrationScript } from "@/lib/narration/speech";
import { buildChoicesNarration } from "@/lib/narration/question-narration";
import { estimateDwellMs } from "@/lib/narration/story-timing";
import { localized } from "@/lib/i18n/content";
import type { Language } from "@/types";

interface ModulePlayerProps {
  module: LearningModule;
  onComplete: () => void;
  onExit: () => void;
}

export function ModulePlayer({ module, onComplete, onExit }: ModulePlayerProps) {
  const { language, updateModuleProgress } = useAppStore();
  const { stop, speak } = useNarration();
  const [slideIndex, setSlideIndex] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState<"correct" | "wrong" | null>(
    null
  );
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  const slide = module.slides[slideIndex];
  const total = module.slides.length;
  const progress = ((slideIndex + 1) / total) * 100;

  const title = localized(language, module.titleHi, module.titleEn);
  const slideTitle = localized(language, slide.titleHi, slide.titleEn);
  const slideBody = localized(language, slide.bodyHi, slide.bodyEn);

  const goNext = useCallback(() => {
    stop();
    setQuizFeedback(null);
    setSelectedChoice(null);
    if (slideIndex < total - 1) {
      setSlideIndex((i) => i + 1);
      updateModuleProgress({
        moduleId: module.id,
        checkpointIndex: slideIndex + 1,
        completed: false,
      });
    } else {
      updateModuleProgress({
        moduleId: module.id,
        checkpointIndex: total,
        completed: true,
      });
      onComplete();
    }
  }, [module.id, onComplete, slideIndex, stop, total, updateModuleProgress]);

  const handleQuizChoice = (choiceId: string, correct?: boolean) => {
    setSelectedChoice(choiceId);
    if (correct) {
      setQuizFeedback("correct");
      void speak(t(language, "correct"), language);
    } else {
      setQuizFeedback("wrong");
      void speak(t(language, "tryAgain"), language);
    }
  };

  const canProceed =
    slide.type !== "quiz" ||
    quizFeedback === "correct" ||
    (slide.choices?.some((c) => c.id === selectedChoice && c.correct) ?? false);

  useEffect(() => {
    if (slide.type !== "quiz" || quizFeedback !== "correct") return;
    const timer = window.setTimeout(() => {
      goNext();
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [goNext, quizFeedback, slide.type]);

  useEffect(() => {
    if (slide.type !== "content") return;
    const narrationMs = estimateDwellMs(
      buildNarrationScript(slideTitle, slideBody),
      true
    );
    const timer = window.setTimeout(() => {
      goNext();
    }, 450 + narrationMs + 3000);
    return () => window.clearTimeout(timer);
  }, [goNext, slide.id, slide.type, slideBody, slideTitle]);

  return (
    <div className="relative min-h-screen pb-24">
      <AmbientBackground intensity="low" />

      <div className="sticky top-0 z-10 bg-white/40 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          <button
            type="button"
            onClick={() => {
              stop();
              onExit();
            }}
            className="touch-target rounded-2xl bg-white/80 px-4 py-2"
          >
            ← {t(language, "back")}
          </button>
          <div className="flex-1">
            <p className="text-sm font-medium">{title}</p>
            <ProgressBar value={progress} className="mt-1" />
            <p className="mt-1 text-xs text-muted">
              {slideIndex + 1} / {total}
            </p>
          </div>
          <AppControls />
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <SlideContent
              slide={slide}
              slideKey={`${module.id}-${slide.id}`}
              language={language}
              quizFeedback={quizFeedback}
              selectedChoice={selectedChoice}
              onChoice={handleQuizChoice}
            />
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex justify-end">
          {slide.type === "quiz" && quizFeedback === "wrong" ? (
            <p className="text-center text-secondary">{t(language, "tryAgain")}</p>
          ) : (
            <Button
              size="lg"
              onClick={goNext}
              disabled={slide.type === "quiz" && !canProceed}
            >
              {slideIndex === total - 1
                ? t(language, "finish")
                : `${t(language, "next")} →`}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function SlideContent({
  slide,
  slideKey,
  language,
  quizFeedback,
  selectedChoice,
  onChoice,
}: {
  slide: ModuleSlide;
  slideKey: string;
  language: Language;
  quizFeedback: "correct" | "wrong" | null;
  selectedChoice: string | null;
  onChoice: (id: string, correct?: boolean) => void;
}) {
  const title = localized(language, slide.titleHi, slide.titleEn);
  const body = localized(language, slide.bodyHi, slide.bodyEn);
  const { soundEnabled, autoNarrate } = useAppStore();
  const [activeNarrationPart, setActiveNarrationPart] = useState<string | null>(null);
  const shouldAutoNarrate = soundEnabled && (autoNarrate || slide.type === "quiz");
  const choiceLabels = useMemo(
    () =>
      slide.type === "quiz" && slide.choices
        ? slide.choices.map((c) => localized(language, c.labelHi, c.labelEn))
        : [],
    [language, slide.choices, slide.type]
  );
  const choicesPart =
    slide.type === "quiz" && choiceLabels.length
      ? buildChoicesNarration(
          language,
          slide.choices ?? []
        )
      : "";
  const narrationText = buildNarrationScript(title, body, choicesPart);
  const [autoListenTick, setAutoListenTick] = useState(0);
  const normalize = (text: string) =>
    text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").trim();

  useAutoNarrate(
    `${slideKey}-${language}`,
    narrationText,
    undefined,
    undefined,
    { force: true }
  );

  useEffect(() => {
    setActiveNarrationPart(null);
    if (!shouldAutoNarrate) return;

    const timers: number[] = [];
    let elapsed = 450;

    const queue = (key: string, text: string) => {
      const start = window.setTimeout(() => setActiveNarrationPart(key), elapsed);
      timers.push(start);
      elapsed += estimateDwellMs(text, true);
    };

    queue("title", title);
    queue("body", body);
    choiceLabels.forEach((label, index) => queue(`choice-${index}`, label));

    const clear = window.setTimeout(() => setActiveNarrationPart(null), elapsed + 120);
    timers.push(clear);

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [body, choiceLabels, shouldAutoNarrate, slideKey, title]);

  useEffect(() => {
    if (slide.type !== "quiz" || !slide.choices?.length) return;
    const delayMs = shouldAutoNarrate
      ? estimateDwellMs(narrationText, true) + 700
      : 450;
    const timer = window.setTimeout(
      () => setAutoListenTick((n) => n + 1),
      delayMs
    );
    return () => window.clearTimeout(timer);
  }, [narrationText, shouldAutoNarrate, slide.choices, slide.type, slideKey]);

  return (
    <Card className="min-h-[280px]">
      <div className="mb-4 flex items-start justify-between gap-4">
        <h2
          className={`rounded-xl px-2 py-1 text-2xl font-semibold transition-colors ${
            activeNarrationPart === "title" ? "bg-primary/20 ring-1 ring-primary/30" : ""
          }`}
        >
          {title}
        </h2>
        <div className="flex items-center gap-2">
          <NarrationButton text={narrationText} />
          {slide.type === "quiz" && slide.choices && (
            <VoiceInputButton
              language={language}
              autoStartKey={`${slideKey}-${autoListenTick}`}
              onResult={(transcript) => {
                const heard = normalize(transcript);
                const match = slide.choices?.find((choice) =>
                  normalize(localized(language, choice.labelHi, choice.labelEn)).includes(
                    heard
                  ) || heard.includes(
                    normalize(localized(language, choice.labelHi, choice.labelEn))
                  )
                );
                if (match) onChoice(match.id, match.correct);
              }}
            />
          )}
        </div>
      </div>

      <p
        className={`rounded-xl px-2 py-1 text-lg leading-relaxed text-foreground/90 transition-colors ${
          activeNarrationPart === "body" ? "bg-secondary/18 ring-1 ring-secondary/30" : ""
        }`}
      >
        {body}
      </p>

      {slide.type === "quiz" && slide.choices && (
        <div className="mt-6 flex flex-col gap-3">
          {slide.choices.map((choice) => {
            const label = localized(language, choice.labelHi, choice.labelEn);
            const isSelected = selectedChoice === choice.id;
            return (
              <motion.button
                key={choice.id}
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => onChoice(choice.id, choice.correct)}
                className={`touch-target w-full rounded-2xl border-2 px-5 py-4 text-left text-lg transition-colors ${
                  isSelected
                    ? choice.correct
                      ? "border-accent bg-accent/20"
                      : "border-primary/50 bg-primary/10"
                    : activeNarrationPart === `choice-${slide.choices?.findIndex((c) => c.id === choice.id) ?? -1}`
                      ? "border-secondary/45 bg-secondary/20"
                      : "border-white bg-white/60 hover:bg-white"
                }`}
              >
                {label}
              </motion.button>
            );
          })}
          {quizFeedback === "correct" && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-lg font-medium text-accent"
            >
              ✨ {t(language, "correct")}
            </motion.p>
          )}
        </div>
      )}

      {slide.type === "checkpoint" && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mt-6 text-center text-5xl"
        >
          ⭐
        </motion.div>
      )}
    </Card>
  );
}
