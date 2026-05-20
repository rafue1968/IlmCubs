import { NextResponse } from "next/server";
import { requireUser } from "@/app/lib/auth/requireUser";
import { requireOwnedChild } from "@/app/lib/auth/requireOwnedChild";
import { deleteBookmark } from "@/app/lib/bookmarks-service";
import { validateVerseInput } from "@/app/lib/quran-validation";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ id: string; bookmarkId: string }>;
}

/**
 * DELETE /api/children/[id]/bookmarks/[bookmarkId]
 * Delete a bookmark
 */
export async function DELETE(req: Request, context: RouteParams) {
  try {
    const { id: childId, bookmarkId } = await context.params;
    const user = await requireUser();

    // Verify ownership of child
    await requireOwnedChild(childId);

    if (!bookmarkId?.trim()) {
      return NextResponse.json(
        { error: "Bookmark ID is required" },
        { status: 400 }
      );
    }

    await deleteBookmark(bookmarkId, childId);

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (err.message === "Child not found") {
        return NextResponse.json({ error: "Child not found" }, { status: 404 });
      }
    }

    console.error("[bookmarks] DELETE error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}