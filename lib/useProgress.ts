"use client";

import { useCallback, useEffect, useState } from "react";

export type BookmarkItem = {
  type: "verse" | "story";
  id: string;
  title: string;
  timestamp: number;
};

export type QuizHistoryItem = {
  date: string;
  score: number;
};

type DailyTasksStore = {
  date: string;
  completed: string[];
};

export type ProgressStore = {
  streak: number;
  lastActiveDate: string;
  bookmarks: BookmarkItem[];
  quizHistory: QuizHistoryItem[];
  dailyTasks: DailyTasksStore;
};

const STORAGE_KEY = "ilmcubs_progress";
const LEGACY_DAILY_TASKS_KEY = "ilmcubs_daily_tasks";
const MS_PER_DAY = 86_400_000;

const defaultProgress: ProgressStore = {
  streak: 0,
  lastActiveDate: "",
  bookmarks: [],
  quizHistory: [],
  dailyTasks: {
    date: "",
    completed: [],
  },
};

let currentProgress: ProgressStore = defaultProgress;
let hasLoadedFromStorage = false;
const subscribers = new Set<(progress: ProgressStore) => void>();

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function getUtcDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function getUtcDayNumber(dateKey: string) {
  const time = Date.parse(`${dateKey}T00:00:00.000Z`);
  return Number.isNaN(time) ? null : Math.floor(time / MS_PER_DAY);
}

function getDateGapInDays(previousDateKey: string, nextDateKey: string) {
  const previousDay = getUtcDayNumber(previousDateKey);
  const nextDay = getUtcDayNumber(nextDateKey);

  if (previousDay === null || nextDay === null) {
    return null;
  }

  return nextDay - previousDay;
}

function normalizeBookmarks(value: unknown): BookmarkItem[] {
  if (!Array.isArray(value)) return [];

  return value.filter((bookmark): bookmark is BookmarkItem => {
    if (!bookmark || typeof bookmark !== "object") return false;
    const item = bookmark as Partial<BookmarkItem>;
    return (
      (item.type === "verse" || item.type === "story") &&
      typeof item.id === "string" &&
      typeof item.title === "string" &&
      typeof item.timestamp === "number"
    );
  });
}

function normalizeQuizHistory(value: unknown): QuizHistoryItem[] {
  if (!Array.isArray(value)) return [];

  return value.filter((historyItem): historyItem is QuizHistoryItem => {
    if (!historyItem || typeof historyItem !== "object") return false;
    const item = historyItem as Partial<QuizHistoryItem>;
    return typeof item.date === "string" && typeof item.score === "number";
  });
}

function normalizeDailyTasks(value: unknown): DailyTasksStore {
  if (!value || typeof value !== "object") return defaultProgress.dailyTasks;

  const tasks = value as Partial<DailyTasksStore>;
  return {
    date: typeof tasks.date === "string" ? tasks.date : "",
    completed: Array.isArray(tasks.completed)
      ? tasks.completed.filter((taskId): taskId is string => typeof taskId === "string")
      : [],
  };
}

function normalizeProgress(value: unknown): ProgressStore {
  if (!value || typeof value !== "object") {
    return defaultProgress;
  }

  const progress = value as Partial<ProgressStore>;
  return {
    streak: typeof progress.streak === "number" ? Math.max(0, progress.streak) : 0,
    lastActiveDate:
      typeof progress.lastActiveDate === "string" ? progress.lastActiveDate : "",
    bookmarks: normalizeBookmarks(progress.bookmarks),
    quizHistory: normalizeQuizHistory(progress.quizHistory),
    dailyTasks: normalizeDailyTasks(progress.dailyTasks),
  };
}

function readLegacyDailyTasks(): DailyTasksStore | null {
  if (!canUseStorage()) return null;

  try {
    const rawValue = window.localStorage.getItem(LEGACY_DAILY_TASKS_KEY);
    if (!rawValue) return null;
    return normalizeDailyTasks(JSON.parse(rawValue));
  } catch {
    return null;
  }
}

function readProgressFromStorage() {
  if (!canUseStorage()) return defaultProgress;

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    const storedProgress = rawValue
      ? normalizeProgress(JSON.parse(rawValue))
      : defaultProgress;
    const legacyDailyTasks = readLegacyDailyTasks();

    return legacyDailyTasks && !storedProgress.dailyTasks.date
      ? { ...storedProgress, dailyTasks: legacyDailyTasks }
      : storedProgress;
  } catch {
    return defaultProgress;
  }
}

function writeProgressToStorage(progress: ProgressStore) {
  if (!canUseStorage()) return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function emitProgress(progress: ProgressStore) {
  currentProgress = progress;
  subscribers.forEach((subscriber) => subscriber(progress));
}

function updateProgress(updater: (progress: ProgressStore) => ProgressStore) {
  const baseProgress = hasLoadedFromStorage
    ? currentProgress
    : readProgressFromStorage();
  const nextProgress = updater(baseProgress);

  hasLoadedFromStorage = true;
  writeProgressToStorage(nextProgress);
  emitProgress(nextProgress);

  return nextProgress;
}

function subscribeToProgress(subscriber: (progress: ProgressStore) => void) {
  subscribers.add(subscriber);
  return () => {
    subscribers.delete(subscriber);
  };
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressStore>(defaultProgress);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToProgress(setProgress);

    queueMicrotask(() => {
      const storedProgress = readProgressFromStorage();
      hasLoadedFromStorage = true;
      emitProgress(storedProgress);
      setIsHydrated(true);
    });

    return unsubscribe;
  }, []);

  const saveProgress = useCallback(
    (
      updater:
        | Partial<ProgressStore>
        | ((currentProgress: ProgressStore) => ProgressStore)
    ) => {
      return updateProgress((current) =>
        typeof updater === "function"
          ? updater(current)
          : normalizeProgress({ ...current, ...updater })
      );
    },
    []
  );

  const checkDailyStreak = useCallback(() => {
    return updateProgress((current) => {
      const today = getUtcDateKey();

      if (current.lastActiveDate === today) {
        return current;
      }

      const gap = current.lastActiveDate
        ? getDateGapInDays(current.lastActiveDate, today)
        : null;
      const nextStreak = gap === 1 ? current.streak + 1 : 1;

      return {
        ...current,
        streak: nextStreak,
        lastActiveDate: today,
      };
    }).streak;
  }, []);

  const addBookmark = useCallback((item: BookmarkItem) => {
    updateProgress((current) => ({
      ...current,
      bookmarks: [
        ...current.bookmarks.filter((bookmark) => bookmark.id !== item.id),
        item,
      ],
    }));
  }, []);

  const removeBookmark = useCallback((id: string) => {
    updateProgress((current) => ({
      ...current,
      bookmarks: current.bookmarks.filter((bookmark) => bookmark.id !== id),
    }));
  }, []);

  const completeQuiz = useCallback((score: number) => {
    return updateProgress((current) => {
      const today = getUtcDateKey();
      const gap = current.lastActiveDate
        ? getDateGapInDays(current.lastActiveDate, today)
        : null;
      const shouldIncrement = current.lastActiveDate !== today;
      const nextStreak = shouldIncrement
        ? gap === 1
          ? current.streak + 1
          : 1
        : current.streak;

      return {
        ...current,
        streak: nextStreak,
        lastActiveDate: shouldIncrement ? today : current.lastActiveDate,
        quizHistory: [
          ...current.quizHistory,
          {
            date: new Date().toISOString(),
            score,
          },
        ],
      };
    });
  }, []);

  const completeDailyTask = useCallback((taskId: string) => {
    return updateProgress((current) => {
      const today = getUtcDateKey();
      const currentDailyTasks =
        current.dailyTasks.date === today
          ? current.dailyTasks
          : { date: today, completed: [] };

      if (currentDailyTasks.completed.includes(taskId)) {
        return current;
      }

      const gap = current.lastActiveDate
        ? getDateGapInDays(current.lastActiveDate, today)
        : null;
      const shouldIncrement = current.lastActiveDate !== today;

      return {
        ...current,
        streak: shouldIncrement
          ? gap === 1
            ? current.streak + 1
            : 1
          : current.streak,
        lastActiveDate: shouldIncrement ? today : current.lastActiveDate,
        dailyTasks: {
          date: today,
          completed: [...currentDailyTasks.completed, taskId],
        },
      };
    });
  }, []);

  const today = getUtcDateKey();
  const completedDailyTaskIds =
    progress.dailyTasks.date === today ? progress.dailyTasks.completed : [];

  return {
    streak: progress.streak,
    lastActiveDate: progress.lastActiveDate,
    bookmarks: progress.bookmarks,
    quizHistory: progress.quizHistory,
    completedDailyTaskIds,
    isHydrated,
    addBookmark,
    removeBookmark,
    completeQuiz,
    checkDailyStreak,
    completeDailyTask,
    saveProgress,
  };
}
