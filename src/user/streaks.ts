import { resolveVerseReference } from "./bookmarks";

const DEFAULT_MUSHAF_ID = 4;
const DEFAULT_ACTIVITY_TYPE = "QURAN";
const MINIMUM_SECONDS_READ = 1;

export type ReadingSession = {
  message: "reading session created" | "reading session updated";
};

export type ActivityDay = {
  id: string;
  date: string;
  progress: number;
  type: "QURAN" | "LESSON" | "QURAN_READING_PROGRAM";
  ranges?: string[];
  pagesRead?: number;
  secondsRead?: number;
  versesRead?: number;
  manuallyAddedSeconds?: number;
  dailyTargetPages?: number;
  dailyTargetSeconds?: number;
  dailyTargetRanges?: string[];
  remainingDailyTargetRanges?: string[];
  mushafId: number;
};

export type CreateReadingSessionInput = {
  verseId: number;
  timestamp: Date;
};

export type ReadingSessionRequestBody = {
  chapterNumber: number;
  verseNumber: number;
};

export type ActivityDayRequestBody = {
  type: "QURAN";
  seconds: number;
  ranges: string[];
  mushafId: number;
  date: string;
};

export function buildReadingSessionRequest(
  input: CreateReadingSessionInput
): ReadingSessionRequestBody {
  validateTimestamp(input.timestamp);

  const reference = resolveVerseReference(input.verseId);

  return {
    chapterNumber: reference.chapterNumber,
    verseNumber: reference.verseNumber,
  };
}

export function buildActivityDayRequest(
  input: CreateReadingSessionInput,
  timeZone: string
): ActivityDayRequestBody {
  validateTimestamp(input.timestamp);

  const reference = resolveVerseReference(input.verseId);
  const range = `${reference.chapterNumber}:${reference.verseNumber}-${reference.chapterNumber}:${reference.verseNumber}`;

  return {
    type: DEFAULT_ACTIVITY_TYPE,
    seconds: MINIMUM_SECONDS_READ,
    ranges: [range],
    mushafId: DEFAULT_MUSHAF_ID,
    date: formatDateForTimeZone(input.timestamp, timeZone),
  };
}

export function getActivityDaysQueryString(): string {
  return new URLSearchParams({
    type: DEFAULT_ACTIVITY_TYPE,
  }).toString();
}

function validateTimestamp(timestamp: Date): void {
  if (!(timestamp instanceof Date) || Number.isNaN(timestamp.getTime())) {
    throw new Error("timestamp must be a valid Date");
  }
}

function formatDateForTimeZone(date: Date, timeZone: string): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Failed to format activity day date");
  }

  return `${year}-${month}-${day}`;
}
