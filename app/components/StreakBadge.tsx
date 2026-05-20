"use client";

import { useEffect, useState } from "react";
import { Flame, Sparkles } from "lucide-react";
import { getStreak, incrementStreak } from "@/lib/progress-storage";

export default function StreakBadge() {
  const [streak, setStreak] = useState(0);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const nextStreak = incrementStreak();
      setStreak(nextStreak || getStreak());
      setHasHydrated(true);
    });
  }, []);

  const nextMilestone = Math.max(3, Math.ceil((streak + 1) / 3) * 3);
  const progress = nextMilestone > 0 ? Math.min((streak / nextMilestone) * 100, 100) : 0;

  return (
    <div
      className={[
        "inline-flex min-w-[210px] items-center gap-3 rounded-full bg-white/70 px-4 py-2 text-sm font-bold text-slate-700 ring-2 ring-white/80",
        hasHydrated ? "ilm-pop" : "",
      ].join(" ")}
    >
      <span className="ilm-pulse-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100">
        <Flame className="h-5 w-5 text-orange-500" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1 text-slate-950">
          {streak} day streak
          {streak > 0 ? (
            <Sparkles className="h-3.5 w-3.5 text-yellow-500" aria-hidden="true" />
          ) : null}
        </span>
        <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-orange-100">
          <span
            className="block h-full rounded-full bg-gradient-to-r from-orange-400 to-yellow-400 transition-all"
            style={{ width: `${progress}%` }}
          />
        </span>
      </span>
    </div>
  );
}
