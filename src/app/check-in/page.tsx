"use client";

import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { EmotionCheckIn } from "@/components/emotion/EmotionCheckIn";
import { useAppStore } from "@/stores/app-store";
import { t } from "@/lib/i18n/translations";

export default function StandaloneCheckInPage() {
  const router = useRouter();
  const language = useAppStore((s) => s.language);

  return (
    <>
      <AppHeader showBack backHref="/home" title={t(language, "emotions")} />
      <EmotionCheckIn
        checkType="pre"
        onComplete={() => router.push("/home")}
      />
    </>
  );
}
