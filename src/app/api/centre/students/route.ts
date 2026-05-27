import { NextResponse } from "next/server";
import { isSupabaseServerConfigured } from "@/lib/supabase/env";
import {
  createCentreStudent,
  fetchCentreStudents,
  fetchPublishedModules,
} from "@/lib/supabase/server-data";

export async function GET() {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 }
    );
  }

  try {
    const modules = await fetchPublishedModules();
    const students = await fetchCentreStudents(modules.length);
    return NextResponse.json({ students, totalModules: modules.length });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load students";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 }
    );
  }

  const body = await request.json();
  const { alias, avatarEmoji } = body as {
    alias?: string;
    avatarEmoji?: string;
  };

  if (!alias?.trim() || !avatarEmoji) {
    return NextResponse.json(
      { error: "alias and avatarEmoji required" },
      { status: 400 }
    );
  }

  try {
    const modules = await fetchPublishedModules();
    const row = await createCentreStudent(alias, avatarEmoji, modules.length);
    return NextResponse.json({ student: row });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create student";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
