"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BRANCHING_STORIES } from "@/data/stories";
import { useAppStore } from "@/stores/app-store";
import { t, topicLabel } from "@/lib/i18n/translations";
import { localized } from "@/lib/i18n/content";
import { AppHeader } from "@/components/layout/AppHeader";
import { Card } from "@/components/ui/Card";

export default function StoriesCatalogPage() {
  const { language } = useAppStore();

  return (
    <>
      <AppHeader showBack backHref="/home" title={t(language, "stories")} />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <p className="mb-6 text-muted">{t(language, "storiesPageIntro")}</p>

        <div className="grid gap-4 sm:grid-cols-2">
          {BRANCHING_STORIES.map((story, i) => {
            const title = localized(language, story.titleHi, story.titleEn);
            const desc = localized(
              language,
              story.descriptionHi,
              story.descriptionEn
            );
            return (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link href={`/story/${story.slug}`}>
                  <Card hover>
                    <span className="text-4xl">{story.emoji}</span>
                    <h2 className="mt-2 text-xl font-semibold">{title}</h2>
                    <p className="text-sm text-muted">{desc}</p>
                    <p className="mt-2 text-xs text-muted">
                      {topicLabel(language, story.topic)} ·{" "}
                      {story.durationMinutes} {t(language, "minutes")}
                    </p>
                    {i === 0 && (
                      <span className="mt-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        {t(language, "featured")}
                      </span>
                    )}
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </>
  );
}
