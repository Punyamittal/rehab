"use client";

import { useState } from "react";
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
import { AppControls } from "@/components/layout/AppControls";
import { buildNarrationScript } from "@/lib/narration/speech";
import { buildChoicesNarration } from "@/lib/narration/question-narration";
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

  const goNext = () => {
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
  };

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
  const choicesPart =
    slide.type === "quiz" && slide.choices
      ? buildChoicesNarration(language, slide.choices)
      : "";
  const narrationText = buildNarrationScript(title, body, choicesPart);

  useAutoNarrate(`${slideKey}-${language}`, narrationText);

  return (
    <Card className="min-h-[280px]">
      <div className="mb-4 flex items-start justify-between gap-4">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <NarrationButton text={narrationText} />
      </div>

      <p className="text-lg leading-relaxed text-foreground/90">{body}</p>

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
