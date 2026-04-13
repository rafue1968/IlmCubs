import { getUserApiClient } from "@/app/lib/user-api-client";

const USER_API_BASE_URL =
  "https://apis-prelive.quran.foundation/content/api/v1";

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

    if (response.status === 400) {
      return Response.json(
        { success: false, message: "missing or invalid query params" },
        { status: 400 }
      );
    }

    if (!response.ok) {
      throw new Error("Failed to fetch current streak");
    }

    const payload = (await response.json()) as {
      data?: unknown;
    };

    return Response.json({
      success: true,
      data: payload.data,
    });
  } catch {
    return Response.json(
      { success: false, message: "failed to fetch current streak" },
      { status: 500 }
    );
  }
}
