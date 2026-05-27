/** Reading pace for auto-advancing story scenes (~12 chars/sec). */
export function estimateDwellMs(text: string, withVoice = false): number {
  const trimmed = text.trim();
  if (!trimmed) return 2200;
  const base = Math.max(2400, Math.min(8000, trimmed.length * 72));
  return withVoice ? base + 900 : base;
}

export const CHOICE_ADVANCE_MS = 1100;
