import { NextResponse } from "next/server";
import { requireUser } from "@/app/lib/auth/requireUser";
import { requireOwnedChild } from "@/app/lib/auth/requireOwnedChild";
import {
  upsertBookmark,
  getBookmarksForChild,
} from "@/app/lib/bookmarks-service";
import { validateVerseInput } from "@/app/lib/quran-validation";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/children/[id]/bookmarks
 * List all bookmarks for a child
 */
export async function GET(req: Request, context: RouteParams) {
  try {
    const { id: childId } = await context.params;
    const user = await requireUser();

    // Verify ownership
    await requireOwnedChild(childId);

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);
    const offset = Number(searchParams.get("offset")) || 0;

    const bookmarks = await getBookmarksForChild(childId, limit, offset);

    return NextResponse.json({
      success: true,
      bookmarks,
      count: bookmarks.length,
    });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (err.message === "Child not found") {
        return NextResponse.json({ error: "Child not found" }, { status: 404 });
      }
    }

    console.error("[bookmarks] GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/children/[id]/bookmarks
 * Create or update a bookmark
 */
export async function POST(req: Request, context: RouteParams) {
  try {
    const { id: childId } = await context.params;
    const user = await requireUser();

    // Verify ownership
    await requireOwnedChild(childId);

    const body = (await req.json()) as {
      surah?: unknown;
      ayah?: unknown;
      note?: string | null;
    };

    const { surah, ayah, note } = body;

    // Validate Quran verse
    const validation = validateVerseInput(surah, ayah);
    if (!validation.valid) {
      return NextResponse.json(
        { error: "Invalid verse", details: validation.errors },
        { status: 400 }
      );
    }

    const bookmark = await upsertBookmark(childId, {
      surah: Number(surah),
      ayah: Number(ayah),
      note: note?.trim() || null,
    });

    return NextResponse.json({
      success: true,
      bookmark,
    });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (err.message === "Child not found") {
        return NextResponse.json({ error: "Child not found" }, { status: 404 });
      }
    }

    console.error("[bookmarks] POST error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
