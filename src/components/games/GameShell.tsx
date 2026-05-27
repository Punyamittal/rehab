"use client";

import Link from "next/link";
import type { GameDefinition } from "@/types";
import { useAppStore } from "@/stores/app-store";
import { localized } from "@/lib/i18n/content";
import { t } from "@/lib/i18n/translations";
import { AppControls } from "@/components/layout/AppControls";

interface GameShellProps {
  game: GameDefinition;
  score?: number;
  maxScore?: number;
  children: React.ReactNode;
}

export function GameShell({ game, score, maxScore, children }: GameShellProps) {
  const language = useAppStore((s) => s.language);
  const title = localized(language, game.titleHi, game.titleEn);

  const pct =
    score !== undefined && maxScore !== undefined && maxScore > 0
      ? Math.round((score / maxScore) * 100)
      : null;

  return (
    <div className="relative min-h-screen pb-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 top-20 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -left-16 bottom-32 h-48 w-48 rounded-full bg-accent/15 blur-3xl" />
      </div>

      <div className="sticky top-0 z-10 border-b border-white/50 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-lg">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <Link
            href="/games"
            className="touch-target shrink-0 rounded-2xl border border-white/60 bg-white/90 px-4 py-2 font-medium shadow-sm transition-colors hover:bg-white"
          >
            ← {t(language, "back")}
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-bold">
              {game.emoji} {title}
            </p>
            {score !== undefined && maxScore !== undefined && (
              <div className="mt-1 flex items-center gap-2">
                <div className="h-1.5 flex-1 max-w-[120px] overflow-hidden rounded-full bg-white/60">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                    style={{ width: `${pct ?? 0}%` }}
                  />
                </div>
                <p className="text-xs font-semibold tabular-nums text-muted">
                  {score}/{maxScore}
                </p>
              </div>
            )}
          </div>
          <AppControls />
        </div>
      </div>
      <div className="relative mx-auto max-w-2xl px-4 py-6">{children}</div>
    </div>
  );
}
