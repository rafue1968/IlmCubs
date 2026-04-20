import { getUserApiClient } from "@/app/lib/user-api-client";

const USER_API_BASE_URL =
  "https://apis-prelive.quran.foundation/content/api/v1";

type UpstreamPayload = {
  data?: unknown;
  raw?: string;
};

function getMockCurrentStreak(type: string) {
  const today = new Date().toISOString().slice(0, 10);

  return {
    id: "mock-current-streak",
    type,
    currentStreak: 7,
    longestStreak: 12,
    status: "ACTIVE",
    lastActivityDate: today,
  };
}

export async function GET(req: Request) {
  const mockUserApi = process.env.MOCK_USER_API === "true";
  const client = getUserApiClient(req);

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  if (!type) {
    return Response.json(
      { success: false, message: "type is required" },
      { status: 400 }
    );
  }

  if (type !== "QURAN") {
    return Response.json(
      { success: false, message: "type must be QURAN" },
      { status: 400 }
    );
  }

  if (mockUserApi) {
    return Response.json({
      success: true,
      data: getMockCurrentStreak(type),
      mocked: true,
    });
  }

  if (!client) {
    return Response.json(
      { success: false, message: "missing auth headers" },
      { status: 401 }
    );
  }

  const headers: HeadersInit = {
    ...client.headers,
  };

  const timezone = req.headers.get("x-timezone");

  if (timezone) {
    headers["x-timezone"] = timezone;
  }

  const url = new URL(`${USER_API_BASE_URL}/streaks/current`);
  url.searchParams.set("type", type);

  try {
    const response = await fetch(url, { headers });
    const rawText = await response.text();

    let payload: UpstreamPayload | null = null;
    try {
      payload = JSON.parse(rawText);
    } catch {
      payload = { raw: rawText };
    }

    if (response.status === 400) {
      return Response.json(
        {
          success: false,
          message: "missing or invalid query params",
          upstreamStatus: response.status,
          upstream: payload,
        },
        { status: 400 }
      );
    }

    if (!response.ok) {
      return Response.json(
        {
          success: false,
          message: "upstream current streak request failed",
          upstreamStatus: response.status,
          upstream: payload,
        },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      data: payload.data,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "failed to fetch current streak",
      },
      { status: 500 }
    );
  }
}
