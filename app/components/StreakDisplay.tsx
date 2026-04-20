"use client";

import { useEffect, useState } from "react";
import { getCurrentQuranStreak } from "../lib/user-api";
import { Flame } from "lucide-react";

type StreakData = {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
};

export default function StreakDisplay() {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStreak() {
      try {
        const response = await getCurrentQuranStreak();
        if (response.success && response.data) {
          setStreak({
            currentStreak: response.data.currentStreak,
            longestStreak: response.data.longestStreak,
            lastActivityDate: response.data.lastActivityDate,
          });
        } else {
          setError(response.message || "Failed to load streak");
        }
      } catch (err) {
        // If unauthorized, don't show error, just don't show streak
        if (err instanceof Error && err.message.includes("401")) {
          setStreak(null);
        } else {
          setError(err instanceof Error ? err.message : "Failed to load streak");
        }
      } finally {
        setLoading(false);
      }
    }

    loadStreak();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-300">
        <Flame className="h-4 w-4" />
        <span>Loading...</span>
      </div>
    );
  }

  if (error || !streak) {
    return null; // Don't show anything if there's an error or no streak
  }

  return (
    <div className="flex items-center gap-2 text-sm text-slate-300">
      <Flame className="h-4 w-4 text-orange-400" />
      <span>
        {streak.currentStreak} day streak
        {streak.longestStreak > streak.currentStreak && (
          <span className="text-slate-400"> (best: {streak.longestStreak})</span>
        )}
      </span>
    </div>
  );
}