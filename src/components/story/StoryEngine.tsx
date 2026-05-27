"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BranchingStory, StoryNode } from "@/types";
import { useAppStore } from "@/stores/app-store";
import { useNarration, useAutoNarrate } from "@/hooks/useNarration";
import { buildNarrationScript } from "@/lib/narration/speech";
import { buildChoicesNarration } from "@/lib/narration/question-narration";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AmbientBackground } from "@/components/ambient/AmbientBackground";
import { localized } from "@/lib/i18n/content";
import { t } from "@/lib/i18n/translations";
import type { Language } from "@/types";
import { NarrationButton } from "@/components/audio/NarrationButton";
import { InteractiveStoryPlayer } from "@/components/story/InteractiveStoryPlayer";
import { AppControls } from "@/components/layout/AppControls";

interface StoryEngineProps {
  story: BranchingStory;
  onComplete: () => void;
  onExit: () => void;
}

export function StoryEngine({ story, onComplete, onExit }: StoryEngineProps) {
  if (story.format === "interactive" && story.scenes?.length) {
    return (
      <InteractiveStoryPlayer
        story={story}
        onComplete={onComplete}
        onExit={onExit}
      />
    );
  }

  const language = useAppStore((s) => s.language);
  const { stop } = useNarration();
  const [currentNodeId, setCurrentNodeId] = useState(story.startNodeId);
  const [history, setHistory] = useState<string[]>([]);

  const node: StoryNode = story.nodes[currentNodeId];
  const title = localized(language, story.titleHi, story.titleEn);
  const narrative = localized(language, node.narrativeHi, node.narrativeEn);

  const handleChoice = (nextNodeId: string) => {
    stop();
    setHistory((h) => [...h, currentNodeId]);
    setCurrentNodeId(nextNodeId);
  };

  const handleBack = () => {
    stop();
    if (history.length === 0) {
      onExit();
      return;
    }
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setCurrentNodeId(prev);
  };

  if (node.isEnding) {
    const outcome = localized(language, node.outcomeHi ?? "", node.outcomeEn ?? "");
    const endingText = outcome
      ? buildNarrationScript(narrative, outcome)
      : narrative;

    return (
      <StoryEnding
        storyId={story.id}
        nodeId={currentNodeId}
        title={title}
        narrative={narrative}
        outcome={outcome}
        endingText={endingText}
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
    );
  }

  return (
    <StoryScene
      storyId={story.id}
      nodeId={currentNodeId}
      title={title}
      narrative={narrative}
      node={node}
      language={language}
      onBack={handleBack}
      onChoice={handleChoice}
    />
  );
}

function StoryScene({
  storyId,
  nodeId,
  title,
  narrative,
  node,
  language,
  onBack,
  onChoice,
}: {
  storyId: string;
  nodeId: string;
  title: string;
  narrative: string;
  node: StoryNode;
  language: Language;
  onBack: () => void;
  onChoice: (nextNodeId: string) => void;
}) {
  const choicesPart = node.choices?.length
    ? buildChoicesNarration(
        language,
        node.choices.map((c) => ({
          labelHi: c.labelHi,
          labelEn: c.labelEn,
        }))
      )
    : "";
  const fullNarration = buildNarrationScript(title, narrative, choicesPart);

  useAutoNarrate(`${storyId}-${nodeId}-${language}`, fullNarration);

  return (
    <div className="relative min-h-screen pb-24">
      <AmbientBackground intensity="medium" />

      <div className="sticky top-0 z-10 flex items-center justify-between gap-2 px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="touch-target rounded-2xl bg-white/80 px-4 py-2"
        >
          ← {t(language, "back")}
        </button>
        <AppControls />
      </div>

      <div className="mx-auto max-w-xl px-4 py-4">
        <div className="mb-4 flex items-center justify-between gap-2">
          <p className="text-sm text-muted">{title}</p>
          <NarrationButton text={fullNarration} size="sm" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={nodeId}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border-2 border-white/80">
              <p className="text-xl leading-relaxed md:text-2xl">{narrative}</p>

              {node.choices && (
                <div className="mt-8 flex flex-col gap-3">
                  {node.choices.map((choice, i) => (
                    <motion.button
                      key={choice.id}
                      type="button"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onChoice(choice.nextNodeId)}
                      className="touch-target w-full rounded-2xl border-2 border-primary/30 bg-gradient-to-r from-white to-primary/5 px-5 py-4 text-left text-lg font-medium hover:border-primary/50"
                    >
                      {localized(language, choice.labelHi, choice.labelEn)}
                    </motion.button>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function StoryEnding({
  storyId,
  nodeId,
  title,
  narrative,
  outcome,
  endingText,
  language,
  onExit,
  onComplete,
}: {
  storyId: string;
  nodeId: string;
  title: string;
  narrative: string;
  outcome?: string;
  endingText: string;
  language: Language;
  onExit: () => void;
  onComplete: () => void;
}) {
  useAutoNarrate(`${storyId}-${nodeId}-end-${language}`, endingText, title);

  return (
    <div className="relative min-h-screen px-4 py-8">
      <AmbientBackground />
      <div className="absolute right-4 top-4">
        <AppControls />
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-xl"
      >
        <Card>
          <div className="mb-4 flex items-start justify-between gap-2">
            <div>
              <p className="text-sm text-muted">{title}</p>
              <h2 className="text-2xl font-semibold">
                {t(language, "storyComplete")}
              </h2>
            </div>
            <NarrationButton text={endingText} size="sm" />
          </div>
          <p className="mb-4 text-lg leading-relaxed">{narrative}</p>
          {outcome && (
            <div className="rounded-2xl bg-accent/20 p-4">
              <p className="text-sm font-medium text-muted">
                {t(language, "learningTakeaway")}
              </p>
              <p className="mt-1 text-lg">{outcome}</p>
            </div>
          )}
          <div className="mt-8 flex gap-4">
            <Button variant="outline" onClick={onExit}>
              {t(language, "back")}
            </Button>
            <Button onClick={onComplete}>
              {t(language, "finish")}
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
