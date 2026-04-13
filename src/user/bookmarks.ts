const DEFAULT_MUSHAF_ID = 4;

const CHAPTER_VERSE_COUNTS = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128,
  111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54,
  45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62,
  55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28,
  20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15,
  21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6,
] as const;

const TOTAL_VERSES = CHAPTER_VERSE_COUNTS.reduce((sum, count) => sum + count, 0);

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

export type AddBookmarkInput = {
  verseId: number;
};

export type VerseReference = {
  verseId: number;
  chapterNumber: number;
  verseNumber: number;
};

export type BookmarkRequestBody = {
  type: "ayah";
  key: number;
  verseNumber: number;
  mushaf: number;
};

export function buildBookmarkRequest(input: AddBookmarkInput): BookmarkRequestBody {
  const reference = resolveVerseReference(input.verseId);

  return {
    type: "ayah",
    key: reference.chapterNumber,
    verseNumber: reference.verseNumber,
    mushaf: DEFAULT_MUSHAF_ID,
  };
}

export function getBookmarksQueryString(): string {
  return new URLSearchParams({
    type: "ayah",
    mushafId: String(DEFAULT_MUSHAF_ID),
  }).toString();
}

export function resolveVerseReference(verseId: number): VerseReference {
  if (!Number.isInteger(verseId) || verseId < 1 || verseId > TOTAL_VERSES) {
    throw new Error(`verseId must be an integer between 1 and ${TOTAL_VERSES}`);
  }

  let previousChapterVerseCount = 0;

  for (let index = 0; index < CHAPTER_VERSE_COUNTS.length; index += 1) {
    const chapterVerseCount = CHAPTER_VERSE_COUNTS[index];
    const currentChapterEnd = previousChapterVerseCount + chapterVerseCount;

    if (verseId <= currentChapterEnd) {
      return {
        verseId,
        chapterNumber: index + 1,
        verseNumber: verseId - previousChapterVerseCount,
      };
    }

    previousChapterVerseCount = currentChapterEnd;
  }

  throw new Error(`Unable to resolve verseId ${verseId}`);
}
