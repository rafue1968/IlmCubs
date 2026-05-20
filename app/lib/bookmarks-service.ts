import { prisma } from "./prisma";

export interface BookmarkCreateInput {
  surah: number;
  ayah: number;
  note?: string | null;
}

/**
 * Upsert a bookmark (create if not exists, update if exists)
 */
export async function upsertBookmark(
  childId: string,
  input: BookmarkCreateInput
) {
  return prisma.bookmark.upsert({
    where: {
      childId_surah_ayah: {
        childId,
        surah: input.surah,
        ayah: input.ayah,
      },
    },
    update: {
      note: input.note ?? null,
    },
    create: {
      childId,
      surah: input.surah,
      ayah: input.ayah,
      note: input.note ?? null,
    },
  });
}

/**
 * Delete a bookmark
 */
export async function deleteBookmark(bookmarkId: string, childId: string) {
  return prisma.bookmark.deleteMany({
    where: {
      id: bookmarkId,
      childId,
    },
  });
}

/**
 * Get all bookmarks for a child
 */
export async function getBookmarksForChild(
  childId: string,
  limit?: number,
  offset?: number
) {
  return prisma.bookmark.findMany({
    where: { childId },
    orderBy: { createdAt: "desc" },
    take: limit ?? 50,
    skip: offset ?? 0,
  });
}

/**
 * Get a single bookmark
 */
export async function getBookmark(bookmarkId: string) {
  return prisma.bookmark.findUnique({
    where: { id: bookmarkId },
  });
}

/**
 * Check if a bookmark exists
 */
export async function bookmarkExists(
  childId: string,
  surah: number,
  ayah: number
) {
  const bookmark = await prisma.bookmark.findUnique({
    where: {
      childId_surah_ayah: {
        childId,
        surah,
        ayah,
      },
    },
  });
  return Boolean(bookmark);
}
