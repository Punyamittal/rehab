import { Readable } from "node:stream";
import type { Language } from "@/types";
import type { VoiceGender } from "@/lib/narration/voice-profiles";
import { getEdgeVoiceId } from "@/lib/narration/edge-voices";

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

/** Server-only: synthesize MP3 via Microsoft Edge neural TTS. */
export async function synthesizeToMp3(
  text: string,
  language: Language,
  voiceGender: VoiceGender = "female"
): Promise<Buffer> {
  const { MsEdgeTTS, OUTPUT_FORMAT } = await import("msedge-tts");
  const voice = getEdgeVoiceId(language, voiceGender);
  const tts = new MsEdgeTTS();

  try {
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const { audioStream } = tts.toStream(text, { rate: 0.95, pitch: "default" });
    const buffer = await streamToBuffer(audioStream);
    if (buffer.length > 0) return buffer;

    if (language !== "hi") {
      const fallbackVoice = getEdgeVoiceId("hi", voiceGender);
      await tts.setMetadata(
        fallbackVoice,
        OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3
      );
      const retry = tts.toStream(text, { rate: 0.95, pitch: "default" });
      const retryBuffer = await streamToBuffer(retry.audioStream);
      if (retryBuffer.length > 0) return retryBuffer;
    }

    throw new Error("TTS returned empty audio");
  } finally {
    tts.close();
  }
}
