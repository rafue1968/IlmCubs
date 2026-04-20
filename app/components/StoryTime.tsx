"use client";

import React, { useEffect, useState } from "react";

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

const defaultJuzList: Juz[] = Array.from({ length: 30 }, (_, index) => ({
  id: index + 1,
  juz_number: index + 1,
}));

const fallbackStory = (juzNumber: number): StoryItem => ({
  juzNumber,
  title: `Story from Juz ${juzNumber}`,
  story: `In Juz ${juzNumber}, the Quran teaches us beautiful lessons about kindness, faith, and good actions.`,
  verse: "The Quran guides us to be good and kind.",
  options: [
    { label: "Follow the teachings", correct: true },
    { label: "Ignore the teachings", correct: false },
  ],
});

const StoryTime: React.FC = () => {
  const [juzList, setJuzList] = useState<Juz[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentStory, setCurrentStory] = useState<StoryItem | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [storyLoading, setStoryLoading] = useState(false);

  const currentJuz = juzList[currentIndex];
  const totalJuz = juzList.length || defaultJuzList.length;

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
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const fetchStory = async () => {
      if (!currentJuz) return;

      setStoryLoading(true);

      try {
        const response = await fetch(`/api/story-ai?juz=${currentJuz.juz_number}`);
        const data = await response.json();

        if (data.success && data.story) {
          setCurrentStory(data.story);
        } else {
          setCurrentStory(fallbackStory(currentJuz.juz_number));
        }
      } catch (error) {
        console.error("Failed to fetch AI story:", error);
        setCurrentStory(fallbackStory(currentJuz.juz_number));
      } finally {
        setStoryLoading(false);
      }
    };

    fetchStory();
  }, [currentJuz]);

  const handleAnswer = (correct: boolean) => {
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

  if (loading || storyLoading) {
    return (
      <div className="rounded-[34px] border-4 border-white/60 bg-white/35 p-7 text-center shadow-[0_30px_70px_-45px_rgba(2,6,23,0.55)] backdrop-blur">
        <p className="text-lg font-semibold text-slate-800">
          {loading ? "Loading story time..." : "Getting your story ready..."}
        </p>
      </div>
    );
  }

  if (!currentJuz || !currentStory) {
    return (
      <div className="rounded-[34px] border-4 border-white/60 bg-white/35 p-7 text-center shadow-[0_30px_70px_-45px_rgba(2,6,23,0.55)] backdrop-blur">
        <p className="text-lg font-semibold text-slate-800">
          Story time is not ready yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[34px] border-4 border-white/60 bg-white/35 p-7 shadow-[0_30px_70px_-45px_rgba(2,6,23,0.55)] backdrop-blur">
      <div className="mb-6 rounded-3xl border border-white/70 bg-gradient-to-r from-sky-200 via-emerald-100 to-yellow-100 p-5 text-center shadow-inner">
        <h1 className="text-3xl font-extrabold text-slate-950">📖 Story Time</h1>
        <p className="mt-2 text-sm font-semibold text-slate-700">
          Learn beautiful Quran lessons one story at a time!
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
          <p className="text-base font-extrabold text-slate-900">
            What should we do?
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {currentStory.options.map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => handleAnswer(option.correct)}
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
  );
};

export default StoryTime;