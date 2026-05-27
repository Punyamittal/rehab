import type {
  BranchingStory,
  EmotionLog,
  EmotionType,
  FacilitatorStudentRow,
  GameDefinition,
  GameScore,
  LearningModule,
  ModuleProgress,
  Student,
  StudentSession,
} from "@/types";

export interface DbStudent {
  id: string;
  centre_id: string;
  alias: string;
  avatar_emoji: string;
  present_today: boolean;
  current_note: string | null;
  assessment_points: number;
  game_points: number;
  session_data: StudentSession | null;
  is_active: boolean;
}

export interface DbModuleRow {
  id: string;
  slug: string;
  title_hi: string;
  title_en: string | null;
  description_hi: string | null;
  description_en: string | null;
  topic: string;
  duration_minutes: number;
  emoji: string | null;
  content_json: unknown;
  is_published: boolean;
  sort_order: number;
}

export interface DbGameRow {
  id: string;
  slug: string;
  game_type: string;
  title_hi: string;
  title_en: string | null;
  description_hi: string | null;
  description_en: string | null;
  topic: string | null;
  duration_minutes: number;
  emoji: string | null;
  skills_hi: string[] | null;
  skills_en: string[] | null;
  config_json: unknown;
  is_published: boolean;
}

export interface DbStoryRow {
  id: string;
  slug: string;
  title_hi: string;
  title_en: string | null;
  description_hi: string | null;
  description_en: string | null;
  topic: string | null;
  duration_minutes: number;
  emoji: string | null;
  format: string;
  start_node_id: string | null;
  graph_json: unknown;
  scenes_json: unknown;
  facilitator_prompts_hi: string[] | null;
  facilitator_prompts_en: string[] | null;
  is_published: boolean;
}

export function mapStudent(row: DbStudent): Student {
  return {
    id: row.id,
    alias: row.alias,
    avatarEmoji: row.avatar_emoji,
    centreId: row.centre_id,
  };
}

export function mapFacilitatorRow(
  row: DbStudent,
  totalModules: number,
  modulesCompleted = 0,
  lastEmotion?: EmotionType,
  preEmotion?: EmotionType
): FacilitatorStudentRow {
  return {
    student: mapStudent(row),
    modulesCompleted,
    totalModules,
    lastEmotion,
    preEmotion,
    note: row.current_note ?? "",
    presentToday: row.present_today,
    assessmentPoints: row.assessment_points,
    gamePoints: row.game_points,
    totalPoints: row.assessment_points + row.game_points,
  };
}

export function mapModuleRow(row: DbModuleRow): LearningModule {
  const content = row.content_json as Partial<LearningModule> | null;
  if (content?.slides?.length) {
    return {
      ...content,
      id: content.id ?? row.slug,
      slug: row.slug,
      titleHi: content.titleHi ?? row.title_hi,
      titleEn: content.titleEn ?? row.title_en ?? "",
      descriptionHi: content.descriptionHi ?? row.description_hi ?? "",
      descriptionEn: content.descriptionEn ?? row.description_en ?? "",
      topic: (content.topic ?? row.topic) as LearningModule["topic"],
      durationMinutes: content.durationMinutes ?? row.duration_minutes,
      emoji: content.emoji ?? row.emoji ?? "📘",
      slides: content.slides,
    };
  }
  return {
    id: row.slug,
    slug: row.slug,
    titleHi: row.title_hi,
    titleEn: row.title_en ?? "",
    descriptionHi: row.description_hi ?? "",
    descriptionEn: row.description_en ?? "",
    topic: row.topic as LearningModule["topic"],
    durationMinutes: row.duration_minutes,
    emoji: row.emoji ?? "📘",
    slides: [],
  };
}

export function mapGameRow(row: DbGameRow): GameDefinition {
  const config = row.config_json as Partial<GameDefinition> | null;
  if (config?.type) {
    return {
      ...config,
      id: config.id ?? row.slug,
      slug: row.slug,
      titleHi: config.titleHi ?? row.title_hi,
      titleEn: config.titleEn ?? row.title_en ?? "",
      descriptionHi: config.descriptionHi ?? row.description_hi ?? "",
      descriptionEn: config.descriptionEn ?? row.description_en ?? "",
      type: config.type,
      topic: (config.topic ?? row.topic) as GameDefinition["topic"],
      durationMinutes: config.durationMinutes ?? row.duration_minutes,
      emoji: config.emoji ?? row.emoji ?? "🎮",
      skillsHi: config.skillsHi ?? row.skills_hi ?? [],
      skillsEn: config.skillsEn ?? row.skills_en ?? [],
    };
  }
  return {
    id: row.slug,
    slug: row.slug,
    type: row.game_type as GameDefinition["type"],
    titleHi: row.title_hi,
    titleEn: row.title_en ?? "",
    descriptionHi: row.description_hi ?? "",
    descriptionEn: row.description_en ?? "",
    emoji: row.emoji ?? "🎮",
    topic: (row.topic ?? "peer_pressure") as GameDefinition["topic"],
    durationMinutes: row.duration_minutes,
    skillsHi: row.skills_hi ?? [],
    skillsEn: row.skills_en ?? [],
  };
}

export function mapStoryRow(row: DbStoryRow): BranchingStory {
  const graph = row.graph_json as BranchingStory["nodes"] | null;
  const scenes = row.scenes_json as BranchingStory["scenes"] | null;
  const content = row.graph_json as Partial<BranchingStory> | null;

  if (content?.nodes && Object.keys(content.nodes).length > 0) {
    return {
      id: content.id ?? row.slug,
      slug: row.slug,
      titleHi: content.titleHi ?? row.title_hi,
      titleEn: content.titleEn ?? row.title_en ?? "",
      descriptionHi: content.descriptionHi ?? row.description_hi ?? "",
      descriptionEn: content.descriptionEn ?? row.description_en ?? "",
      topic: (content.topic ?? row.topic) as BranchingStory["topic"],
      durationMinutes: content.durationMinutes ?? row.duration_minutes,
      emoji: content.emoji ?? row.emoji ?? "📖",
      format: (content.format ?? row.format) as BranchingStory["format"],
      startNodeId: content.startNodeId ?? row.start_node_id ?? "",
      nodes: content.nodes,
      scenes: content.scenes ?? scenes ?? undefined,
      facilitatorPromptsHi:
        content.facilitatorPromptsHi ?? row.facilitator_prompts_hi ?? undefined,
      facilitatorPromptsEn:
        content.facilitatorPromptsEn ?? row.facilitator_prompts_en ?? undefined,
    };
  }

  return {
    id: row.slug,
    slug: row.slug,
    titleHi: row.title_hi,
    titleEn: row.title_en ?? "",
    descriptionHi: row.description_hi ?? "",
    descriptionEn: row.description_en ?? "",
    topic: (row.topic ?? "peer_pressure") as BranchingStory["topic"],
    durationMinutes: row.duration_minutes,
    emoji: row.emoji ?? "📖",
    format: row.format as BranchingStory["format"],
    startNodeId: row.start_node_id ?? "",
    nodes: graph ?? {},
    scenes: scenes ?? undefined,
  };
}

export function sessionFromDbRows(
  moduleRows: {
    module_slug: string;
    checkpoint_index: number;
    completed: boolean;
    score: number | null;
  }[],
  gameRows: {
    game_slug: string;
    best_score: number;
    last_score: number;
    plays: number;
    last_played_at: string;
  }[],
  emotionRows: {
    emotion: EmotionType;
    check_type: string;
    module_slug: string | null;
    created_at: string;
  }[],
  sessionData: StudentSession | null
): StudentSession {
  const moduleProgress: Record<string, ModuleProgress> = {};
  for (const row of moduleRows) {
    moduleProgress[row.module_slug] = {
      moduleId: row.module_slug,
      checkpointIndex: row.checkpoint_index,
      completed: row.completed,
      score: row.score ?? undefined,
    };
  }

  const gameScores: Record<string, GameScore> = {};
  for (const row of gameRows) {
    gameScores[row.game_slug] = {
      gameId: row.game_slug,
      bestScore: row.best_score,
      lastScore: row.last_score,
      plays: row.plays,
      lastPlayedAt: row.last_played_at,
    };
  }

  const emotionLogs: EmotionLog[] = emotionRows.map((row) => ({
    emotion: row.emotion,
    checkType: row.check_type as EmotionLog["checkType"],
    moduleId: row.module_slug ?? undefined,
    timestamp: row.created_at,
  }));

  if (
    Object.keys(moduleProgress).length === 0 &&
    Object.keys(gameScores).length === 0 &&
    emotionLogs.length === 0 &&
    sessionData
  ) {
    return sessionData;
  }

  return {
    moduleProgress:
      Object.keys(moduleProgress).length > 0
        ? moduleProgress
        : (sessionData?.moduleProgress ?? {}),
    gameScores:
      Object.keys(gameScores).length > 0
        ? gameScores
        : (sessionData?.gameScores ?? {}),
    emotionLogs:
      emotionLogs.length > 0 ? emotionLogs : (sessionData?.emotionLogs ?? []),
  };
}
