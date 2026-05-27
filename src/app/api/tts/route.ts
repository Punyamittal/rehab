import { NextResponse } from "next/server";
import type { Language } from "@/types";
import { synthesizeToMp3 } from "@/lib/narration/synthesize";
import { getEdgeVoiceId } from "@/lib/narration/edge-voices";

export const runtime = "nodejs";

const MAX_CHARS = 900;
const VALID_LANGS = new Set<Language>(["hi", "en", "pa", "bho", "hr"]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const text = typeof body.text === "string" ? body.text.trim() : "";
    const language = body.language as Language;
    const voiceGender =
      body.voiceGender === "male" || body.voiceGender === "female"
        ? body.voiceGender
        : "female";

    if (!text) {
      return NextResponse.json({ error: "text required" }, { status: 400 });
    }
    if (!VALID_LANGS.has(language)) {
      return NextResponse.json({ error: "invalid language" }, { status: 400 });
    }

    const trimmed = text.slice(0, MAX_CHARS);
    const buffer = await synthesizeToMp3(trimmed, language, voiceGender);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "private, max-age=86400",
        "X-TTS-Voice": getEdgeVoiceId(language, voiceGender),
      },
    });
  } catch (err) {
    console.error("[tts]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "TTS failed" },
      { status: 500 }
    );
  }
}
