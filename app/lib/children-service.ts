import { prisma } from "./prisma";
import { User } from "@prisma/client";

/**
 * Get all children for an authenticated user
 */
export async function getChildrenForUser(user: User) {
  return prisma.child.findMany({
    where: { userId: user.id },
    include: {
      streak: true,
      bookmarks: {
        take: 5,
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get a single child by ID with ownership verification
 */
export async function getChildById(childId: string, userId: string) {
  return prisma.child.findFirst({
    where: {
      id: childId,
      userId,
    },
    include: {
      streak: true,
      bookmarks: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

/**
 * Get child with full statistics
 */
export async function getChildWithStats(childId: string, userId: string) {
  const child = await getChildById(childId, userId);
  if (!child) return null;

  const bookmarkCount = await prisma.bookmark.count({
    where: { childId },
  });

  return {
    ...child,
    stats: {
      bookmarkCount,
      currentStreak: child.streak?.current ?? 0,
      longestStreak: child.streak?.longest ?? 0,
    },
  };
}
