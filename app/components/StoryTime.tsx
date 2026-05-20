"use client";

import {
  Bookmark,
  CheckCircle,
  Loader2,
  RotateCcw,
  Sparkles,
  Volume2,
  WandSparkles,
  XCircle,
} from "lucide-react";
import { completeActivity } from "../lib/user-api";
import { useCallback, useState, useEffect, useRef } from "react";
import {
  addBookmark,
  getBookmarks,
  removeBookmark,
} from "@/lib/progress-storage";

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
  juz: number;
}

const STORIES: StoryConfig[] = [
  { surah: "Al-Fil", topic: "Elephant and the Kaaba", name: "The Elephant", juz: 30 },
  { surah: "Quraysh", topic: "Trade and protection", name: "Quraysh Tribe", juz: 30 },
  { surah: "Al-Ikhlas", topic: "Allah is One", name: "One Allah", juz: 30 },
  { surah: "An-Nas", topic: "Asking Allah for protection", name: "Safe Hearts", juz: 30 },
];

type StoryCard = {
  juzNumber: number;
  title: string;
  story: string;
  verse: string;
  options: { label: string; correct: boolean }[];
};

type Difficulty = "easy" | "guided" | "challenge";
type QuestionStyle =
  | "meaning"
  | "kindness"
  | "daily-action"
  | "listen"
  | "sequence"
  | "feeling";

export default function StoryTime() {
  const [selectedStory, setSelectedStory] = useState<StoryConfig | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);
  const askedQuestionsRef = useRef<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [bookmarkedStoryIds, setBookmarkedStoryIds] = useState<string[]>([]);
  const [storyCard, setStoryCard] = useState<StoryCard | null>(null);
  const [storyCardLoading, setStoryCardLoading] = useState(false);
  const [selectedStoryOption, setSelectedStoryOption] = useState<number | null>(null);
  const [learningComplete, setLearningComplete] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [questionStyle, setQuestionStyle] = useState<QuestionStyle>("meaning");
  const [celebrationText, setCelebrationText] = useState<string | null>(null);
  const [bookmarkMessage, setBookmarkMessage] = useState<string | null>(null);


  const generateQuestions = useCallback(async () => {
    if (!selectedStory) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surah: selectedStory.surah,
          topic: selectedStory.topic,
          previousQuestions: askedQuestionsRef.current,
          difficulty,
          questionStyle,
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

      // Track asked questions to avoid repetition
      askedQuestionsRef.current = [
        ...askedQuestionsRef.current,
        ...data.questions.map((q) => q.question),
      ];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Error generating questions:", err);
    } finally {
      setLoading(false);
    }
  }, [difficulty, questionStyle, selectedStory]);

  const generateStoryCard = useCallback(async () => {
    if (!selectedStory) return;

    setStoryCardLoading(true);
    setError(null);
    setStoryCard(null);
    setSelectedStoryOption(null);
    setLearningComplete(false);

    try {
      const response = await fetch(`/api/story-ai?juz=${selectedStory.juz}`);
      const data = (await response.json()) as {
        success: boolean;
        story?: StoryCard;
        error?: string;
      };

      if (!data.success || !data.story) {
        throw new Error(data.error || "Failed to generate story card");
      }

      setStoryCard(data.story);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Error generating story card:", err);
    } finally {
      setStoryCardLoading(false);
    }
  }, [selectedStory]);


  useEffect(() => {
    queueMicrotask(() => {
      setBookmarkedStoryIds(
        getBookmarks()
          .filter((bookmark) => bookmark.type === "story")
          .map((bookmark) => bookmark.id)
      );
    });
  }, []);

  useEffect(() => {
    if (selectedStory) {
      queueMicrotask(() => {
        void generateStoryCard();
        void generateQuestions();
      });
    }
  }, [generateQuestions, generateStoryCard, selectedStory]);

  const getStoryId = (story: StoryConfig) => `story:${story.surah}`;

  const isStoryBookmarked = (story: StoryConfig) =>
    bookmarkedStoryIds.includes(getStoryId(story));

  const toggleStoryBookmark = (story: StoryConfig) => {
    const storyId = getStoryId(story);

    if (bookmarkedStoryIds.includes(storyId)) {
      removeBookmark(storyId);
      setBookmarkedStoryIds((currentIds) =>
        currentIds.filter((currentId) => currentId !== storyId)
      );
      setBookmarkMessage("Removed from saved stories");
      window.setTimeout(() => setBookmarkMessage(null), 1400);
      return;
    }

    addBookmark({
      type: "story",
      id: storyId,
      title: story.name,
      timestamp: Date.now(),
    });
    setBookmarkedStoryIds((currentIds) => [...currentIds, storyId]);
    setBookmarkMessage("Story saved to your collection");
    window.setTimeout(() => setBookmarkMessage(null), 1400);
  };

  const handleAnswer = (index: number) => {
    if (answered) return;

    setSelectedAnswer(index);
    setAnswered(true);

    if (index === questions[currentQuestionIndex].correctAnswer) {
      setScore(score + 1);
      setCelebrationText("Lovely choice!");
      window.setTimeout(() => setCelebrationText(null), 1400);
    }
  };

  const handleStoryOption = (index: number) => {
    if (!storyCard) return;

    setSelectedStoryOption(index);

    if (storyCard.options[index]?.correct) {
      setLearningComplete(true);
      setCelebrationText("Kind action unlocked!");
      window.setTimeout(() => setCelebrationText(null), 1400);
    }
  };

  const handleSpeak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.84;
    utterance.pitch = 1.08;
    window.speechSynthesis.speak(utterance);
  };

  const handleNext = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      // Record quiz completion
      try {
        await completeActivity("quiz_completion", {
          story: selectedStory?.name,
          score,
          totalQuestions: questions.length,
        });
      } catch (err) {
        console.error("Failed to record activity:", err);
        // Don't block the user experience
      }

      // Generate more questions when quiz is done
      const nextDifficulty: Difficulty =
        score >= questions.length - 1
          ? "challenge"
          : score >= Math.ceil(questions.length / 2)
            ? "guided"
            : "easy";
      setDifficulty(nextDifficulty);
      setCurrentQuestionIndex(0);
      setScore(0); // Reset score for new quiz
      generateQuestions();
    }
  };

  const handleReset = () => {
    setSelectedStory(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setScore(0);
    askedQuestionsRef.current = [];
    setError(null);
    setStoryCard(null);
    setSelectedStoryOption(null);
    setLearningComplete(false);
    setDifficulty("easy");
    setQuestionStyle("meaning");
  };

  if (!selectedStory) {
    return (
      <div className="space-y-6">
        {bookmarkMessage ? (
          <div className="ilm-pop fixed left-1/2 top-6 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg">
            <Sparkles className="h-4 w-4 text-yellow-300" aria-hidden="true" />
            {bookmarkMessage}
          </div>
        ) : null}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Quran Story Time
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
              className="p-6 bg-white border-2 border-blue-200 rounded-2xl hover:border-blue-400 hover:shadow-lg transition text-left"
            >
              <h2 className="text-xl font-bold text-slate-900">{story.name}</h2>
              <p className="text-sm text-slate-600 mt-1">{story.topic}</p>
              <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
                {isStoryBookmarked(story) ? "Saved" : "Open to save"}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (loading || storyCardLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        <p className="text-slate-600">Gemini is making your story adventure...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 space-y-4">
        <p className="text-red-800 font-medium">Error: {error}</p>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          Back to Stories
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">No questions available</p>
        <button
          onClick={handleReset}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Back to Stories
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  if (!learningComplete) {
    const activeStoryCard =
      storyCard ||
      ({
        juzNumber: selectedStory.juz,
        title: selectedStory.name,
        story: `Let us learn about ${selectedStory.topic} with kind hearts.`,
        verse: "The Quran guides us to choose what is good.",
        options: [
          { label: "Choose the kind action", correct: true },
          { label: "Choose the unkind action", correct: false },
        ],
      } satisfies StoryCard);

    return (
      <div className="space-y-6">
        {bookmarkMessage ? (
          <div className="ilm-pop fixed left-1/2 top-6 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg">
            <Sparkles className="h-4 w-4 text-yellow-300" aria-hidden="true" />
            {bookmarkMessage}
          </div>
        ) : null}
        {celebrationText ? (
          <div className="fixed left-1/2 top-8 z-50 -translate-x-1/2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-black text-white shadow-lg">
            {celebrationText}
          </div>
        ) : null}

        <div className="rounded-[28px] border-4 border-white bg-white/80 p-6 shadow-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-600">
                Learn first
              </p>
              <h1 className="mt-2 text-3xl font-extrabold text-slate-950">
                {activeStoryCard.title}
              </h1>
            </div>
            <Sparkles className="h-8 w-8 text-yellow-500" aria-hidden="true" />
          </div>

          <p className="mt-5 rounded-2xl bg-blue-50 p-4 text-lg font-bold leading-8 text-blue-950">
            {activeStoryCard.story}
          </p>
          <p className="mt-4 rounded-2xl bg-emerald-50 p-4 text-base font-extrabold leading-7 text-emerald-900">
            {activeStoryCard.verse}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                handleSpeak(`${activeStoryCard.title}. ${activeStoryCard.story}. ${activeStoryCard.verse}`)
              }
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-extrabold text-slate-900 ring-2 ring-blue-100 transition hover:bg-blue-50"
            >
              <Volume2 className="h-4 w-4" aria-hidden="true" />
              Listen
            </button>
            <button
              type="button"
              onClick={() => {
                void generateStoryCard();
                void generateQuestions();
              }}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-extrabold text-slate-900 ring-2 ring-blue-100 transition hover:bg-blue-50"
            >
              <WandSparkles className="h-4 w-4" aria-hidden="true" />
              New AI card
            </button>
          </div>

          <div className="mt-6">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-600">
              What should we do?
            </p>
            <div className="mt-3 grid gap-3">
              {activeStoryCard.options.map((option, index) => {
                const isSelected = selectedStoryOption === index;
                const isCorrect = option.correct;

                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => handleStoryOption(index)}
                    className={[
                      "rounded-2xl border-2 p-4 text-left text-base font-extrabold transition",
                      selectedStoryOption === null
                        ? "border-blue-100 bg-white text-slate-900 hover:border-blue-300"
                        : isCorrect
                          ? "border-emerald-400 bg-emerald-50 text-emerald-900"
                          : isSelected
                            ? "border-rose-300 bg-rose-50 text-rose-900"
                            : "border-slate-200 bg-slate-50 text-slate-500",
                    ].join(" ")}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {bookmarkMessage ? (
        <div className="ilm-pop fixed left-1/2 top-6 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg">
          <Sparkles className="h-4 w-4 text-yellow-300" aria-hidden="true" />
          {bookmarkMessage}
        </div>
      ) : null}
      {celebrationText ? (
        <div className="fixed left-1/2 top-8 z-50 -translate-x-1/2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-black text-white shadow-lg">
          {celebrationText}
        </div>
      ) : null}
      <div className="bg-blue-50 rounded-2xl p-4 flex justify-between items-center gap-4">
        <div>
          <p className="text-sm text-blue-600 font-medium">
            {selectedStory.name}
          </p>
          <p className="text-2xl font-bold text-blue-900">Score: {score}</p>
          <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-blue-500">
            {difficulty} · {questionStyle.replace("-", " ")}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <button
            onClick={() => toggleStoryBookmark(selectedStory)}
            className={[
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition",
              isStoryBookmarked(selectedStory)
                ? "ilm-pop bg-yellow-200 text-yellow-950"
                : "bg-white text-blue-700 hover:bg-blue-100",
            ].join(" ")}
          >
            <Bookmark className="h-4 w-4" aria-hidden="true" />
            {isStoryBookmarked(selectedStory) ? "Story saved" : "Save story"}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            <RotateCcw className="h-4 w-4" />
            New Story
          </button>
        </div>
      </div>

      <div className="rounded-2xl border-2 border-blue-100 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-600">
            AI question style
          </p>
          <button
            type="button"
            onClick={() => handleSpeak(currentQuestion.question)}
            className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-xs font-extrabold text-blue-800 transition hover:bg-blue-100"
          >
            <Volume2 className="h-4 w-4" aria-hidden="true" />
            Read question
          </button>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {[
            { id: "meaning", label: "Meaning" },
            { id: "kindness", label: "Kindness" },
            { id: "daily-action", label: "Daily action" },
            { id: "listen", label: "Listen" },
            { id: "sequence", label: "What happened" },
            { id: "feeling", label: "Feelings" },
          ].map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => {
                setQuestionStyle(style.id as QuestionStyle);
                askedQuestionsRef.current = [];
                void generateQuestions();
              }}
              className={[
                "rounded-full px-3 py-2 text-xs font-extrabold transition",
                questionStyle === style.id
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200",
              ].join(" ")}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 space-y-6">
        <div>
          <p className="text-sm text-blue-600 font-medium mb-2">
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
              onClick={() => handleAnswer(index)}
              disabled={answered}
              className={`w-full p-4 text-left rounded-xl border-2 font-medium transition ${
                !answered
                  ? "border-gray-200 hover:border-blue-400 cursor-pointer text-slate-900"
                  : index === currentQuestion.correctAnswer
                    ? "border-green-500 bg-green-50 text-green-900"
                    : index === selectedAnswer && selectedAnswer !== currentQuestion.correctAnswer
                      ? "border-red-500 bg-red-50 text-red-900"
                      : "border-gray-200 text-slate-700"
              }`}
            >
              <div className="flex items-center gap-3">
                {answered && index === currentQuestion.correctAnswer && (
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                )}
                {answered &&
                  index === selectedAnswer &&
                  selectedAnswer !== currentQuestion.correctAnswer && (
                    <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                  )}
                <span>{option}</span>
              </div>
            </button>
          ))}
        </div>

        {answered && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded space-y-2">
            <p className="font-medium text-blue-900">Explanation</p>
            <p className="text-blue-800">{currentQuestion.explanation}</p>
          </div>
        )}

        {answered && (
          <button
            onClick={handleNext}
            className="w-full px-4 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition"
          >
            {currentQuestionIndex < questions.length - 1 ? "Next Question" : "More Questions"}
          </button>
        )}
      </div>
    </div>
  );

}
