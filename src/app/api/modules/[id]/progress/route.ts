import { NextResponse } from "next/server";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: moduleId } = await params;
  const body = await request.json();
  const { studentId, checkpointIndex, completed, score } = body;

  if (!studentId) {
    return NextResponse.json({ error: "studentId required" }, { status: 400 });
  }

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      const { error } = await supabase.from("module_progress").upsert(
        {
          student_id: studentId,
          module_id: moduleId,
          checkpoint_index: checkpointIndex ?? 0,
          completed: completed ?? false,
          score,
          completed_at: completed ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "student_id,module_id" }
      );
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
  }

  return NextResponse.json({
    ok: true,
    moduleId,
    checkpointIndex,
    completed,
    persisted: isSupabaseConfigured(),
  });
}
