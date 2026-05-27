"use client";

import { useEffect, useRef } from "react";
import { resolveHoverReadable } from "@/lib/narration/hover-read";
import { isSpeechSupported, speakText, stopSpeaking } from "@/lib/narration/speech";
import { useAppStore } from "@/stores/app-store";

const HOVER_DELAY_MS = 400;

/**
 * Reads aloud the text under the mouse cursor (or keyboard focus) when sound is on.
 */
export function HoverReadAloud() {
  const { language, soundEnabled } = useAppStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSpokenRef = useRef("");
  const requestIdRef = useRef(0);
  const activeTargetRef = useRef<EventTarget | null>(null);

  useEffect(() => {
    if (!soundEnabled || !isSpeechSupported()) return;

    const scheduleRead = (target: EventTarget | null) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      activeTargetRef.current = target;

      timerRef.current = setTimeout(() => {
        if (activeTargetRef.current !== target) return;

        const text = resolveHoverReadable(target);
        if (!text || text === lastSpokenRef.current) return;

        lastSpokenRef.current = text;
        const id = ++requestIdRef.current;

        void speakText(text, {
          language,
          onEnd: () => {
            if (id === requestIdRef.current) {
              lastSpokenRef.current = "";
            }
          },
          onError: () => {
            if (id === requestIdRef.current) {
              lastSpokenRef.current = "";
            }
          },
        });
      }, HOVER_DELAY_MS);
    };

    const cancelScheduled = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      activeTargetRef.current = null;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      scheduleRead(e.target);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      scheduleRead(e.target);
    };

    const onFocusIn = (e: FocusEvent) => {
      scheduleRead(e.target);
    };

    const onPointerLeave = (e: PointerEvent) => {
      if (e.target === document.documentElement) {
        cancelScheduled();
      }
    };

    const onBlur = () => {
      cancelScheduled();
    };

    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.addEventListener("focusin", onFocusIn, true);
    document.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("blur", onBlur);

    return () => {
      cancelScheduled();
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("focusin", onFocusIn, true);
      document.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("blur", onBlur);
      stopSpeaking();
      lastSpokenRef.current = "";
    };
  }, [language, soundEnabled]);

  return null;
}
