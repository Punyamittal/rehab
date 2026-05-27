import { NextResponse } from "next/server";
import { getStoryBySlug } from "@/data/stories";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const story = getStoryBySlug(slug);

  if (!story) {
    return NextResponse.json({ error: "Story not found" }, { status: 404 });
  }

  return NextResponse.json({ story });
}
