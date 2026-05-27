"use client";

import Link from "next/link";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { SoundToggle } from "@/components/audio/SoundToggle";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { useAppStore } from "@/stores/app-store";
import { t } from "@/lib/i18n/translations";

interface AppHeaderProps {
  showBack?: boolean;
  backHref?: string;
  title?: string;
}

export function AppHeader({ showBack, backHref = "/", title }: AppHeaderProps) {
  const language = useAppStore((s) => s.language);

  return (
    <header className="no-print sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-white/50 bg-white/70 px-4 py-3 shadow-[0_4px_24px_rgba(74,55,40,0.06)] backdrop-blur-lg md:px-8">
      <div className="flex items-center gap-3">
        {showBack && (
          <Link
            href={backHref}
            className="touch-target flex items-center justify-center rounded-2xl bg-white/70 px-3 text-lg"
            aria-label={t(language, "back")}
          >
            ←
          </Link>
        )}
        {title ? (
          <h1 className="text-lg font-semibold md:text-xl">{title}</h1>
        ) : (
          <Link href="/" className="flex flex-col">
            <span className="text-lg font-bold text-primary">
              🌸 {t(language, "appName")}
            </span>
            <span className="text-xs text-muted">{t(language, "tagline")}</span>
          </Link>
        )}
      </div>
      <div className="flex items-center gap-2">
        <LogoutButton variant="icon" />
        <SoundToggle />
        <LanguageSelector />
      </div>
    </header>
  );
}
