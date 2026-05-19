import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { requireUser } from "@/app/lib/auth/requireUser";
import { handleAuthError } from "@/app/lib/auth/handleAuthError";

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
        childId,
      },
      create: {
        childId,
        current: shouldIncrement ? 1 : 0,
        longest: shouldIncrement ? 1 : 0,
        lastRead: shouldIncrement ? now : null,
      },
      update: shouldIncrement
        ? {
            current: {
              increment: 1,
            },
            lastRead: now,
          }
        : {},
    });

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
  } catch (error) {
    return handleAuthError(error);
  }
}