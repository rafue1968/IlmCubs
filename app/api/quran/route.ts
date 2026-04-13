export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const type = searchParams.get("type");
  const chapter = searchParams.get("chapter");
  const key = searchParams.get("key");
  const juz = searchParams.get("juz");
  const q = searchParams.get("q");
  const translations = searchParams.get("translations") || "131";

  const base = process.env.QURAN_API_BASE_URL;

  if (!base) {
    return Response.json(
      { success: false, error: "Missing QURAN_API_BASE_URL in .env" },
      { status: 500 }
    );
  }

  let url = "";

  switch (type) {
    case "chapters":
      // Example: https://api.quran.com/api/v4/chapters
      url = `${base}/chapters`;
      break;

    case "verses":
      // Example: https://api.quran.com/api/v4/verses/by_chapter/2?translations=131
      if (!chapter) {
        return Response.json({ error: "chapter required" }, { status: 400 });
      }
      url = `${base}/verses/by_chapter/${chapter}?translations=${translations}`;
      break;

    case "verse":
      // Example: https://api.quran.com/api/v4/verses/by_key/2:255?translations=131
      if (!key) {
        return Response.json(
          { error: "key required (e.g. 2:255)" },
          { status: 400 }
        );
      }
      url = `${base}/verses/by_key/${key}?translations=${translations}`;
      break;

    case "juz":
      // Example: https://api.quran.com/api/v4/juzs/1
      if (!juz) {
        return Response.json({ error: "juz required" }, { status: 400 });
      }
      url = `${base}/juzs/${juz}`;
      break;

    case "search":
      // Example: https://api.quran.com/api/v4/search?q=patience
      if (!q) {
        return Response.json({ error: "query required" }, { status: 400 });
      }
      url = `${base}/search?q=${q}`;
      break;

    default:
      return Response.json(
        { error: "invalid type. Use: chapters | verses | verse | juz | search" },
        { status: 400 }
      );
  }

  try {
    const res = await fetch(url);
    const data = await res.json();

    return Response.json({
      success: true,
      type,
      source_url: url,
      data,
    });
  } catch {
    return Response.json(
      { success: false, error: "failed to fetch data from Quran API" },
      { status: 500 }
    );
  }
<<<<<<< api
}
=======
}
>>>>>>> main
