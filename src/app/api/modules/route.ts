import { NextResponse } from "next/server";
import { isSupabaseServerConfigured } from "@/lib/supabase/env";
import { fetchPublishedModules } from "@/lib/supabase/server-data";

export async function GET(request: Request) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const topic = searchParams.get("topic");

  try {
    let modules = await fetchPublishedModules();
    if (topic) {
      modules = modules.filter((m) => m.topic === topic);
    }
    return NextResponse.json({ modules });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load modules";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
