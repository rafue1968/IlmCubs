"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getChapters,
  getVersesByChapter,
  type QuranChapter,
  type QuranVerse,
} from "@/app/lib/quran";

type QuizChoice = {
  id: number;
  latinName: string;
  arabicName: string;
};

type QuizQuestion = {
  id: string;
  chapterId: number;
  surahTitle: string;
  surahArabicTitle: string;
  arabicText: string;
  translationText: string;
  verseKey: string;
  choices: QuizChoice[];
};

const QUIZ_CHAPTER_IDS = [
  105, 106, 107, 108, 109, 110, 111, 112, 113, 114,
];
const TOTAL_ROUNDS = 5;

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function pickQuestionVerse(verses: QuranVerse[]): QuranVerse | null {
  const filtered = verses.filter(
    (verse) => Boolean(verse.text_uthmani) && Boolean(verse.translations?.[0]?.text)
  );

  if (filtered.length === 0) {
    return null;
  }

  return filtered[Math.floor(Math.random() * filtered.length)] ?? null;
}

function buildQuestions(
  chapters: QuranChapter[],
  versesByChapter: Map<number, QuranVerse[]>
): QuizQuestion[] {
  const candidateChapters = chapters.filter((chapter) =>
    QUIZ_CHAPTER_IDS.includes(chapter.id)
  );

  return shuffleArray(candidateChapters)
    .slice(0, TOTAL_ROUNDS)
    .map((chapter) => {
      const verses = versesByChapter.get(chapter.id) || [];
      const verse = pickQuestionVerse(verses);

      if (!verse?.text_uthmani || !verse.translations?.[0]?.text) {
        return null;
      }

      const distractors = shuffleArray(
        candidateChapters.filter((candidate) => candidate.id !== chapter.id)
      )
        .slice(0, 3)
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

export default function MatchTheSurahPage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadQuiz() {
      setIsLoading(true);
      setError(null);

      try {
        const chapterResponse = await getChapters();
        const chapters = chapterResponse.data?.chapters || [];
        const quizChapters = chapters.filter((chapter) =>
          QUIZ_CHAPTER_IDS.includes(chapter.id)
        );

        const verseResponses = await Promise.all(
          quizChapters.map(async (chapter) => ({
            chapterId: chapter.id,
            response: await getVersesByChapter(chapter.id),
          }))
        );

        const versesByChapter = new Map<number, QuranVerse[]>(
          verseResponses.map(({ chapterId, response }) => [
            chapterId,
            response.data?.verses || [],
          ])
        );

        const nextQuestions = buildQuestions(chapters, versesByChapter);

        if (!isMounted) {
          return;
        }

        if (nextQuestions.length === 0) {
          throw new Error("No quiz questions were available from the Quran API.");
        }

        setQuestions(nextQuestions);
        setCurrentIndex(0);
        setSelectedChoiceId(null);
        setScore(0);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load the quiz."
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadQuiz();

    return () => {
      isMounted = false;
    };
  }, []);

  const currentQuestion = questions[currentIndex] ?? null;
  const totalQuestions = questions.length;
  const isFinished = !isLoading && totalQuestions > 0 && currentIndex >= totalQuestions;
  const progressValue =
    totalQuestions > 0 ? Math.min((currentIndex / totalQuestions) * 100, 100) : 0;

  function handleChoice(choiceId: number) {
    if (!currentQuestion || selectedChoiceId !== null) {
      return;
    }

    setSelectedChoiceId(choiceId);

    if (choiceId === currentQuestion.chapterId) {
      setScore((currentScore) => currentScore + 1);
    }
  }

  function handleNext() {
    if (selectedChoiceId === null) {
      return;
    }

    setCurrentIndex((index) => index + 1);
    setSelectedChoiceId(null);
  }

  function handleRestart() {
    const shuffled = shuffleArray(questions);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setSelectedChoiceId(null);
    setScore(0);
    setError(null);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-200 via-emerald-100 to-yellow-100 px-5 py-10">
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link
            href="/quizzes"
            className="rounded-full bg-white/55 px-4 py-2 text-sm font-extrabold text-slate-800 ring-2 ring-white/70 backdrop-blur transition hover:bg-white/65"
          >
            ← Back
          </Link>
          <div className="rounded-full bg-white/55 px-4 py-2 text-sm font-extrabold text-slate-800 ring-2 ring-white/70 backdrop-blur">
            Match the Surah
          </div>
        </div>

        <div className="rounded-[34px] border-4 border-white/70 bg-white/35 p-5 shadow-[0_30px_80px_-55px_rgba(2,6,23,0.6)] backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.24em] text-slate-700">
                Live Quran Quiz
              </p>
              <p className="mt-1 text-xl font-extrabold text-slate-950">
                Verse to surah challenge
              </p>
            </div>
            <div className="rounded-2xl bg-white/60 px-4 py-3 text-center ring-2 ring-white/70">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-600">
                Score
              </p>
              <p className="text-2xl font-extrabold text-emerald-700">
                {score}/{totalQuestions || TOTAL_ROUNDS}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-full bg-white/60 p-1 ring-2 ring-white/70">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-emerald-500 via-sky-500 to-orange-400 transition-all"
              style={{ width: `${progressValue}%` }}
            />
          </div>

          {isLoading ? (
            <div className="mt-6 rounded-[26px] border-3 border-white/70 bg-white/45 p-6 text-center">
              <p className="text-lg font-extrabold text-slate-900">
                Loading quiz from the Quran API...
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-700">
                Pulling live verses and building your round set.
              </p>
            </div>
          ) : null}

          {error ? (
            <div className="mt-6 rounded-[26px] border-3 border-rose-200 bg-rose-50/80 p-6 text-center">
              <p className="text-lg font-extrabold text-rose-800">
                We couldn&apos;t load the quiz.
              </p>
              <p className="mt-2 text-sm font-semibold text-rose-700">{error}</p>
            </div>
          ) : null}

          {isFinished ? (
            <div className="mt-6 rounded-[26px] border-3 border-white/70 bg-white/45 p-6 text-center">
              <p className="text-sm font-black uppercase tracking-[0.24em] text-slate-700">
                Finished
              </p>
              <h1 className="mt-2 text-3xl font-extrabold text-slate-950">
                Great job!
              </h1>
              <p className="mt-3 text-lg font-bold text-slate-800">
                You matched {score} out of {totalQuestions} verses correctly.
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-700">
                Tap below to replay with a reshuffled set of live API questions.
              </p>

              <button
                type="button"
                onClick={handleRestart}
                className="mt-5 rounded-full bg-slate-900 px-6 py-3 text-sm font-extrabold text-white transition hover:bg-slate-800"
              >
                Play again
              </button>
            </div>
          ) : null}

          {!isLoading && !error && !isFinished && currentQuestion ? (
            <>
              <div className="mt-6 rounded-[22px] border-2 border-emerald-300/60 bg-emerald-50/70 p-4 shadow-inner">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-900/70">
                    Round {currentIndex + 1} of {totalQuestions}
                  </p>
                  <p className="rounded-full bg-white/70 px-3 py-1 text-xs font-extrabold text-emerald-900 ring-1 ring-emerald-200">
                    {currentQuestion.verseKey}
                  </p>
                </div>

                <p className="mt-4 text-center text-2xl font-bold leading-relaxed text-emerald-950 [font-family:var(--font-geist-sans)] sm:text-3xl">
                  {currentQuestion.arabicText}
                </p>
              </div>

              <p className="mt-3 text-center text-sm font-semibold italic text-slate-700 sm:text-base">
                {currentQuestion.translationText}
              </p>

              <div className="mt-5 rounded-[26px] border-3 border-white/70 bg-white/40 p-4">
                <p className="text-center text-xl font-extrabold text-slate-900">
                  Which surah is this verse from?
                </p>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  {currentQuestion.choices.map((choice) => {
                    const isCorrect = choice.id === currentQuestion.chapterId;
                    const isSelected = choice.id === selectedChoiceId;

                    let buttonClasses =
                      "rounded-[22px] border-4 p-4 text-left shadow-[0_18px_40px_-30px_rgba(2,6,23,0.6)] transition active:scale-[0.99] ";

                    if (selectedChoiceId === null) {
                      buttonClasses +=
                        "border-indigo-200/80 bg-indigo-50/80 hover:bg-indigo-50";
                    } else if (isCorrect) {
                      buttonClasses += "border-emerald-400 bg-emerald-100";
                    } else if (isSelected) {
                      buttonClasses += "border-rose-300 bg-rose-100";
                    } else {
                      buttonClasses += "border-slate-200 bg-slate-100 opacity-70";
                    }

                    return (
                      <button
                        key={choice.id}
                        type="button"
                        onClick={() => handleChoice(choice.id)}
                        disabled={selectedChoiceId !== null}
                        className={buttonClasses}
                      >
                        <p className="text-center text-lg font-extrabold text-slate-900">
                          {choice.latinName}
                        </p>
                        <p className="mt-1 text-center text-sm font-bold text-purple-700">
                          {choice.arabicName}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {selectedChoiceId !== null ? (
                  <div className="mt-5 text-center">
                    <p className="text-base font-extrabold text-slate-900">
                      {selectedChoiceId === currentQuestion.chapterId
                        ? "Correct! Nice match."
                        : `Nice try. This verse is from ${currentQuestion.surahTitle}.`}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {currentQuestion.surahArabicTitle}
                    </p>

                    <button
                      type="button"
                      onClick={handleNext}
                      className="mt-4 rounded-full bg-slate-900 px-6 py-3 text-sm font-extrabold text-white transition hover:bg-slate-800"
                    >
                      {currentIndex + 1 === totalQuestions ? "See results" : "Next verse"}
                    </button>
                  </div>
                ) : (
                  <p className="mt-5 text-center text-sm font-semibold text-slate-700">
                    Choose one answer to lock it in.
                  </p>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}
