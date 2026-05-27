import type { SupabaseClient } from "@supabase/supabase-js";
import { LEARNING_MODULES } from "@/data/modules";
import { GAMES } from "@/data/games";
import { BRANCHING_STORIES } from "@/data/stories";
import { getCentreId } from "@/lib/supabase/env";

/** One-time server seed when Supabase tables are empty (content lives in DB after this). */
export async function ensureCatalogSeeded(admin: SupabaseClient): Promise<void> {
  const centreId = getCentreId();

  const { count: centreCount } = await admin
    .from("centres")
    .select("*", { count: "exact", head: true });
  if (!centreCount) {
    await admin.from("centres").insert({
      id: centreId,
      name: "REHAB Centre",
      location: "India",
    });
  }

  const { count: moduleCount } = await admin
    .from("modules")
    .select("*", { count: "exact", head: true });

  if (!moduleCount) {
    await admin.from("modules").insert(
      LEARNING_MODULES.map((mod, index) => ({
        slug: mod.slug,
        title_hi: mod.titleHi,
        title_en: mod.titleEn,
        description_hi: mod.descriptionHi,
        description_en: mod.descriptionEn,
        topic: mod.topic,
        duration_minutes: mod.durationMinutes,
        emoji: mod.emoji,
        content_json: mod,
        is_published: true,
        sort_order: index + 1,
      }))
    );
  }

  const { count: gameCount } = await admin
    .from("games")
    .select("*", { count: "exact", head: true });

  if (!gameCount) {
    await admin.from("games").insert(
      GAMES.map((game) => ({
        slug: game.id,
        game_type: game.type,
        title_hi: game.titleHi,
        title_en: game.titleEn,
        description_hi: game.descriptionHi,
        description_en: game.descriptionEn,
        topic: game.topic,
        duration_minutes: game.durationMinutes,
        emoji: game.emoji,
        skills_hi: game.skillsHi,
        skills_en: game.skillsEn,
        config_json: game,
        is_published: true,
      }))
    );
  }

  const { count: storyCount } = await admin
    .from("stories")
    .select("*", { count: "exact", head: true });

  if (!storyCount) {
    await admin.from("stories").insert(
      BRANCHING_STORIES.map((story) => ({
        slug: story.slug,
        title_hi: story.titleHi,
        title_en: story.titleEn,
        description_hi: story.descriptionHi,
        description_en: story.descriptionEn,
        topic: story.topic,
        duration_minutes: story.durationMinutes,
        emoji: story.emoji,
        format: story.format,
        start_node_id: story.startNodeId,
        graph_json: story,
        scenes_json: story.scenes ?? null,
        facilitator_prompts_hi: story.facilitatorPromptsHi ?? null,
        facilitator_prompts_en: story.facilitatorPromptsEn ?? null,
        is_published: true,
      }))
    );
  }
}
