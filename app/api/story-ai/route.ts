import { NextRequest, NextResponse } from "next/server";

type StoryItem = {
  juzNumber: number;
  title: string;
  story: string;
  verse: string;
  options: { label: string; correct: boolean }[];
};

type GeminiStoryResponse = {
  title: string;
  story: string;
  verse: string;
  correctOption: string;
  incorrectOption: string;
};

const GEMINI_MODEL = "gemini-2.5-flash";

function fallbackStory(juzNumber: number): StoryItem {
  return {
    juzNumber,
    title: `Story from Juz ${juzNumber}`,
    story: `In Juz ${juzNumber}, the Quran teaches us beautiful lessons about kindness, patience, and faith.`,
    verse: "The Quran guides us to be good and kind.",
    options: [
      { label: "Follow the good teaching", correct: true },
      { label: "Ignore the good teaching", correct: false },
    ],
  };
}

async function generateAIStory(juzNumber: number, geminiKey: string): Promise<StoryItem> {
  const prompt = `
You are creating a very gentle Quran story card for children aged 4 to 6.

Task:
Create one short child-friendly story inspired by Juz ${juzNumber}.

Rules:
- Keep language very simple.
- Use short sentences.
- Make it warm, cheerful, and safe for little children.
- Do not use scary or harsh language.
- Keep the story general and child-friendly.
- Include one short verse-style takeaway sentence.
- Provide exactly 2 answer choices:
  - one kind/good choice
  - one unkind/wrong choice

Return ONLY valid JSON.

Schema:
{
  "title": "short title",
  "story": "2 to 4 short sentences",
  "verse": "1 short takeaway sentence",
  "correctOption": "good action",
  "incorrectOption": "wrong action"
}
`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${geminiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
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
              title: { type: "STRING" },
              story: { type: "STRING" },
              verse: { type: "STRING" },
              correctOption: { type: "STRING" },
              incorrectOption: { type: "STRING" },
            },
            required: [
              "title",
              "story",
              "verse",
              "correctOption",
              "incorrectOption",
            ],
          },
        },
      }),
    }
  );

  const text = await res.text();

  let data: unknown = null;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Gemini returned invalid JSON envelope for story generation");
  }

  if (!res.ok) {
    throw new Error("Gemini story request failed");
  }

  const raw = (data as any)?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  if (!raw) {
    throw new Error("Gemini returned no story text");
  }

  const parsed = JSON.parse(raw) as GeminiStoryResponse;

  return {
    juzNumber,
    title: parsed.title?.trim() || `Story from Juz ${juzNumber}`,
    story:
      parsed.story?.trim() ||
      `In Juz ${juzNumber}, the Quran teaches us beautiful lessons about being good and kind.`,
    verse: parsed.verse?.trim() || "The Quran guides us to be good and kind.",
    options: [
      {
        label: parsed.correctOption?.trim() || "Choose the kind action",
        correct: true,
      },
      {
        label: parsed.incorrectOption?.trim() || "Choose the unkind action",
        correct: false,
      },
    ],
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const juzNumber = parseInt(searchParams.get("juz") || "1", 10);

    if (Number.isNaN(juzNumber) || juzNumber < 1 || juzNumber > 30) {
      return NextResponse.json(
        { success: false, error: "Juz number must be between 1 and 30" },
        { status: 400 }
      );
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return NextResponse.json(
        { success: false, error: "Missing GEMINI_API_KEY in .env" },
        { status: 500 }
      );
    }

    try {
      const story = await generateAIStory(juzNumber, geminiKey);
      return NextResponse.json({ success: true, story });
    } catch (err) {
      console.error("Gemini story generation failed:", err);
      return NextResponse.json({
        success: true,
        story: fallbackStory(juzNumber),
        fallback: true,
      });
    }
  } catch (error) {
    console.error("Error generating AI story:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate story" },
      { status: 500 }
    );
  }
}