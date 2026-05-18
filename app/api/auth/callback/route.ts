import { NextResponse } from "next/server";
import { getEnv } from "@/app/lib/env";
import {
  APP_USER_SESSION_COOKIE,
  createQuranOAuthProfileCookieValue,
  getOAuthIdentityFromIdToken,
  QURAN_ACCESS_TOKEN_COOKIE,
  QURAN_OAUTH_PROFILE_COOKIE,
  QURAN_REFRESH_TOKEN_COOKIE,
} from "@/app/lib/quran-oauth-session";
import {
  getRequestOrigin,
  getCookieValue,
  OAUTH_CODE_VERIFIER_COOKIE,
  OAUTH_NONCE_COOKIE,
  OAUTH_REDIRECT_URI_COOKIE,
  OAUTH_STATE_COOKIE,
  redactUrlForLogs,
  redactValue,
} from "@/app/lib/oauth-server";
import { prisma } from "../../../lib/prisma";

type CallbackRequest = {
  code?: string | null;
  state?: string | null;
};

type CallbackMode = "json" | "redirect";

type TokenResponsePayload = {
  access_token?: unknown;
  refresh_token?: unknown;
  expires_in?: unknown;
  id_token?: unknown;
  [key: string]: unknown;
};

const TOKEN_EXCHANGE_TIMEOUT_MS = readPositiveIntegerEnv(
  "QURAN_OAUTH_TOKEN_TIMEOUT_MS",
  8_000
);

export const runtime = "nodejs";

class OAuthTokenExchangeTimeoutError extends Error {
  constructor(readonly timeoutMs: number) {
    super(`OAuth token exchange timed out after ${timeoutMs}ms`);
    this.name = "OAuthTokenExchangeTimeoutError";
  }
}

function basicAuthHeader(clientId: string, clientSecret: string) {
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  return `Basic ${credentials}`;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const providerError = url.searchParams.get("error");

    if (providerError) {
      return clearOAuthCookies(
        redirectWithOAuthError(
          req,
          providerError,
          url.searchParams.get("error_description") ||
            `OAuth provider returned an error: ${providerError}`
        )
      );
    }

    return completeOAuthCallback(
      req,
      {
        code: url.searchParams.get("code"),
        state: url.searchParams.get("state"),
      },
      {
        callbackUrl: req.url,
        mode: "redirect",
      }
    );
  } catch (error) {
    console.error("[oauth.callback] Unexpected GET callback failure", {
      message: error instanceof Error ? error.message : "Unknown error",
    });

    return clearOAuthCookies(
      redirectWithOAuthError(
        req,
        "callback_failed",
        error instanceof Error ? error.message : "Unexpected callback error"
      )
    );
  }
}

export async function POST(req: Request) {
  let body: CallbackRequest;

  try {
    body = (await req.json()) as CallbackRequest;
  } catch {
    return clearOAuthCookies(
      NextResponse.json(
        {
          success: false,
          message: "Invalid callback request body",
        },
        { status: 400 }
      )
    );
  }

  return completeOAuthCallback(req, body, {
    callbackUrl: req.headers.get("referer") || req.url,
    mode: "json",
  });
}

async function completeOAuthCallback(
  req: Request,
  body: CallbackRequest,
  options: {
    callbackUrl: string;
    mode: CallbackMode;
  }
) {
  try {
    const cookieState = getCookieValue(req, OAUTH_STATE_COOKIE);
    const codeVerifier = getCookieValue(req, OAUTH_CODE_VERIFIER_COOKIE);
    const redirectUri = getCookieValue(req, OAUTH_REDIRECT_URI_COOKIE);

    console.info("[oauth.callback] Received callback exchange request", {
      callbackUrl: redactUrlForLogs(options.callbackUrl),
      mode: options.mode,
      queryParamNames: getQueryParamNames(options.callbackUrl),
      hasCode: Boolean(body.code),
      hasReturnedState: Boolean(body.state),
      hasStoredState: Boolean(cookieState),
      hasCodeVerifier: Boolean(codeVerifier),
      hasRedirectUri: Boolean(redirectUri),
    });

    if (!body.code) {
      return oauthFailureResponse(
        req,
        options.mode,
        400,
        "Missing authorization code",
        "missing_authorization_code"
      );
    }

    if (!body.state || !cookieState || body.state !== decodeURIComponent(cookieState)) {
      return oauthFailureResponse(
        req,
        options.mode,
        400,
        "Invalid OAuth state",
        "invalid_oauth_state"
      );
    }

    if (!codeVerifier || !redirectUri) {
      return oauthFailureResponse(
        req,
        options.mode,
        400,
        "OAuth login session expired. Please try signing in again.",
        "oauth_session_expired"
      );
    }

    const clientId = getEnv("QURAN_CLIENT_ID");
    const clientSecret = getEnv("QURAN_CLIENT_SECRET");
    const baseUrl = getEnv("QURAN_OAUTH_BASE_URL");
    const tokenEndpoint = new URL("/oauth2/token", baseUrl).toString();

    console.info("[oauth.callback] Exchanging authorization code", {
      tokenEndpoint,
      redirectUri: decodeURIComponent(redirectUri),
      clientId: redactValue(clientId),
      hasClientSecret: Boolean(clientSecret),
      timeoutMs: TOKEN_EXCHANGE_TIMEOUT_MS,
    });

    const form = new URLSearchParams({
      grant_type: "authorization_code",
      code: body.code,
      redirect_uri: decodeURIComponent(redirectUri),
      code_verifier: decodeURIComponent(codeVerifier),
    });

    let tokenRes: Response;

    try {
      tokenRes = await postTokenRequest(tokenEndpoint, form, clientId, clientSecret);
    } catch (error) {
      if (error instanceof OAuthTokenExchangeTimeoutError) {
        console.error("[oauth.callback] Token exchange timed out", {
          tokenEndpoint,
          timeoutMs: error.timeoutMs,
        });

        return oauthFailureResponse(
          req,
          options.mode,
          502,
          "OAuth token exchange timed out. Please try signing in again.",
          "token_exchange_timeout"
        );
      }

      if (error instanceof TypeError) {
        console.error("[oauth.callback] Token endpoint network failure", {
          tokenEndpoint,
          message: error.message,
        });

        return oauthFailureResponse(
          req,
          options.mode,
          502,
          "Could not reach the OAuth token endpoint. Please try signing in again.",
          "token_exchange_network_error"
        );
      }

      throw error;
    }

    const rawText = await tokenRes.text();

    let data: TokenResponsePayload;
    try {
      data = JSON.parse(rawText) as TokenResponsePayload;
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

      return oauthFailureResponse(
        req,
        options.mode,
        400,
        "Token exchange failed",
        "token_exchange_failed",
        {
          upstreamStatus: tokenRes.status,
          upstream: data,
        }
      );
    }

    const accessToken = data.access_token;
    const refreshToken = data.refresh_token;
    const expiresIn = data.expires_in;
    const tokenMaxAge = readExpiresInSeconds(expiresIn);
    const profileCookieValue = createQuranOAuthProfileCookieValue(data.id_token);
    const oauthUserId = getOAuthIdentityFromIdToken(
      typeof data.id_token === "string" ? data.id_token : String(data.id_token ?? "")
    );
    
    if (!oauthUserId){
      return oauthFailureResponse(
        req,
        options.mode,
        400,
        "Missing OAuth identity (sub)",
        "missing_oauth_identity",
      );
    }

    if (typeof accessToken !== "string" || !accessToken) {
      return oauthFailureResponse(
        req,
        options.mode,
        400,
        "No access token returned",
        "missing_access_token",
        {
          upstream: data,
        }
      );
    }

    const user = await prisma.user.upsert({
      where: {
        oauthUserId,
      },
      update: {
        email: undefined,
      },
      create: {
        oauthUserId,
        email: null,
        role: "PARENT",
      },
    })

    const res =
      options.mode === "redirect"
        ? NextResponse.redirect(new URL("/", getRequestOrigin(req)))
        : NextResponse.json({ success: true });
    clearOAuthCookies(res);

    res.cookies.set(APP_USER_SESSION_COOKIE, user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    res.cookies.set(QURAN_ACCESS_TOKEN_COOKIE, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      ...(tokenMaxAge ? { maxAge: tokenMaxAge } : {}),
    });

    if (typeof refreshToken === "string" && refreshToken) {
      res.cookies.set(QURAN_REFRESH_TOKEN_COOKIE, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
    }

    if (profileCookieValue) {
      res.cookies.set(QURAN_OAUTH_PROFILE_COOKIE, profileCookieValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        ...(tokenMaxAge ? { maxAge: tokenMaxAge } : {}),
      });
    } else {
      res.cookies.set(QURAN_OAUTH_PROFILE_COOKIE, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
    }

    return res;
  } catch (error) {
    console.error("[oauth.callback] Unexpected callback failure", {
      message: error instanceof Error ? error.message : "Unknown error",
    });

    return oauthFailureResponse(
      req,
      options.mode,
      500,
      error instanceof Error ? error.message : "Unexpected callback error",
      "callback_failed"
    );
  }
}

async function postTokenRequest(
  tokenEndpoint: string,
  form: URLSearchParams,
  clientId: string,
  clientSecret: string
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    TOKEN_EXCHANGE_TIMEOUT_MS
  );

  try {
    return await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: basicAuthHeader(clientId, clientSecret),
      },
      body: form,
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new OAuthTokenExchangeTimeoutError(TOKEN_EXCHANGE_TIMEOUT_MS);
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function oauthFailureResponse(
  req: Request,
  mode: CallbackMode,
  status: number,
  message: string,
  errorCode: string,
  extra?: Record<string, unknown>
) {
  if (mode === "redirect") {
    return clearOAuthCookies(redirectWithOAuthError(req, errorCode, message));
  }

  return clearOAuthCookies(
    NextResponse.json(
      {
        success: false,
        message,
        ...extra,
      },
      { status }
    )
  );
}

function redirectWithOAuthError(
  req: Request,
  error: string,
  description: string
): NextResponse {
  const url = new URL("/oauth/callback", getRequestOrigin(req));
  url.searchParams.set("error", error);
  url.searchParams.set("error_description", description);

  return NextResponse.redirect(url);
}

function getQueryParamNames(url: string): string[] {
  try {
    return Array.from(new URL(url).searchParams.keys());
  } catch {
    return [];
  }
}

function readExpiresInSeconds(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.floor(value);
  }

  if (typeof value === "string" && /^\d+$/.test(value)) {
    const parsed = Number(value);
    return parsed > 0 ? parsed : undefined;
  }

  return undefined;
}

function readPositiveIntegerEnv(name: string, fallback: number): number {
  const rawValue = process.env[name]?.trim();

  if (!rawValue) {
    return fallback;
  }

  const parsed = Number(rawValue);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function clearOAuthCookies(res: NextResponse): NextResponse {
  for (const name of [
    OAUTH_STATE_COOKIE,
    OAUTH_NONCE_COOKIE,
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