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
    const { childId, surah, ayah, note } = body;

    if (!childId || !surah || !ayah) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 🔐 ensure child belongs to user
    const child = await prisma.child.findFirst({
      where: {
        id: childId,
        userId: user.id,
      },
    });

    if (!child) {
      return NextResponse.json(
        { error: "Child not found or not owned by user" },
        { status: 403 }
      );
    }

    const bookmark = await prisma.bookmark.upsert({
      where: {
        childId_surah_ayah: {
          childId,
          surah,
          ayah,
        },
      },
      update: {
        note: note ?? null,
      },
      create: {
        childId,
        surah,
        ayah,
        note: note ?? null,
      },
    });

    return NextResponse.json({ success: true, bookmark });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


export async function DELETE(req: Request) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    const childId = searchParams.get("childId");
    const surah = Number(searchParams.get("surah"));
    const ayah = Number(searchParams.get("ayah"));

    if (!childId || !surah || !ayah) {
      return NextResponse.json(
        { error: "Missing params" },
        { status: 400 }
      );
    }

    // 🔐 ownership check
    const child = await prisma.child.findFirst({
      where: {
        id: childId,
        userId: user.id,
      },
    });

    if (!child) {
      return NextResponse.json(
        { error: "Child not found or not owned" },
        { status: 403 }
      );
    }

    await prisma.bookmark.delete({
      where: {
        childId_surah_ayah: {
          childId,
          surah,
          ayah,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}