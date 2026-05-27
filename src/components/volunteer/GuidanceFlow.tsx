"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { GuidanceSession } from "@/types";
import { useAppStore } from "@/stores/app-store";
import { t } from "@/lib/i18n/translations";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { NarrationButton } from "@/components/audio/NarrationButton";
import { AppControls } from "@/components/layout/AppControls";
import { useAutoNarrate } from "@/hooks/useNarration";
import { buildNarrationScript } from "@/lib/narration/speech";
import { localized } from "@/lib/i18n/content";

interface GuidanceFlowProps {
  session: GuidanceSession;
}

export function GuidanceFlow({ session }: GuidanceFlowProps) {
  const language = useAppStore((s) => s.language);
  const [stepIndex, setStepIndex] = useState(0);

  const step = session.steps[stepIndex];
  const total = session.steps.length;
  const progress = ((stepIndex + 1) / total) * 100;

  const title = localized(language, session.titleHi, session.titleEn);
  const stepTitle = localized(language, step.titleHi, step.titleEn);
  const stepPrompt = localized(language, step.promptHi, step.promptEn);
  const stepTip = localized(language, step.tipHi ?? "", step.tipEn ?? "");
  const narrationText = buildNarrationScript(
    stepTitle,
    stepPrompt,
    stepTip ?? undefined
  );

  useAutoNarrate(`${session.id}-${step.id}`, narrationText, stepTitle);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-4 flex justify-end">
        <AppControls />
      </div>
      <h1 className="mb-2 text-2xl font-bold">{title}</h1>
      <p className="mb-6 text-muted">
        {session.durationMinutes} {t(language, "minutes")} · {t(language, "step")}{" "}
        {stepIndex + 1}/{total}
      </p>

      <ProgressBar value={progress} className="mb-8" />

      <motion.div
        key={step.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Card>
          <div className="mb-4 flex items-start justify-between gap-2">
            <h2 className="text-xl font-semibold">{stepTitle}</h2>
            <NarrationButton text={narrationText} size="sm" />
          </div>

          <div className="mb-4 rounded-2xl bg-secondary/10 p-4">
            <p className="text-sm font-medium text-secondary">
              💬 {t(language, "discussion")}
            </p>
            <p className="mt-2 text-lg">
              {stepPrompt}
            </p>
          </div>

          <p className="text-sm text-muted">
            ⏱ {t(language, "timing")}: {step.durationMinutes}{" "}
            {t(language, "minutes")}
          </p>

          {(step.tipHi || step.tipEn) && (
            <div className="mt-4 rounded-2xl bg-accent/15 p-4">
              <p className="text-sm font-medium">💡 {t(language, "tip")}</p>
              <p className="mt-1">
                {stepTip}
              </p>
            </div>
          )}
        </Card>
      </motion.div>

      <div className="mt-8 flex justify-between gap-4">
        <Button
          variant="outline"
          disabled={stepIndex === 0}
          onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
        >
          ← {t(language, "previous")}
        </Button>
        <Button
          onClick={() =>
            setStepIndex((i) => Math.min(total - 1, i + 1))
          }
          disabled={stepIndex === total - 1}
        >
          {t(language, "next")} →
        </Button>
      </div>
    </div>
  );
}
