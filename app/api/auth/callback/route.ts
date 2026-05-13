import { NextResponse } from "next/server";
import { getEnv } from "@/app/lib/env";
import {
  getCookieValue,
  OAUTH_CODE_VERIFIER_COOKIE,
  OAUTH_REDIRECT_URI_COOKIE,
  OAUTH_STATE_COOKIE,
  redactUrlForLogs,
  redactValue,
} from "@/app/lib/oauth-server";

type CallbackRequest = {
  code?: string;
  state?: string;
};

function basicAuthHeader(clientId: string, clientSecret: string) {
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  return `Basic ${credentials}`;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CallbackRequest;
    const cookieState = getCookieValue(req, OAUTH_STATE_COOKIE);
    const codeVerifier = getCookieValue(req, OAUTH_CODE_VERIFIER_COOKIE);
    const redirectUri = getCookieValue(req, OAUTH_REDIRECT_URI_COOKIE);
    const callbackUrl = req.headers.get("referer") || req.url;

    console.info("[oauth.callback] Received callback exchange request", {
      callbackUrl: redactUrlForLogs(callbackUrl),
      queryParamNames: Array.from(new URL(callbackUrl).searchParams.keys()),
      hasCode: Boolean(body.code),
      hasReturnedState: Boolean(body.state),
      hasStoredState: Boolean(cookieState),
      hasCodeVerifier: Boolean(codeVerifier),
      hasRedirectUri: Boolean(redirectUri),
    });

    if (!body.code) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing authorization code",
        },
        { status: 400 }
      );
    }

    if (!body.state || !cookieState || body.state !== decodeURIComponent(cookieState)) {
      return clearOAuthCookies(
        NextResponse.json(
          {
            success: false,
            message: "Invalid OAuth state",
          },
          { status: 400 }
        )
      );
    }

    if (!codeVerifier || !redirectUri) {
      return clearOAuthCookies(
        NextResponse.json(
          {
            success: false,
            message: "OAuth login session expired. Please try signing in again.",
          },
          { status: 400 }
        )
      );
    }

    const clientId = getEnv("QURAN_CLIENT_ID");
    const clientSecret = getEnv("QURAN_CLIENT_SECRET");
    const baseUrl = getEnv("QURAN_OAUTH_BASE_URL");

    console.info("[oauth.callback] Exchanging authorization code", {
      tokenEndpoint: new URL("/oauth2/token", baseUrl).toString(),
      redirectUri: decodeURIComponent(redirectUri),
      clientId: redactValue(clientId),
      hasClientSecret: Boolean(clientSecret),
    });

    const form = new URLSearchParams({
      grant_type: "authorization_code",
      code: body.code,
      redirect_uri: decodeURIComponent(redirectUri),
      code_verifier: decodeURIComponent(codeVerifier),
    });

    const tokenRes = await fetch(`${baseUrl}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: basicAuthHeader(clientId, clientSecret),
      },
      body: form,
    });

    const rawText = await tokenRes.text();

    let data: Record<string, unknown>;
    try {
      data = JSON.parse(rawText) as Record<string, unknown>;
    } catch {
      data = { raw: rawText };
    }

    if (!tokenRes.ok) {
      console.error("[oauth.callback] Token exchange failed", {
        upstreamStatus: tokenRes.status,
        upstreamError:
          typeof data.error === "string" ? data.error : "unknown_token_error",
        upstreamErrorDescription:
          typeof data.error_description === "string"
            ? data.error_description
            : undefined,
      });

      return clearOAuthCookies(
        NextResponse.json(
          {
            success: false,
            message: "Token exchange failed",
            upstreamStatus: tokenRes.status,
            upstream: data,
          },
          { status: 400 }
        )
      );
    }

    const accessToken = data.access_token;
    const refreshToken = data.refresh_token;
    const expiresIn = data.expires_in;

    if (typeof accessToken !== "string" || !accessToken) {
      return clearOAuthCookies(
        NextResponse.json(
          {
            success: false,
            message: "No access token returned",
            upstream: data,
          },
          { status: 400 }
        )
      );
    }

    const res = NextResponse.json({ success: true });
    clearOAuthCookies(res);

    res.cookies.set("quran_access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      ...(typeof expiresIn === "number" ? { maxAge: expiresIn } : {}),
    });

    if (typeof refreshToken === "string" && refreshToken) {
      res.cookies.set("quran_refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
    }

    return res;
  } catch (error) {
    console.error("[oauth.callback] Unexpected callback failure", {
      message: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Unexpected callback error",
      },
      { status: 500 }
    );
  }
}

function clearOAuthCookies(res: NextResponse): NextResponse {
  for (const name of [
    OAUTH_STATE_COOKIE,
    OAUTH_CODE_VERIFIER_COOKIE,
    OAUTH_REDIRECT_URI_COOKIE,
  ]) {
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
