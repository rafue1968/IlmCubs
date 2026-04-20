export type QuizChoice = {
  id: number;
  latinName: string;
  arabicName: string;
};

export type QuizQuestion = {
  id: string;
  chapterId: number;
  surahTitle: string;
  surahArabicTitle: string;
  arabicText: string;
  translationText: string;
  verseKey: string;
  choices: QuizChoice[];
};

export type QuizState = {
  currentIndex: number;
  score: number;
  selectedChoiceId: number | null;
};


type GeminiMatchSurahQuestion = {
  verseKey: string;
  arabicText: string;
  translationText: string;

  story: string;
  prompt: string;
  hint: string;
  goodDeed: string;

  correctChapterId: number;
  correctSurahName: string;
  correctSurahArabic: string;

  choices: QuizChoice[];

  successMessage: string;
  retryMessage: string;
};