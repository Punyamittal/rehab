import type { BranchingStory } from "@/types";

export const BRANCHING_STORIES: BranchingStory[] = [
  {
    id: "story-do-raste",
    slug: "do-raste",
    titleHi: "दो रास्ते",
    titleEn: "Two Paths",
    descriptionHi:
      "आशा, रिया और तान्या — peer pressure, सही फैसला, और मदद मांगने की कहानी।",
    descriptionEn:
      "Asha, Riya, and Tanya — a story about peer pressure, saying no, and asking for help.",
    topic: "peer_pressure",
    durationMinutes: 6,
    emoji: "🛤️",
    format: "interactive",
    facilitatorPromptsHi: [
      "क्यों कई लोग peer pressure में आ जाते हैं?",
      "ना बोलना मुश्किल क्यों लगता है?",
      "एक अच्छा दोस्त कैसा होता है?",
      "क्या डर decision बदल देता है?",
    ],
    facilitatorPromptsEn: [
      "Why do many people give in to peer pressure?",
      "Why does saying no feel difficult?",
      "What makes a good friend?",
      "Does fear change our decisions?",
    ],
    startNodeId: "",
    nodes: {},
    scenes: [
      {
        id: "intro-1",
        type: "scene",
        character: "narrator",
        emoji: "💭",
        reaction: "float",
        narrativeHi:
          "क्या आपने कभी सिर्फ फिट होने के लिए कुछ ऐसा किया… जो आपको अंदर से गलत लगा हो?",
        narrativeEn:
          "Have you ever done something just to fit in… that felt wrong inside?",
      },
      {
        id: "intro-2",
        type: "scene",
        character: "narrator",
        emoji: "👧",
        reaction: "pulse",
        narrativeHi: "आज आशा के सामने भी यही सवाल है...",
        narrativeEn: "Today Asha faces the same question...",
      },
      {
        id: "intro-caption",
        type: "caption",
        character: "narrator",
        narrativeHi: "",
        narrativeEn: "",
        captionHi: "क्या आप सही फैसला कर पाएंगे?",
        captionEn: "Can you make the right choice?",
        emoji: "🤔",
        reaction: "bounce",
      },
      {
        id: "q1",
        type: "interactive",
        character: "narrator",
        narrativeHi:
          "क्या आपने कभी दोस्तों के दबाव में कोई काम किया है?",
        narrativeEn:
          "Have you ever done something because of pressure from friends?",
        facilitatorPromptHi: "कोई छोटा example share करना चाहेगा?",
        facilitatorPromptEn: "Would anyone like to share a small example?",
        choices: [
          { id: "yes", labelHi: "हाँ", labelEn: "Yes" },
          { id: "no", labelHi: "नहीं", labelEn: "No" },
          { id: "maybe", labelHi: "शायद", labelEn: "Maybe" },
        ],
      },
      {
        id: "corridor-cinematic",
        type: "cinematic",
        character: "narrator",
        narrativeHi: "स्कूल corridor, lunch break — तीन दोस्त, एक मुश्किल फैसला।",
        narrativeEn:
          "School corridor, lunch break — three friends, one difficult decision.",
        cinematic: {
          settingHi: "लंच ब्रेक · स्कूल corridor",
          settingEn: "Lunch break · School corridor",
          dialogues: [
            {
              character: "tanya",
              textHi: "इतना भी क्या डरना? सब try करते हैं.",
              textEn: "Why so scared? Everyone tries it.",
              emoji: "😏",
              reaction: "wobble",
            },
            {
              character: "asha",
              textHi: "मुझे नहीं पता… शायद ये गलत है…",
              textEn: "I don't know… maybe this is wrong…",
              emoji: "😰",
              reaction: "shake",
            },
            {
              character: "riya",
              textHi: "गलत लग रहा है तो मत करो. ना बोलना ठीक है.",
              textEn: "If it feels wrong, don't do it. Saying no is okay.",
              emoji: "💚",
              reaction: "pulse",
            },
          ],
        },
        choices: [
          {
            id: "pressure",
            labelHi: "Pressure में आ जाओ",
            labelEn: "Give in to pressure",
          },
          {
            id: "refuse",
            labelHi: "ना बोलो",
            labelEn: "Say no",
          },
          {
            id: "help",
            labelHi: "मदद मांगो",
            labelEn: "Ask for help",
          },
        ],
      },
      {
        id: "s4-riya-1",
        type: "scene",
        character: "riya",
        narrativeHi: "आशा, तू uncomfortable लग रही है।",
        narrativeEn: "Asha, you look uncomfortable.",
        emoji: "💚",
        reaction: "pulse",
      },
      {
        id: "s4-asha-2",
        type: "scene",
        character: "asha",
        narrativeHi: "मुझे नहीं करना…",
        narrativeEn: "I don't want to…",
        emoji: "😟",
        reaction: "shake",
      },
      {
        id: "s4-tanya-3",
        type: "scene",
        character: "tanya",
        narrativeHi: "इतनी बच्ची मत बन।",
        narrativeEn: "Don't act like such a child.",
        emoji: "😒",
        reaction: "wobble",
      },
      {
        id: "s4-riya-2",
        type: "scene",
        character: "riya",
        narrativeHi: "ना बोलना कमजोरी नहीं होती।",
        narrativeEn: "Saying no is not a weakness.",
        emoji: "✊",
        reaction: "pulse",
      },
      {
        id: "s4-riya-3",
        type: "scene",
        character: "riya",
        narrativeHi:
          "कभी-कभी सबसे strong decision… group से अलग होना होता है।",
        narrativeEn:
          "Sometimes the strongest decision… is to stand apart from the group.",
        emoji: "🌟",
        reaction: "sparkle",
      },
      {
        id: "s4-split",
        type: "split",
        character: "narrator",
        narrativeHi: "ध्यान दीजिए… कौन सा रास्ता future बेहतर बनाएगा?",
        narrativeEn: "Pay attention… which path will make a better future?",
        split: {
          left: {
            titleHi: "अस्थायी स्वीकृति",
            titleEn: "Temporary approval",
            itemsHi: ["जोखिम भरा व्यवहार", "अंदर से बेचैनी"],
            itemsEn: ["Risky behavior", "Inner unease"],
            tone: "risky",
          },
          right: {
            titleHi: "आत्म-सम्मान",
            titleEn: "Self-respect",
            itemsHi: ["सुरक्षा", "आत्मविश्वास"],
            itemsEn: ["Safety", "Confidence"],
            tone: "safe",
          },
        },
      },
      {
        id: "q3",
        type: "quiz",
        character: "narrator",
        narrativeHi: "सच्चा दोस्त कौन है?",
        narrativeEn: "Who is a true friend?",
        choices: [
          { id: "pressure", labelHi: "जो दबाव डाले", labelEn: "Who pressures you" },
          {
            id: "mock",
            labelHi: "जो मजाक उड़ाए",
            labelEn: "Who makes fun of you",
          },
          {
            id: "listen",
            labelHi: "जो आपकी बात सुने",
            labelEn: "Who listens to you",
            correct: true,
          },
          {
            id: "unsafe",
            labelHi: "जो unsafe काम करवाए",
            labelEn: "Who pushes unsafe things",
          },
        ],
      },
      {
        id: "s5-asha-fear",
        type: "scene",
        character: "asha",
        emoji: "😨",
        reaction: "shake",
        narrativeHi:
          "मुझे डर लग रहा था कि लोग मुझे judge करेंगे…",
        narrativeEn: "I was afraid people would judge me…",
      },
      {
        id: "s5-riya-respect",
        type: "scene",
        character: "riya",
        emoji: "💪",
        reaction: "pulse",
        narrativeHi: "Real लोग तुम्हें respect करेंगे।",
        narrativeEn: "Real people will respect you.",
      },
      {
        id: "s5-narrator",
        type: "scene",
        character: "narrator",
        emoji: "🫂",
        reaction: "float",
        narrativeHi:
          "कई बार हमें गलत काम नहीं… अकेले पड़ने का डर होता है।",
        narrativeEn:
          "Often we're not afraid of the wrong thing itself… but of being left alone.",
      },
      {
        id: "q4",
        type: "interactive",
        character: "narrator",
        narrativeHi:
          "अगर आपके साथ ऐसा हो तो आप कैसा महसूस करेंगे?",
        narrativeEn: "If this happened to you, how would you feel?",
        choices: [
          { id: "fear", labelHi: "डर", labelEn: "Fear" },
          { id: "anger", labelHi: "गुस्सा", labelEn: "Anger" },
          { id: "confusion", labelHi: "confusion", labelEn: "Confusion" },
          { id: "pressure", labelHi: "pressure", labelEn: "Pressure" },
          { id: "confidence", labelHi: "confidence", labelEn: "Confidence" },
        ],
      },
      {
        id: "s6-asha-no",
        type: "scene",
        character: "asha",
        emoji: "✋",
        reaction: "bounce",
        narrativeHi: "मैं नहीं करूंगी।",
        narrativeEn: "I'm not going to do it.",
      },
      {
        id: "s6-tanya-leave",
        type: "scene",
        character: "tanya",
        narrativeHi: "तान्या आँखें घुमाकर चली जाती है।",
        narrativeEn: "Tanya rolls her eyes and walks away.",
        emoji: "🙄",
        reaction: "wobble",
      },
      {
        id: "s6-riya-food",
        type: "scene",
        character: "riya",
        narrativeHi: "चल, कुछ खाना खाते हैं।",
        narrativeEn: "Come on, let's get something to eat.",
        emoji: "🍽️",
        reaction: "pulse",
      },
      {
        id: "s6-narrator",
        type: "scene",
        character: "narrator",
        emoji: "✨",
        reaction: "sparkle",
        narrativeHi: "हर छोटा फैसला… आपकी कहानी बदल सकता है।",
        narrativeEn: "Every small decision… can change your story.",
      },
      {
        id: "learning-loop",
        type: "learning",
        character: "narrator",
        emoji: "📌",
        reaction: "pulse",
        narrativeHi: "याद रखें:",
        narrativeEn: "Remember:",
        learningPointsHi: [
          "🙅 ना कहना ठीक है।",
          "🆘 मदद मांगना ठीक है।",
          "🌟 अलग होना गलत नहीं है।",
        ],
        learningPointsEn: [
          "🙅 Saying no is okay.",
          "🆘 Asking for help is okay.",
          "🌟 Standing apart is not wrong.",
        ],
      },
      {
        id: "q5",
        type: "interactive",
        character: "narrator",
        narrativeHi:
          "अगर आपका दोस्त pressure में हो तो आप क्या करेंगे?",
        narrativeEn:
          "If your friend is under pressure, what would you do?",
        choices: [
          { id: "ignore", labelHi: "Ignore करूँ", labelEn: "Ignore them" },
          {
            id: "support",
            labelHi: "Support करूँ",
            labelEn: "Support them",
          },
          {
            id: "mock",
            labelHi: "मजाक उड़ाऊँ",
            labelEn: "Make fun of them",
          },
          {
            id: "inform",
            labelHi: "भरोसेमंद adult को बताऊँ",
            labelEn: "Tell a trusted adult",
          },
        ],
      },
      {
        id: "ending",
        type: "ending",
        character: "narrator",
        emoji: "🛡️",
        reaction: "sparkle",
        narrativeHi: "तुमने strong decision लेने की practice की।",
        narrativeEn: "You practiced making strong decisions.",
        badge: {
          emoji: "🛡️",
          labelHi: "Strong Decision Maker",
          labelEn: "Strong Decision Maker",
        },
      },
    ],
  },
  {
    id: "story-exam-pressure",
    slug: "exam-pressure",
    titleHi: "परीक्षा से पहले",
    titleEn: "Before the Exam",
    descriptionHi: "रीना और मीना — exam stress और सही choice की कहानी।",
    descriptionEn: "Rina and Meena — a story about exam stress and making the right choice.",
    topic: "addiction",
    durationMinutes: 4,
    emoji: "📚",
    format: "branching",
    startNodeId: "start",
    nodes: {
      start: {
        id: "start",
        narrativeHi:
          "रीना की परीक्षा कल है। उसकी सहेली मीना उसे छत पर ले जाती है और कहती है — 'एक बार ले ले, तनाव कम होगा।' रीना के मन में उलझन है।",
        narrativeEn:
          "Rina's exam is tomorrow. Her friend Meena takes her to the roof and says — 'Just try once, it'll reduce stress.' Rina feels confused.",
        choices: [
          {
            id: "accept",
            labelHi: "हाँ, एक बार ले लूँ",
            labelEn: "Yes, I'll try once",
            nextNodeId: "accept-path",
            emotionalTag: "anxious",
          },
          {
            id: "refuse",
            labelHi: "नहीं, मुझे नहीं चाहिए",
            labelEn: "No, I don't want it",
            nextNodeId: "refuse-path",
            emotionalTag: "calm",
          },
          {
            id: "help",
            labelHi: "किसी बड़े से बात करूँ",
            labelEn: "Talk to a trusted adult",
            nextNodeId: "help-path",
            emotionalTag: "happy",
          },
        ],
      },
      "accept-path": {
        id: "accept-path",
        narrativeHi:
          "रीना ने ले लिया। पहले थोड़ा अजीब लगा, फिर चक्कर आने लगे। उसे डर लगा। अब वह समझती है — यह समाधान नहीं था।",
        narrativeEn:
          "Rina tried it. At first it felt strange, then she got dizzy. She was scared. Now she understands — this wasn't a solution.",
        isEnding: true,
        outcomeHi:
          "सीख: हानिकारक चीज़ें तनाव कम नहीं करतीं। सही मदद लेना बहादुरी है।",
        outcomeEn:
          "Learning: Harmful things don't reduce stress. Getting proper help is brave.",
      },
      "refuse-path": {
        id: "refuse-path",
        narrativeHi:
          "रीना ने शांति से कहा — 'नहीं, मुझे यह ठीक नहीं लगता।' मीना पहले नाराज़ हुई, फिर चली गई। रीना को अंदर से अच्छा लगा।",
        narrativeEn:
          "Rina calmly said — 'No, this doesn't feel right.' Meena was upset at first, then left. Rina felt good inside.",
        isEnding: true,
        outcomeHi:
          "सीख: 'नहीं' कहना तुम्हारा अधिकार है। सच्चे दोस्त तुम्हारा सम्मान करते हैं।",
        outcomeEn:
          "Learning: Saying 'no' is your right. True friends respect you.",
      },
      "help-path": {
        id: "help-path",
        narrativeHi:
          "रीना ने सुविधाकर्ता दीदी से बात की। दीदी ने समझाया और मीना से भी बात की। रीना को सुरक्षित महसूस हुआ।",
        narrativeEn:
          "Rina talked to her facilitator. She explained everything and spoke with Meena too. Rina felt safe.",
        isEnding: true,
        outcomeHi:
          "सीख: मदद मांगना कमज़ोरी नहीं — यह ताकत है। तुम कभी अकेली नहीं हो।",
        outcomeEn:
          "Learning: Asking for help isn't weakness — it's strength. You're never alone.",
      },
    },
  },
];

export function getStoryBySlug(slug: string): BranchingStory | undefined {
  return BRANCHING_STORIES.find((s) => s.slug === slug);
}
