import { NextResponse } from "next/server";
import { getEnv } from "@/app/lib/env";
import {
  createCodeChallenge,
  getOAuthRedirectUri,
  getRequestOrigin,
  OAUTH_CODE_VERIFIER_COOKIE,
  OAUTH_REDIRECT_URI_COOKIE,
  OAUTH_SCOPES,
  OAUTH_STATE_COOKIE,
  randomOauthValue,
  redactUrlForLogs,
  redactValue,
} from "@/app/lib/oauth-server";

const OAUTH_COOKIE_MAX_AGE_SECONDS = 10 * 60;

export async function GET(req: Request) {
  try {
    const clientId = getEnv("QURAN_CLIENT_ID");
    const baseUrl = getEnv("QURAN_OAUTH_BASE_URL");
    const configuredRedirectUri = process.env.QURAN_OAUTH_REDIRECT_URI?.trim();

    if (configuredRedirectUri) {
      const requestOrigin = getRequestOrigin(req);
      const oauthOrigin = new URL(configuredRedirectUri).origin;

      if (requestOrigin !== oauthOrigin) {
        return NextResponse.redirect(new URL("/api/auth/login", oauthOrigin));
      }
    }

    const redirectUri = getOAuthRedirectUri(req);
    const state = randomOauthValue();
    const codeVerifier = randomOauthValue(64);
    const codeChallenge = createCodeChallenge(codeVerifier);

    const url = new URL(`${baseUrl}/oauth2/auth`);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("code_challenge", codeChallenge);
    url.searchParams.set("code_challenge_method", "S256");
    url.searchParams.set("state", state);
    url.searchParams.set("scope", OAUTH_SCOPES);

    console.info("[oauth.login] Starting authorization request", {
      providerOrigin: new URL(baseUrl).origin,
      responseType: "code",
      redirectUri,
      scopes: OAUTH_SCOPES,
      hasPkce: true,
      clientId: redactValue(clientId),
      authorizationUrl: redactUrlForLogs(url.toString()),
      redirectUriFromEnv: Boolean(process.env.QURAN_OAUTH_REDIRECT_URI?.trim()),
    });

    const res = NextResponse.redirect(url);
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: OAUTH_COOKIE_MAX_AGE_SECONDS,
    };

    res.cookies.set(OAUTH_STATE_COOKIE, state, cookieOptions);
    res.cookies.set(OAUTH_CODE_VERIFIER_COOKIE, codeVerifier, cookieOptions);
    res.cookies.set(OAUTH_REDIRECT_URI_COOKIE, redirectUri, cookieOptions);

    return res;
  } catch (error) {
    console.error("[oauth.login] Failed to start OAuth login", {
      message: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.redirect(
      new URL(
        `/oauth/callback?error=login_failed&error_description=${encodeURIComponent(
          "Unable to start OAuth login."
        )}`,
        req.url
      )
    );
  }
}

export async function POST(req: Request) {
  try {
    const loginUrl = new URL("/api/auth/login", req.url);

    return NextResponse.json({
      success: true,
      url: loginUrl.toString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to build login URL",
      },
      { status: 500 }
    );
  }
}
