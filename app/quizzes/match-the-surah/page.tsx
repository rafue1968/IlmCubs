"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  MATCH_SURAH_MODE_CONFIGS,
  type QuizMode,
} from "@/app/lib/quiz-config";
import {
  buildMatchSurahQuestions,
  shuffleArray,
} from "@/app/lib/quiz-generator";
import {
  createQuizState,
  goToNextQuestion,
  restartQuizState,
  selectAnswer,
} from "@/app/lib/quiz-engine";
import {
  getChapters,
  getVersesByChapter,
  type QuranChapter,
  type QuranVerse,
} from "@/app/lib/quran";
import type { QuizQuestion, QuizState } from "@/app/lib/quiz-types";

export default function MatchTheSurahPage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizState, setQuizState] = useState<QuizState>(createQuizState());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<QuizMode>("juz-amma");

  useEffect(() => {
    let isMounted = true;

    async function loadQuiz() {
      setIsLoading(true);
      setError(null);

      const config = MATCH_SURAH_MODE_CONFIGS[mode];

      try {
        const chapterResponse = await getChapters();
        const chapters = chapterResponse.data?.chapters || [];

        const quizChapters = chapters.filter((chapter) =>
          config.allowedChapterIds.includes(chapter.id)
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

        const nextQuestions = buildMatchSurahQuestions(
          chapters,
          versesByChapter,
          config
        );

        if (!isMounted) return;

        if (nextQuestions.length === 0) {
          throw new Error("No quiz questions were available from the Quran API.");
        }

        setQuestions(nextQuestions);
        setQuizState(createQuizState());
      } catch (loadError) {
        if (!isMounted) return;

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
  }, [mode]);

  const currentQuestion = questions[quizState.currentIndex] ?? null;
  const totalQuestions = questions.length;
  const isFinished =
    !isLoading &&
    totalQuestions > 0 &&
    quizState.currentIndex >= totalQuestions;

  const progressValue =
    totalQuestions > 0
      ? Math.min((quizState.currentIndex / totalQuestions) * 100, 100)
      : 0;

  const currentConfig = MATCH_SURAH_MODE_CONFIGS[mode];

  function handleChoice(choiceId: number) {
    if (!currentQuestion) return;

    setQuizState((currentState) =>
      selectAnswer(currentState, choiceId, currentQuestion.chapterId)
    );
  }

  function handleNext() {
    if (quizState.selectedChoiceId === null) return;

    setQuizState((currentState) => goToNextQuestion(currentState));
  }

  function handleRestart() {
    setQuestions((currentQuestions) => shuffleArray(currentQuestions));
    setQuizState(restartQuizState());
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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
                {quizState.score}/{totalQuestions || currentConfig.totalRounds}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <label className="text-sm font-extrabold text-slate-800">
              Choose a mode
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              {(Object.keys(MATCH_SURAH_MODE_CONFIGS) as QuizMode[]).map(
                (modeKey) => (
                  <button
                    key={modeKey}
                    type="button"
                    onClick={() => setMode(modeKey)}
                    className={[
                      "rounded-full px-4 py-2 text-sm font-extrabold transition",
                      mode === modeKey
                        ? "bg-slate-900 text-white"
                        : "bg-white/70 text-slate-900 ring-2 ring-white/70 hover:bg-white",
                    ].join(" ")}
                  >
                    {MATCH_SURAH_MODE_CONFIGS[modeKey].label}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="mt-5 rounded-full bg-white/60 p-1 ring-2 ring-white/70">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-emerald-500 via-sky-500 to-orange-400 transition-all"
              style={{ width: `${progressValue}%` }}
            />
          </div>

          {isLoading ? (
            <div className="mt-6 rounded-[26px] border-[3px] border-white/70 bg-white/45 p-6 text-center">
              <p className="text-lg font-extrabold text-slate-900">
                Loading quiz from the Quran API...
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-700">
                Pulling live verses and building your {currentConfig.label} round.
              </p>
            </div>
          ) : null}

          {error ? (
            <div className="mt-6 rounded-[26px] border-[3px] border-rose-200 bg-rose-50/80 p-6 text-center">
              <p className="text-lg font-extrabold text-rose-800">
                We couldn&apos;t load the quiz.
              </p>
              <p className="mt-2 text-sm font-semibold text-rose-700">{error}</p>
            </div>
          ) : null}

          {isFinished ? (
            <div className="mt-6 rounded-[26px] border-[3px] border-white/70 bg-white/45 p-6 text-center">
              <p className="text-sm font-black uppercase tracking-[0.24em] text-slate-700">
                Finished
              </p>
              <h1 className="mt-2 text-3xl font-extrabold text-slate-950">
                Great job!
              </h1>
              <p className="mt-3 text-lg font-bold text-slate-800">
                You matched {quizState.score} out of {totalQuestions} verses
                correctly.
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-700">
                Tap below to replay this mode with a reshuffled question set.
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
                    {currentConfig.label} • Round {quizState.currentIndex + 1} of {totalQuestions}
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

              <div className="mt-5 rounded-[26px] border-[3px] border-white/70 bg-white/40 p-4">
                <p className="text-center text-xl font-extrabold text-slate-900">
                  Which surah is this verse from?
                </p>

                <div
                  className={`mt-4 grid gap-4 ${
                    currentQuestion.choices.length === 2
                      ? "grid-cols-1"
                      : "grid-cols-2"
                  }`}
                >
                  {currentQuestion.choices.map((choice) => {
                    const isCorrect = choice.id === currentQuestion.chapterId;
                    const isSelected = choice.id === quizState.selectedChoiceId;

                    let buttonClasses =
                      "rounded-[22px] border-4 p-4 text-left shadow-[0_18px_40px_-30px_rgba(2,6,23,0.6)] transition active:scale-[0.99] ";

                    if (quizState.selectedChoiceId === null) {
                      buttonClasses +=
                        "border-indigo-200/80 bg-indigo-50/80 hover:bg-indigo-50";
                    } else if (isCorrect) {
                      buttonClasses += "border-emerald-400 bg-emerald-100";
                    } else if (isSelected) {
                      buttonClasses += "border-rose-300 bg-rose-100";
                    } else {
                      buttonClasses +=
                        "border-slate-200 bg-slate-100 opacity-70";
                    }

                    return (
                      <button
                        key={choice.id}
                        type="button"
                        onClick={() => handleChoice(choice.id)}
                        disabled={quizState.selectedChoiceId !== null}
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

                {quizState.selectedChoiceId !== null ? (
                  <div className="mt-5 text-center">
                    <p className="text-base font-extrabold text-slate-900">
                      {quizState.selectedChoiceId === currentQuestion.chapterId
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
                      {quizState.currentIndex + 1 === totalQuestions
                        ? "See results"
                        : "Next verse"}
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