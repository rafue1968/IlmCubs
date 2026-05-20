"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BookmarkCheck, BookOpen, HeartHandshake, Puzzle, Sparkles, Volume2 } from "lucide-react";
import { useProgress } from "@/lib/useProgress";

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

type ChallengeOption = {
  id: number;
  label: string;
  subLabel?: string;
};

type ChallengeKind = "surah" | "meaning" | "good-deed";

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
  const [hasStartedQuiz, setHasStartedQuiz] = useState(false);
  const [bookmarkMessage, setBookmarkMessage] = useState<string | null>(null);
  const { bookmarks, addBookmark, removeBookmark, completeQuiz } = useProgress();

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
      setHasStartedQuiz(false);
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
  const moduleName =
    quizState.currentIndex < 2
      ? "Easy meanings"
      : quizState.currentIndex < 4
        ? "Guided matching"
        : "Challenge round";
  const challengeKind = getChallengeKind(quizState.currentIndex);
  const challengeMeta = getChallengeMeta(challengeKind);
  const ChallengeIcon = challengeMeta.Icon;
  const challengeOptions = currentQuestion
    ? getChallengeOptions(challengeKind, currentQuestion, questions)
    : [];
  const isCurrentQuestionBookmarked = useMemo(
    () =>
      currentQuestion
        ? bookmarks.some((bookmark) => bookmark.id === currentQuestion.verseKey)
        : false,
    [bookmarks, currentQuestion]
  );

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
      completeQuiz(quizState.score);
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
      setBookmarkMessage("Removed from your saved gems");
      window.setTimeout(() => setBookmarkMessage(null), 1400);
      return;
    }

    addBookmark({
      type: "verse",
      id: currentQuestion.verseKey,
      title: `${currentQuestion.verseKey} - ${currentQuestion.correctSurahName}`,
      timestamp: Date.now(),
    });
    setBookmarkMessage("Saved as a learning gem");
    window.setTimeout(() => setBookmarkMessage(null), 1400);
  }

  function handleSpeak(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.82;
    utterance.pitch = 1.08;
    window.speechSynthesis.speak(utterance);
  }

  function getChallengeKind(index: number): ChallengeKind {
    const kinds: ChallengeKind[] = ["surah", "meaning", "good-deed"];
    return kinds[index % kinds.length];
  }

  function getChallengeMeta(kind: ChallengeKind) {
    if (kind === "meaning") {
      return {
        label: "Meaning match",
        prompt: "Which meaning belongs with this verse?",
        Icon: BookOpen,
      };
    }

    if (kind === "good-deed") {
      return {
        label: "Good deed choice",
        prompt: "Which action can we try today?",
        Icon: HeartHandshake,
      };
    }

    return {
      label: "Surah match",
      prompt: currentQuestion?.prompt || "Which surah is this verse from?",
      Icon: Puzzle,
    };
  }

  function getChallengeOptions(
    kind: ChallengeKind,
    question: GeminiMatchSurahQuestion,
    allQuestions: GeminiMatchSurahQuestion[]
  ): ChallengeOption[] {
    if (kind === "meaning") {
      const distractors = allQuestions
        .filter((candidate) => candidate.verseKey !== question.verseKey)
        .slice(0, 3)
        .map((candidate, index) => ({
          id: -100 - index,
          label: candidate.translationText,
        }));

      return shuffleOptions(
        [
        {
          id: question.correctChapterId,
          label: question.translationText,
        },
        ...distractors,
        ],
        `${question.verseKey}-${kind}`
      );
    }

    if (kind === "good-deed") {
      return shuffleOptions(
        [
        {
          id: question.correctChapterId,
          label: question.goodDeed || "Be kind today.",
        },
        {
          id: -201,
          label: "Ignore someone who needs help.",
        },
        {
          id: -202,
          label: "Use rude words when upset.",
        },
        {
          id: -203,
          label: "Keep all good things only for myself.",
        },
        ],
        `${question.verseKey}-${kind}`
      );
    }

    return question.choices.map((choice) => ({
      id: choice.id,
      label: choice.latinName,
      subLabel: choice.arabicName,
    }));
  }

  function shuffleOptions(options: ChallengeOption[], seed: string) {
    return options
      .map((option, index) => ({
        option,
        sort: hashString(`${seed}-${option.id}-${index}`),
      }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ option }) => option);
  }

  function hashString(value: string) {
    return value.split("").reduce((hash, char) => {
      return (hash * 31 + char.charCodeAt(0)) % 997;
    }, 7);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-200 via-emerald-100 to-yellow-100 px-5 py-10">
      {bookmarkMessage ? (
        <div className="ilm-pop fixed left-1/2 top-6 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg">
          <Sparkles className="h-4 w-4 text-yellow-300" aria-hidden="true" />
          {bookmarkMessage}
        </div>
      ) : null}
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
              {!hasStartedQuiz ? (
                <div className="mt-6 rounded-[26px] border-[3px] border-white/70 bg-white/50 p-6 text-center">
                  <p className="text-sm font-black uppercase tracking-[0.24em] text-slate-700">
                    Learn first
                  </p>
                  <h1 className="mt-2 text-3xl font-extrabold text-slate-950">
                    {moduleName}
                  </h1>
                  <p className="mt-3 text-base font-bold leading-7 text-slate-800">
                    {currentQuestion.story ||
                      "Let us learn a beautiful Quran lesson before we play."}
                  </p>
                  <p className="mt-4 rounded-2xl bg-emerald-100/80 p-4 text-sm font-extrabold leading-6 text-emerald-900">
                    Real-life connection:{" "}
                    {currentQuestion.goodDeed || "Do one kind action today."}
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        handleSpeak(
                          `${currentQuestion.story || ""} ${
                            currentQuestion.translationText
                          } ${currentQuestion.goodDeed || ""}`
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-extrabold text-slate-900 ring-2 ring-white/70 transition hover:bg-white/90"
                    >
                      <Volume2 className="h-4 w-4" aria-hidden="true" />
                      Listen
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasStartedQuiz(true)}
                      className="rounded-full bg-slate-900 px-6 py-3 text-sm font-extrabold text-white transition hover:bg-slate-800"
                    >
                      Start quiz
                    </button>
                  </div>
                </div>
              ) : null}

              {hasStartedQuiz ? (
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
                      className={[
                        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold ring-1 transition",
                        isCurrentQuestionBookmarked
                          ? "ilm-pop bg-yellow-200 text-yellow-950 ring-yellow-300"
                          : "bg-white/80 text-emerald-900 ring-emerald-200 hover:bg-white",
                      ].join(" ")}
                    >
                      <BookmarkCheck className="h-3.5 w-3.5" aria-hidden="true" />
                      {isCurrentQuestionBookmarked ? "Gem saved" : "Save gem"}
                    </button>
                  </div>
                </div>

                <p className="mt-4 text-center text-2xl font-bold leading-relaxed text-emerald-950 [font-family:var(--font-geist-sans)] sm:text-3xl">
                  {currentQuestion.arabicText}
                </p>
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={() =>
                      handleSpeak(
                        `${currentQuestion.translationText}. ${
                          currentQuestion.hint || ""
                        }`
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-extrabold text-emerald-900 ring-1 ring-emerald-200 transition hover:bg-white"
                  >
                    <Volume2 className="h-4 w-4" aria-hidden="true" />
                    Hear meaning
                  </button>
                </div>
              </div>

              <p className="mt-3 text-center text-sm font-semibold italic text-slate-700 sm:text-base">
                {currentQuestion.translationText}
              </p>

              <div className="mt-5 rounded-[26px] border-[3px] border-white/70 bg-white/40 p-4">
                <div className="text-center">
                  <p className="inline-flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-600">
                    <ChallengeIcon className="h-4 w-4" aria-hidden="true" />
                    {moduleName} · {challengeMeta.label}
                  </p>
                  <p className="mt-1 text-xl font-extrabold text-slate-900">
                    🎯 {challengeMeta.prompt}
                  </p>
                </div>

                {currentQuestion.hint ? (
                  <p className="mt-2 text-center text-sm font-semibold text-slate-700">
                    💡 {currentQuestion.hint}
                  </p>
                ) : null}

                <div className="mt-4 grid grid-cols-2 gap-4">
                  {challengeOptions.map((option) => {
                    const isCorrect = option.id === currentQuestion.correctChapterId;
                    const isSelected = option.id === quizState.selectedChoiceId;

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
                        key={`${challengeKind}-${option.id}`}
                        type="button"
                        onClick={() => handleChoice(option.id)}
                        disabled={quizState.selectedChoiceId !== null}
                        className={buttonClasses}
                      >
                        <p className="text-center text-base font-extrabold leading-6 text-slate-900 sm:text-lg">
                          {option.label}
                        </p>
                        {option.subLabel ? (
                          <p className="mt-1 text-center text-sm font-bold text-purple-700">
                            {option.subLabel}
                          </p>
                        ) : null}
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
