"use client";

import { useState } from "react";
import { useAppStore } from "@/stores/app-store";
import { cn } from "@/lib/utils";

export function HeardButton({ className }: { className?: string }) {
  const role = useAppStore((s) => s.role);
  const heard = useAppStore((s) => s.voiceLastHeard);
  const [open, setOpen] = useState(false);

  if (!role) return null;

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="touch-target rounded-xl border border-primary/20 bg-white/85 px-2.5 py-1.5 text-xs font-semibold text-primary shadow-sm hover:bg-white"
        aria-label="Show heard command"
        title="Show heard command"
      >
        Heard
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-40 w-56 rounded-xl border border-primary/15 bg-white/95 p-2 text-xs text-foreground shadow-[0_10px_28px_rgba(74,55,40,0.18)]">
          {heard ? `Last heard: ${heard}` : "No command heard yet."}
        </div>
      )}
    </div>
  );
}
