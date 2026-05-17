import { NextResponse } from "next/server";
import {
  OAUTH_CODE_VERIFIER_COOKIE,
  OAUTH_NONCE_COOKIE,
  OAUTH_REDIRECT_URI_COOKIE,
  OAUTH_STATE_COOKIE,
  getRequestOrigin,
} from "@/app/lib/oauth-server";
import {
  QURAN_ACCESS_TOKEN_COOKIE,
  QURAN_OAUTH_PROFILE_COOKIE,
  QURAN_REFRESH_TOKEN_COOKIE,
} from "@/app/lib/quran-oauth-session";

export const runtime = "nodejs";

const COOKIES_TO_CLEAR = [
  QURAN_ACCESS_TOKEN_COOKIE,
  QURAN_REFRESH_TOKEN_COOKIE,
  QURAN_OAUTH_PROFILE_COOKIE,
  OAUTH_STATE_COOKIE,
  OAUTH_NONCE_COOKIE,
  OAUTH_CODE_VERIFIER_COOKIE,
  OAUTH_REDIRECT_URI_COOKIE,
];

export async function GET(req: Request) {
  return clearQuranOAuthSession(req);
}

export async function POST(req: Request) {
  return clearQuranOAuthSession(req);
}

function clearQuranOAuthSession(req: Request): NextResponse {
  const res = NextResponse.redirect(new URL("/", getRequestOrigin(req)));

  for (const name of COOKIES_TO_CLEAR) {
    res.cookies.set(name, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  }

  return res;
}
