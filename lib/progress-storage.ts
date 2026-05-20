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

export type ProgressStore = {
  streak: number;
  lastActiveDate: string;
  bookmarks: BookmarkItem[];
  quizHistory: QuizHistoryItem[];
};

const STORAGE_KEY = "ilmcubs_progress";

const defaultStore: ProgressStore = {
  streak: 0,
  lastActiveDate: "",
  bookmarks: [],
  quizHistory: [],
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function getDateDiffInDays(fromDate: string, toDate: string) {
  const from = new Date(`${fromDate}T00:00:00`);
  const to = new Date(`${toDate}T00:00:00`);
  const diff = to.getTime() - from.getTime();

  return Math.round(diff / 86_400_000);
}

function normalizeStore(value: unknown): ProgressStore {
  if (!value || typeof value !== "object") {
    return { ...defaultStore };
  }

  const store = value as Partial<ProgressStore>;

  return {
    streak: typeof store.streak === "number" ? store.streak : 0,
    lastActiveDate:
      typeof store.lastActiveDate === "string" ? store.lastActiveDate : "",
    bookmarks: Array.isArray(store.bookmarks) ? store.bookmarks : [],
    quizHistory: Array.isArray(store.quizHistory) ? store.quizHistory : [],
  };
}

function readStore(): ProgressStore {
  if (!canUseStorage()) {
    return { ...defaultStore };
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);

    if (!rawValue) {
      return { ...defaultStore };
    }

    return normalizeStore(JSON.parse(rawValue));
  } catch {
    return { ...defaultStore };
  }
}

function writeStore(store: ProgressStore) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getStreak() {
  return readStore().streak;
}

export function setStreak(value: number) {
  const store = readStore();
  writeStore({
    ...store,
    streak: Math.max(0, value),
    lastActiveDate: getTodayDate(),
  });
}

export function incrementStreak() {
  const store = readStore();
  const today = getTodayDate();

  if (store.lastActiveDate === today) {
    return store.streak;
  }

  const nextStreak =
    store.lastActiveDate && getDateDiffInDays(store.lastActiveDate, today) === 1
      ? store.streak + 1
      : 1;

  writeStore({
    ...store,
    streak: nextStreak,
    lastActiveDate: today,
  });

  return nextStreak;
}

export function getBookmarks() {
  return readStore().bookmarks;
}

export function addBookmark(item: BookmarkItem) {
  const store = readStore();
  const bookmarks = store.bookmarks.filter((bookmark) => bookmark.id !== item.id);

  writeStore({
    ...store,
    bookmarks: [...bookmarks, item],
  });
}

export function removeBookmark(id: string) {
  const store = readStore();

  writeStore({
    ...store,
    bookmarks: store.bookmarks.filter((bookmark) => bookmark.id !== id),
  });
}

export function addQuizHistory(score: number) {
  const store = readStore();

  writeStore({
    ...store,
    quizHistory: [
      ...store.quizHistory,
      {
        date: new Date().toISOString(),
        score,
      },
    ],
  });
}
