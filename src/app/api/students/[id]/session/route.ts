import { NextResponse } from "next/server";
import { isSupabaseServerConfigured } from "@/lib/supabase/env";
import {
  fetchStudentSession,
  saveStudentSession,
} from "@/lib/supabase/server-data";
import type { StudentSession } from "@/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  }

  try {
    const session = await fetchStudentSession(id);
    return NextResponse.json({ session });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  }

  const body = await request.json();
  const session = body.session as StudentSession;
  if (!session) {
    return NextResponse.json({ error: "session required" }, { status: 400 });
  }

  try {
    await saveStudentSession(id, session);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to save session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
