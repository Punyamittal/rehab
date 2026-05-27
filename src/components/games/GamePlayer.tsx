"use client";

import type { GameDefinition } from "@/types";
import { ScenarioHeroGame } from "./ScenarioHeroGame";
import { EmotionMatchGame } from "./EmotionMatchGame";
import { SafeOrNotGame } from "./SafeOrNotGame";
import { CalmBreathGame } from "./CalmBreathGame";
import { HabitMatchGame } from "./HabitMatchGame";

export function GamePlayer({ game }: { game: GameDefinition }) {
  switch (game.type) {
    case "scenario_hero":
      return <ScenarioHeroGame game={game} />;
    case "emotion_match":
      return <EmotionMatchGame game={game} />;
    case "safe_or_not":
      return <SafeOrNotGame game={game} />;
    case "calm_breath":
      return <CalmBreathGame game={game} />;
    case "habit_match":
      return <HabitMatchGame game={game} />;
    default:
      return <p>Game not found</p>;
  }
}
