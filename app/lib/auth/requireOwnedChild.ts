import { prisma } from "@/app/lib/prisma";
import { requireUser } from "./requireUser";
import { NotFoundError } from "./error";

export async function requireOwnedChild(childId: string) {
  const user = await requireUser();

  const child = await prisma.child.findFirst({
    where: {
      id: childId,
      userId: user.id,
    },
    include: {
      streak: true,
      bookmarks: true,
    },
  });

  if (!child) {
    throw new NotFoundError();
  }

  return child;
}