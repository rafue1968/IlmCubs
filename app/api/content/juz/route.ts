export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const number = searchParams.get("number");
  const base = process.env.QURAN_API_BASE_URL;

  if (!number) {
    return Response.json({ success: false, error: "number required" }, { status: 400 });
  }

  if (!base) {
    return Response.json(
      { success: false, error: "Missing QURAN_API_BASE_URL in .env" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(`${base}/juzs/${number}`);

    if (!res.ok) {
      throw new Error("Failed to fetch juz");
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
