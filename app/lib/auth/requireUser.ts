import { cookies } from "next/headers";
import { prisma } from "@/app/lib/prisma";
import { APP_USER_SESSION_COOKIE } from "@/app/lib/quran-oauth-session";
import { UnauthorizedError } from "./error";

export async function requireUser() {
  const cookieStore = await cookies();

  const sessionUserId = cookieStore.get(
    APP_USER_SESSION_COOKIE
  )?.value;

  if (!sessionUserId) {
    throw new UnauthorizedError();
  }

  const user = await prisma.user.findUnique({
    where: {
      id: sessionUserId,
    },
  });

  if (!user) {
    throw new UnauthorizedError();
  }

  return user;
}