import type { GuidanceSession } from "@/types";

export const GUIDANCE_SESSIONS: GuidanceSession[] = [
  {
    id: "guide-peer-pressure",
    moduleSlug: "peer-pressure",
    titleHi: "साथियों का दबाव — सत्र मार्गदर्शन",
    titleEn: "Peer Pressure — Session Guide",
    durationMinutes: 15,
    steps: [
      {
        id: "g1",
        titleHi: "परिचय",
        titleEn: "Introduction",
        promptHi: "सभी को बैठने दें। पूछें: 'क्या कभी किसी ने तुमसे असहज काम करने को कहा?'",
        promptEn: "Let everyone sit. Ask: 'Has anyone ever asked you to do something uncomfortable?'",
        durationMinutes: 3,
        tipHi: "एक एक करके सुनें, कोई भी जवाब गलत नहीं है।",
        tipEn: "Listen one by one; no answer is wrong.",
      },
      {
        id: "g2",
        titleHi: "मॉड्यूल चलाएँ",
        titleEn: "Run module",
        promptHi: "छात्राओं को मॉड्यूल देखने दें। साथ में रहें।",
        promptEn: "Let students watch the module. Stay with them.",
        durationMinutes: 5,
        tipHi: "रुकने पर प्रोत्साहित करें, जल्दी मत कराएँ।",
        tipEn: "Encourage pauses; don't rush.",
      },
      {
        id: "g3",
        titleHi: "चर्चा",
        titleEn: "Discussion",
        promptHi: "'नहीं' कहना कैसा लगता है? कोई उदाहरण साझा करना चाहती है?",
        promptEn: "How does it feel to say 'no'? Anyone want to share an example?",
        durationMinutes: 4,
      },
      {
        id: "g4",
        titleHi: "भावना चेक-इन",
        titleEn: "Emotion check-in",
        promptHi: "सत्र के बाद भावना चेक-इन करवाएँ।",
        promptEn: "Conduct post-session emotion check-in.",
        durationMinutes: 2,
      },
      {
        id: "g5",
        titleHi: "समापन",
        titleEn: "Closing",
        promptHi: "धन्यवाद कहें। याद दिलाएँ: मदद हमेशा उपलब्ध है।",
        promptEn: "Say thank you. Remind: help is always available.",
        durationMinutes: 1,
      },
    ],
  },
];

export function getGuidanceByModuleSlug(
  slug: string
): GuidanceSession | undefined {
  return GUIDANCE_SESSIONS.find((g) => g.moduleSlug === slug);
}
