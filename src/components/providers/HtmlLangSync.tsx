"use client";

import { useEffect } from "react";
import { useAppStore } from "@/stores/app-store";
import { getLanguageConfig } from "@/lib/i18n/languages";

/** Keeps document lang in sync with the selected voice/UI language. */
export function HtmlLangSync() {
  const language = useAppStore((s) => s.language);

  useEffect(() => {
    const { speechLang } = getLanguageConfig(language);
    document.documentElement.lang = speechLang;
  }, [language]);

  return null;
}
