"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  label?: string;
}

export function ProgressBar({
  value,
  max = 100,
  className,
  label,
}: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <p className="mb-2 text-sm text-muted">{label}</p>
      )}
      <div className="h-3 overflow-hidden rounded-full bg-white/60">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
