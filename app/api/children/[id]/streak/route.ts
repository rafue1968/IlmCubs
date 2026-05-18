import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { requireUser } from "@/app/lib/auth/requireUser";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();

    const { childId, increment } = body;

    if (!childId) {
      return NextResponse.json(
        { error: "childId is required" },
        { status: 400 }
      );
    }

    // 🔐 Ensure child belongs to user
    const child = await prisma.child.findFirst({
      where: {
        id: childId,
        userId: user.id,
      },
    });

    if (!child) {
      return NextResponse.json(
        { error: "Child not found" },
        { status: 404 }
      );
    }

    const shouldIncrement = increment !== false;

    const now = new Date();

    const streak = await prisma.streak.upsert({
      where: {
        childId: childId,
      },
      create: {
        childId,
        current: shouldIncrement ? 1 : 0,
        longest: shouldIncrement ? 1 : 0,
        lastRead: shouldIncrement ? now : null,
      },
      update: {
        ...(shouldIncrement && {
          current: {
            increment: 1,
          },
          lastRead: now,
        }),
      },
    });

    // 🔥 Fix longest streak (only after update)
    const updatedStreak =
      streak.current > streak.longest
        ? await prisma.streak.update({
            where: { childId },
            data: {
              longest: streak.current,
            },
          })
        : streak;

    return NextResponse.json({
      streak: updatedStreak,
    });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to update streak" },
      { status: 500 }
    );
  }
}