"use client";

import { Flame } from "lucide-react";

interface StreakCardProps {
  current: number;
  longest: number;
  isReadToday: boolean;
  onIncrement?: () => void;
  isLoading?: boolean;
}

export function StreakCard({
  current,
  longest,
  isReadToday,
  onIncrement,
  isLoading,
}: StreakCardProps) {
  return (
    <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-white/60 mb-1">Reading Streak</p>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-emerald-400">
              {current}
            </span>
            <span className="text-white/40">days</span>
          </div>
          <p className="mt-3 text-sm text-white/50">
            Best: <span className="text-emerald-300 font-semibold">{longest} days</span>
          </p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div
            className={`relative h-16 w-16 rounded-full flex items-center justify-center transition-all ${
              current > 0
                ? "bg-orange-500/20 ring-2 ring-orange-400"
                : "bg-white/5 ring-1 ring-white/10"
            }`}
          >
            <Flame
              className={`h-8 w-8 ${
                current > 0 ? "text-orange-400" : "text-white/20"
              }`}
            />
          </div>

          {onIncrement && (
            <button
              onClick={onIncrement}
              disabled={isReadToday || isLoading}
              className={`rounded-lg px-3 py-1 text-sm font-semibold transition-colors ${
                isReadToday
                  ? "bg-white/5 text-white/40 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-600 text-white"
              } disabled:opacity-50`}
            >
              {isLoading ? "..." : isReadToday ? "Done Today" : "Read Today"}
            </button>
          )}
        </div>
      </div>

      {isReadToday && (
        <p className="mt-4 rounded-lg bg-emerald-500/10 p-2 text-center text-sm text-emerald-300">
          ✓ Great job! Come back tomorrow to keep your streak alive.
        </p>
      )}
    </div>
  );
}
