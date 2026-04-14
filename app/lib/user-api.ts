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