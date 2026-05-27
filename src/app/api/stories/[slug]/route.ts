import { NextResponse } from "next/server";
import { isSupabaseServerConfigured } from "@/lib/supabase/env";
import { fetchPublishedStories } from "@/lib/supabase/server-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!isSupabaseServerConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 }
    );
  }

  try {
    const stories = await fetchPublishedStories();
    const story = stories.find((s) => s.slug === slug);
    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }
    return NextResponse.json({ story });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load story";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
