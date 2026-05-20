"use client";

import { useState, useEffect } from "react";
import { Child, Streak, Bookmark } from "@prisma/client";
import { StreakCard } from "@/app/components/StreakCard";
import { BookmarksList } from "@/app/components/BookmarksList";
import { BookmarkForm } from "@/app/components/BookmarkForm";

interface ChildDashboardProps {
  child: Child & {
    streak: Streak | null;
    bookmarks: Bookmark[];
  };
}

export function ChildDashboard({ child }: ChildDashboardProps) {
  const [streak, setStreak] = useState(
    child.streak || { current: 0, longest: 0, lastRead: null }
  );
  const [bookmarks, setBookmarks] = useState(child.bookmarks);
  const [isStreakLoading, setIsStreakLoading] = useState(false);
  const [streakError, setStreakError] = useState<string | null>(null);

  const checkStreakReadToday = (): boolean => {
    if (!streak.lastRead) return false;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastRead = new Date(
      new Date(streak.lastRead).getFullYear(),
      new Date(streak.lastRead).getMonth(),
      new Date(streak.lastRead).getDate()
    );
    return today.getTime() === lastRead.getTime();
  };

  const handleIncrementStreak = async () => {
    setIsStreakLoading(true);
    setStreakError(null);
    try {
      const res = await fetch(`/api/children/${child.id}/streak`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "increment" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to increment streak");
      }

      const data = await res.json();
      setStreak(data.streak);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setStreakError(errorMsg);
    } finally {
      setIsStreakLoading(false);
    }
  };

  const handleBookmarkAdded = (newBookmark: Bookmark) => {
    setBookmarks((prev) => [newBookmark, ...prev]);
  };

  const handleBookmarkDeleted = (bookmarkId: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">{child.name}</h1>
        {child.age && <p className="text-white/50 mt-1">Age {child.age}</p>}
      </div>

      {/* Streak Card */}
      <StreakCard
        current={streak.current ?? 0}
        longest={streak.longest ?? 0}
        isReadToday={checkStreakReadToday()}
        onIncrement={handleIncrementStreak}
        isLoading={isStreakLoading}
      />

      {streakError && (
        <div className="rounded-lg bg-red-500/10 p-4 text-red-300">
          {streakError}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-white/50 uppercase">Bookmarks</p>
          <p className="mt-2 text-2xl font-bold text-emerald-400">
            {bookmarks.length}
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-white/50 uppercase">Current Streak</p>
          <p className="mt-2 text-2xl font-bold text-orange-400">
            {streak.current ?? 0}
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-white/50 uppercase">Best Streak</p>
          <p className="mt-2 text-2xl font-bold text-emerald-400">
            {streak.longest ?? 0}
          </p>
        </div>
      </div>

      {/* Bookmark Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Bookmarks</h2>
        <BookmarkForm
          childId={child.id}
          onSuccess={handleBookmarkAdded}
        />
        <BookmarksList
          bookmarks={bookmarks}
          childId={child.id}
          onDelete={handleBookmarkDeleted}
        />
      </div>
    </div>
  );
}
