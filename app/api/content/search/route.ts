export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const base = process.env.QURAN_API_BASE_URL;

  if (!q) {
    return Response.json({ success: false, error: "query required" }, { status: 400 });
  }

  if (!base) {
    return Response.json(
      { success: false, error: "Missing QURAN_API_BASE_URL in .env" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(`${base}/search?q=${encodeURIComponent(q)}`);

    if (!res.ok) {
      throw new Error("Failed to fetch search results");
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
