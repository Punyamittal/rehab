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
    <header className="no-print sticky top-0 z-30 border-b border-white/55 bg-gradient-to-r from-white/80 via-white/70 to-white/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-2.5 py-2 md:gap-3 md:px-6 md:py-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          {showBack && (
            <Link
              href={backHref}
              className="touch-target flex h-11 w-11 items-center justify-center rounded-xl border border-primary/15 bg-white/85 text-lg text-primary shadow-sm transition-colors hover:bg-white"
              aria-label={t(language, "back")}
            >
              ←
            </Link>
          )}
          {title ? (
            <h1 className="truncate text-sm font-semibold md:text-lg">{title}</h1>
          ) : (
            <Link
              href="/"
              className="flex min-w-0 flex-col rounded-xl px-1 py-0.5 transition-colors hover:bg-white/60"
            >
              <span className="truncate text-sm font-bold text-primary md:text-lg">
                🌸 {t(language, "appName")}
              </span>
              <span className="hidden truncate text-[11px] text-muted sm:block md:text-xs">
                {t(language, "tagline")}
              </span>
            </Link>
          )}
        </div>
        <div className="flex items-center gap-1 rounded-2xl border border-white/70 bg-white/55 p-1 shadow-[0_6px_22px_rgba(74,55,40,0.08)]">
          <LogoutButton variant="icon" />
          <SoundToggle />
          <LanguageSelector />
        </div>
      </div>
    </header>
  );
}
