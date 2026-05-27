"use client";

import Link from "next/link";
import { GUIDANCE_SESSIONS } from "@/data/guidance";
import { useAppStore } from "@/stores/app-store";
import { t } from "@/lib/i18n/translations";
import { localized } from "@/lib/i18n/content";
import { AppHeader } from "@/components/layout/AppHeader";
import { Card } from "@/components/ui/Card";
import { GuidanceFlow } from "@/components/volunteer/GuidanceFlow";
import { useState } from "react";

export default function VolunteerGuidePage() {
  const language = useAppStore((s) => s.language);
  const [activeId, setActiveId] = useState<string | null>(null);

  const session = GUIDANCE_SESSIONS.find((g) => g.id === activeId);

  if (session) {
    return (
      <>
        <AppHeader
          showBack
          backHref="/guide"
          title={t(language, "volunteerGuide")}
        />
        <button
          type="button"
          className="mx-4 mb-4 text-sm text-primary underline"
          onClick={() => setActiveId(null)}
        >
          ← {t(language, "list")}
        </button>
        <GuidanceFlow session={session} />
      </>
    );
  }

  return (
    <>
      <AppHeader showBack backHref="/" title={t(language, "volunteerGuide")} />
      <div className="mx-auto max-w-2xl px-4 py-8">
        <p className="mb-6 text-muted">{t(language, "guideSelectSession")}</p>
        <div className="flex flex-col gap-4">
          {GUIDANCE_SESSIONS.map((g) => (
            <Card
              key={g.id}
              hover
              onClick={() => setActiveId(g.id)}
            >
              <p className="font-semibold">
                {localized(language, g.titleHi, g.titleEn)}
              </p>
              <p className="text-sm text-muted">
                {g.durationMinutes} {t(language, "minutes")} · {g.steps.length}{" "}
                {t(language, "step")}
              </p>
            </Card>
          ))}
        </div>
        <Link
          href="/learn/peer-pressure"
          className="mt-8 block text-center text-primary underline"
        >
          {t(language, "openRelatedModule")}
        </Link>
      </div>
    </>
  );
}
