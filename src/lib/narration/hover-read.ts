const MAX_HOVER_CHARS = 600;

const EXCLUDED_SELECTOR = [
  "[data-no-hover-read]",
  "script",
  "style",
  "noscript",
  "svg",
  "path",
  "canvas",
].join(",");

function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function isExcluded(el: Element | null): boolean {
  if (!el || !(el instanceof HTMLElement)) return true;
  return Boolean(el.closest(EXCLUDED_SELECTOR));
}

function elementReadableText(el: HTMLElement): string {
  const dataNarrate = el.getAttribute("data-narrate");
  if (dataNarrate?.trim()) return normalizeText(dataNarrate);

  if (el.getAttribute("aria-hidden") === "true") return "";

  const aria = el.getAttribute("aria-label");
  if (aria?.trim()) return normalizeText(aria);

  const title = el.getAttribute("title");
  if (title?.trim()) return normalizeText(title);

  return normalizeText(el.innerText);
}

function clampText(text: string): string {
  if (text.length <= MAX_HOVER_CHARS) return text;
  return `${text.slice(0, MAX_HOVER_CHARS).trim()}…`;
}

/**
 * Smallest meaningful text block under the pointer (or focused element).
 */
export function resolveHoverReadable(target: EventTarget | null): string | null {
  if (!(target instanceof HTMLElement)) return null;
  if (isExcluded(target)) return null;

  let el: HTMLElement | null = target;
  let lastText: string | null = null;

  while (el && el !== document.body) {
    if (isExcluded(el)) return null;

    const text = elementReadableText(el);
    if (text.length >= 2) {
      const parent: HTMLElement | null = el.parentElement;
      const parentText =
        parent && !isExcluded(parent) ? elementReadableText(parent) : "";

      if (parentText && parentText === text) {
        lastText = text;
        el = parent;
        continue;
      }

      return clampText(text);
    }

    el = el.parentElement;
  }

  return lastText ? clampText(lastText) : null;
}
