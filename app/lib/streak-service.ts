import { prisma } from "./prisma";

/**
 * Get or create streak for a child
 */
export async function getOrCreateStreak(childId: string) {
  return prisma.streak.upsert({
    where: { childId },
    update: {},
    create: {
      childId,
      current: 0,
      longest: 0,
    },
  });
}

/**
 * Check if a child read today (prevents double-increment)
 */
export function isReadToday(lastReadDate: Date | null): boolean {
  if (!lastReadDate) return false;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastRead = new Date(
    lastReadDate.getFullYear(),
    lastReadDate.getMonth(),
    lastReadDate.getDate()
  );

  return today.getTime() === lastRead.getTime();
}

/**
 * Check if streak should be reset (gap > 1 day)
 */
export function shouldResetStreak(lastReadDate: Date | null): boolean {
  if (!lastReadDate) return false;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastRead = new Date(
    lastReadDate.getFullYear(),
    lastReadDate.getMonth(),
    lastReadDate.getDate()
  );

  const daysDiff = Math.floor(
    (today.getTime() - lastRead.getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysDiff > 1;
}

/**
 * Increment streak for a child
 * Returns { incremented: boolean, streak: Streak }
 */
export async function incrementStreak(childId: string) {
  const streak = await getOrCreateStreak(childId);

  // Check if already read today
  if (isReadToday(streak.lastRead)) {
    return {
      incremented: false,
      streak,
      reason: "Already incremented today",
    };
  }

  // Check if should reset (gap > 1 day)
  const shouldReset = shouldResetStreak(streak.lastRead);
  const newCurrent = shouldReset ? 1 : (streak.current ?? 0) + 1;

  // Update longest if current exceeds it
  const newLongest = Math.max(newCurrent, streak.longest ?? 0);

  const updated = await prisma.streak.update({
    where: { childId },
    data: {
      current: newCurrent,
      longest: newLongest,
      lastRead: new Date(),
    },
  });

  return {
    incremented: true,
    streak: updated,
    reason: shouldReset ? "Streak reset due to gap" : "Streak incremented",
  };
}

/**
 * Reset streak manually
 */
export async function resetStreak(childId: string) {
  return prisma.streak.update({
    where: { childId },
    data: {
      current: 0,
      lastRead: null,
    },
  });
}

/**
 * Get streak stats for a child
 */
export async function getStreakStats(childId: string) {
  const streak = await getOrCreateStreak(childId);

  return {
    current: streak.current ?? 0,
    longest: streak.longest ?? 0,
    lastRead: streak.lastRead,
    isReadToday: isReadToday(streak.lastRead),
    canIncrement: !isReadToday(streak.lastRead),
  };
}
