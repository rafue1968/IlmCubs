export type QuizMode = "beginner" | "juz-amma" | "protection" | "stories";

export type MatchSurahModeConfig = {
  totalRounds: number;
  optionCount: number;
  allowedChapterIds: number[];
  label: string;
};

export const MATCH_SURAH_MODE_CONFIGS: Record<QuizMode, MatchSurahModeConfig> = {
  beginner: {
    label: "Beginner",
    totalRounds: 5,
    optionCount: 2,
    allowedChapterIds: [112, 113, 114],
  },
  "juz-amma": {
    label: "Juz Amma",
    totalRounds: 5,
    optionCount: 4,
    allowedChapterIds: [105, 106, 107, 108, 109, 110, 111, 112, 113, 114],
  },
  protection: {
    label: "Protection",
    totalRounds: 5,
    optionCount: 3,
    allowedChapterIds: [113, 114],
  },
  stories: {
    label: "Stories",
    totalRounds: 5,
    optionCount: 4,
    allowedChapterIds: [105, 106, 111],
  },
};