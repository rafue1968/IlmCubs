export type JuzResponse = {
  success: boolean;
  data?: {
    juz_number?: number;
    id?: number;
  };
  error?: string;
};

export type VerseApiResponse = {
  success: boolean;
  data?: {
    verse?: {
      verse_key?: string;
      text_uthmani?: string;
      translations?: { text?: string }[];
    };
  };
  error?: string;
};

export async function getJuz(number: number): Promise<JuzResponse> {
  const res = await fetch(`/api/content/juz?number=${number}`);
  if (!res.ok) {
    throw new Error("Failed to fetch juz");
  }
  return res.json();
}

export async function getVerseByKey(
  key: string,
  translations = "131"
): Promise<VerseApiResponse> {
  const res = await fetch(
    `/api/content/verse?key=${encodeURIComponent(key)}&translations=${translations}`
  );
  if (!res.ok) {
    throw new Error("Failed to fetch verse");
  }
  return res.json();
}