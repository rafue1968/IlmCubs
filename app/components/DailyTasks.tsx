"use client";

import { useEffect, useState } from "react";
import { BookOpen, CheckCircle2, HeartHandshake, Volume2 } from "lucide-react";
import { incrementStreak } from "@/lib/progress-storage";

const TASK_STORAGE_KEY = "ilmcubs_daily_tasks";

type DailyTask = {
  id: string;
  title: string;
  detail: string;
  connection: string;
  icon: "read" | "kindness" | "listen";
};

const dailyTasks: DailyTask[] = [
  {
    id: "read-short-surah",
    title: "Read one short surah",
    detail: "Read Al-Fatihah, Al-Ikhlas, Al-Falaq, or An-Nas with its meaning.",
    connection: "Tell one family member what the surah reminds you to do today.",
    icon: "read",
  },
  {
    id: "kindness-action",
    title: "Do one kind action",
    detail: "Help someone, share something, or use gentle words.",
    connection: "Connect it to the Quran teaching us to do good.",
    icon: "kindness",
  },
  {
    id: "listen-and-repeat",
    title: "Listen and repeat",
    detail: "Listen to a short verse or story and repeat one meaning you learned.",
    connection: "Ask: where can I use this lesson at home today?",
    icon: "listen",
  },
];

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function getIcon(icon: DailyTask["icon"]) {
  if (icon === "kindness") return HeartHandshake;
  if (icon === "listen") return Volume2;
  return BookOpen;
}

function getCompletedTasks() {
  if (typeof window === "undefined") return [];

  try {
    const rawValue = window.localStorage.getItem(TASK_STORAGE_KEY);
    if (!rawValue) return [];

    const parsed = JSON.parse(rawValue) as { date?: string; completed?: string[] };
    return parsed.date === getTodayDate() && Array.isArray(parsed.completed)
      ? parsed.completed
      : [];
  } catch {
    return [];
  }
}

function saveCompletedTasks(completed: string[]) {
  window.localStorage.setItem(
    TASK_STORAGE_KEY,
    JSON.stringify({
      date: getTodayDate(),
      completed,
    })
  );
}

export default function DailyTasks() {
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);

  useEffect(() => {
    queueMicrotask(() => {
      setCompletedTaskIds(getCompletedTasks());
    });
  }, []);

  function handleComplete(taskId: string) {
    if (completedTaskIds.includes(taskId)) return;

    const nextCompletedTaskIds = [...completedTaskIds, taskId];
    saveCompletedTasks(nextCompletedTaskIds);
    incrementStreak();
    setCompletedTaskIds(nextCompletedTaskIds);
  }

  return (
    <section className="mt-8 rounded-[36px] border-4 border-white/60 bg-white/35 p-6 shadow-[0_30px_70px_-45px_rgba(2,6,23,0.55)] backdrop-blur sm:p-8">
      <p className="text-sm font-black uppercase tracking-[0.24em] text-slate-700">
        Daily guidance
      </p>
      <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
        Today&apos;s Quran tasks
      </h2>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {dailyTasks.map((task) => {
          const Icon = getIcon(task.icon);
          const isComplete = completedTaskIds.includes(task.id);

          return (
            <div
              key={task.id}
              className="rounded-[28px] border-4 border-white/60 bg-white/45 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70 text-emerald-700 ring-2 ring-white/80">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                {isComplete ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Done
                  </span>
                ) : null}
              </div>
              <h3 className="mt-4 text-lg font-extrabold text-slate-950">
                {task.title}
              </h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
                {task.detail}
              </p>
              <p className="mt-3 rounded-2xl bg-yellow-100/70 p-3 text-sm font-bold leading-6 text-yellow-900">
                {task.connection}
              </p>
              <button
                type="button"
                onClick={() => handleComplete(task.id)}
                disabled={isComplete}
                className="mt-4 w-full rounded-full bg-slate-900 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-slate-800 disabled:bg-slate-400"
              >
                {isComplete ? "Completed today" : "Mark complete"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
