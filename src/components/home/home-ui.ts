import type { ModuleTopic } from "@/types";

export const TOPIC_ACCENT: Record<
  ModuleTopic,
  { ring: string; bg: string; icon: string; bar: string }
> = {
  peer_pressure: {
    ring: "ring-amber-200/60",
    bg: "from-amber-50 to-orange-100",
    icon: "bg-amber-100 text-amber-800",
    bar: "from-amber-400 to-orange-400",
  },
  hygiene: {
    ring: "ring-pink-200/60",
    bg: "from-pink-50 to-rose-100",
    icon: "bg-pink-100 text-pink-800",
    bar: "from-pink-400 to-rose-400",
  },
  confidence: {
    ring: "ring-violet-200/60",
    bg: "from-violet-50 to-purple-100",
    icon: "bg-violet-100 text-violet-800",
    bar: "from-violet-400 to-purple-400",
  },
  safety: {
    ring: "ring-sky-200/60",
    bg: "from-sky-50 to-cyan-100",
    icon: "bg-sky-100 text-sky-800",
    bar: "from-sky-400 to-cyan-400",
  },
  addiction: {
    ring: "ring-rose-200/60",
    bg: "from-rose-50 to-red-100",
    icon: "bg-rose-100 text-rose-800",
    bar: "from-rose-400 to-red-400",
  },
  communication: {
    ring: "ring-teal-200/60",
    bg: "from-teal-50 to-emerald-100",
    icon: "bg-teal-100 text-teal-800",
    bar: "from-teal-400 to-emerald-400",
  },
  emotional_intelligence: {
    ring: "ring-indigo-200/60",
    bg: "from-indigo-50 to-blue-100",
    icon: "bg-indigo-100 text-indigo-800",
    bar: "from-indigo-400 to-blue-400",
  },
  health: {
    ring: "ring-lime-200/60",
    bg: "from-lime-50 to-green-100",
    icon: "bg-lime-100 text-lime-800",
    bar: "from-lime-400 to-green-400",
  },
  self_esteem: {
    ring: "ring-fuchsia-200/60",
    bg: "from-fuchsia-50 to-pink-100",
    icon: "bg-fuchsia-100 text-fuchsia-800",
    bar: "from-fuchsia-400 to-pink-400",
  },
};

export const QUICK_NAV = [
  {
    href: "/learn",
    emoji: "📖",
    labelKey: "modules" as const,
    descHi: "छोटे पाठ, क्विज़",
    descPa: "ਛੋਟੇ ਪਾਠ, ਕੁਇਜ਼",
    descEn: "Short lessons & quizzes",
    tile: "from-amber-50/90 via-white to-orange-50/80",
    icon: "bg-gradient-to-br from-amber-100 to-orange-200",
  },
  {
    href: "/games",
    emoji: "🎮",
    labelKey: "games" as const,
    descHi: "मज़ेदार अभ्यास",
    descPa: "ਮਜ਼ੇਦਾਰ ਅਭਿਆਸ",
    descEn: "Fun practice",
    tile: "from-violet-50/90 via-white to-purple-50/80",
    icon: "bg-gradient-to-br from-violet-100 to-purple-200",
  },
  {
    href: "/story",
    emoji: "🎭",
    labelKey: "stories" as const,
    descHi: "इंटरैक्टिव कहानियाँ",
    descPa: "ਇੰਟਰਐਕਟਿਵ ਕਹਾਣੀਆਂ",
    descEn: "Interactive stories",
    tile: "from-sky-50/90 via-white to-cyan-50/80",
    icon: "bg-gradient-to-br from-sky-100 to-cyan-200",
  },
  {
    href: "/check-in",
    emoji: "💭",
    labelKey: "emotions" as const,
    descHi: "अपनी भावना बताओ",
    descPa: "ਆਪਣੀ ਭਾਵਨਾ ਦੱਸੋ",
    descEn: "Share how you feel",
    tile: "from-emerald-50/90 via-white to-teal-50/80",
    icon: "bg-gradient-to-br from-emerald-100 to-teal-200",
  },
] as const;
