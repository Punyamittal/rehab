import type { EmotionType } from "@/types";

export interface ScenarioQuestion {
  id: string;
  emoji: string;
  situationHi: string;
  situationEn: string;
  choices: {
    id: string;
    labelHi: string;
    labelEn: string;
    correct: boolean;
    feedbackHi: string;
    feedbackEn: string;
  }[];
}

export const SCENARIO_QUESTIONS: ScenarioQuestion[] = [
  {
    id: "q1",
    emoji: "📚",
    situationHi: "एक साथी परीक्षा से पहले कुछ हानिकारक देने को कहती है।",
    situationEn: "A friend offers something harmful before an exam.",
    choices: [
      {
        id: "a",
        labelHi: "मना करूँगी और मदद लूँगी",
        labelEn: "Refuse and get help",
        correct: true,
        feedbackHi: "बहादुरी! मदद लेना ताकत है।",
        feedbackEn: "Brave! Asking for help is strength.",
      },
      {
        id: "b",
        labelHi: "चुप रह जाऊँगी",
        labelEn: "Stay silent",
        correct: false,
        feedbackHi: "चुप रहना कभी-कभी मुश्किल बना देता है। किसी भरोसेमंद से बात करो।",
        feedbackEn: "Silence can make things harder. Talk to someone you trust.",
      },
    ],
  },
  {
    id: "q2",
    emoji: "🚶‍♀️",
    situationHi: "कोई अजनबी तुम्हें अकेले जाने के लिए कहे।",
    situationEn: "A stranger asks you to go somewhere alone.",
    choices: [
      {
        id: "a",
        labelHi: "ना कहूँ और बड़े को बताऊँ",
        labelEn: "Say no and tell an adult",
        correct: true,
        feedbackHi: "सही! तुम्हारी सुरक्षा सबसे पहले।",
        feedbackEn: "Right! Your safety comes first.",
      },
      {
        id: "b",
        labelHi: "डर के चले जाऊँ",
        labelEn: "Go because you're scared",
        correct: false,
        feedbackHi: "अजनबियों के साथ अकेले न जाओ।",
        feedbackEn: "Don't go alone with strangers.",
      },
    ],
  },
  {
    id: "q3",
    emoji: "👥",
    situationHi: "सभी तुम पर कुछ करने का दबाव डाल रहे हैं जो गलत लगता है।",
    situationEn: "Everyone pressures you to do something that feels wrong.",
    choices: [
      {
        id: "a",
        labelHi: "'नहीं' कहूँगी",
        labelEn: "I will say no",
        correct: true,
        feedbackHi: "'नहीं' तुम्हारा अधिकार है!",
        feedbackEn: "'No' is your right!",
      },
      {
        id: "b",
        labelHi: "सबकी खुशी के लिए हाँ कर दूँ",
        labelEn: "Say yes to please everyone",
        correct: false,
        feedbackHi: "सच्चे दोस्त तुम्हारा सम्मान करते हैं।",
        feedbackEn: "True friends respect you.",
      },
    ],
  },
  {
    id: "q4",
    emoji: "😤",
    situationHi: "तुम किसी बात पर बहुत गुस्सा महसूस कर रही हो।",
    situationEn: "You feel very angry about something.",
    choices: [
      {
        id: "a",
        labelHi: "गहरी साँस लूँ या किसी से बात करूँ",
        labelEn: "Take deep breaths or talk to someone",
        correct: true,
        feedbackHi: "शानदार! भावनाओं को संभालना सीखना ज़रूरी है।",
        feedbackEn: "Great! Managing emotions is important.",
      },
      {
        id: "b",
        labelHi: "किसी पर चिल्लाऊँ",
        labelEn: "Yell at someone",
        correct: false,
        feedbackHi: "पहले शांत हो, फिर बात करो।",
        feedbackEn: "Calm down first, then talk.",
      },
    ],
  },
];

export interface EmotionMatchRound {
  id: string;
  situationHi: string;
  situationEn: string;
  correctEmotion: EmotionType;
}

export const EMOTION_MATCH_ROUNDS: EmotionMatchRound[] = [
  {
    id: "e1",
    situationHi: "परीक्षा कल है और तुम तैयार नहीं लग रही।",
    situationEn: "Exam is tomorrow and you don't feel ready.",
    correctEmotion: "anxious",
  },
  {
    id: "e2",
    situationHi: "तुमने कोई अच्छा काम किया और सबने तारीफ की।",
    situationEn: "You did something good and everyone praised you.",
    correctEmotion: "happy",
  },
  {
    id: "e3",
    situationHi: "कोई दोस्त आज तुमसे बात नहीं कर रहा।",
    situationEn: "A friend isn't talking to you today.",
    correctEmotion: "sad",
  },
  {
    id: "e4",
    situationHi: "नया नियम समझ नहीं आ रहा।",
    situationEn: "A new rule doesn't make sense to you.",
    correctEmotion: "confused",
  },
  {
    id: "e5",
    situationHi: "शांत कोने में बैठकर साँस लेने के बाद।",
    situationEn: "After sitting quietly and breathing.",
    correctEmotion: "calm",
  },
];

export interface SafeOrNotItem {
  id: string;
  textHi: string;
  textEn: string;
  safe: boolean;
  explainHi: string;
  explainEn: string;
}

export const SAFE_OR_NOT_ITEMS: SafeOrNotItem[] = [
  {
    id: "s1",
    textHi: "हाथ खाने से पहले धोना",
    textEn: "Washing hands before eating",
    safe: true,
    explainHi: "स्वच्छता से बीमारी दूर रहती है।",
    explainEn: "Hygiene keeps illness away.",
  },
  {
    id: "s2",
    textHi: "अजनबी के साथ अकेले जाना",
    textEn: "Going alone with a stranger",
    safe: false,
    explainHi: "हमेशा सुरक्षित जगह और लोगों के पास रहो।",
    explainEn: "Stay near safe people and places.",
  },
  {
    id: "s3",
    textHi: "भरोसेमंद दीदी को अपनी परेशानी बताना",
    textEn: "Telling a trusted facilitator your worry",
    safe: true,
    explainHi: "मदद मांगना बहादुरी है।",
    explainEn: "Asking for help is brave.",
  },
  {
    id: "s4",
    textHi: "इंटरनेट पर अपनी निजी जानकारी साझा करना",
    textEn: "Sharing private info online with strangers",
    safe: false,
    explainHi: "निजी बातें सुरक्षित रखो।",
    explainEn: "Keep private information safe.",
  },
  {
    id: "s5",
    textHi: "रोज़ सुबह नहाना",
    textEn: "Bathing every morning",
    safe: true,
    explainHi: "अच्छी आदत स्वस्थ शरीर देती है।",
    explainEn: "Good habits mean a healthy body.",
  },
  {
    id: "s6",
    textHi: "किसी का मज़ाक उदास होकर बर्दाश्त करना",
    textEn: "Silently accepting hurtful jokes",
    safe: false,
    explainHi: "तुम बोल सकती हो — मदद लो।",
    explainEn: "You can speak up — get support.",
  },
];

export interface HabitPair {
  id: string;
  emoji: string;
  labelHi: string;
  labelEn: string;
}

export const HABIT_PAIRS: HabitPair[] = [
  { id: "h1", emoji: "🧼", labelHi: "हाथ धोना", labelEn: "Wash hands" },
  { id: "h2", emoji: "🪥", labelHi: "दाँत साफ़", labelEn: "Brush teeth" },
  { id: "h3", emoji: "🚿", labelHi: "नहाना", labelEn: "Bathe" },
  { id: "h4", emoji: "💧", labelHi: "पानी पीना", labelEn: "Drink water" },
  { id: "h5", emoji: "🥗", labelHi: "सब्ज़ी खाना", labelEn: "Eat vegetables" },
  { id: "h6", emoji: "😴", labelHi: "समय पर सोना", labelEn: "Sleep on time" },
];
