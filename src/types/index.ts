export type UserRole = "student" | "facilitator" | "volunteer" | "admin";
/** Voice + UI language (Indic dialects use Hindi learning content). */
export type Language = "hi" | "en" | "pa" | "bho" | "hr";
export type ModuleTopic =
  | "addiction"
  | "communication"
  | "hygiene"
  | "emotional_intelligence"
  | "confidence"
  | "health"
  | "safety"
  | "peer_pressure"
  | "self_esteem";

export type EmotionType =
  | "happy"
  | "anxious"
  | "sad"
  | "angry"
  | "confused"
  | "calm";

export type CheckType = "pre" | "post";

export interface Student {
  id: string;
  alias: string;
  avatarEmoji: string;
  centreId: string;
}

export interface ModuleSlide {
  id: string;
  type: "content" | "quiz" | "checkpoint";
  titleHi: string;
  titleEn: string;
  bodyHi: string;
  bodyEn: string;
  image?: string;
  choices?: { id: string; labelHi: string; labelEn: string; correct?: boolean }[];
  narrationHint?: string;
}

export interface LearningModule {
  id: string;
  slug: string;
  titleHi: string;
  titleEn: string;
  descriptionHi: string;
  descriptionEn: string;
  topic: ModuleTopic;
  durationMinutes: number;
  emoji: string;
  slides: ModuleSlide[];
}

export type StoryCharacter = "narrator" | "asha" | "riya" | "tanya";

export type StorySceneType =
  | "scene"
  | "caption"
  | "interactive"
  | "quiz"
  | "split"
  | "learning"
  | "cinematic"
  | "ending";

export type StoryReactionMotion =
  | "float"
  | "pulse"
  | "shake"
  | "sparkle"
  | "bounce"
  | "wobble";

export interface CinematicDialogueLine {
  character: Exclude<StoryCharacter, "narrator">;
  textHi: string;
  textEn: string;
  emoji?: string;
  /** CSS motion preset (gif-like loop) */
  reaction?: StoryReactionMotion;
  /** Optional path e.g. /reactions/support.gif */
  gif?: string;
}

export interface CinematicSceneConfig {
  settingHi: string;
  settingEn: string;
  dialogues: CinematicDialogueLine[];
}

export interface StorySceneChoice {
  id: string;
  labelHi: string;
  labelEn: string;
  correct?: boolean;
  emoji?: string;
}

export interface StorySplitPanel {
  titleHi: string;
  titleEn: string;
  itemsHi: string[];
  itemsEn: string[];
  tone: "risky" | "safe";
}

export interface StoryChoice {
  id: string;
  labelHi: string;
  labelEn: string;
  nextNodeId: string;
  emotionalTag?: EmotionType;
  takeawayHi?: string;
  takeawayEn?: string;
}

export interface StoryNode {
  id: string;
  narrativeHi: string;
  narrativeEn: string;
  image?: string;
  choices?: StoryChoice[];
  isEnding?: boolean;
  outcomeHi?: string;
  outcomeEn?: string;
}

export interface StoryScene {
  id: string;
  type: StorySceneType;
  character?: StoryCharacter;
  narrativeHi: string;
  narrativeEn: string;
  captionHi?: string;
  captionEn?: string;
  emoji?: string;
  reaction?: StoryReactionMotion;
  gif?: string;
  facilitatorPromptHi?: string;
  facilitatorPromptEn?: string;
  choices?: StorySceneChoice[];
  split?: {
    left: StorySplitPanel;
    right: StorySplitPanel;
  };
  learningPointsHi?: string[];
  learningPointsEn?: string[];
  badge?: { emoji: string; labelHi: string; labelEn: string };
  cinematic?: CinematicSceneConfig;
}

export interface BranchingStory {
  id: string;
  slug: string;
  titleHi: string;
  titleEn: string;
  descriptionHi: string;
  descriptionEn: string;
  topic: ModuleTopic;
  durationMinutes: number;
  emoji: string;
  format: "branching" | "interactive";
  /** Linear reel-style scenes (interactive format). */
  scenes?: StoryScene[];
  facilitatorPromptsHi?: string[];
  facilitatorPromptsEn?: string[];
  startNodeId: string;
  nodes: Record<string, StoryNode>;
}

export interface EmotionOption {
  id: EmotionType;
  emoji: string;
  labelHi: string;
  labelEn: string;
  color: string;
}

export interface GuidanceStep {
  id: string;
  titleHi: string;
  titleEn: string;
  promptHi: string;
  promptEn: string;
  durationMinutes: number;
  tipHi?: string;
  tipEn?: string;
}

export interface GuidanceSession {
  id: string;
  moduleSlug: string;
  titleHi: string;
  titleEn: string;
  durationMinutes: number;
  steps: GuidanceStep[];
}

export interface ModuleProgress {
  moduleId: string;
  checkpointIndex: number;
  completed: boolean;
  score?: number;
}

export interface EmotionLog {
  emotion: EmotionType;
  checkType: CheckType;
  moduleId?: string;
  timestamp: string;
}

export type GameType =
  | "scenario_hero"
  | "emotion_match"
  | "safe_or_not"
  | "calm_breath"
  | "habit_match";

export interface GameDefinition {
  id: string;
  slug: string;
  type: GameType;
  titleHi: string;
  titleEn: string;
  descriptionHi: string;
  descriptionEn: string;
  emoji: string;
  topic: ModuleTopic;
  durationMinutes: number;
  skillsHi: string[];
  skillsEn: string[];
}

export interface GameScore {
  gameId: string;
  bestScore: number;
  lastScore: number;
  plays: number;
  lastPlayedAt: string;
}

export interface StudentSession {
  moduleProgress: Record<string, ModuleProgress>;
  emotionLogs: EmotionLog[];
  gameScores: Record<string, GameScore>;
}

export interface FacilitatorStudentRow {
  student: Student;
  modulesCompleted: number;
  totalModules: number;
  lastEmotion?: EmotionType;
  preEmotion?: EmotionType;
  note?: string;
  presentToday?: boolean;
  assessmentPoints?: number;
  gamePoints?: number;
  totalPoints?: number;
}
