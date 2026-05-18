import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { requireUser } from "@/app/lib/auth/requireUser";

export async function GET() {
  try {
    const user = await requireUser();

    const children = await prisma.child.findMany({
      where: {
        userId: user.id,
      },
      include: {
        streak: true,
        bookmarks: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ children });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch children" },
      { status: 500 }
    );
  }
}


export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();

    const { name, age } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const child = await prisma.child.create({
      data: {
        userId: user.id,
        name,
        age: age ?? null,

        // NO streak created here → lazy creation later
      },
    });

    return NextResponse.json({ child });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to create child" },
      { status: 500 }
    );
  }
}