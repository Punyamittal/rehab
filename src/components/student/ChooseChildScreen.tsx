"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAppStore } from "@/stores/app-store";
import { t } from "@/lib/i18n/translations";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { SoundToggle } from "@/components/audio/SoundToggle";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { VoiceInputButton } from "@/components/audio/VoiceInputButton";
import { useAutoNarrate } from "@/hooks/useNarration";
import { cn } from "@/lib/utils";
import { estimateDwellMs } from "@/lib/narration/story-timing";

export function ChooseChildScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromHome = searchParams.get("from") === "home";

  const {
    language,
    role,
    studentId,
    managedStudents,
    selectStudentProfile,
  } = useAppStore();
  const [query, setQuery] = useState("");
  const [heardName, setHeardName] = useState("");
  const [voiceLoginBusy, setVoiceLoginBusy] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  useEffect(() => {
    if (role === null) router.replace("/");
    else if (role !== "student") router.replace("/");
  }, [role, router]);

  const handleSelect = async (id: string) => {
    const ok = await selectStudentProfile(id);
    if (ok) router.push("/home");
  };

  const normalize = (text: string) =>
    text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").trim();

  const devanagariToLatin = (text: string) => {
    const pairs: Array<[string, string]> = [
      ["अ", "a"], ["आ", "aa"], ["इ", "i"], ["ई", "ee"], ["उ", "u"], ["ऊ", "oo"],
      ["ए", "e"], ["ऐ", "ai"], ["ओ", "o"], ["औ", "au"], ["क", "k"], ["ख", "kh"],
      ["ग", "g"], ["घ", "gh"], ["च", "ch"], ["छ", "chh"], ["ज", "j"], ["झ", "jh"],
      ["ट", "t"], ["ठ", "th"], ["ड", "d"], ["ढ", "dh"], ["त", "t"], ["थ", "th"],
      ["द", "d"], ["ध", "dh"], ["न", "n"], ["प", "p"], ["फ", "f"], ["ब", "b"],
      ["भ", "bh"], ["म", "m"], ["य", "y"], ["र", "r"], ["ल", "l"], ["व", "v"],
      ["स", "s"], ["श", "sh"], ["ह", "h"], ["ण", "n"], ["ं", "n"], ["्", ""],
      ["ा", "a"], ["ि", "i"], ["ी", "ee"], ["ु", "u"], ["ू", "oo"], ["े", "e"],
      ["ै", "ai"], ["ो", "o"], ["ौ", "au"],
    ];
    let output = text;
    for (const [from, to] of pairs) {
      output = output.split(from).join(to);
    }
    return output;
  };

  const phoneticKey = (text: string) =>
    normalize(text)
      .replace(/[aeiouअआइईउऊएऐओऔ]/g, "")
      .replace(/ph/g, "f")
      .replace(/sh/g, "s")
      .replace(/ch/g, "c")
      .replace(/j/g, "z")
      .replace(/\s+/g, "");

  const canonicalKey = (text: string) =>
    normalize(devanagariToLatin(text))
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const levenshtein = (a: string, b: string): number => {
    const m = a.length;
    const n = b.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + cost
        );
      }
    }
    return dp[m][n];
  };

  const handleVoiceName = (transcript: string) => {
    if (voiceLoginBusy || managedStudents.length === 0) return;
    const heard = normalize(transcript);
    setHeardName(transcript);
    setVoiceError(null);
    if (!heard || heard.length < 2) return;
    const scored = managedStudents
      .map((row) => {
        const alias = normalize(row.student.alias);
        const heardLatin = normalize(devanagariToLatin(heard));
        const aliasLatin = normalize(devanagariToLatin(alias));
        const heardCanonical = canonicalKey(heard);
        const aliasCanonical = canonicalKey(alias);
        const aliasFirst = alias.split(/\s+/)[0] ?? alias;
        const heardFirst = heard.split(/\s+/)[0] ?? heard;
        let score = 0;

        if (heard === alias) score += 100;
        if (heard.includes(alias) || alias.includes(heard)) score += 70;
        if (
          heardFirst === aliasFirst ||
          heardFirst.includes(aliasFirst) ||
          aliasFirst.includes(heardFirst)
        ) {
          score += 60;
        }

        const heardTokens = heard.split(/\s+/).filter(Boolean);
        const aliasTokens = alias.split(/\s+/).filter(Boolean);
        const tokenMatch = heardTokens.some((ht) =>
          aliasTokens.some(
            (at) => at.includes(ht) || ht.includes(at) || levenshtein(ht, at) <= 1
          )
        );
        if (tokenMatch) score += 40;

        if (levenshtein(heard, alias) <= 2) score += 30;
        if (
          heardLatin === aliasLatin ||
          heardLatin.includes(aliasLatin) ||
          aliasLatin.includes(heardLatin)
        ) {
          score += 55;
        }
        if (levenshtein(heardLatin, aliasLatin) <= 2) score += 35;
        if (
          heardCanonical === aliasCanonical ||
          heardCanonical.includes(aliasCanonical) ||
          aliasCanonical.includes(heardCanonical)
        ) {
          score += 70;
        }
        if (
          heardCanonical.split(" ")[0] &&
          aliasCanonical.split(" ")[0] &&
          levenshtein(
            heardCanonical.split(" ")[0]!,
            aliasCanonical.split(" ")[0]!
          ) <= 1
        ) {
          score += 45;
        }

        const phoneticMatch =
          phoneticKey(heard) === phoneticKey(alias) ||
          phoneticKey(heardFirst) === phoneticKey(aliasFirst);
        if (phoneticMatch) score += 25;

        return { row, score };
      })
      .sort((a, b) => b.score - a.score);

    const best = scored[0];
    if (best && best.score > 0) {
      setVoiceLoginBusy(true);
      void handleSelect(best.row.student.id).finally(() => {
        setVoiceLoginBusy(false);
      });
      return;
    }

    // Practical fallback: when only one profile exists, accept voice login.
    if (managedStudents.length === 1) {
      setVoiceLoginBusy(true);
      void handleSelect(managedStudents[0]!.student.id).finally(() => {
        setVoiceLoginBusy(false);
      });
      return;
    }

    setVoiceError("Name not found. Please try again.");
  };

  const askNamePrompt = `${t(language, "chooseChildTitle")}. ${t(
    language,
    "chooseChildHint"
  )}. ${t(language, "askFacilitator")}.`;

  useAutoNarrate(
    `choose-student-ask-name-${language}-${managedStudents.length}`,
    askNamePrompt,
    undefined,
    undefined,
    { force: true }
  );

  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return managedStudents;
    return managedStudents.filter((row) =>
      row.student.alias.toLowerCase().includes(q)
    );
  }, [managedStudents, query]);

  const lastActive = managedStudents.find((row) => row.student.id === studentId);

  if (role !== "student") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-secondary/10">
      <header className="sticky top-0 z-30 border-b border-white/55 bg-gradient-to-r from-white/80 via-white/70 to-white/75 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-3 py-2.5 md:px-5">
          {fromHome ? (
            <Link
              href="/home"
              className="touch-target flex h-11 w-11 items-center justify-center rounded-xl border border-primary/15 bg-white/85 text-lg text-primary shadow-sm transition-colors hover:bg-white"
              aria-label={t(language, "back")}
            >
              ←
            </Link>
          ) : (
            <Link
              href="/"
              className="touch-target flex h-11 w-11 items-center justify-center rounded-xl border border-primary/15 bg-white/85 text-lg text-primary shadow-sm transition-colors hover:bg-white"
              aria-label={t(language, "back")}
            >
              ←
            </Link>
          )}
          <div className="flex items-center gap-1.5 rounded-2xl border border-white/70 bg-white/55 p-1 shadow-[0_6px_22px_rgba(74,55,40,0.08)]">
            <LogoutButton variant="icon" />
            <SoundToggle />
            <LanguageSelector />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-8">
        <div className="mb-2" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.img
            src="/run.gif"
            alt="Running animation"
            className="mx-auto h-24 w-32 rounded-2xl object-cover shadow-[0_8px_24px_rgba(74,55,40,0.16)] md:h-28 md:w-36"
            animate={{ scale: [1, 1.06, 1], opacity: [0.95, 1, 0.95] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
          <h1 className="mt-4 text-2xl font-bold text-primary md:text-3xl">
            {t(language, "chooseChildTitle")}
          </h1>
          <p className="mt-2 text-muted">{t(language, "chooseChildHint")}</p>
          <div className="mt-3 flex justify-center">
            <VoiceInputButton
              language={language}
              autoStartKey={`choose-student-${managedStudents.length}-${studentId || "none"}`}
              autoStartDelayMs={estimateDwellMs(askNamePrompt, true) + 700}
              onResult={handleVoiceName}
            />
          </div>
          {heardName && (
            <p className="mt-2 text-xs text-muted">
              Heard: {heardName}
              {voiceLoginBusy ? " · logging in..." : ""}
            </p>
          )}
          {voiceError && (
            <p className="mt-1 text-xs font-medium text-red-700">{voiceError}</p>
          )}
        </motion.div>

        {lastActive && (
          <button
            type="button"
            onClick={() => handleSelect(lastActive.student.id)}
            className="mt-5 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-left text-sm font-medium text-primary hover:bg-primary/15"
          >
            ↺ Quick resume: {lastActive.student.avatarEmoji} {lastActive.student.alias}
          </button>
        )}

        {managedStudents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-10 rounded-2xl border border-amber-200/80 bg-amber-50/90 p-6 text-center text-amber-950 shadow-sm"
          >
            <p className="text-lg font-medium">
              {t(language, "noChildrenForStudent")}
            </p>
            <p className="mt-3 text-sm text-amber-900/80">
              {t(language, "askFacilitator")}
            </p>
          </motion.div>
        ) : (
          <>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search child"
              className="mt-6 w-full rounded-2xl border border-primary/20 bg-white/90 px-4 py-3 text-sm outline-none ring-primary/30 focus:ring-2"
            />
            <ul className="mt-4 flex flex-col gap-3">
            {filteredStudents.map((row, index) => {
              const { id, alias, avatarEmoji } = row.student;
              const isCurrent = id === studentId;
              return (
                <motion.li
                  key={id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <button
                    type="button"
                    onClick={() => handleSelect(id)}
                    className={cn(
                      "touch-target flex w-full items-center gap-4 rounded-2xl border-2 bg-white/90 p-4 text-left shadow-md transition hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]",
                      isCurrent
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-white/80"
                    )}
                  >
                    <span
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 text-4xl"
                      aria-hidden
                    >
                      {avatarEmoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xl font-semibold">{alias}</p>
                      {row.modulesCompleted > 0 && (
                        <p className="text-sm text-muted">
                          {row.modulesCompleted} {t(language, "modules")}
                        </p>
                      )}
                    </div>
                    <span className="text-2xl text-primary" aria-hidden>
                      →
                    </span>
                  </button>
                </motion.li>
              );
            })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
