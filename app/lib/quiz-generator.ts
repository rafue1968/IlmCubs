import type { QuranChapter, QuranVerse } from "@/app/lib/quran";
import type {
  MatchSurahModeConfig,
} from "@/app/lib/quiz-config";
import type { QuizChoice, QuizQuestion } from "@/app/lib/quiz-types";

export function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

export function pickQuestionVerse(verses: QuranVerse[]): QuranVerse | null {
  const filtered = verses.filter(
    (verse) =>
      Boolean(verse.text_uthmani) && Boolean(verse.translations?.[0]?.text)
  );

  if (filtered.length === 0) {
    return null;
  }

  return filtered[Math.floor(Math.random() * filtered.length)] ?? null;
}

export function buildMatchSurahQuestions(
  chapters: QuranChapter[],
  versesByChapter: Map<number, QuranVerse[]>,
  config: MatchSurahModeConfig
): QuizQuestion[] {
  const candidateChapters = chapters.filter((chapter) =>
    config.allowedChapterIds.includes(chapter.id)
  );

  return shuffleArray(candidateChapters)
    .slice(0, config.totalRounds)
    .map((chapter) => {
      const verses = versesByChapter.get(chapter.id) || [];
      const verse = pickQuestionVerse(verses);

      if (!verse?.text_uthmani || !verse.translations?.[0]?.text) {
        return null;
      }

      const distractors: QuizChoice[] = shuffleArray(
        candidateChapters.filter((candidate) => candidate.id !== chapter.id)
      )
        .slice(0, config.optionCount - 1)
        .map((candidate) => ({
          id: candidate.id,
          latinName: candidate.name_simple,
          arabicName: candidate.name_arabic,
        }));

      const choices = shuffleArray([
        {
          id: chapter.id,
          latinName: chapter.name_simple,
          arabicName: chapter.name_arabic,
        },
        ...distractors,
      ]);

      return {
        id: verse.verse_key,
        chapterId: chapter.id,
        surahTitle: chapter.name_simple,
        surahArabicTitle: chapter.name_arabic,
        arabicText: verse.text_uthmani,
        translationText: verse.translations[0].text,
        verseKey: verse.verse_key,
        choices,
      };
    })
    .filter((question): question is QuizQuestion => Boolean(question));
}