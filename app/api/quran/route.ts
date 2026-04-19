type VerseTranslation = {
  text?: string | null;
};

type VerseWord = {
  translation?: VerseTranslation | null;
};

type Verse = {
  verse_key: string;
  text_uthmani?: string | null;
  translations?: VerseTranslation[] | null;
  words?: VerseWord[] | null;
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

async function fetchJson(url: string) {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Upstream request failed: ${url}`);
  }

  return res.json();
}

function buildVerseTranslation(verse: Verse): VerseTranslation[] | undefined {
  if (verse.translations?.[0]?.text) {
    return verse.translations;
  }

  const text = (verse.words || [])
    .map((word) => word.translation?.text?.trim())
    .filter((word): word is string => Boolean(word))
    .join(" ")
    .trim();

  return text ? [{ text }] : undefined;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const base = process.env.QURAN_API_BASE_URL;

  if (!base) {
    return Response.json(
      { success: false, error: "Missing QURAN_API_BASE_URL in .env" },
      { status: 500 }
    );
  }

  const type = searchParams.get("type");

  if (type) {
    const chapter = searchParams.get("chapter");
    const key = searchParams.get("key");
    const juz = searchParams.get("juz");
    const q = searchParams.get("q");
    const translations = searchParams.get("translations") || "131";

    let url = "";

    switch (type) {
      case "chapters":
        url = `${base}/chapters`;
        break;

      case "verses":
        if (!chapter) {
          return Response.json({ error: "chapter required" }, { status: 400 });
        }
        url =
          `${base}/verses/by_chapter/${chapter}` +
          `?translations=${encodeURIComponent(translations)}` +
          `&fields=text_uthmani` +
          `&words=true`;
        break;

      case "verse":
        if (!key) {
          return Response.json(
            { error: "key required (e.g. 2:255)" },
            { status: 400 }
          );
        }
        url = `${base}/verses/by_key/${encodeURIComponent(key)}?translations=${encodeURIComponent(translations)}`;
        break;

      case "juz":
        if (!juz) {
          return Response.json({ error: "juz required" }, { status: 400 });
        }
        url = `${base}/juzs/${encodeURIComponent(juz)}`;
        break;

      case "search":
        if (!q) {
          return Response.json({ error: "query required" }, { status: 400 });
        }
        url = `${base}/search?q=${encodeURIComponent(q)}`;
        break;

      default:
        return Response.json(
          {
            error:
              "invalid type. Use: chapters | verses | verse | juz | search",
          },
          { status: 400 }
        );
    }

    try {
      const data = await fetchJson(url);

      if (type === "verses" && Array.isArray(data?.verses)) {
        data.verses = data.verses.map((verse: Verse) => ({
          ...verse,
          translations: buildVerseTranslation(verse),
        }));
      }

      return Response.json({
        success: true,
        type,
        source_url: url,
        data,
      });
    } catch {
      return Response.json(
        { success: false, error: "failed to fetch data from Quran API" },
        { status: 500 }
      );
    }
  }

  const chapter = searchParams.get("chapter");
  const tafsirId = searchParams.get("tafsir_id") || "169";
  const translationId = searchParams.get("translation_id") || "131";

  if (!chapter) {
    return Response.json(
      {
        success: false,
        error:
          "chapter is required when type is omitted, or pass type=chapters|verses|verse|juz|search",
      },
      { status: 400 }
    );
  }

  const versesUrl =
    `${base}/verses/by_chapter/${encodeURIComponent(chapter)}` +
    `?translations=${encodeURIComponent(translationId)}` +
    `&fields=text_uthmani`;

  const tafsirUrl =
    `${base}/quran/tafsirs/${encodeURIComponent(tafsirId)}` +
    `?chapter_number=${encodeURIComponent(chapter)}`;

  try {
    const [versesPayload, tafsirPayload] = (await Promise.all([
      fetchJson(versesUrl),
      fetchJson(tafsirUrl),
    ])) as [VersesPayload, TafsirPayload];

    const tafsirMap = new Map<string, string | null>(
      (tafsirPayload.tafsirs || []).map((item) => [
        item.verse_key,
        item.text ?? null,
      ])
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