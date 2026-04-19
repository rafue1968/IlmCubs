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