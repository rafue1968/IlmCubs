import { prisma } from "@/app/lib/prisma";

export async function ensureUser(oauthUserId: string) {
  // 1. Find or create User
  let user = await prisma.user.findUnique({
    where: { oauthUserId },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        oauthUserId,
        role: "PARENT",
      },
    });
  }

  return user;
}