export async function POST(req: Request) {
  const { surah, topic, previousQuestions } = await req.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return Response.json(
      { success: false, error: "Missing ANTHROPIC_API_KEY in .env" },
      { status: 500 }
    );
  }

  const prompt = `You are a Quran quiz generator. Generate 5 multiple choice questions based on the ${surah} story about "${topic}" from the Quran.

${previousQuestions && previousQuestions.length > 0 ? `Previously asked questions: ${previousQuestions.join(", ")}. Generate NEW different questions, not these.` : ""}

Format your response as JSON array with this structure:
[
  {
    "question": "question text",
    "options": ["option1", "option2", "option3", "option4"],
    "correctAnswer": 0,
    "explanation": "brief explanation"
  }
]

Only return the JSON array, no other text.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const data = (await response.json()) as { content?: Array<{ text?: string }> };

    if (!response.ok || !data.content?.[0]?.text) {
      throw new Error("Failed to generate questions");
    }

    const text = data.content[0].text;
    const questions = JSON.parse(text);

    return Response.json({
      success: true,
      questions,
    });
  } catch (error) {
    console.error("Error generating quiz:", error);
    return Response.json(
      { success: false, error: "Failed to generate quiz questions" },
      { status: 500 }
    );
  }
}