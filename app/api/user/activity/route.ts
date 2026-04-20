import { getUserApiClient } from "@/app/lib/user-api-client";

const USER_API_BASE_URL =
  "https://apis-prelive.quran.foundation/content/api/v1";

export async function POST(req: Request) {
  const mockUserApi = process.env.MOCK_USER_API === "true";
  const client = getUserApiClient(req);

  if (mockUserApi) {
    // Mock activity completion - in real implementation, this would update streaks
    return Response.json({
      success: true,
      message: "Activity completed (mock)",
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
    // In a real implementation, this would call the appropriate Quran API endpoint
    // For now, we'll assume the activity is recorded
    return Response.json({
      success: true,
      message: "Activity completed",
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to record activity",
      },
      { status: 500 }
    );
  }
}