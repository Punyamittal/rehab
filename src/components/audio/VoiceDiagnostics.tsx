"use client";

import { useState, useEffect } from "react";
import {
  isSpeechSupported,
  loadVoices,
  speakText,
  stopSpeaking,
  getAllVoices,
  getActiveVoiceLabel,
  getLastTtsEngine,
} from "@/lib/narration/speech";
import { getEdgeVoiceLabel } from "@/lib/narration/edge-voices";
import { useAppStore } from "@/stores/app-store";
import { getLanguageConfig } from "@/lib/i18n/languages";
import { t, getUiLocale } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

const SAMPLES: Record<string, string> = {
  hi: "नमस्ते! यह हिंदी में आवाज़ की जाँच है।",
  pa: "सत श्री अकाल! यह पंजाबी आवाज़ जाँच है।",
  bho: "प्रणाम! ई भोजपुरी आवाज़ जाँच बा।",
  hr: "राम राम! यो हरियाणवी आवाज़ जाँच सै।",
  en: "Hello! This is a voice test.",
};

export function VoiceDiagnostics({ className }: { className?: string }) {
  const { language, soundEnabled, setSoundEnabled } = useAppStore();
  const uiLocale = getUiLocale(language);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [status, setStatus] = useState<"idle" | "playing" | "error" | "ok">("idle");
  const [open, setOpen] = useState(false);
  const [engine, setEngine] = useState<"cloud" | "browser" | "none">("none");

  useEffect(() => {
    if (!isSpeechSupported()) return;
    loadVoices().then((v) => setVoices(v));
  }, []);

  const config = getLanguageConfig(language);
  const cloudVoice = getEdgeVoiceLabel(language);

  const test = async () => {
    if (!soundEnabled) setSoundEnabled(true);
    setIsSpeaking(true);
    setStatus("playing");
    await speakText(SAMPLES[language] ?? SAMPLES.hi, {
      language,
      onStart: () => {
        setEngine(getLastTtsEngine());
        setStatus("ok");
      },
      onEnd: () => {
        setIsSpeaking(false);
        setEngine(getLastTtsEngine());
        setStatus("ok");
      },
      onError: () => {
        setIsSpeaking(false);
        setStatus("error");
      },
    });
  };

  const stop = () => {
    stopSpeaking();
    setIsSpeaking(false);
    setStatus("idle");
    setEngine("none");
  };

  if (!isSpeechSupported()) {
    return (
      <div className={cn("rounded-2xl bg-red-50 p-4 text-sm text-red-600", className)}>
        ⚠️ Browser audio not available.
      </div>
    );
  }

  return (
    <div className={cn("rounded-3xl bg-white/80 shadow-sm", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="touch-target flex w-full items-center justify-between rounded-3xl px-5 py-4"
      >
        <span className="font-medium">
          🔊 {uiLocale === "hi" ? "आवाज़ सेटिंग और जाँच" : "Sound settings & test"}
        </span>
        <span>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="space-y-4 px-5 pb-5">
          <div className="rounded-2xl bg-accent/20 px-4 py-3 text-sm">
            <p className="font-medium text-primary">☁️ {t(uiLocale, "cloudVoice")}</p>
            <p className="mt-1 text-muted">
              {cloudVoice}
              {config.usesSharedVoice
                ? ` · ${t(uiLocale, "dialectVoiceNote")}`
                : null}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={cn(
                "h-3 w-3 rounded-full",
                status === "ok" ? "bg-green-400" :
                status === "error" ? "bg-red-400" :
                status === "playing" ? "animate-pulse bg-yellow-400" :
                "bg-gray-300"
              )}
            />
            <span className="text-sm text-muted">
              {status === "ok" &&
                (engine === "cloud"
                  ? t(uiLocale, "cloudVoiceActive")
                  : uiLocale === "hi"
                    ? "ब्राउज़र आवाज़ ✓"
                    : "Browser voice ✓")}
              {status === "error" &&
                (uiLocale === "hi" ? "समस्या — नीचे देखें" : "Error — see below")}
              {status === "playing" &&
                (uiLocale === "hi" ? "बोल रहा है…" : "Speaking…")}
              {status === "idle" &&
                (uiLocale === "hi" ? "जाँच शुरू नहीं" : "Not tested yet")}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">{uiLocale === "hi" ? "आवाज़" : "Sound"}</span>
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-medium",
                soundEnabled ? "bg-primary text-white" : "bg-gray-200 text-muted"
              )}
            >
              {soundEnabled ? "🔊 ON" : "🔇 OFF"}
            </button>
          </div>

          {status === "ok" && engine !== "none" && (
            <p className="rounded-xl bg-white/60 px-3 py-2 text-sm">
              {getActiveVoiceLabel(language)}
            </p>
          )}

          <button
            type="button"
            onClick={isSpeaking ? stop : test}
            className="touch-target w-full rounded-2xl bg-primary px-5 py-3 font-medium text-white"
          >
            {isSpeaking ? "⏹ Stop" : "▶ Test voice"}
          </button>

          {voices.length > 0 && (
            <details className="text-xs text-muted">
              <summary className="cursor-pointer py-1">
                {voices.length} browser voices (backup)
              </summary>
              <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto">
                {voices.map((v) => (
                  <li key={v.name} className="flex justify-between">
                    <span>{v.name}</span>
                    <span>{v.lang}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}

          <div className="rounded-2xl bg-yellow-50 p-4 text-xs text-yellow-900 space-y-1">
            <p className="font-semibold">
              {uiLocale === "hi" ? "पहली बार:" : "First time:"}
            </p>
            <p>
              {uiLocale === "hi"
                ? "नीचे नीली पट्टी «आवाज़ चालू करें» पर एक बार दबाएँ, फिर Test voice दबाएँ।"
                : "Tap the blue «Enable sound» bar once, then Test voice."}
            </p>
            <p>
              {uiLocale === "hi"
                ? "इंटरनेट चालू रखें — सभी भाषाओं के लिए क्लाउड आवाज़ उपयोग होती है।"
                : "Keep internet on — all languages use cloud voices."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
