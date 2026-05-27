import { NextResponse } from "next/server";
import { isSupabaseServerConfigured } from "@/lib/supabase/env";
import { upsertModuleProgress } from "@/lib/supabase/server-data";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: moduleSlug } = await params;
  const body = await request.json();
  const { studentId, checkpointIndex, completed, score } = body;

  if (!studentId) {
    return NextResponse.json({ error: "studentId required" }, { status: 400 });
  }

  if (!isSupabaseServerConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 }
    );
  }

  try {
    await upsertModuleProgress(studentId, {
      moduleSlug,
      checkpointIndex: checkpointIndex ?? 0,
      completed: completed ?? false,
      score,
    });
    return NextResponse.json({
      ok: true,
      moduleId: moduleSlug,
      checkpointIndex,
      completed,
      persisted: true,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to save progress";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
