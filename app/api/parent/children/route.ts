export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"

export async function GET() {
  try {
    const parentId = "TEMP_PARENT_ID" // replace later with auth

    const children = await prisma.user.findMany({
      where: {
        parentId: parentId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ children })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch children" },
      { status: 500 }
    )
  }
}