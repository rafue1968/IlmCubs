"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  addBookmark,
  addQuizHistory,
  getBookmarks,
  incrementStreak,
  removeBookmark,
} from "@/lib/progress-storage";

type QuizChoice = {
  id: number;
  latinName: string;
  arabicName: string;
};

type GeminiMatchSurahQuestion = {
  verseKey: string;
  arabicText: string;
  translationText: string;
  prompt: string;
  correctChapterId: number;
  correctSurahName: string;
  correctSurahArabic: string;
  choices: QuizChoice[];
  successMessage: string;
  retryMessage: string;
  hint?: string;
  story?: string;
  goodDeed?: string;
};

type QuizState = {
  currentIndex: number;
  score: number;
  selectedChoiceId: number | null;
};

function createQuizState(): QuizState {
  return {
    currentIndex: 0,
    score: 0,
    selectedChoiceId: null,
  };
}

export default function MatchTheSurahPage() {
  const [questions, setQuestions] = useState<GeminiMatchSurahQuestion[]>([]);
  const [quizState, setQuizState] = useState<QuizState>(createQuizState());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCurrentQuestionBookmarked, setIsCurrentQuestionBookmarked] =
    useState(false);

  async function loadQuiz() {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/quiz/match-surah/generate", {
        method: "POST",
      });

      const data = await res.json();

      console.log("match-surah generate response:", data);

      if (!res.ok || !data?.success || !Array.isArray(data?.data)) {
        const details = [
          data?.message,
          data?.step ? `step: ${data.step}` : null,
          data?.debug ? JSON.stringify(data.debug, null, 2) : null,
          data?.chapterResult ? JSON.stringify(data.chapterResult, null, 2) : null,
          data?.failedChapterFetch
            ? JSON.stringify(data.failedChapterFetch, null, 2)
            : null,
          data?.raw ? JSON.stringify(data.raw, null, 2) : null,
          data?.gemini ? JSON.stringify(data.gemini, null, 2) : null,
        ]
          .filter(Boolean)
          .join("\n\n");

        throw new Error(details || "Failed to load quiz session");
      }

      setQuestions(data.data);
      setQuizState(createQuizState());
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load the quiz."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const init = async () => {
      await loadQuiz();
    };

    init();
  }, []);

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

  useEffect(() => {
    queueMicrotask(() => {
      setIsCurrentQuestionBookmarked(
        currentQuestion
          ? getBookmarks().some(
              (bookmark) => bookmark.id === currentQuestion.verseKey
            )
          : false
      );
    });
  }, [currentQuestion]);

  function handleChoice(choiceId: number) {
    if (!currentQuestion || quizState.selectedChoiceId !== null) {
      return;
    }

    const isCorrect = choiceId === currentQuestion.correctChapterId;

    setQuizState((currentState) => ({
      ...currentState,
      selectedChoiceId: choiceId,
      score: isCorrect ? currentState.score + 1 : currentState.score,
    }));
  }

  function handleNext() {
    if (quizState.selectedChoiceId === null) {
      return;
    }

    if (quizState.currentIndex + 1 >= totalQuestions) {
      incrementStreak();
      addQuizHistory(quizState.score);
    }

    setQuizState((currentState) => ({
      ...currentState,
      currentIndex: currentState.currentIndex + 1,
      selectedChoiceId: null,
    }));
  }

  function handleToggleBookmark() {
    if (!currentQuestion) {
      return;
    }

    if (isCurrentQuestionBookmarked) {
      removeBookmark(currentQuestion.verseKey);
      setIsCurrentQuestionBookmarked(false);
      return;
    }

    addBookmark({
      type: "verse",
      id: currentQuestion.verseKey,
      title: `${currentQuestion.verseKey} - ${currentQuestion.correctSurahName}`,
      timestamp: Date.now(),
    });
    setIsCurrentQuestionBookmarked(true);
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
                Quran Adventure
              </p>
              <p className="mt-1 text-xl font-extrabold text-slate-950">
                Match the Surah
              </p>
            </div>
            <div className="rounded-2xl bg-white/60 px-4 py-3 text-center ring-2 ring-white/70">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-600">
                Stars
              </p>
              <p className="text-2xl font-extrabold text-emerald-700">
                {quizState.score}/{totalQuestions || 5}
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
            <div className="mt-6 rounded-[26px] border-[3px] border-white/70 bg-white/45 p-6 text-center">
              <p className="text-lg font-extrabold text-slate-900">
                Getting your game ready...
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-700">
                Picking lovely Quran questions for you.
              </p>
            </div>
          ) : null}

          {error ? (
            <div className="mt-6 rounded-[26px] border-[3px] border-rose-200 bg-rose-50/80 p-6 text-center">
              <p className="text-lg font-extrabold text-rose-800">
                Oops! The game is not ready yet.
              </p>
              <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-left text-xs font-semibold text-rose-700">
                {error}
              </pre>

              <button
                type="button"
                onClick={loadQuiz}
                className="mt-4 rounded-full bg-slate-900 px-6 py-3 text-sm font-extrabold text-white transition hover:bg-slate-800"
              >
                Try again
              </button>
            </div>
          ) : null}

          {isFinished ? (
            <div className="mt-6 rounded-[26px] border-[3px] border-white/70 bg-white/45 p-6 text-center">
              <p className="text-sm font-black uppercase tracking-[0.24em] text-slate-700">
                Finished
              </p>
              <h1 className="mt-2 text-3xl font-extrabold text-slate-950">
                Amazing work! 🌟
              </h1>
              <p className="mt-3 text-lg font-bold text-slate-800">
                You got {quizState.score} out of {totalQuestions} right!
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-700">
                Tap below for a brand new Quran game.
              </p>

              <button
                type="button"
                onClick={loadQuiz}
                className="mt-5 rounded-full bg-slate-900 px-6 py-3 text-sm font-extrabold text-white transition hover:bg-slate-800"
              >
                Play again
              </button>
            </div>
          ) : null}

          {!isLoading && !error && !isFinished && currentQuestion ? (
            <>
              <div className="mt-4 rounded-2xl bg-yellow-100 p-4 text-center">
                <p className="text-sm font-bold text-yellow-800">
                  🌟 Little Story
                </p>
                <p className="mt-1 text-base font-semibold text-yellow-900">
                  {currentQuestion.story || "Let’s learn a beautiful Quran lesson."}
                </p>
              </div>

              <div className="mt-6 rounded-[22px] border-2 border-emerald-300/60 bg-emerald-50/70 p-4 shadow-inner">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-900/70">
                    Round {quizState.currentIndex + 1} of {totalQuestions}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="rounded-full bg-white/70 px-3 py-1 text-xs font-extrabold text-emerald-900 ring-1 ring-emerald-200">
                      {currentQuestion.verseKey}
                    </p>
                    <button
                      type="button"
                      onClick={handleToggleBookmark}
                      className="rounded-full bg-white/80 px-3 py-1 text-xs font-extrabold text-emerald-900 ring-1 ring-emerald-200 transition hover:bg-white"
                    >
                      {isCurrentQuestionBookmarked ? "Saved" : "Save"}
                    </button>
                  </div>
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
                  🎯 {currentQuestion.prompt}
                </p>

                {currentQuestion.hint ? (
                  <p className="mt-2 text-center text-sm font-semibold text-slate-700">
                    💡 {currentQuestion.hint}
                  </p>
                ) : null}

                <div className="mt-4 grid grid-cols-2 gap-4">
                  {currentQuestion.choices.map((choice) => {
                    const isCorrect = choice.id === currentQuestion.correctChapterId;
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
                      {quizState.selectedChoiceId === currentQuestion.correctChapterId
                        ? currentQuestion.successMessage
                        : currentQuestion.retryMessage}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {currentQuestion.correctSurahArabic}
                    </p>

                    <button
                      type="button"
                      onClick={handleNext}
                      className="mt-4 rounded-full bg-slate-900 px-6 py-3 text-sm font-extrabold text-white transition hover:bg-slate-800"
                    >
                      {quizState.currentIndex + 1 === totalQuestions
                        ? "See my stars"
                        : "Next question"}
                    </button>
                  </div>
                ) : (
                  <p className="mt-5 text-center text-sm font-semibold text-slate-700">
                    Tap one answer to choose.
                  </p>
                )}
              </div>
            </>
          ) : null}

          {quizState.selectedChoiceId !== null && currentQuestion ? (
            <div className="mt-4 rounded-2xl bg-emerald-100 p-4 text-center">
              <p className="text-sm font-bold text-emerald-800">
                🌱 Try this!
              </p>
              <p className="mt-1 text-base font-semibold text-emerald-900">
                {currentQuestion.goodDeed || "Be kind today."}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
