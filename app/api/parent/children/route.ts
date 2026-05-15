export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"

export async function GET() {
  try {
    const parentUserId = "TEMP_PARENT_ID" // replace later with auth

    const children = await prisma.child.findMany({
      where: {
        parent: {
          userId: parentUserId,
        },
      },
      select: {
        id: true,
        name: true,
        age: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    return NextResponse.json({ children })
  } catch (error) {
    console.error("[parent.children] Failed to fetch children", error)

    return NextResponse.json(
      { error: "Failed to fetch children" },
      { status: 500 }
    )
  }
}
