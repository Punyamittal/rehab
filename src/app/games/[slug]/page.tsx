"use client";

import { use } from "react";
import { GamePlayer } from "@/components/games/GamePlayer";
import { AmbientBackground } from "@/components/ambient/AmbientBackground";
import { useAppStore } from "@/stores/app-store";
import { useCatalogStore } from "@/stores/catalog-store";
import { t } from "@/lib/i18n/translations";
import { AppControls } from "@/components/layout/AppControls";
import { CatalogLoader } from "@/components/ui/CatalogLoader";

export default function GamePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const language = useAppStore((s) => s.language);
  const getGameBySlug = useCatalogStore((s) => s.getGameBySlug);
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
