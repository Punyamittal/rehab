import { NextResponse } from "next/server";
import { isSupabaseServerConfigured } from "@/lib/supabase/env";
import { insertEmotionLog } from "@/lib/supabase/server-data";

export async function POST(request: Request) {
  const body = await request.json();
  const { studentId, moduleId, storyId, checkType, emotion } = body;

  if (!studentId || !checkType || !emotion) {
    return NextResponse.json(
      { error: "studentId, checkType, emotion required" },
      { status: 400 }
    );
  }

  if (!isSupabaseServerConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 }
    );
  }

  try {
    await insertEmotionLog(studentId, {
      emotion,
      checkType,
      moduleSlug: moduleId ?? undefined,
      storySlug: storyId ?? undefined,
    });
    return NextResponse.json({ ok: true, persisted: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to save emotion";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
