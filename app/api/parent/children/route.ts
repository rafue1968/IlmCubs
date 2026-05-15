export const runtime = "nodejs";

import { prisma } from "@/app/lib/prisma";
import { getOAuthUserId } from "@/app/lib/auth/getCurrentUser";
import { ensureUser } from "@/app/lib/user/ensureUser";

function getParentProfileId(user: Awaited<ReturnType<typeof ensureUser>>) {
  if (!user) {
    throw new Error("User was not created for this OAuth identity.");
  }

  if (!user.parentProfile) {
    throw new Error("Parent profile was not created for this user.");
  }

  return user.parentProfile.id;
}

export async function GET() {
  try {
    const oauthUserId = await getOAuthUserId();

    if (!oauthUserId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await ensureUser(oauthUserId);
    const parentId = getParentProfileId(user);

    const children = await prisma.child.findMany({
      where: { parentId },
      include: {
        streak: true,
        bookmarks: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return Response.json({ children });
  } catch (err) {
    console.error("[parent.children] Failed to fetch children", err);

    return Response.json(
      { error: "Failed to fetch children" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const oauthUserId = await getOAuthUserId();

    if (!oauthUserId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await ensureUser(oauthUserId);
    const parentId = getParentProfileId(user);
    const body = await req.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const age = typeof body?.age === "number" ? body.age : undefined;

    if (!name) {
      return Response.json({ error: "Name is required." }, { status: 400 });
    }

    const child = await prisma.child.create({
      data: {
        name,
        age,
        parentId,
        streak: {
          create: {
            current: 0,
            longest: 0,
          },
        },
      },
      include: {
        streak: true,
      },
    });

    return Response.json(
      {
        message: "Child created successfully",
        child,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[parent.children] Failed to create child", err);

    return Response.json(
      { error: "Failed to create child" },
      { status: 500 }
    );
  }
}
