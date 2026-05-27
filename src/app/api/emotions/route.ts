import { NextResponse } from "next/server";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";

export async function POST(request: Request) {
  const body = await request.json();
  const { studentId, moduleId, storyId, checkType, emotion } = body;

  if (!studentId || !checkType || !emotion) {
    return NextResponse.json(
      { error: "studentId, checkType, emotion required" },
      { status: 400 }
    );
  }

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      const { error } = await supabase.from("emotion_logs").insert({
        student_id: studentId,
        module_id: moduleId ?? null,
        story_id: storyId ?? null,
        check_type: checkType,
        emotion,
      });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
  }

  return NextResponse.json({
    ok: true,
    persisted: isSupabaseConfigured(),
  });
}
