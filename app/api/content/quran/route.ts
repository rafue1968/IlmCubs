type VerseTranslation = {
  text?: string | null;
};

type Verse = {
  verse_key: string;
  text_uthmani?: string | null;
  translations?: VerseTranslation[] | null;
};

type VersesPayload = {
  verses?: Verse[] | null;
};

type TafsirEntry = {
  verse_key: string;
  text?: string | null;
};

type TafsirPayload = {
  tafsirs?: TafsirEntry[] | null;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const chapter = searchParams.get("chapter");
  const tafsirId = searchParams.get("tafsir_id") || "169";
  const translationId = searchParams.get("translation_id") || "131";
  const base = process.env.QURAN_API_BASE_URL;

  if (!chapter) {
    return Response.json(
      { success: false, error: "chapter is required" },
      { status: 400 }
    );
  }

  if (!base) {
    return Response.json(
      { success: false, error: "Missing QURAN_API_BASE_URL in .env" },
      { status: 500 }
    );
  }

  const versesUrl =
    `${base}/verses/by_chapter/${chapter}` +
    `?translations=${encodeURIComponent(translationId)}` +
    `&fields=text_uthmani`;

  const tafsirUrl =
    `${base}/quran/tafsirs/${encodeURIComponent(tafsirId)}` +
    `?chapter_number=${encodeURIComponent(chapter)}`;

  try {
    const [versesRes, tafsirRes] = await Promise.all([
      fetch(versesUrl),
      fetch(tafsirUrl),
    ]);

    if (!versesRes.ok || !tafsirRes.ok) {
      throw new Error("Failed to fetch Quran data");
    }

    const [versesPayload, tafsirPayload] = (await Promise.all([
      versesRes.json(),
      tafsirRes.json(),
    ])) as [VersesPayload, TafsirPayload];

    const tafsirMap = new Map<string, string | null>(
      (tafsirPayload.tafsirs || []).map((item) => [item.verse_key, item.text ?? null])
    );

    const data = (versesPayload.verses || []).map((verse) => ({
      verse_key: verse.verse_key,
      arabic: verse.text_uthmani ?? null,
      translation: verse.translations?.[0]?.text ?? null,
      tafsir: tafsirMap.get(verse.verse_key) ?? null,
    }));

    return Response.json({ success: true, data });
  } catch {
    return Response.json(
      { success: false, error: "failed to fetch data from Quran API" },
      { status: 500 }
    );
  }
}
