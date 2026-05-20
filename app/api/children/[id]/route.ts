import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { requireUser } from "@/app/lib/auth/requireUser";

export async function DELETE(
  _req: Request,
  { params }: { params: { childId: string } }
) {
  try {
    const user = await requireUser();

    const child = await prisma.child.findFirst({
      where: {
        id: params.childId,
        userId: user.id, // 🔐 critical ownership check
      },
    });

    if (!child) {
      return NextResponse.json(
        { error: "Child not found" },
        { status: 404 }
      );
    }

    await prisma.child.delete({
      where: {
        id: child.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to delete child" },
      { status: 500 }
    );
  }
}