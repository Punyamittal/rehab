"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/stores/app-store";
import { getLanguageConfig } from "@/lib/i18n/languages";

interface RecognitionAlternative {
  transcript: string;
}

interface RecognitionResultLike {
  0: RecognitionAlternative;
}

interface RecognitionEventLike {
  results: ArrayLike<RecognitionResultLike>;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: RecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
}

type RecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function normalizeCommand(text: string): string {
  return text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").trim();
}

function hasAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

export function VoiceNavigator() {
  const router = useRouter();
  const pathname = usePathname();
  const language = useAppStore((s) => s.language);
  const role = useAppStore((s) => s.role);
  const managedStudents = useAppStore((s) => s.managedStudents);
  const logout = useAppStore((s) => s.logout);
  const selectStudentProfile = useAppStore((s) => s.selectStudentProfile);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const enabledRef = useRef(false);
  const managedStudentsRef = useRef(managedStudents);
  const logoutRef = useRef(logout);
  const selectStudentProfileRef = useRef(selectStudentProfile);
  const routerRef = useRef(router);

  useEffect(() => {
    managedStudentsRef.current = managedStudents;
    logoutRef.current = logout;
    selectStudentProfileRef.current = selectStudentProfile;
    routerRef.current = router;
  }, [logout, managedStudents, router, selectStudentProfile]);
  const routeNeedsLocalVoice =
    pathname === "/choose-student" ||
    pathname === "/check-in" ||
    pathname.startsWith("/learn/") ||
    pathname.startsWith("/games/");

  useEffect(() => {
    const Recognition = getRecognitionCtor();
    if (!Recognition) return;

    enabledRef.current = Boolean(role && !routeNeedsLocalVoice);
    if (!enabledRef.current) {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      return;
    }

    const recognition = new Recognition();
    recognition.lang = getLanguageConfig(language).speechLang;
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    const routeTo = (target: string) => {
      if (pathname !== target) routerRef.current.push(target);
    };

    const clickByText = (patterns: RegExp[]) => {
      const buttons = Array.from(
        document.querySelectorAll("button, a[role='button']")
      ) as HTMLElement[];
      const target = buttons.find((el) =>
        patterns.some((pattern) =>
          pattern.test((el.textContent ?? "").toLowerCase())
        )
      );
      target?.click();
    };

    recognition.onresult = (event) => {
      const latest = event.results?.[event.results.length - 1];
      const transcript = normalizeCommand(latest?.[0]?.transcript ?? "");
      if (!transcript) return;

      const openIntent = hasAny(transcript, [
        /\bopen\b/,
        /\bshow\b/,
        /\bdikhao\b/,
        /\bdikha\b/,
        /\bkhol\b/,
        /\bkhol[oae]?\b/,
        /खोल/,
        /दिखा/,
      ]);

      if (pathname === "/choose-student" && managedStudentsRef.current.length > 0) {
        const match = managedStudentsRef.current.find((row) => {
          const alias = normalizeCommand(row.student.alias);
          return (
            transcript === alias ||
            transcript.includes(alias) ||
            alias.includes(transcript)
          );
        });
        if (match) {
          void selectStudentProfileRef.current(match.student.id).then((ok) => {
            if (ok) routerRef.current.push("/home");
          });
          return;
        }
      }

      if (/(home|होम|घर)/.test(transcript)) return routeTo("/home");
      if (
        hasAny(transcript, [
          /\bgames?\b/,
          /\bkhel\b/,
          /\bkhelo\b/,
          /खेल/,
        ]) &&
        (openIntent || /(games?|खेल|khel)/.test(transcript))
      ) {
        return routeTo("/games");
      }
      if (
        hasAny(transcript, [
          /\bstor(y|ies)\b/,
          /\bkahani\b/,
          /कहानी/,
        ]) &&
        (openIntent || /(story|stories|कहानी)/.test(transcript))
      ) {
        return routeTo("/story");
      }
      if (
        hasAny(transcript, [
          /\bmodules?\b/,
          /\bmodul\b/,
          /\blearn\b/,
          /\bpath\b/,
          /\bpaath\b/,
          /\bmodule dikhao\b/,
          /\bmodule kholo\b/,
          /\bmodules dikhao\b/,
          /\bmodules kholo\b/,
          /मॉड्यूल/,
          /पाठ/,
          /सीख/,
        ]) &&
        (openIntent || /(modules?|learn|मॉड्यूल|पाठ|सीख)/.test(transcript))
      ) {
        return routeTo("/learn");
      }
      if (/(dashboard|facilitator|डैशबोर्ड)/.test(transcript))
        return routeTo("/dashboard");
      if (/(choose student|choose child|बच्चा चुनो|चुनो)/.test(transcript))
        return routeTo("/choose-student");
      if (/(check in|भावना|checkin)/.test(transcript)) return routeTo("/check-in");

      if (/(logout|log out|लॉग आउट|बाहर निकल)/.test(transcript)) {
        logoutRef.current();
        return routerRef.current.push("/");
      }

      if (/(back|previous|पीछे|वापस)/.test(transcript))
        return routerRef.current.back();
      if (/(next|continue|आगे|जारी)/.test(transcript)) {
        return clickByText([/next/, /continue/, /आगे/, /जारी/, /start/, /play story/]);
      }
    };

    recognition.onend = () => {
      if (!enabledRef.current) return;
      window.setTimeout(() => {
        try {
          recognition.start();
        } catch {
          // no-op
        }
      }, 250);
    };

    recognition.onerror = () => {
      // recognition recovers through onend restart
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      // no-op
    }

    return () => {
      enabledRef.current = false;
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [language, pathname, role, routeNeedsLocalVoice]);

  return null;
}
