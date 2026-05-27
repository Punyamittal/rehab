import type { StoryCharacter, StoryReactionMotion, StoryScene } from "@/types";

export const CHARACTER_DEFAULT_EMOJI: Record<
  StoryCharacter,
  { emoji: string; reaction: StoryReactionMotion }
> = {
  narrator: { emoji: "🎙️", reaction: "float" },
  asha: { emoji: "😔", reaction: "shake" },
  tanya: { emoji: "😒", reaction: "wobble" },
  riya: { emoji: "💚", reaction: "pulse" },
};

export const SCENE_TYPE_EMOJI: Partial<
  Record<StoryScene["type"], { emoji: string; reaction: StoryReactionMotion }>
> = {
  caption: { emoji: "✨", reaction: "sparkle" },
  interactive: { emoji: "🤔", reaction: "bounce" },
  quiz: { emoji: "❓", reaction: "bounce" },
  split: { emoji: "⚖️", reaction: "float" },
  learning: { emoji: "📌", reaction: "pulse" },
  ending: { emoji: "🛡️", reaction: "sparkle" },
  cinematic: { emoji: "🎬", reaction: "float" },
};

export interface SceneMedia {
  emoji: string;
  reaction: StoryReactionMotion;
  gif?: string;
}

export function resolveSceneMedia(scene: StoryScene): SceneMedia {
  if (scene.emoji || scene.reaction || scene.gif) {
    const fallback =
      (scene.character && CHARACTER_DEFAULT_EMOJI[scene.character]) ||
      SCENE_TYPE_EMOJI[scene.type] ||
      CHARACTER_DEFAULT_EMOJI.narrator;
    return {
      emoji: scene.emoji ?? fallback.emoji,
      reaction: scene.reaction ?? fallback.reaction,
      gif: scene.gif,
    };
  }

  if (scene.character) {
    return {
      emoji: CHARACTER_DEFAULT_EMOJI[scene.character].emoji,
      reaction: CHARACTER_DEFAULT_EMOJI[scene.character].reaction,
    };
  }

  const byType = SCENE_TYPE_EMOJI[scene.type];
  if (byType) return { ...byType };

  return CHARACTER_DEFAULT_EMOJI.narrator;
}

export const CHOICE_EMOJI: Record<string, string> = {
  yes: "🙋",
  no: "🚫",
  maybe: "🤷",
  try: "😬",
  refuse: "✋",
  leave: "🚶",
  help: "🆘",
  pressure: "😰",
  listen: "👂",
  mock: "😔",
  unsafe: "⚠️",
  fear: "😨",
  anger: "😠",
  confusion: "😕",
  confidence: "💪",
  ignore: "🙈",
  support: "🤝",
  inform: "📢",
};

export function getChoiceEmoji(choiceId: string, explicit?: string): string | undefined {
  return explicit ?? CHOICE_EMOJI[choiceId];
}
