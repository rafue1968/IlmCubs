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
  story?: string;
  goodDeed?: string;
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

type GeminiEnhancement = {
  prompt: string;
  successMessage: string;
  retryMessage: string;
  hint: string;
  story: string;
  goodDeed: string;
};

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

const ALLOWED_CHAPTER_IDS = [105, 106, 107, 108, 109, 110, 111, 112, 113, 114];
const TOTAL_QUESTIONS = 5;
const OPTION_COUNT = 4;
const GEMINI_MODEL = "gemini-2.5-flash";

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

function buildFallbackQuestion(source: SourceQuestion): GeneratedMatchSurahQuestion {
  return {
    verseKey: source.verseKey,
    arabicText: source.arabicText,
    translationText: source.translationText,
    prompt: "Which surah is this verse from?",
    correctChapterId: source.correctChapterId,
    correctSurahName: source.correctSurahName,
    correctSurahArabic: source.correctSurahArabic,
    choices: source.choices,
    successMessage: "Great job! That is correct!",
    retryMessage: `Nice try. This verse is from ${source.correctSurahName}.`,
    hint: "Look carefully and choose the right surah.",
    story: "A child is learning a beautiful Quran verse.",
    goodDeed: "Be kind today.",
  };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateOneQuestionWithGemini(
  source: SourceQuestion,
  geminiKey: string
): Promise<GeneratedMatchSurahQuestion | null> {
  const prompt = `
You are creating a gentle Quran learning experience for children aged 4 to 6.

RULES:
- Use ONLY the Quran facts provided.
- DO NOT change the verse.
- DO NOT change the translation.
- DO NOT change the surah.
- DO NOT change the answer choices.
- Keep the language very simple.
- Use very short sentences.
- Make the tone warm, cheerful, and kind.
- Story must be a tiny child-friendly everyday situation.
- Good deed must be one simple action a child can do today.

Return ONLY valid JSON.

Generate:
- story
- prompt
- hint
- successMessage
- retryMessage
- goodDeed

Source data:
${JSON.stringify(source, null, 2)}
`;

  const requestBody = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          prompt: { type: "STRING" },
          successMessage: { type: "STRING" },
          retryMessage: { type: "STRING" },
          hint: { type: "STRING" },
          story: { type: "STRING" },
          goodDeed: { type: "STRING" },
        },
        required: [
          "prompt",
          "successMessage",
          "retryMessage",
          "hint",
          "story",
          "goodDeed",
        ],
      },
    },
  };

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    const text = await res.text();

    let data: unknown = null;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    if (!res.ok) {
      if ((res.status === 503 || res.status === 429) && attempt < 2) {
        await delay(500 * (attempt + 1));
        continue;
      }
      return null;
    }

    const envelope = data as GeminiGenerateContentResponse;
    const raw = envelope.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as GeminiEnhancement;

      return {
        verseKey: source.verseKey,
        arabicText: source.arabicText,
        translationText: source.translationText,
        prompt: parsed.prompt?.trim() || "Which surah is this verse from?",
        correctChapterId: source.correctChapterId,
        correctSurahName: source.correctSurahName,
        correctSurahArabic: source.correctSurahArabic,
        choices: source.choices,
        successMessage:
          parsed.successMessage?.trim() || "Great job! That is correct!",
        retryMessage:
          parsed.retryMessage?.trim() ||
          `Nice try. This verse is from ${source.correctSurahName}.`,
        hint:
          parsed.hint?.trim() ||
          "Look carefully and choose the right surah.",
        story:
          parsed.story?.trim() ||
          "A child is learning a beautiful Quran verse.",
        goodDeed:
          parsed.goodDeed?.trim() ||
          "Be kind today.",
      };
    } catch {
      return null;
    }
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!geminiKey) {
      return NextResponse.json(
        { success: false, step: "env", message: "Missing GEMINI_API_KEY" },
        { status: 500 }
      );
    }

    const origin = new URL(req.url).origin;

    const chapterResult = await fetchJson(`${origin}/api/quran?type=chapters`);

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
        },
        { status: 500 }
      );
    }

    const targetChapters = shuffleArray(chapters).slice(0, TOTAL_QUESTIONS);

    const chapterPayloads = await Promise.all(
      targetChapters.map(async (chapter) => {
        const result = await fetchJson(`${origin}/api/quran?chapter=${chapter.id}`);
        return { chapter, result };
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
        },
        { status: 500 }
      );
    }

    const questions = await Promise.all(
      sourceQuestions.map(async (source) => {
        const generated = await generateOneQuestionWithGemini(source, geminiKey);
        return generated ?? buildFallbackQuestion(source);
      })
    );

    const usedFallback = questions.some(
      (question, index) =>
        question.prompt === "Which surah is this verse from?" &&
        question.successMessage === "Great job! That is correct!" &&
        question.retryMessage ===
          `Nice try. This verse is from ${sourceQuestions[index].correctSurahName}.`
    );

    return NextResponse.json({
      success: true,
      data: questions,
      fallback: usedFallback,
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
