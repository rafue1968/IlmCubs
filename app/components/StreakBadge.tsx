"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { getStreak, incrementStreak } from "@/lib/progress-storage";

export default function StreakBadge() {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    queueMicrotask(() => {
      const nextStreak = incrementStreak();
      setStreak(nextStreak || getStreak());
    });
  }, []);

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-4 py-2 text-sm font-bold text-slate-700 ring-2 ring-white/70">
      <Flame className="h-4 w-4 text-orange-500" aria-hidden="true" />
      <span>{streak} day streak</span>
    </div>
  );
}
