import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAuthenticatedUser } from "@/app/lib/auth/getAuthenticatedUser";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { childId, surah, ayah } = body;

    if (!childId || !surah || !ayah) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify ownership
      const child = await tx.child.findFirst({
        where: {
          id: childId,
          userId: user.id,
        },
      });

      if (!child) {
        throw new Error("NOT_OWNED");
      }

      // 2. Get or create streak (lazy creation requirement)
      const streak = await tx.streak.upsert({
        where: { childId },
        create: {
          childId,
          current: 1,
          longest: 1,
          lastRead: now,
        },
        update: {
          lastRead: now,
          current: {
            increment: 1,
          },
        },
      });

      // ensure longest is correct
      const updatedStreak = await tx.streak.update({
        where: { childId },
        data: {
          longest:
            streak.current + 1 > streak.longest
              ? streak.current + 1
              : streak.longest,
        },
      });

      // 3. Create or update bookmark (last read position)
      let bookmark = await tx.bookmark.findFirst({
        where: {
          childId,
          surah,
          ayah,
        },
      });

      if (bookmark) {
        bookmark = await tx.bookmark.update({
          where: {
            id: bookmark.id,
          },
          data: {
            createdAt: now,
          },
        });
      } else {
        bookmark = await tx.bookmark.create({
          data: {
            childId,
            surah,
            ayah,
          },
        });
      }

      return {
        streak: updatedStreak,
        bookmark,
      };
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    if (err.message === "NOT_OWNED") {
      return NextResponse.json(
        { error: "Child not found or not owned" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}