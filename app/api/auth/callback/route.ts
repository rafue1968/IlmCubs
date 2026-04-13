import { NextResponse, type NextRequest } from "next/server";
import { getEnv } from "@/app/lib/env";

const CLIENT_ID = getEnv("QURAN_CLIENT_ID");
const CLIENT_SECRET = getEnv("QURAN_CLIENT_SECRET");
const BASE_URL = getEnv("QURAN_OAUTH_BASE_URL");
const REDIRECT_URI = "http://localhost:3000/api/auth/callback";
const ACCESS_TOKEN_COOKIE = "quran_access_token";

type TokenResponse = {
  access_token?: string;
  expires_in?: number;
};

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return Response.json(
      { success: false, message: "missing authorization code" },
      { status: 400 }
    );
  }

  try {
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
    });

    const response = await fetch(`${BASE_URL}/token`, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!response.ok) {
      throw new Error("Failed to exchange authorization code");
    }

    const payload = (await response.json()) as TokenResponse;
    const accessToken = payload.access_token;

    if (!accessToken) {
      throw new Error("Missing access token in token response");
    }

    const redirectResponse = NextResponse.redirect(new URL("/", req.url));

    redirectResponse.cookies.set({
      name: ACCESS_TOKEN_COOKIE,
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      ...(payload.expires_in ? { maxAge: payload.expires_in } : {}),
    });

    return redirectResponse;
  } catch {
    return Response.json(
      { success: false, message: "failed to complete oauth callback" },
      { status: 500 }
    );
  }
}
