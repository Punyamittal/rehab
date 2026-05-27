import { NextResponse } from "next/server";
import { isSupabaseServerConfigured } from "@/lib/supabase/env";
import { fetchPublishedGames } from "@/lib/supabase/server-data";

export async function GET() {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 }
    );
  }

  try {
    const games = await fetchPublishedGames();
    return NextResponse.json({ games });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load games";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
