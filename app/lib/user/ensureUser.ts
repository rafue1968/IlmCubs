import { prisma } from "@/app/lib/prisma";

export async function ensureUser(oauthUserId: string) {
  // 1. Find or create User
  let user = await prisma.user.findUnique({
    where: { oauthUserId },
    include: { parentProfile: true },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        oauthUserId,
        role: "PARENT",
        parentProfile: {
          create: {},
        },
      },
      include: { parentProfile: true },
    });
  }

  // 2. Ensure parentProfile exists (safety net)
  if (!user.parentProfile) {
    await prisma.parentProfile.create({
      data: {
        userId: user.id,
      },
    });

    user = await prisma.user.findUnique({
      where: { oauthUserId },
      include: { parentProfile: true },
    })!;
  }

  return user;
}