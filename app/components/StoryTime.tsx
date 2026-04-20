"use client";

import React, { useEffect, useState } from "react";
import { Loader2, CheckCircle, XCircle, RotateCcw } from "lucide-react";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface StoryConfig {
  surah: string;
  topic: string;
  name: string;
}

type Juz = {
  id: number;
  juz_number: number;
};

type StoryItem = {
  juzNumber: number;
  title: string;
  story: string;
  verse: string;
  options: { label: string; correct: boolean }[];
};

type StoryMode = "menu" | "quiz" | "juz";

const STORIES: StoryConfig[] = [
  { surah: "Al-Fil", topic: "Elephant and the Kaaba", name: "The Elephant" },
  { surah: "Quraysh", topic: "Trade and protection", name: "Quraysh Tribe" },
];

const storyItems: StoryItem[] = [
  {
    juzNumber: 2,
    title: "The Helping Heart",
    story:
      "In Juz 2, the Quran teaches us to help our family and share good feelings.",
    verse: "Allah loves those who help and care.",
    options: [
      { label: "Help someone who is sad", correct: true },
      { label: "Keep all toys for yourself", correct: false },
    ],
  },
  {
    juzNumber: 3,
    title: "The Thankful Smile",
    story:
      "In Juz 3, the Quran tells us to say thank you for our food and our friends.",
    verse: "Be grateful and smile with your heart.",
    options: [
      { label: "Say thank you to Allah", correct: true },
      { label: "Say thank you only to yourself", correct: false },
    ],
  },
  {
    juzNumber: 4,
    title: "The Gentle Friend",
    story:
      "In Juz 4, the Quran teaches us to speak softly and be a gentle friend.",
    verse: "Use kind words and make others happy.",
    options: [
      { label: "Speak softly and kindly", correct: true },
      { label: "Shout and be mean", correct: false },
    ],
  },
];

const defaultJuzList: Juz[] = Array.from({ length: 30 }, (_, index) => ({
  id: index + 1,
  juz_number: index + 1,
}));

function buildFallbackStory(juzNumber: number): StoryItem {
  const staticMatch = storyItems.find((item) => item.juzNumber === juzNumber);
  if (staticMatch) return staticMatch;

  return {
    juzNumber,
    title: `Story from Juz ${juzNumber}`,
    story: `In Juz ${juzNumber}, the Quran teaches us valuable lessons about life and faith.`,
    verse: "The Quran guides us to be good and kind.",
    options: [
      { label: "Follow the teachings", correct: true },
      { label: "Ignore the teachings", correct: false },
    ],
  };
}

export default function StoryTime() {
  const [mode, setMode] = useState<StoryMode>("menu");

  // Quiz mode state
  const [selectedStory, setSelectedStory] = useState<StoryConfig | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [score, setScore] = useState(0);
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const [quizError, setQuizError] = useState<string | null>(null);

  // Juz mode state
  const [juzList, setJuzList] = useState<Juz[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentStory, setCurrentStory] = useState<StoryItem | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loadingJuzList, setLoadingJuzList] = useState(true);
  const [storyLoading, setStoryLoading] = useState(false);

  const currentJuz = juzList[currentIndex];
  const totalJuz = juzList.length || defaultJuzList.length;

  useEffect(() => {
    if (selectedStory && mode === "quiz") {
      generateQuestions();
    }
  }, [selectedStory, mode]);

  useEffect(() => {
    fetch("https://api.quran.foundation/v1/juzs")
      .then((res) => res.json())
      .then((data) => {
        const juzs = data?.data?.juzs ?? data?.juzs ?? [];
        setJuzList(juzs.length ? juzs.slice(0, 30) : defaultJuzList);
      })
      .catch(() => {
        setJuzList(defaultJuzList);
      })
      .finally(() => setLoadingJuzList(false));
  }, []);

  useEffect(() => {
    const fetchStory = async () => {
      if (!currentJuz || mode !== "juz") return;

      setStoryLoading(true);

      try {
        const response = await fetch(`/api/story-ai?juz=${currentJuz.juz_number}`);
        const data = await response.json();

        if (data.success && data.story) {
          setCurrentStory(data.story);
        } else {
          setCurrentStory(buildFallbackStory(currentJuz.juz_number));
        }
      } catch (error) {
        console.error("Failed to fetch AI story:", error);
        setCurrentStory(buildFallbackStory(currentJuz.juz_number));
      } finally {
        setStoryLoading(false);
      }
    };

    fetchStory();
  }, [currentJuz, mode]);

  const generateQuestions = async () => {
    if (!selectedStory) return;

    setLoadingQuiz(true);
    setQuizError(null);

    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surah: selectedStory.surah,
          topic: selectedStory.topic,
          previousQuestions: askedQuestions,
        }),
      });

      const data = (await response.json()) as {
        success: boolean;
        questions?: Question[];
        error?: string;
      };

      if (!data.success || !data.questions) {
        throw new Error(data.error || "Failed to generate questions");
      }

      setQuestions(data.questions);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setAnswered(false);

      setAskedQuestions((prev) => [
        ...prev,
        ...data.questions!.map((q) => q.question),
      ]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setQuizError(errorMessage);
      console.error("Error generating questions:", err);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleQuizAnswer = (index: number) => {
    if (answered) return;

    setSelectedAnswer(index);
    setAnswered(true);

    if (index === questions[currentQuestionIndex].correctAnswer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      setCurrentQuestionIndex(0);
      generateQuestions();
    }
  };

  const handleQuizReset = () => {
    setSelectedStory(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setScore(0);
    setAskedQuestions([]);
    setQuizError(null);
    setMode("menu");
  };

  const handleStoryAnswer = (correct: boolean) => {
    setFeedback(
      correct
        ? "🎉 Yes! That is the kind answer!"
        : "Try again — choose the kind answer."
    );
  };

  const nextStory = () => {
    setFeedback(null);
    setCurrentIndex((prev) => (prev + 1) % totalJuz);
  };

  if (mode === "menu") {
    return (
      <div className="space-y-6 rounded-[34px] border-4 border-white/60 bg-white/35 p-7 shadow-[0_30px_70px_-45px_rgba(2,6,23,0.55)] backdrop-blur">
        <div className="text-center">
          <h1 className="mb-2 text-3xl font-bold text-slate-900">Quran Story Time</h1>
          <p className="text-slate-600">
            Choose how you want to explore Quran stories
          </p>
        </div>

        <div className="grid gap-4">
          <button
            onClick={() => setMode("quiz")}
            className="rounded-2xl border-2 border-blue-200 bg-white p-6 text-left transition hover:border-blue-400 hover:shadow-lg"
          >
            <h2 className="text-xl font-bold text-slate-900">Story Quiz</h2>
            <p className="mt-1 text-sm text-slate-600">
              Pick a story and answer endless AI-generated questions
            </p>
          </button>

          <button
            onClick={() => setMode("juz")}
            className="rounded-2xl border-2 border-emerald-200 bg-white p-6 text-left transition hover:border-emerald-400 hover:shadow-lg"
          >
            <h2 className="text-xl font-bold text-slate-900">Juz Story Time</h2>
            <p className="mt-1 text-sm text-slate-600">
              Explore one AI-generated story from each Juz
            </p>
          </button>
        </div>
      </div>
    );
  }

  if (mode === "quiz") {
    if (!selectedStory) {
      return (
        <div className="space-y-6">
          <button
            onClick={() => setMode("menu")}
            className="rounded-full bg-white/70 px-4 py-2 text-sm font-bold text-slate-800 ring-2 ring-white/70"
          >
            ← Back
          </button>

          <div className="text-center">
            <h1 className="mb-2 text-3xl font-bold text-slate-900">
              Quran Story Quiz
            </h1>
            <p className="text-slate-600">
              Choose a story and answer endless AI-generated questions
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {STORIES.map((story) => (
              <button
                key={story.name}
                onClick={() => setSelectedStory(story)}
                className="rounded-2xl border-2 border-blue-200 bg-white p-6 text-left transition hover:border-blue-400 hover:shadow-lg"
              >
                <h2 className="text-xl font-bold text-slate-900">{story.name}</h2>
                <p className="mt-1 text-sm text-slate-600">{story.topic}</p>
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (loadingQuiz) {
      return (
        <div className="flex flex-col items-center justify-center space-y-4 py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-slate-600">Generating questions...</p>
        </div>
      );
    }

    if (quizError) {
      return (
        <div className="space-y-4 rounded-2xl border-2 border-red-200 bg-red-50 p-6">
          <p className="font-medium text-red-800">Error: {quizError}</p>
          <button
            onClick={handleQuizReset}
            className="rounded-lg bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
          >
            Back to Stories
          </button>
        </div>
      );
    }

    if (questions.length === 0) {
      return (
        <div className="py-12 text-center">
          <p className="text-slate-600">No questions available</p>
          <button
            onClick={handleQuizReset}
            className="mt-4 rounded-lg bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600"
          >
            Back to Stories
          </button>
        </div>
      );
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
      <div className="space-y-6">
        <button
          onClick={handleQuizReset}
          className="rounded-full bg-white/70 px-4 py-2 text-sm font-bold text-slate-800 ring-2 ring-white/70"
        >
          ← Back
        </button>

        <div className="flex items-center justify-between rounded-2xl bg-blue-50 p-4">
          <div>
            <p className="text-sm font-medium text-blue-600">{selectedStory.name}</p>
            <p className="text-2xl font-bold text-blue-900">Score: {score}</p>
          </div>
          <button
            onClick={handleQuizReset}
            className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm text-white transition hover:bg-blue-600"
          >
            <RotateCcw className="h-4 w-4" />
            New Story
          </button>
        </div>

        <div className="space-y-6 rounded-2xl border-2 border-blue-200 bg-white p-6">
          <div>
            <p className="mb-2 text-sm font-medium text-blue-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
            <h2 className="text-xl font-bold text-slate-900">
              {currentQuestion.question}
            </h2>
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleQuizAnswer(index)}
                disabled={answered}
                className={`w-full rounded-xl border-2 p-4 text-left font-medium transition ${
                  !answered
                    ? "cursor-pointer border-gray-200 hover:border-blue-400"
                    : index === currentQuestion.correctAnswer
                      ? "border-green-500 bg-green-50 text-green-900"
                      : index === selectedAnswer &&
                          selectedAnswer !== currentQuestion.correctAnswer
                        ? "border-red-500 bg-red-50 text-red-900"
                        : "border-gray-200 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  {answered && index === currentQuestion.correctAnswer && (
                    <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
                  )}
                  {answered &&
                    index === selectedAnswer &&
                    selectedAnswer !== currentQuestion.correctAnswer && (
                      <XCircle className="h-5 w-5 shrink-0 text-red-500" />
                    )}
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>

          {answered && (
            <div className="space-y-2 rounded border-l-4 border-blue-500 bg-blue-50 p-4">
              <p className="font-medium text-blue-900">Explanation</p>
              <p className="text-blue-800">{currentQuestion.explanation}</p>
            </div>
          )}

          {answered && (
            <button
              onClick={handleNextQuestion}
              className="w-full rounded-lg bg-blue-500 px-4 py-3 font-medium text-white transition hover:bg-blue-600"
            >
              {currentQuestionIndex < questions.length - 1
                ? "Next Question"
                : "More Questions"}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (loadingJuzList || storyLoading) {
    return (
      <div className="rounded-[34px] border-4 border-white/60 bg-white/35 p-7 text-center shadow-[0_30px_70px_-45px_rgba(2,6,23,0.55)] backdrop-blur">
        <p className="text-lg font-semibold text-slate-800">
          {loadingJuzList ? "Loading story time..." : "Generating AI story..."}
        </p>
      </div>
    );
  }

  if (!currentJuz || !currentStory) {
    return (
      <div className="rounded-[34px] border-4 border-white/60 bg-white/35 p-7 text-center shadow-[0_30px_70px_-45px_rgba(2,6,23,0.55)] backdrop-blur">
        <p className="text-lg font-semibold text-slate-800">
          Loading story time...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => setMode("menu")}
        className="rounded-full bg-white/70 px-4 py-2 text-sm font-bold text-slate-800 ring-2 ring-white/70"
      >
        ← Back
      </button>

      <div className="rounded-[34px] border-4 border-white/60 bg-white/35 p-7 shadow-[0_30px_70px_-45px_rgba(2,6,23,0.55)] backdrop-blur">
        <div className="mb-6 rounded-3xl border border-white/70 bg-gradient-to-r from-sky-200 via-emerald-100 to-yellow-100 p-5 text-center shadow-inner">
          <h1 className="text-3xl font-extrabold text-slate-950">📖 Story Time</h1>
          <p className="mt-2 text-sm font-semibold text-slate-700">
            Learn what each surah teaches us!
          </p>
        </div>

        <div className="space-y-5">
          <div className="rounded-[28px] border-2 border-emerald-300/60 bg-emerald-50/80 p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
                Juz {currentJuz.juz_number}
              </p>
              <p className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white">
                {currentIndex + 1}/{totalJuz}
              </p>
            </div>
            <h2 className="mt-3 text-xl font-extrabold text-slate-950">
              {currentStory.title}
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-700">
              {currentStory.story}
            </p>
            <p className="mt-4 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700">
              {currentStory.verse}
            </p>
          </div>

          <div className="rounded-[28px] border-2 border-white/70 bg-white/60 p-6 shadow-[0_18px_40px_-20px_rgba(2,6,23,0.35)]">
            <p className="text-base font-extrabold text-slate-900">What should we do?</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {currentStory.options.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => handleStoryAnswer(option.correct)}
                  className={`rounded-[24px] px-4 py-3 text-sm font-bold text-white transition ${
                    option.correct
                      ? "bg-emerald-700 hover:bg-emerald-600"
                      : "bg-slate-900 hover:bg-slate-800"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <p className="mt-4 text-center text-sm font-semibold text-slate-700">
              {feedback || "Choose the kind answer to learn from the story."}
            </p>

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={nextStory}
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Next ➡️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}