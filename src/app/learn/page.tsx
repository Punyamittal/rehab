"use client";

import Link from "next/link";
import { useAppStore } from "@/stores/app-store";
import { useCatalogStore } from "@/stores/catalog-store";
import { localized } from "@/lib/i18n/content";
import { t } from "@/lib/i18n/translations";
import { AppHeader } from "@/components/layout/AppHeader";
import { CatalogLoader } from "@/components/ui/CatalogLoader";
import { NarrationButton } from "@/components/audio/NarrationButton";

export default function LearnPage() {
  const language = useAppStore((s) => s.language);
  const modules = useCatalogStore((s) => s.modules);
  const moduleProgress = useAppStore((s) => s.moduleProgress);

  return (
    <CatalogLoader>
      <AppHeader showBack backHref="/home" title={t(language, "modules")} />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="grid gap-4">
          {modules.map((mod) => {
            const prog = moduleProgress[mod.id];
            const title = localized(language, mod.titleHi, mod.titleEn);
            const desc = localized(language, mod.descriptionHi, mod.descriptionEn);
            const narrationText = `${title}. ${desc}`;
            return (
              <Link
                key={mod.id}
                href={`/learn/${mod.slug}`}
                className="flex items-center gap-4 rounded-3xl bg-white/80 p-6 shadow-[var(--safe-shadow)] transition-transform hover:scale-[1.01]"
              >
                <span className="text-4xl">{mod.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xl font-semibold">{title}</p>
                    <div
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <NarrationButton text={narrationText} size="sm" />
                    </div>
                  </div>
                  <p className="text-sm text-muted">
                    {prog?.completed
                      ? "✓ " + t(language, "statusDone")
                      : t(language, "start")}
                  </p>
                </div>
                <span className="text-2xl text-primary">→</span>
              </Link>
            );
          })}
        </div>
      </div>
    </CatalogLoader>
  );
}
