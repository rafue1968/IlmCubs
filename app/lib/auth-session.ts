import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  QURAN_ACCESS_TOKEN_COOKIE,
  QURAN_OAUTH_PROFILE_COOKIE,
  QURAN_REFRESH_TOKEN_COOKIE,
} from "@/app/lib/quran-oauth-session";

export type AuthSession = {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
};

export async function getAuthSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(QURAN_ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return null;
  }

  const refreshToken = cookieStore.get(QURAN_REFRESH_TOKEN_COOKIE)?.value;

  return {
    accessToken,
    refreshToken: refreshToken || undefined,
  };
}

export async function setAuthSession(session: AuthSession): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(QURAN_ACCESS_TOKEN_COOKIE, session.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  if (session.refreshToken) {
    cookieStore.set(QURAN_REFRESH_TOKEN_COOKIE, session.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }
}

export async function clearAuthSession(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(QURAN_ACCESS_TOKEN_COOKIE);
  cookieStore.delete(QURAN_REFRESH_TOKEN_COOKIE);
  cookieStore.delete(QURAN_OAUTH_PROFILE_COOKIE);
}

export async function requireAuth(): Promise<AuthSession> {
  const session = await getAuthSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}
