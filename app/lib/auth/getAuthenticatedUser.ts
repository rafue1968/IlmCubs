import { cookies } from "next/headers";
import { prisma } from "@/app/lib/prisma";
import { APP_USER_SESSION_COOKIE } from "@/app/lib/quran-oauth-session";

export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(APP_USER_SESSION_COOKIE)?.value;

  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  return user;
}