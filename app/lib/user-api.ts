export type CurrentStreakResponse = {
  success: boolean;
  data?: {
    id: string;
    type: string;
    currentStreak: number;
    longestStreak: number;
    status: string;
    lastActivityDate: string;
  };
  mocked?: boolean;
  message?: string;
};

export type StreakHistoryResponse = {
  success: boolean;
  data?: {
    id: string;
    type: string;
    status: string;
    date: string;
  }[];
  pagination?: {
    total_records: number;
    total_pages: number;
    current_page: number;
  };
  mocked?: boolean;
  message?: string;
};

export type Bookmark = {
  id: string;
  createdAt: string;
  type: "ayah" | "surah" | "juz" | "page";
  key: number;
  verseNumber?: number | null;
  group?: string;
  isInDefaultCollection: boolean;
  isReading?: boolean | null;
  collectionsCount?: number;
};

export type BookmarksResponse = {
  success: boolean;
  data?: Bookmark[];
  mocked?: boolean;
  message?: string;
};

export type AddBookmarkResponse = {
  success: boolean;
  data?: Bookmark;
  mocked?: boolean;
  message?: string;
};

export async function getUserHealth() {
  const res = await fetch("/api/user/health");
  if (!res.ok) throw new Error("Failed to check user API health");
  return res.json();
}

export async function getCurrentQuranStreak(): Promise<CurrentStreakResponse> {
  const res = await fetch("/api/user/streaks/current?type=QURAN", {
    headers: {
      "x-timezone": Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message || "Failed to fetch current streak");
  }

  return res.json();
}

export async function getQuranStreakHistory(): Promise<StreakHistoryResponse> {
  const res = await fetch("/api/user/streaks?type=QURAN");

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message || "Failed to fetch streak history");
  }

  return res.json();
}

export async function getBookmarks(): Promise<BookmarksResponse> {
  const res = await fetch("/api/user/bookmarks");

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message || "Failed to fetch bookmarks");
  }

  return res.json();
}

export async function addBookmark(bookmarkData: {
  type: "ayah";
  key: number;
  verseNumber: number;
  mushaf?: number;
}): Promise<AddBookmarkResponse> {
  const res = await fetch("/api/user/bookmarks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bookmarkData),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message || "Failed to add bookmark");
  }

  return res.json();
}

export async function completeActivity(activityType: string, data?: any): Promise<{ success: boolean; message?: string }> {
  // This would typically call the Quran API to record activity completion
  // For now, it's a mock implementation
  const res = await fetch("/api/user/activity", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type: activityType, ...data }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message || "Failed to record activity");
  }

  return res.json();
}