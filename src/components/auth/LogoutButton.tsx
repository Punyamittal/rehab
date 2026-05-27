"use client";

import { useRouter } from "next/navigation";
import { useAppStore } from "@/stores/app-store";
import { t } from "@/lib/i18n/translations";
import { stopSpeaking } from "@/lib/narration/speech";
import { cn } from "@/lib/utils";

interface LogoutButtonProps {
  className?: string;
  variant?: "icon" | "text";
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

const baseRed =
  "border border-red-200/80 bg-gradient-to-br from-red-50 to-rose-100 text-red-700 shadow-[0_2px_12px_rgba(220,38,38,0.12)] transition-all duration-200";

const hoverRed =
  "hover:border-red-300 hover:from-red-100 hover:to-rose-200 hover:text-red-800 hover:shadow-[0_4px_20px_rgba(220,38,38,0.22)] active:scale-[0.98]";

export function LogoutButton({ className, variant = "text" }: LogoutButtonProps) {
  const router = useRouter();
  const language = useAppStore((s) => s.language);
  const role = useAppStore((s) => s.role);
  const logout = useAppStore((s) => s.logout);

  if (!role) return null;

  const handleLogout = () => {
    stopSpeaking();
    logout();
    router.push("/");
  };

  const label = t(language, "logout");

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleLogout}
        className={cn(
          "touch-target flex h-11 w-11 items-center justify-center rounded-2xl",
          baseRed,
          hoverRed,
          className
        )}
        aria-label={label}
        title={label}
      >
        <LogoutIcon className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={cn(
        "touch-target inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-2xl px-6 py-3 text-sm font-semibold tracking-wide",
        baseRed,
        hoverRed,
        "ring-1 ring-red-100/80",
        className
      )}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/15">
        <LogoutIcon className="h-4 w-4" />
      </span>
      {label}
    </button>
  );
}
