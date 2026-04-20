import { getUserApiClient } from "@/app/lib/user-api-client";

const USER_API_BASE_URL =
  "https://apis-prelive.quran.foundation/content/api/v1";

function getMockBookmarks() {
  return [
    {
      id: "mock-bookmark-1",
      createdAt: new Date().toISOString(),
      type: "ayah",
      key: 1,
      verseNumber: 1,
      group: "default",
      isInDefaultCollection: true,
      isReading: true,
      collectionsCount: 1,
    },
    {
      id: "mock-bookmark-2",
      createdAt: new Date().toISOString(),
      type: "ayah",
      key: 2,
      verseNumber: 255,
      group: "default",
      isInDefaultCollection: true,
      isReading: false,
      collectionsCount: 1,
    },
  ];
}

export async function GET(req: Request) {
  const mockUserApi = process.env.MOCK_USER_API === "true";
  const client = getUserApiClient(req);

  if (mockUserApi) {
    return Response.json({
      success: true,
      data: getMockBookmarks(),
      mocked: true,
    });
  }

  if (!client) {
    return Response.json(
      { success: false, message: "missing auth headers" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const url = new URL(`${USER_API_BASE_URL}/bookmarks`);
  url.search = searchParams.toString();

  try {
    const response = await fetch(url, {
      headers: client.headers,
    });

    if (!response.ok) {
      throw new Error("Failed to fetch bookmarks");
    }

    const payload = await response.json();
    return Response.json({ success: true, data: payload.data || payload });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch bookmarks",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const mockUserApi = process.env.MOCK_USER_API === "true";
  const client = getUserApiClient(req);

  if (mockUserApi) {
    const body = await req.json();
    return Response.json({
      success: true,
      data: {
        id: `mock-bookmark-${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...body,
        isInDefaultCollection: true,
        collectionsCount: 1,
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

  try {
    const body = await req.json();
    const response = await fetch(`${USER_API_BASE_URL}/bookmarks`, {
      method: "POST",
      headers: {
        ...client.headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error("Failed to create bookmark");
    }

    const payload = await response.json();
    return Response.json({ success: true, data: payload.data || payload });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to create bookmark",
      },
      { status: 500 }
    );
  }
}