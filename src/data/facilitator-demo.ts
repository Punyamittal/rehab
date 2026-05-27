import type { FacilitatorStudentRow } from "@/types";

export const DEMO_FACILITATOR_STUDENTS: FacilitatorStudentRow[] = [
  {
    student: { id: "s1", alias: "बुलबुल", avatarEmoji: "🌸", centreId: "c1" },
    modulesCompleted: 3,
    totalModules: 4,
    preEmotion: "anxious",
    lastEmotion: "happy",
    presentToday: true,
    note: "आज सक्रिय भागीदारी",
  },
  {
    student: { id: "s2", alias: "गुलाब", avatarEmoji: "🌹", centreId: "c1" },
    modulesCompleted: 1,
    totalModules: 4,
    preEmotion: "sad",
    lastEmotion: "calm",
    presentToday: true,
  },
  {
    student: { id: "s3", alias: "चमेली", avatarEmoji: "🌼", centreId: "c1" },
    modulesCompleted: 2,
    totalModules: 4,
    preEmotion: "confused",
    lastEmotion: "happy",
    presentToday: false,
  },
  {
    student: { id: "s4", alias: "कमल", avatarEmoji: "🪷", centreId: "c1" },
    modulesCompleted: 4,
    totalModules: 4,
    preEmotion: "happy",
    lastEmotion: "happy",
    presentToday: true,
    note: "सभी मॉड्यूल पूरे",
  },
];
