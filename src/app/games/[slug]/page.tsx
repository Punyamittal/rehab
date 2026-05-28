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
        <div className="mx-auto max-w-6xl px-4 pb-6 pt-4">
          <div className="mb-3 rounded-2xl border border-primary/15 bg-white/80 px-4 py-3 text-sm text-muted">
            External educational game (opens inside the app).
          </div>
          <div className="overflow-hidden rounded-3xl border border-white/60 bg-white shadow-[var(--safe-shadow)]">
            <iframe
              src="https://toothstars.itch.io/game"
              title="ToothStars"
              className="h-[78vh] w-full"
              allow="fullscreen; autoplay"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
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
