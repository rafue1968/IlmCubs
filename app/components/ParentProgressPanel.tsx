"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, Bookmark, CalendarCheck, Flame, Sparkles } from "lucide-react";
import {
  type BookmarkItem,
  type ProgressStore,
  getProgressStore,
  removeBookmark,
} from "@/lib/progress-storage";

const emptyProgress: ProgressStore = {
  streak: 0,
  lastActiveDate: "",
  bookmarks: [],
  quizHistory: [],
};

function formatDate(value: string) {
  if (!value) return "Not started";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function getAverageScore(scores: number[]) {
  if (scores.length === 0) return 0;

  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}

export default function ParentProgressPanel() {
  const [progress, setProgress] = useState<ProgressStore>(emptyProgress);

  useEffect(() => {
    queueMicrotask(() => {
      setProgress(getProgressStore());
    });
  }, []);

  const quizScores = useMemo(
    () => progress.quizHistory.map((historyItem) => historyItem.score),
    [progress.quizHistory]
  );
  const averageScore = getAverageScore(quizScores);
  const latestBookmarks = progress.bookmarks.slice().reverse().slice(0, 6);
  const streakMilestones = [1, 3, 7, 14, 30];

  function handleRemoveBookmark(bookmark: BookmarkItem) {
    removeBookmark(bookmark.id);
    setProgress(getProgressStore());
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[34px] border-4 border-white/60 bg-white/35 p-6 shadow-[0_30px_70px_-45px_rgba(2,6,23,0.55)] backdrop-blur sm:p-8">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-slate-700">
          Parent layer
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
          Progress and accomplishments
        </h1>
        <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-slate-700">
          This local profile shows streaks, saved lessons, and quiz history on this
          device, matching local dev and Vercel browser behavior.
        </p>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="ilm-pop rounded-[24px] border-4 border-white/60 bg-white/50 p-5">
            <span className="ilm-pulse-ring flex h-11 w-11 items-center justify-center rounded-full bg-orange-100">
              <Flame className="h-6 w-6 text-orange-500" aria-hidden="true" />
            </span>
            <p className="mt-4 text-sm font-black uppercase tracking-[0.18em] text-slate-600">
              Current streak
            </p>
            <p className="mt-1 text-3xl font-extrabold text-slate-950">
              {progress.streak}
            </p>
          </div>
          <div className="rounded-[24px] border-4 border-white/60 bg-white/50 p-5">
            <CalendarCheck className="h-6 w-6 text-emerald-600" aria-hidden="true" />
            <p className="mt-4 text-sm font-black uppercase tracking-[0.18em] text-slate-600">
              Last active
            </p>
            <p className="mt-1 text-2xl font-extrabold text-slate-950">
              {formatDate(progress.lastActiveDate)}
            </p>
          </div>
          <div className="rounded-[24px] border-4 border-white/60 bg-white/50 p-5">
            <Bookmark className="h-6 w-6 text-blue-600" aria-hidden="true" />
            <p className="mt-4 text-sm font-black uppercase tracking-[0.18em] text-slate-600">
              Bookmarks
            </p>
            <p className="mt-1 text-3xl font-extrabold text-slate-950">
              {progress.bookmarks.length}
            </p>
          </div>
          <div className="rounded-[24px] border-4 border-white/60 bg-white/50 p-5">
            <BarChart3 className="h-6 w-6 text-violet-600" aria-hidden="true" />
            <p className="mt-4 text-sm font-black uppercase tracking-[0.18em] text-slate-600">
              Average score
            </p>
            <p className="mt-1 text-3xl font-extrabold text-slate-950">
              {averageScore}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-[26px] border-4 border-white/60 bg-white/50 p-5">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-600">
            Streak path
          </p>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {streakMilestones.map((milestone) => {
              const isUnlocked = progress.streak >= milestone;

              return (
                <div
                  key={milestone}
                  className={[
                    "rounded-2xl p-3 text-center ring-2 transition",
                    isUnlocked
                      ? "ilm-pop bg-yellow-100 text-yellow-950 ring-yellow-200"
                      : "bg-white/70 text-slate-500 ring-white/70",
                  ].join(" ")}
                >
                  <Sparkles
                    className={[
                      "mx-auto h-5 w-5",
                      isUnlocked ? "text-yellow-500" : "text-slate-300",
                    ].join(" ")}
                    aria-hidden="true"
                  />
                  <p className="mt-1 text-xs font-black">{milestone}d</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[30px] border-4 border-white/60 bg-white/40 p-6">
          <h2 className="text-2xl font-extrabold text-slate-950">
            Saved bookmarks
          </h2>
          <div className="mt-5 space-y-3">
            {latestBookmarks.length > 0 ? (
              latestBookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="ilm-pop flex items-start justify-between gap-4 rounded-[22px] bg-white/60 p-4 ring-2 ring-white/70"
                >
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-600">
                      {bookmark.type}
                    </p>
                    <p className="mt-1 text-base font-extrabold text-slate-950">
                      {bookmark.title}
                    </p>
                    <p className="mt-1 text-xs font-bold text-slate-600">
                      {formatDate(new Date(bookmark.timestamp).toISOString())}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveBookmark(bookmark)}
                    className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-black text-white transition hover:bg-slate-800"
                  >
                    Remove
                  </button>
                </div>
              ))
            ) : (
              <p className="rounded-[22px] bg-white/55 p-5 text-sm font-bold text-slate-700">
                Saved stories and verses will appear here after a child taps Save.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-[30px] border-4 border-white/60 bg-white/40 p-6">
          <h2 className="text-2xl font-extrabold text-slate-950">
            Guidance notes
          </h2>
          <div className="mt-5 space-y-3">
            {[
              "Start with short surahs, simple meanings, and kind actions.",
              "Use bookmarks to repeat stories your child enjoyed.",
              "AI-generated quizzes should stay age-filtered and meaning-focused.",
              "Move from easy recall to matching, then gentle reflection questions.",
            ].map((note) => (
              <p
                key={note}
                className="flex gap-3 rounded-[22px] bg-white/55 p-4 text-sm font-bold leading-6 text-slate-700"
              >
                <Sparkles
                  className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                  aria-hidden="true"
                />
                {note}
              </p>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
