"use client";

import { useAppStore } from "@/stores/app-store";
import { cn } from "@/lib/utils";

export function VoiceCommandToggle({ className }: { className?: string }) {
  const role = useAppStore((s) => s.role);
  const enabled = useAppStore((s) => s.voiceCommandsEnabled);
  const setEnabled = useAppStore((s) => s.setVoiceCommandsEnabled);

  if (!role) return null;

  return (
    <button
      type="button"
      onClick={() => setEnabled(!enabled)}
      className={cn(
        "touch-target flex h-11 w-11 items-center justify-center rounded-xl border shadow-sm transition-colors",
        enabled
          ? "border-primary/30 bg-primary/20 text-primary"
          : "border-white/70 bg-white/85 text-muted hover:bg-white",
        className
      )}
      aria-pressed={enabled}
      aria-label={enabled ? "Voice commands on" : "Voice commands off"}
      title={enabled ? "Voice commands on" : "Voice commands off"}
    >
      {enabled ? "🎙️" : "🎤"}
    </button>
  );
}
