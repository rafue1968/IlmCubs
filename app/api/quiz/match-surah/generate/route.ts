import { NextResponse } from "next/server";

type QuranChapter = {
  id: number;
  name_simple: string;
  name_arabic: string;
};

type QuranVerse = {
  verse_key: string;
  arabic?: string | null;
  translation?: string | null;
  text_uthmani?: string | null;
  translations?: Array<{ text?: string | null }> | null;
  tafsir?: string | null;
};

type QuizChoice = {
  id: number;
  latinName: string;
  arabicName: string;
};

type GeneratedMatchSurahQuestion = {
  verseKey: string;
  arabicText: string;
  translationText: string;
  prompt: string;
  correctChapterId: number;
  correctSurahName: string;
  correctSurahArabic: string;
  choices: QuizChoice[];
  successMessage: string;
  retryMessage: string;
  hint?: string;
};

type SourceQuestion = {
  verseKey: string;
  arabicText: string;
  translationText: string;
  correctChapterId: number;
  correctSurahName: string;
  correctSurahArabic: string;
  choices: QuizChoice[];
};

const ALLOWED_CHAPTER_IDS = [105, 106, 107, 108, 109, 110, 111, 112, 113, 114];
const TOTAL_QUESTIONS = 5;
const OPTION_COUNT = 4;

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalizeVerse(verse: QuranVerse) {
  return {
    verse_key: verse.verse_key,
    arabic: verse.arabic ?? verse.text_uthmani ?? null,
    translation: verse.translation ?? verse.translations?.[0]?.text ?? null,
    tafsir: verse.tafsir ?? null,
  };
}

function pickRandomVerse(verses: QuranVerse[]) {
  const normalized = verses
    .map(normalizeVerse)
    .filter((verse) => Boolean(verse.arabic) && Boolean(verse.translation));

  if (normalized.length === 0) return null;
  return normalized[Math.floor(Math.random() * normalized.length)] ?? null;
}

async function fetchJson(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();

  let data: unknown = null;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  return {
    ok: res.ok,
    status: res.status,
    data,
  };
}

export async function POST() {
  try {
    const appUrl = "http://localhost:3000";
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!geminiKey) {
      return NextResponse.json(
        { success: false, step: "env", message: "Missing GEMINI_API_KEY" },
        { status: 500 }
      );
    }

    const chapterResult = await fetchJson(`${appUrl}/api/quran?type=chapters`);

    if (!chapterResult.ok) {
      return NextResponse.json(
        {
          success: false,
          step: "fetch-chapters",
          message: "Failed to fetch chapters",
          chapterResult,
        },
        { status: 500 }
      );
    }

    const chapterJson = chapterResult.data as {
      data?: { chapters?: QuranChapter[] };
    };

    const chapters =
      chapterJson?.data?.chapters?.filter((chapter) =>
        ALLOWED_CHAPTER_IDS.includes(chapter.id)
      ) || [];

    if (chapters.length < OPTION_COUNT) {
      return NextResponse.json(
        {
          success: false,
          step: "chapters-filter",
          message: "Not enough chapters available",
          chapterCount: chapters.length,
          chapters,
        },
        { status: 500 }
      );
    }

    const targetChapters = shuffleArray(chapters).slice(0, TOTAL_QUESTIONS);

    const chapterPayloads = await Promise.all(
      targetChapters.map(async (chapter) => {
        const result = await fetchJson(`${appUrl}/api/quran?chapter=${chapter.id}`);
        return {
          chapter,
          result,
        };
      })
    );

    const failedChapterFetch = chapterPayloads.find((item) => !item.result.ok);
    if (failedChapterFetch) {
      return NextResponse.json(
        {
          success: false,
          step: "fetch-chapter-verses",
          message: "Failed to fetch one of the chapter verse payloads",
          failedChapterFetch,
        },
        { status: 500 }
      );
    }

    const normalizedPayloads = chapterPayloads.map(({ chapter, result }) => {
      const json = result.data as { data?: QuranVerse[] };
      return {
        chapter,
        verses: json?.data || [],
      };
    });

    const sourceQuestions = normalizedPayloads
      .map(({ chapter, verses }): SourceQuestion | null => {
        const verse = pickRandomVerse(verses);
        if (!verse?.arabic || !verse.translation) return null;

        const distractors = shuffleArray(
          chapters.filter((candidate) => candidate.id !== chapter.id)
        )
          .slice(0, OPTION_COUNT - 1)
          .map((candidate) => ({
            id: candidate.id,
            latinName: candidate.name_simple,
            arabicName: candidate.name_arabic,
          }));

        const correctChoice = {
          id: chapter.id,
          latinName: chapter.name_simple,
          arabicName: chapter.name_arabic,
        };

        const choices = shuffleArray([correctChoice, ...distractors]);

        return {
          verseKey: verse.verse_key,
          arabicText: verse.arabic,
          translationText: verse.translation,
          correctChapterId: chapter.id,
          correctSurahName: chapter.name_simple,
          correctSurahArabic: chapter.name_arabic,
          choices,
        };
      })
      .filter((question): question is SourceQuestion => question !== null);

    if (sourceQuestions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          step: "build-source-questions",
          message: "No valid source questions could be built",
          debug: normalizedPayloads.map(({ chapter, verses }) => ({
            chapterId: chapter.id,
            chapterName: chapter.name_simple,
            verseCount: verses.length,
            firstVerse: verses[0] ?? null,
            firstNormalizedVerse: verses[0] ? normalizeVerse(verses[0]) : null,
          })),
        },
        { status: 500 }
      );
    }

    const prompt = `
You are generating Quran quiz questions for children aged 4 to 6.

Use ONLY the Quran facts I provide.
Do NOT invent Quran facts.
Do NOT change the correct surah.
Do NOT change the Arabic verse text.
Do NOT change the translation text.
Do NOT change the choices.
Keep the language simple, warm, playful, and short.

Return ONLY valid JSON as an array.

For each question, produce:
- verseKey
- arabicText
- translationText
- prompt
- correctChapterId
- correctSurahName
- correctSurahArabic
- choices
- successMessage
- retryMessage
- hint

Here is the source question data:
${JSON.stringify(sourceQuestions, null, 2)}
`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );

    const geminiText = await geminiRes.text();

    let geminiJson: unknown = null;
    try {
      geminiJson = JSON.parse(geminiText);
    } catch {
      return NextResponse.json(
        {
          success: false,
          step: "gemini-parse",
          message: "Gemini returned non-JSON response",
          raw: geminiText,
        },
        { status: 500 }
      );
    }

    if (!geminiRes.ok) {
      return NextResponse.json(
        {
          success: false,
          step: "gemini-request",
          message: "Gemini request failed",
          gemini: geminiJson,
        },
        { status: 500 }
      );
    }

    const rawText =
      (geminiJson as any)?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!rawText) {
      return NextResponse.json(
        {
          success: false,
          step: "gemini-empty",
          message: "Gemini returned no question text",
          gemini: geminiJson,
        },
        { status: 500 }
      );
    }

    let generatedQuestions: GeneratedMatchSurahQuestion[] = [];
    try {
      generatedQuestions = JSON.parse(rawText) as GeneratedMatchSurahQuestion[];
    } catch {
      return NextResponse.json(
        {
          success: false,
          step: "gemini-question-json",
          message: "Gemini question text was not valid JSON",
          rawText,
        },
        { status: 500 }
      );
    }

    const finalQuestions = sourceQuestions.map((source, index) => {
      const generated = generatedQuestions[index];

      return {
        verseKey: source.verseKey,
        arabicText: source.arabicText,
        translationText: source.translationText,
        prompt: generated?.prompt?.trim() || "Which surah is this verse from?",
        correctChapterId: source.correctChapterId,
        correctSurahName: source.correctSurahName,
        correctSurahArabic: source.correctSurahArabic,
        choices: source.choices,
        successMessage:
          generated?.successMessage?.trim() || "Great job! That is correct!",
        retryMessage:
          generated?.retryMessage?.trim() ||
          `Nice try. This verse is from ${source.correctSurahName}.`,
        hint:
          generated?.hint?.trim() ||
          "Look carefully and choose the right surah.",
      };
    });

    return NextResponse.json({
      success: true,
      data: finalQuestions,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        step: "catch",
        message:
          error instanceof Error
            ? error.message
            : "Failed to generate quiz session",
      },
      { status: 500 }
    );
  }
}