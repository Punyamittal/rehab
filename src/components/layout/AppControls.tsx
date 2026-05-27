"use client";

import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { SoundToggle } from "@/components/audio/SoundToggle";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { cn } from "@/lib/utils";

interface AppControlsProps {
  className?: string;
  showLogout?: boolean;
}

/** Sound, language, and optional logout — for pages without AppHeader. */
export function AppControls({ className, showLogout = true }: AppControlsProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showLogout && <LogoutButton variant="icon" />}
      <SoundToggle />
      <LanguageSelector />
    </div>
  );
}
