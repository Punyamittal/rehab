/** Reading pace for auto-advancing story scenes (~12 chars/sec). */
export function estimateDwellMs(text: string, withVoice = false): number {
  const trimmed = text.trim();
  if (!trimmed) return 2200;
  const base = Math.max(2800, Math.min(12000, trimmed.length * 85));
  return withVoice ? base + 1800 : base;
}

/** Extra buffer when waiting for cloud TTS before fallback advance. */
export const SPEECH_FALLBACK_BUFFER_MS = 3000;

export const LINE_PAUSE_MS = 400;

export const CHOICE_ADVANCE_MS = 1100;
