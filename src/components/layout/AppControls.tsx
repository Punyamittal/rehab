"use client";

import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { SoundToggle } from "@/components/audio/SoundToggle";
import { VoiceCommandToggle } from "@/components/audio/VoiceCommandToggle";
import { HeardButton } from "@/components/audio/HeardButton";
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
      <VoiceCommandToggle />
      <HeardButton />
      <SoundToggle />
      <LanguageSelector />
    </div>
  );
}
