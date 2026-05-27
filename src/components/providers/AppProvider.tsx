"use client";

import { useEffect, useState } from "react";
import { loadVoices, isSpeechSupported } from "@/lib/narration/speech";
import { HtmlLangSync } from "@/components/providers/HtmlLangSync";
import { StudentPathGuard } from "@/components/student/StudentPathGuard";
import { HoverReadAloud } from "@/components/audio/HoverReadAloud";
import { useSupabaseBootstrap } from "@/hooks/useSupabaseBootstrap";

function SupabaseBootstrap() {
  useSupabaseBootstrap();
  return null;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isSpeechSupported()) {
      void loadVoices();
    }
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-pulse rounded-full bg-primary/30" />
      </div>
    );
  }

  return (
    <>
      <HtmlLangSync />
      <SupabaseBootstrap />
      <StudentPathGuard />
      <HoverReadAloud />
      {children}
    </>
  );
}
