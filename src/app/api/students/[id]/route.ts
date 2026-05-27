import { NextResponse } from "next/server";
import { isSupabaseServerConfigured } from "@/lib/supabase/env";
import {
  awardPoints,
  deleteStudent,
  patchStudent,
} from "@/lib/supabase/server-data";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  }

  try {
    await deleteStudent(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to delete student";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  }

  const body = await request.json();
  const { note, presentToday, awardBucket, awardPoints: points } = body as {
    note?: string;
    presentToday?: boolean;
    awardBucket?: "assessment" | "game";
    awardPoints?: number;
  };

  try {
    if (awardBucket && typeof points === "number") {
      const result = await awardPoints(id, awardBucket, points);
      return NextResponse.json({ ok: true, ...result });
    }

    await patchStudent(id, { note, presentToday });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update student";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
