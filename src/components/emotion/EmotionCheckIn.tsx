"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EMOTION_OPTIONS } from "@/data/emotions";
import { useAppStore } from "@/stores/app-store";
import { t } from "@/lib/i18n/translations";
import { useAutoNarrate } from "@/hooks/useNarration";
import {
  buildChoicesNarration,
  buildLocalizedNarration,
} from "@/lib/narration/question-narration";
import { Button } from "@/components/ui/Button";
import { AppControls } from "@/components/layout/AppControls";
import { NarrationButton } from "@/components/audio/NarrationButton";
import { localized } from "@/lib/i18n/content";
import type { CheckType, EmotionType } from "@/types";

interface EmotionCheckInProps {
  checkType: CheckType;
  moduleId?: string;
  onComplete: (emotion: EmotionType) => void;
}

export function EmotionCheckIn({
  checkType,
  moduleId,
  onComplete,
}: EmotionCheckInProps) {
  const { language, addEmotionLog } = useAppStore();
  const [selected, setSelected] = useState<EmotionType | null>(null);

  const subtitle =
    checkType === "pre" ? t(language, "beforeModule") : t(language, "afterModule");
  const prompt = t(language, "howFeeling");
  const fullPrompt = buildLocalizedNarration(
    subtitle,
    prompt,
    buildChoicesNarration(
      language,
      EMOTION_OPTIONS.map((o) => ({
        labelHi: o.labelHi,
        labelEn: o.labelEn,
      }))
    )
  );

  useAutoNarrate(
    `checkin-${checkType}-${moduleId ?? "standalone"}-${language}`,
    fullPrompt,
    undefined,
    undefined,
    { force: true }
  );

  const handleContinue = () => {
    if (!selected) return;
    addEmotionLog({ emotion: selected, checkType, moduleId });
    onComplete(selected);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-lg px-4 py-8"
    >
      <div className="mb-4 flex justify-end">
        <AppControls />
      </div>
      <p className="mb-2 text-center text-sm text-muted">{subtitle}</p>
      <div className="mb-8 flex flex-col items-center gap-3">
        <h2 className="text-center text-2xl font-semibold md:text-3xl">
          {prompt}
        </h2>
        <NarrationButton text={fullPrompt} size="sm" />
      </div>

      <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
        {EMOTION_OPTIONS.map((opt) => (
          <motion.button
            key={opt.id}
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelected(opt.id)}
            className="touch-target flex flex-col items-center gap-2 rounded-3xl p-4 transition-all"
            style={{
              backgroundColor:
                selected === opt.id ? opt.color : "rgba(255,255,255,0.7)",
              boxShadow:
                selected === opt.id
                  ? "0 4px 20px rgba(0,0,0,0.1)"
                  : "var(--safe-shadow)",
              transform: selected === opt.id ? "scale(1.05)" : "scale(1)",
            }}
            aria-pressed={selected === opt.id}
          >
            <span className="text-4xl" role="img" aria-hidden>
              {opt.emoji}
            </span>
            <span className="text-sm font-medium">
              {localized(language, opt.labelHi, opt.labelEn)}
            </span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-10 flex justify-center"
          >
            <Button size="lg" onClick={handleContinue}>
              {t(language, "checkInContinue")} →
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
