import { NextResponse } from "next/server";

import {
  APP_USER_SESSION_COOKIE,
  QURAN_ACCESS_TOKEN_COOKIE,
  QURAN_OAUTH_PROFILE_COOKIE,
  QURAN_REFRESH_TOKEN_COOKIE,
} from "@/app/lib/quran-oauth-session";

import {
  OAUTH_CODE_VERIFIER_COOKIE,
  OAUTH_NONCE_COOKIE,
  OAUTH_REDIRECT_URI_COOKIE,
  OAUTH_STATE_COOKIE,
} from "@/app/lib/oauth-server";

export function clearAuthCookies(res: NextResponse) {
  const cookiesToClear = [
    APP_USER_SESSION_COOKIE,

    QURAN_ACCESS_TOKEN_COOKIE,
    QURAN_REFRESH_TOKEN_COOKIE,
    QURAN_OAUTH_PROFILE_COOKIE,

    OAUTH_STATE_COOKIE,
    OAUTH_NONCE_COOKIE,
    OAUTH_CODE_VERIFIER_COOKIE,
    OAUTH_REDIRECT_URI_COOKIE,
  ];

  for (const cookieName of cookiesToClear) {
    res.cookies.set(cookieName, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  }

  return res;
}