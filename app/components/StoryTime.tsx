"use client";

import { CheckCircle, Loader2, RotateCcw, XCircle } from "lucide-react";
import { completeActivity } from "../lib/user-api";
import { useState, useEffect } from "react";

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

const STORIES: StoryConfig[] = [
  { surah: "Al-Fil", topic: "Elephant and the Kaaba", name: "The Elephant" },
  { surah: "Quraysh", topic: "Trade and protection", name: "Quraysh Tribe" },
];

export default function StoryTime() {
  const [selectedStory, setSelectedStory] = useState<StoryConfig | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedStory) {
      generateQuestions();
    }
  }, [selectedStory]);

  const generateQuestions = async () => {
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

      // Track asked questions to avoid repetition
      setAskedQuestions([
        ...askedQuestions,
        ...data.questions.map((q) => q.question),
      ]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Error generating questions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (index: number) => {
    if (answered) return;

    setSelectedAnswer(index);
    setAnswered(true);

    if (index === questions[currentQuestionIndex].correctAnswer) {
      setScore(score + 1);
    }
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
    setAskedQuestions([]);
    setError(null);
  };

  if (!selectedStory) {
    return (
      <div className="space-y-6">
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
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        <p className="text-slate-600">Generating questions...</p>
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

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-2xl p-4 flex justify-between items-center">
        <div>
          <p className="text-sm text-blue-600 font-medium">
            {selectedStory.name}
          </p>
          <p className="text-2xl font-bold text-blue-900">Score: {score}</p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          <RotateCcw className="h-4 w-4" />
          New Story
        </button>
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