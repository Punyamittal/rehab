"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StoryEngine } from "@/components/story/StoryEngine";
import { EmotionCheckIn } from "@/components/emotion/EmotionCheckIn";
import { useAppStore } from "@/stores/app-store";
import { useCatalogStore } from "@/stores/catalog-store";
import { t } from "@/lib/i18n/translations";
import { AppControls } from "@/components/layout/AppControls";
import { CatalogLoader } from "@/components/ui/CatalogLoader";

type Phase = "pre" | "story" | "post" | "done";

export default function StoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const language = useAppStore((s) => s.language);
  const getStoryBySlug = useCatalogStore((s) => s.getStoryBySlug);
  const story = getStoryBySlug(slug);
  const [phase, setPhase] = useState<Phase>("pre");

  useEffect(() => {
    if (phase === "story") {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      return () => {
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
      };
    }
  }, [phase]);

  if (!story) {
    return (
      <CatalogLoader>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
          <AppControls />
          <p>{t(language, "storyNotFound")}</p>
        </div>
      </CatalogLoader>
    );
  }

  if (phase === "pre") {
    return (
      <EmotionCheckIn
        checkType="pre"
        onComplete={() => setPhase("story")}
      />
    );
  }

  if (phase === "story") {
    return (
      <StoryEngine
        story={story}
        onComplete={() => setPhase("post")}
        onExit={() => router.push("/story")}
      />
    );
  }

  if (phase === "post") {
    return (
      <EmotionCheckIn
        checkType="post"
        onComplete={() => setPhase("done")}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <div className="absolute right-4 top-4">
        <AppControls />
      </div>
      <button
        type="button"
        onClick={() => router.push("/home")}
        className="touch-target rounded-2xl bg-primary px-8 py-4 text-white"
      >
        ← {t(language, "home")}
      </button>
    </div>
  );
}
