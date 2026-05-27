"use client";

import Link from "next/link";
import { LEARNING_MODULES } from "@/data/modules";
import { useAppStore } from "@/stores/app-store";
import { t, topicLabel } from "@/lib/i18n/translations";
import { localized } from "@/lib/i18n/content";
import { AppHeader } from "@/components/layout/AppHeader";
import { Card } from "@/components/ui/Card";

export default function LearnCatalogPage() {
  const { language, moduleProgress } = useAppStore();

  return (
    <>
      <AppHeader showBack backHref="/home" title={t(language, "modules")} />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {LEARNING_MODULES.map((mod) => {
            const prog = moduleProgress[mod.id];
            const title = localized(language, mod.titleHi, mod.titleEn);
            const desc = localized(
              language,
              mod.descriptionHi,
              mod.descriptionEn
            );
            return (
              <Link key={mod.id} href={`/learn/${mod.slug}`}>
                <Card hover>
                  <span className="text-4xl">{mod.emoji}</span>
                  <h2 className="mt-2 text-xl font-semibold">{title}</h2>
                  <p className="text-sm text-muted">{desc}</p>
                  <p className="mt-2 text-xs text-muted">
                    {topicLabel(language, mod.topic)}
                  </p>
                  {prog?.completed && (
                    <span className="mt-2 inline-block rounded-full bg-accent/30 px-3 py-1 text-sm">
                      ✓
                    </span>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
