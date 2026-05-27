import { NextResponse } from "next/server";
import { LEARNING_MODULES } from "@/data/modules";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get("topic");

  let modules = LEARNING_MODULES;
  if (topic) {
    modules = modules.filter((m) => m.topic === topic);
  }

  return NextResponse.json({ modules });
}
