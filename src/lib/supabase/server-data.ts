import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureCatalogSeeded } from "@/lib/supabase/bootstrap";
import { getCentreId } from "@/lib/supabase/env";
import {
  mapFacilitatorRow,
  mapGameRow,
  mapModuleRow,
  mapStoryRow,
  mapStudent,
  sessionFromDbRows,
  type DbGameRow,
  type DbModuleRow,
  type DbStoryRow,
  type DbStudent,
} from "@/lib/supabase/mappers";
import type {
  BranchingStory,
  EmotionType,
  FacilitatorStudentRow,
  GameDefinition,
  LearningModule,
  StudentSession,
} from "@/types";

async function admin(): Promise<SupabaseClient> {
  const client = createAdminClient();
  if (!client) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env"
    );
  }
  await ensureCatalogSeeded(client);
  return client;
}

function formatDbError(error: { message: string; code?: string }): string {
  if (error.code === "23505") {
    return "This name is already registered.";
  }
  if (error.code === "23503") {
    return "Centre not found. Run supabase/seed.sql or set NEXT_PUBLIC_CENTRE_ID.";
  }
  return error.message;
}

export async function fetchPublishedModules(): Promise<LearningModule[]> {
  const db = await admin();
  const { data, error } = await db
    .from("modules")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data as DbModuleRow[]).map(mapModuleRow);
}

export async function fetchPublishedGames(): Promise<GameDefinition[]> {
  const db = await admin();
  const { data, error } = await db
    .from("games")
    .select("*")
    .eq("is_published", true);
  if (error) throw error;
  return (data as DbGameRow[]).map(mapGameRow);
}

export async function fetchPublishedStories(): Promise<BranchingStory[]> {
  const db = await admin();
  const { data, error } = await db
    .from("stories")
    .select("*")
    .eq("is_published", true);
  if (error) throw error;
  return (data as DbStoryRow[]).map(mapStoryRow);
}

export async function fetchCentreStudents(
  totalModules: number
): Promise<FacilitatorStudentRow[]> {
  const db = await admin();
  const centreId = getCentreId();

  const { data: students, error } = await db
    .from("students")
    .select("*")
    .eq("centre_id", centreId)
    .eq("is_active", true)
    .order("alias", { ascending: true });
  if (error) throw error;

  const rows = (students ?? []) as DbStudent[];
  const result: FacilitatorStudentRow[] = [];

  for (const row of rows) {
    const { data: progress } = await db
      .from("module_progress")
      .select("module_slug, completed")
      .eq("student_id", row.id);
    const modulesCompleted =
      progress?.filter((p) => p.completed).length ?? 0;

    const { data: emotions } = await db
      .from("emotion_logs")
      .select("emotion, check_type, created_at")
      .eq("student_id", row.id)
      .order("created_at", { ascending: false })
      .limit(20);

    const lastEmotion = emotions?.[0]?.emotion as EmotionType | undefined;
    const preEmotion = emotions?.find((e) => e.check_type === "pre")
      ?.emotion as EmotionType | undefined;

    result.push(
      mapFacilitatorRow(
        row,
        totalModules,
        modulesCompleted,
        lastEmotion,
        preEmotion
      )
    );
  }

  return result;
}

export async function createCentreStudent(
  alias: string,
  avatarEmoji: string,
  totalModules: number
): Promise<FacilitatorStudentRow> {
  const db = await admin();
  const centreId = getCentreId();

  const { data, error } = await db
    .from("students")
    .insert({
      centre_id: centreId,
      alias: alias.trim(),
      avatar_emoji: avatarEmoji,
      present_today: true,
      current_note: "",
      assessment_points: 0,
      game_points: 0,
    })
    .select()
    .single();
  if (error) throw new Error(formatDbError(error));
  return mapFacilitatorRow(data as DbStudent, totalModules, 0);
}

export async function deleteStudent(studentId: string): Promise<void> {
  const db = await admin();
  const { error } = await db.from("students").delete().eq("id", studentId);
  if (error) throw error;
}

export async function patchStudent(
  studentId: string,
  patch: {
    note?: string;
    presentToday?: boolean;
    assessmentPoints?: number;
    gamePoints?: number;
  }
): Promise<void> {
  const db = await admin();
  const updates: Record<string, unknown> = {};
  if (patch.note !== undefined) updates.current_note = patch.note;
  if (patch.presentToday !== undefined) {
    updates.present_today = patch.presentToday;
  }
  if (patch.assessmentPoints !== undefined) {
    updates.assessment_points = patch.assessmentPoints;
  }
  if (patch.gamePoints !== undefined) updates.game_points = patch.gamePoints;

  const { error } = await db
    .from("students")
    .update(updates)
    .eq("id", studentId);
  if (error) throw error;
}

export async function fetchStudentSession(
  studentId: string
): Promise<StudentSession> {
  const db = await admin();

  const { data: student } = await db
    .from("students")
    .select("session_data")
    .eq("id", studentId)
    .single();

  const { data: moduleRows } = await db
    .from("module_progress")
    .select("module_slug, checkpoint_index, completed, score")
    .eq("student_id", studentId);

  const { data: gameRows } = await db
    .from("game_scores")
    .select("game_slug, best_score, last_score, plays, last_played_at")
    .eq("student_id", studentId);

  const { data: emotionRows } = await db
    .from("emotion_logs")
    .select("emotion, check_type, module_slug, created_at")
    .eq("student_id", studentId)
    .order("created_at", { ascending: true });

  return sessionFromDbRows(
    moduleRows ?? [],
    gameRows ?? [],
    emotionRows ?? [],
    (student?.session_data as StudentSession | null) ?? null
  );
}

export async function saveStudentSession(
  studentId: string,
  session: StudentSession
): Promise<void> {
  const db = await admin();

  await db
    .from("students")
    .update({ session_data: session })
    .eq("id", studentId);

  for (const progress of Object.values(session.moduleProgress)) {
    await db.from("module_progress").upsert(
      {
        student_id: studentId,
        module_slug: progress.moduleId,
        checkpoint_index: progress.checkpointIndex,
        completed: progress.completed,
        score: progress.score ?? null,
        completed_at: progress.completed ? new Date().toISOString() : null,
      },
      { onConflict: "student_id,module_slug" }
    );
  }

  for (const score of Object.values(session.gameScores)) {
    await db.from("game_scores").upsert(
      {
        student_id: studentId,
        game_slug: score.gameId,
        best_score: score.bestScore,
        last_score: score.lastScore,
        plays: score.plays,
        last_played_at: score.lastPlayedAt,
      },
      { onConflict: "student_id,game_slug" }
    );
  }
}

export async function insertEmotionLog(
  studentId: string,
  payload: {
    emotion: string;
    checkType: string;
    moduleSlug?: string;
    storySlug?: string;
  }
): Promise<void> {
  const db = await admin();
  const { error } = await db.from("emotion_logs").insert({
    student_id: studentId,
    emotion: payload.emotion,
    check_type: payload.checkType,
    module_slug: payload.moduleSlug ?? null,
    story_slug: payload.storySlug ?? null,
  });
  if (error) throw error;
}

export async function upsertModuleProgress(
  studentId: string,
  progress: {
    moduleSlug: string;
    checkpointIndex: number;
    completed: boolean;
    score?: number;
  }
): Promise<void> {
  const db = await admin();
  const { error } = await db.from("module_progress").upsert(
    {
      student_id: studentId,
      module_slug: progress.moduleSlug,
      checkpoint_index: progress.checkpointIndex,
      completed: progress.completed,
      score: progress.score ?? null,
      completed_at: progress.completed ? new Date().toISOString() : null,
    },
    { onConflict: "student_id,module_slug" }
  );
  if (error) throw error;
}

export async function upsertGameScore(
  studentId: string,
  gameSlug: string,
  score: number,
  maxScore: number
): Promise<void> {
  const db = await admin();
  const normalized = Math.round((score / maxScore) * 100);
  const { data: existing } = await db
    .from("game_scores")
    .select("best_score, plays")
    .eq("student_id", studentId)
    .eq("game_slug", gameSlug)
    .maybeSingle();

  const { error } = await db.from("game_scores").upsert(
    {
      student_id: studentId,
      game_slug: gameSlug,
      best_score: Math.max(existing?.best_score ?? 0, normalized),
      last_score: normalized,
      plays: (existing?.plays ?? 0) + 1,
      last_played_at: new Date().toISOString(),
    },
    { onConflict: "student_id,game_slug" }
  );
  if (error) throw error;
}

export async function awardPoints(
  studentId: string,
  bucket: "assessment" | "game",
  points: number
): Promise<{ assessmentPoints: number; gamePoints: number }> {
  const db = await admin();
  const { data: row, error: fetchError } = await db
    .from("students")
    .select("assessment_points, game_points")
    .eq("id", studentId)
    .single();
  if (fetchError) throw fetchError;

  const assessment =
    bucket === "assessment"
      ? Math.max(0, (row.assessment_points ?? 0) + points)
      : row.assessment_points;
  const game =
    bucket === "game"
      ? Math.max(0, (row.game_points ?? 0) + points)
      : row.game_points;

  const { error } = await db
    .from("students")
    .update({ assessment_points: assessment, game_points: game })
    .eq("id", studentId);
  if (error) throw error;

  await db.from("points_ledger").insert({
    student_id: studentId,
    bucket,
    points,
  });

  return { assessmentPoints: assessment, gamePoints: game };
}
