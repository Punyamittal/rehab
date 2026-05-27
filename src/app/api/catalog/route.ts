import { NextResponse } from "next/server";
import { isSupabaseServerConfigured } from "@/lib/supabase/env";
import {
  fetchPublishedGames,
  fetchPublishedModules,
  fetchPublishedStories,
} from "@/lib/supabase/server-data";

export async function GET() {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured. Add SUPABASE_SERVICE_ROLE_KEY." },
      { status: 503 }
    );
  }

  try {
    const [modules, games, stories] = await Promise.all([
      fetchPublishedModules(),
      fetchPublishedGames(),
      fetchPublishedStories(),
    ]);
    return NextResponse.json({ modules, games, stories });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load catalog";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
