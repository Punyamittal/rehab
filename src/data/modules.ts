import type { LearningModule } from "@/types";

export const LEARNING_MODULES: LearningModule[] = [
  {
    id: "mod-peer-pressure",
    slug: "peer-pressure",
    titleHi: "साथियों का दबाव",
    titleEn: "Peer Pressure",
    descriptionHi: "दबाव में सही फैसला कैसे लें",
    descriptionEn: "Making good choices under pressure",
    topic: "peer_pressure",
    durationMinutes: 4,
    emoji: "🤝",
    slides: [
      {
        id: "s1",
        type: "content",
        titleHi: "दबाव क्या है?",
        titleEn: "What is pressure?",
        bodyHi:
          "कभी-कभी दोस्त या साथी कुछ ऐसा करने को कहते हैं जो तुम सही नहीं समझती। यही 'दबाव' है। तुम अकेली नहीं हो — मदद मांगना बहादुरी है।",
        bodyEn:
          "Sometimes friends ask you to do something that doesn't feel right. That's pressure. You're not alone — asking for help is brave.",
        narrationHint: "दबाव के बारे में सोचो",
      },
      {
        id: "s2",
        type: "quiz",
        titleHi: "तुम क्या करोगी?",
        titleEn: "What would you do?",
        bodyHi: "एक साथी परीक्षा से पहले कुछ हानिकारक लेने को कहती है।",
        bodyEn: "A friend offers something harmful before an exam.",
        choices: [
          { id: "a", labelHi: "मना कर दूँगी", labelEn: "I will refuse", correct: true },
          { id: "b", labelHi: "चुप रहूँगी", labelEn: "Stay silent" },
          { id: "c", labelHi: "किसी बड़े से मदद लूँगी", labelEn: "Ask an adult for help", correct: true },
        ],
      },
      {
        id: "s3",
        type: "content",
        titleHi: "मना करना सीखो",
        titleEn: "Learn to say no",
        bodyHi:
          "'नहीं, मुझे यह ठीक नहीं लगता' — यह वाक्य तुम्हारा दोस्त है। आवाज शांत रखो, आँखों में देखकर बोलो।",
        bodyEn:
          "'No, this doesn't feel right to me' — this sentence is your friend. Speak calmly and look them in the eye.",
      },
      {
        id: "s4",
        type: "checkpoint",
        titleHi: "चेकपॉइंट ✨",
        titleEn: "Checkpoint",
        bodyHi: "बहुत अच्छा! तुमने दबाव के बारे में महत्वपूर्ण बातें सीखीं।",
        bodyEn: "Great! You've learned important things about pressure.",
      },
    ],
  },
  {
    id: "mod-hygiene",
    slug: "hygiene",
    titleHi: "स्वच्छता की आदतें",
    titleEn: "Hygiene Habits",
    descriptionHi: "रोज़ की छोटी आदतें, बड़ा स्वास्थ्य",
    descriptionEn: "Small daily habits, big health",
    topic: "hygiene",
    durationMinutes: 3,
    emoji: "🧼",
    slides: [
      {
        id: "s1",
        type: "content",
        titleHi: "हाथ धोना",
        titleEn: "Hand washing",
        bodyHi: "खाने से पहले और बाथरूम के बाद हाथ ज़रूर धोओ। 20 सेकंड गुनगुनाओ — यह मज़ेदार है!",
        bodyEn: "Wash hands before eating and after the bathroom. Hum for 20 seconds — it's fun!",
      },
      {
        id: "s2",
        type: "quiz",
        titleHi: "सही आदत",
        titleEn: "Right habit",
        bodyHi: "सबसे अच्छी आदत कौन सी है?",
        bodyEn: "Which is the best habit?",
        choices: [
          { id: "a", labelHi: "रोज़ नहाना", labelEn: "Bathing daily", correct: true },
          { id: "b", labelHi: "कपड़े हफ्ते भर न पहनना", labelEn: "Wearing clothes all week" },
        ],
      },
      {
        id: "s3",
        type: "checkpoint",
        titleHi: "शाबाश!",
        titleEn: "Well done!",
        bodyHi: "तुम स्वच्छता की रानी बन रही हो!",
        bodyEn: "You're becoming a hygiene champion!",
      },
    ],
  },
  {
    id: "mod-confidence",
    slug: "confidence",
    titleHi: "मुझ पर भरोसा",
    titleEn: "Believe in Me",
    descriptionHi: "आत्मविश्वास बढ़ाने के छोटे कदम",
    descriptionEn: "Small steps to build confidence",
    topic: "confidence",
    durationMinutes: 5,
    emoji: "⭐",
    slides: [
      {
        id: "s1",
        type: "content",
        titleHi: "तुम विशेष हो",
        titleEn: "You are special",
        bodyHi: "हर लड़की में कुछ अनोखा होता है। आज एक चीज़ लिखो जो तुम अच्छी करती हो।",
        bodyEn: "Every girl has something unique. Write one thing you do well today.",
      },
      {
        id: "s2",
        type: "content",
        titleHi: "सकारात्मक बात",
        titleEn: "Positive talk",
        bodyHi: "खुद से दोस्त की तरह बात करो: 'मैं कोशिश कर सकती हूँ।'",
        bodyEn: "Talk to yourself like a friend: 'I can try.'",
      },
      {
        id: "s3",
        type: "checkpoint",
        titleHi: "तारा मिला!",
        titleEn: "Star earned!",
        bodyHi: "तुमने आत्मविश्वास का मॉड्यूल पूरा किया!",
        bodyEn: "You completed the confidence module!",
      },
    ],
  },
  {
    id: "mod-safety",
    slug: "personal-safety",
    titleHi: "अपनी सुरक्षा",
    titleEn: "Personal Safety",
    descriptionHi: "सुरक्षित रहने के नियम",
    descriptionEn: "Rules to stay safe",
    topic: "safety",
    durationMinutes: 4,
    emoji: "🛡️",
    slides: [
      {
        id: "s1",
        type: "content",
        titleHi: "सुरक्षित स्थान",
        titleEn: "Safe places",
        bodyHi: "जहाँ तुम सुरक्षित महसूस करो — वहाँ रहो। असहज लगे तो वहाँ से हटो और किसी भरोसेमंद व्यक्ति को बताओ।",
        bodyEn: "Stay where you feel safe. If uncomfortable, leave and tell someone you trust.",
      },
      {
        id: "s2",
        type: "checkpoint",
        titleHi: "सुरक्षा ज्ञान",
        titleEn: "Safety knowledge",
        bodyHi: "तुम अपनी सुरक्षा के बारे में जागरूक हो!",
        bodyEn: "You're aware of your personal safety!",
      },
    ],
  },
];

export function getModuleBySlug(slug: string): LearningModule | undefined {
  return LEARNING_MODULES.find((m) => m.slug === slug);
}

export function getModuleById(id: string): LearningModule | undefined {
  return LEARNING_MODULES.find((m) => m.id === id);
}
