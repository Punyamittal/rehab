"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ModulePlayer } from "@/components/learning/ModulePlayer";
import { EmotionCheckIn } from "@/components/emotion/EmotionCheckIn";
import { useAppStore } from "@/stores/app-store";
import { useCatalogStore } from "@/stores/catalog-store";
import { t } from "@/lib/i18n/translations";
import { Button } from "@/components/ui/Button";
import { AppControls } from "@/components/layout/AppControls";
import { CatalogLoader } from "@/components/ui/CatalogLoader";

type Phase = "pre" | "learning" | "post" | "done";

export default function ModulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const language = useAppStore((s) => s.language);
  const getModuleBySlug = useCatalogStore((s) => s.getModuleBySlug);
  const mod = getModuleBySlug(slug);
  const [phase, setPhase] = useState<Phase>("pre");

  if (!mod) {
    return (
      <CatalogLoader>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
          <AppControls />
          <p>{t(language, "moduleNotFound")}</p>
        </div>
      </CatalogLoader>
    );
  }

  if (phase === "pre") {
    return (
      <EmotionCheckIn
        checkType="pre"
        moduleId={mod.id}
        onComplete={() => setPhase("learning")}
      />
    );
  }

  if (phase === "learning") {
    return (
      <ModulePlayer
        module={mod}
        onComplete={() => setPhase("post")}
        onExit={() => router.push("/home")}
      />
    );
  }

  if (phase === "post") {
    return (
      <EmotionCheckIn
        checkType="post"
        moduleId={mod.id}
        onComplete={() => setPhase("done")}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <div className="absolute right-4 top-4">
        <AppControls />
      </div>
      <span className="text-6xl">⭐</span>
      <p className="text-center text-2xl font-semibold">
        {mod.emoji} {t(language, "moduleCompleteCelebration")}
      </p>
      <Button size="lg" onClick={() => router.push("/home")}>
        → {t(language, "home")}
      </Button>
    </div>
  );
}
