import { getUserApiClient } from "@/app/lib/user-api-client";

const USER_API_BASE_URL =
  "https://apis-prelive.quran.foundation/content/api/v1";

function getMockStreaks(type: string | null) {
  const today = new Date();

  return Array.from({ length: 5 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - index);

    return {
      id: `mock-streak-${index + 1}`,
      type: type ?? "QURAN",
      status: "COMPLETED",
      date: date.toISOString().slice(0, 10),
    };
  });
}

export async function GET(req: Request) {
  const mockUserApi = process.env.MOCK_USER_API === "true";
  const client = getUserApiClient(req);

  const { searchParams } = new URL(req.url);
  const allowedParams = [
    "from",
    "to",
    "type",
    "sortOrder",
    "orderBy",
    "status",
    "first",
    "after",
    "before",
    "last",
  ];

  const upstreamParams = new URLSearchParams();

  for (const key of allowedParams) {
    const value = searchParams.get(key);

    if (value === "") {
      return Response.json(
        { success: false, message: `missing value for ${key}` },
        { status: 400 }
      );
    }

    if (value) {
      upstreamParams.set(key, value);
    }
  }

  if (mockUserApi) {
    return Response.json({
      success: true,
      data: getMockStreaks(searchParams.get("type")),
      pagination: {
        total_records: 5,
        total_pages: 1,
        current_page: 1,
      },
      mocked: true,
    });
  }

  if (!client) {
    return Response.json(
      { success: false, message: "missing auth headers" },
      { status: 401 }
    );
  }

  const url = new URL(`${USER_API_BASE_URL}/streaks`);
  url.search = upstreamParams.toString();

  try {
    const response = await fetch(url, {
      headers: client.headers,
    });

    if (response.status === 400) {
      return Response.json(
        { success: false, message: "missing or invalid query params" },
        { status: 400 }
      );
    }

    if (!response.ok) {
      throw new Error("Failed to fetch streaks");
    }

    const payload = (await response.json()) as {
      data?: unknown;
      pagination?: unknown;
    };

    return Response.json({
      success: true,
      data: payload.data,
      pagination: payload.pagination,
    });
  } catch {
    return Response.json(
      { success: false, message: "failed to fetch user streaks" },
      { status: 500 }
    );
  }
}
