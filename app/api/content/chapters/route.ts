export async function GET() {
  const base = process.env.QURAN_API_BASE_URL;

  if (!base) {
    return Response.json(
      { success: false, error: "Missing QURAN_API_BASE_URL in .env" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(`${base}/chapters`);

    if (!res.ok) {
      throw new Error("Failed to fetch chapters");
    }

    const data = await res.json();

    return Response.json({ success: true, data });
  } catch {
    return Response.json(
      { success: false, error: "failed to fetch data from Quran API" },
      { status: 500 }
    );
  }
}
