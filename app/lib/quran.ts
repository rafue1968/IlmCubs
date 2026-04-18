export type QuranChapter = {
  id: number;
  name_simple: string;
  name_arabic: string;
  translated_name?: {
    name?: string;
  };
};

export type ChaptersResponse = {
  success: boolean;
  data?: {
    chapters?: QuranChapter[];
  };
};

export type QuranVerse = {
  verse_key: string;
  text_uthmani?: string | null;
  translations?: Array<{
    text?: string | null;
  }> | null;
};

export type VersesResponse = {
  success: boolean;
  data?: {
    verses?: QuranVerse[];
  };
};

export async function getChapters(): Promise<ChaptersResponse> {
  const res = await fetch("/api/quran?type=chapters");
  if (!res.ok) throw new Error("Failed to fetch chapters");
  return res.json();
}

export async function getVersesByChapter(
  chapter: number,
  translations = "131"
): Promise<VersesResponse> {
  const res = await fetch(
    `/api/quran?type=verses&chapter=${chapter}&translations=${translations}`
  );
  if (!res.ok) throw new Error("Failed to fetch verses");
  return res.json();
}

export async function getVerseByKey(key: string, translations = "131") {
  const res = await fetch(
    `/api/quran?type=verse&key=${encodeURIComponent(key)}&translations=${translations}`
  );
  if (!res.ok) throw new Error("Failed to fetch verse");
  return res.json();
}

export async function searchQuran(query: string) {
  const res = await fetch(
    `/api/quran?type=search&q=${encodeURIComponent(query)}`
  );
  if (!res.ok) throw new Error("Failed to search Quran");
  return res.json();
}
