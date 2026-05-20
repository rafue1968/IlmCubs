import { NextResponse } from "next/server";

type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

type GeminiQuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
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

const GEMINI_MODEL = "gemini-2.5-flash";

function buildFallbackQuestions(
  surah: string,
  topic: string,
  difficulty: string
): QuizQuestion[] {
  const challengeQuestion =
    difficulty === "challenge"
      ? `How can you use the lesson from ${surah} today?`
      : `What does ${surah} teach us?`;

  return [
    {
      question: challengeQuestion,
      options: [
        "Trust Allah and do good",
        "Be mean to others",
        "Never help anyone",
        "Forget kindness",
      ],
      correctAnswer: 0,
      explanation: `${surah} teaches us to trust Allah and choose what is good.`,
    },
    {
      question:
        difficulty === "challenge"
          ? `Which action best matches the lesson from ${topic}?`
          : `Which action matches the lesson?`,
      options: [
        "Helping others",
        "Hurting others",
        "Ignoring everyone",
        "Being rude",
      ],
      correctAnswer: 0,
      explanation: `This story teaches children to choose kind and helpful actions.`,
    },
    {
      question: `What happened in this lesson first?`,
      options: [
        "We listen and learn",
        "We shout over everyone",
        "We stop trying",
        "We forget the lesson",
      ],
      correctAnswer: 0,
      explanation: `First we listen with calm hearts, then we try the good lesson.`,
    },
    {
      question: `How can a child feel after doing a good action?`,
      options: [
        "Happy and thankful",
        "Mean and proud",
        "Angry at everyone",
        "Too busy to care",
      ],
      correctAnswer: 0,
      explanation: `Good actions can help our hearts feel thankful and peaceful.`,
    },
    {
      question: `What should a child do after learning this Quran story?`,
      options: [
        "Practice a good action",
        "Choose a bad action",
        "Laugh at others",
        "Refuse to listen",
      ],
      correctAnswer: 0,
      explanation: `The Quran teaches us to learn and practice good manners.`,
    },
  ];
}

async function generateQuizWithGemini(
  surah: string,
  topic: string,
  previousQuestions: string[],
  difficulty: string,
  questionStyle: string,
  geminiKey: string
): Promise<QuizQuestion[]> {
  const prompt = `
You are a Quran quiz generator for children aged 4 to 6.

Task:
Generate 5 multiple choice questions about the Quran story of "${surah}" and the topic "${topic}".

Rules:
- Keep language very simple.
- Use short sentences.
- Make questions friendly and easy for little children.
- Difficulty level: ${difficulty}. For "easy", ask recall questions. For "guided", ask meaning/action questions. For "challenge", ask gentle real-life application questions.
- Question style: ${questionStyle}.
  - meaning: ask what the story teaches.
  - kindness: ask which kind choice fits.
  - daily-action: ask what the child can do today.
  - listen: write questions that are especially easy to answer after hearing them aloud.
  - sequence: ask what happened first/next/last in a very simple way.
  - feeling: ask about gentle feelings like gratitude, calm, patience, and kindness.
- Keep every question age-appropriate and cheerful.
- Focus on meanings, kindness, gratitude, patience, trust in Allah, and everyday good actions.
- Avoid complex law, conflict, punishment details, adult themes, fear-based wording, or graphic content.
- Avoid repeating any of these previous questions:
${previousQuestions.length ? previousQuestions.join(" | ") : "None"}

Return ONLY valid JSON.

Schema:
[
  {
    "question": "short question",
    "options": ["a", "b", "c", "d"],
    "correctAnswer": 0,
    "explanation": "short friendly explanation"
  }
]
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
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                question: { type: "STRING" },
                options: {
                  type: "ARRAY",
                  items: { type: "STRING" },
                },
                correctAnswer: { type: "NUMBER" },
                explanation: { type: "STRING" },
              },
              required: ["question", "options", "correctAnswer", "explanation"],
            },
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
    throw new Error("Gemini returned invalid JSON envelope for quiz generation");
  }

  if (!res.ok) {
    throw new Error("Gemini quiz request failed");
  }

  const envelope = data as GeminiGenerateContentResponse;
  const raw = envelope.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  if (!raw) {
    throw new Error("Gemini returned no quiz text");
  }

  const parsed = JSON.parse(raw) as GeminiQuizQuestion[];

  return parsed
    .filter(
      (q) =>
        typeof q.question === "string" &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        typeof q.correctAnswer === "number" &&
        q.correctAnswer >= 0 &&
        q.correctAnswer < 4 &&
        typeof q.explanation === "string"
    )
    .slice(0, 5);
}

export async function POST(req: Request) {
  try {
    const {
      surah,
      topic,
      previousQuestions = [],
      difficulty = "easy",
      questionStyle = "meaning",
    } = await req.json();

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return NextResponse.json(
        { success: false, error: "Missing GEMINI_API_KEY in .env" },
        { status: 500 }
      );
    }

    if (!surah || !topic) {
      return NextResponse.json(
        { success: false, error: "Missing surah or topic" },
        { status: 400 }
      );
    }

    try {
      const questions = await generateQuizWithGemini(
        surah,
        topic,
        Array.isArray(previousQuestions) ? previousQuestions : [],
        typeof difficulty === "string" ? difficulty : "easy",
        typeof questionStyle === "string" ? questionStyle : "meaning",
        geminiKey
      );

      if (!questions.length) {
        throw new Error("No valid questions returned");
      }

      return NextResponse.json({
        success: true,
        questions,
      });
    } catch (error) {
      console.error("Gemini quiz generation failed:", error);

      return NextResponse.json({
        success: true,
        questions: buildFallbackQuestions(
          surah,
          topic,
          typeof difficulty === "string" ? difficulty : "easy"
        ),
        fallback: true,
      });
    }
  } catch (error) {
    console.error("Error generating quiz:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate quiz questions" },
      { status: 500 }
    );
  }
}
