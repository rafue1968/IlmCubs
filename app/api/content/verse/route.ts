export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");
  const translations = searchParams.get("translations") || "131";
  const base = process.env.QURAN_API_BASE_URL;

  if (!key) {
    return Response.json(
      { success: false, error: "key required (e.g. 2:255)" },
      { status: 400 }
    );
  }

  if (!base) {
    return Response.json(
      { success: false, error: "Missing QURAN_API_BASE_URL in .env" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(
      `${base}/verses/by_key/${encodeURIComponent(key)}` +
        `?translations=${encodeURIComponent(translations)}` +
        `&fields=text_uthmani`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch verse");
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
