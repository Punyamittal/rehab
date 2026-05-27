"use client";

import { use } from "react";
import { getGameBySlug } from "@/data/games";
import { GamePlayer } from "@/components/games/GamePlayer";
import { AmbientBackground } from "@/components/ambient/AmbientBackground";
import { useAppStore } from "@/stores/app-store";
import { t } from "@/lib/i18n/translations";
import { AppControls } from "@/components/layout/AppControls";

export default function GamePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const language = useAppStore((s) => s.language);
  const game = getGameBySlug(slug);

  if (!game) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <AppControls />
        <p>{t(language, "gameNotFound")}</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <AmbientBackground intensity="low" />
      <GamePlayer game={game} />
    </div>
  );
}
