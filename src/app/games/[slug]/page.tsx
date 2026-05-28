"use client";

import { use } from "react";
import { GamePlayer } from "@/components/games/GamePlayer";
import { AmbientBackground } from "@/components/ambient/AmbientBackground";
import { useAppStore } from "@/stores/app-store";
import { useCatalogStore } from "@/stores/catalog-store";
import { t } from "@/lib/i18n/translations";
import { AppControls } from "@/components/layout/AppControls";
import { CatalogLoader } from "@/components/ui/CatalogLoader";
import { AppHeader } from "@/components/layout/AppHeader";

export default function GamePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const language = useAppStore((s) => s.language);
  const getGameBySlug = useCatalogStore((s) => s.getGameBySlug);

  if (slug === "toothstars") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-primary/5">
        <AppHeader showBack backHref="/games" title="ToothStars" />
        <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center px-4 py-8">
          <div className="w-full rounded-3xl border border-white/60 bg-white/85 p-6 text-center shadow-[var(--safe-shadow)] backdrop-blur-sm">
            <p className="text-lg font-semibold text-foreground">
              ToothStars cannot be embedded here.
            </p>
            <p className="mt-2 text-sm text-muted">
              This website blocks iframe embedding. Open it in a new tab to play.
            </p>
            <a
              href="https://toothstars.itch.io/game"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3 font-medium text-white transition-colors hover:bg-primary-dark"
            >
              Play ToothStars
            </a>
          </div>
        </div>
      </div>
    );
  }

  const game = getGameBySlug(slug);

  if (!game) {
    return (
      <CatalogLoader>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
          <AppControls />
          <p>{t(language, "gameNotFound")}</p>
        </div>
      </CatalogLoader>
    );
  }

  return (
    <div className="relative min-h-screen">
      <AmbientBackground intensity="low" />
      <GamePlayer game={game} />
    </div>
  );
}
