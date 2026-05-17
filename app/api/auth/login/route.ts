import { NextResponse } from "next/server";
import { getEnv } from "@/app/lib/env";
import {
  createCodeChallenge,
  getConfiguredOAuthRedirectUri,
  getOAuthScopes,
  getOAuthRedirectUriCandidates,
  getPreferredOAuthOrigin,
  getRequestOrigin,
  OAUTH_CODE_VERIFIER_COOKIE,
  OAUTH_NONCE_COOKIE,
  OAUTH_REDIRECT_URI_COOKIE,
  OAUTH_STATE_COOKIE,
  randomOauthValue,
  redactUrlForLogs,
  redactValue,
} from "@/app/lib/oauth-server";

const OAUTH_COOKIE_MAX_AGE_SECONDS = 10 * 60;
const OAUTH_START_TIMEOUT_MS = readPositiveIntegerEnv(
  "QURAN_OAUTH_START_TIMEOUT_MS",
  5_000
);

export const runtime = "nodejs";

type OAuthStartCheck =
  | { ok: true }
  | {
      ok: false;
      error: string;
      description: string;
    };

type AuthorizationRequest = {
  redirectUri: string;
  url: URL;
};

type AuthorizationSelection =
  | ({ ok: true } & AuthorizationRequest)
  | ({
      ok: false;
    } & Exclude<OAuthStartCheck, { ok: true }>);

export async function GET(req: Request) {
  try {
    const clientId = getEnv("QURAN_CLIENT_ID");
    const baseUrl = getEnv("QURAN_OAUTH_BASE_URL");
    const requestOrigin = getRequestOrigin(req);
    const preferredOAuthOrigin = getPreferredOAuthOrigin(req);

    if (requestOrigin !== preferredOAuthOrigin) {
      return NextResponse.redirect(
        new URL("/api/auth/login", preferredOAuthOrigin)
      );
    }

    const state = randomOauthValue();
    const nonce = randomOauthValue(24);
    const codeVerifier = randomOauthValue(64);
    const codeChallenge = createCodeChallenge(codeVerifier);
    const scopes = getOAuthScopes();
    const authorizationRequest = await selectAuthorizationRequest({
      baseUrl,
      clientId,
      codeChallenge,
      nonce,
      req,
      scopes,
      state,
    });

    if (!authorizationRequest.ok) {
      return redirectWithLoginError(
        req,
        authorizationRequest.error,
        authorizationRequest.description
      );
    }

    const { redirectUri, url } = authorizationRequest;

    const res = NextResponse.redirect(url);
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: OAUTH_COOKIE_MAX_AGE_SECONDS,
    };

    res.cookies.set(OAUTH_STATE_COOKIE, state, cookieOptions);
    res.cookies.set(OAUTH_NONCE_COOKIE, nonce, cookieOptions);
    res.cookies.set(OAUTH_CODE_VERIFIER_COOKIE, codeVerifier, cookieOptions);
    res.cookies.set(OAUTH_REDIRECT_URI_COOKIE, redirectUri, cookieOptions);

    return res;
  } catch (error) {
    console.error("[oauth.login] Failed to start OAuth login", {
      message: error instanceof Error ? error.message : "Unknown error",
    });

    return redirectWithLoginError(
      req,
      "login_failed",
      "Unable to start OAuth login."
    );
  }
}

async function selectAuthorizationRequest(input: {
  baseUrl: string;
  clientId: string;
  codeChallenge: string;
  nonce: string;
  req: Request;
  scopes: string;
  state: string;
}): Promise<AuthorizationSelection> {
  const redirectUriCandidates = getOAuthRedirectUriCandidates(input.req);
  const providerOrigin = new URL(input.baseUrl).origin;
  const redirectUriFromEnv = Boolean(getConfiguredOAuthRedirectUri());
  let lastProviderStart: Exclude<OAuthStartCheck, { ok: true }> | null = null;

  for (const [index, redirectUri] of redirectUriCandidates.entries()) {
    const url = createAuthorizationUrl({
      baseUrl: input.baseUrl,
      clientId: input.clientId,
      codeChallenge: input.codeChallenge,
      nonce: input.nonce,
      redirectUri,
      scopes: input.scopes,
      state: input.state,
    });

    console.info("[oauth.login] Starting authorization request", {
      providerOrigin,
      responseType: "code",
      redirectUri,
      redirectUriCandidate: index + 1,
      redirectUriCandidateCount: redirectUriCandidates.length,
      scopes: input.scopes,
      hasPkce: true,
      clientId: redactValue(input.clientId),
      authorizationUrl: redactUrlForLogs(url.toString()),
      redirectUriFromEnv,
    });

    const providerStart = await checkOAuthStart(url.toString());

    if (providerStart.ok) {
      return {
        ok: true,
        redirectUri,
        url,
      };
    }

    lastProviderStart = providerStart;

    console.error("[oauth.login] OAuth provider rejected startup", {
      providerOrigin,
      error: providerStart.error,
      description: providerStart.description,
      redirectUri,
      timeoutMs: OAUTH_START_TIMEOUT_MS,
    });

    if (!isRedirectUriMismatch(providerStart)) {
      return providerStart;
    }
  }

  return (
    lastProviderStart || {
      ok: false,
      error: "oauth_redirect_uri_rejected",
      description:
        "Quran.com rejected every configured OAuth callback URL for this app.",
    }
  );
}

function createAuthorizationUrl(input: {
  baseUrl: string;
  clientId: string;
  codeChallenge: string;
  nonce: string;
  redirectUri: string;
  scopes: string;
  state: string;
}): URL {
  const url = new URL("/oauth2/auth", input.baseUrl);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", input.clientId);
  url.searchParams.set("redirect_uri", input.redirectUri);
  url.searchParams.set("code_challenge", input.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("state", input.state);
  url.searchParams.set("nonce", input.nonce);
  url.searchParams.set("scope", input.scopes);

  return url;
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

async function checkOAuthStart(
  authorizationUrl: string
): Promise<OAuthStartCheck> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OAUTH_START_TIMEOUT_MS);

  try {
    const res = await fetch(authorizationUrl, {
      method: "GET",
      cache: "no-store",
      redirect: "manual",
      signal: controller.signal,
    });

    if (res.status >= 500) {
      return {
        ok: false,
        error: "oauth_provider_unavailable",
        description: "Quran.com sign-in is temporarily unavailable. Please try again.",
      };
    }

    const providerError = readProviderError(res.headers.get("location"));

    if (providerError) {
      return providerError;
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "oauth_provider_unavailable",
      description: "Quran.com sign-in is temporarily unavailable. Please try again.",
    };
  } finally {
    clearTimeout(timeout);
  }
}

function readProviderError(location: string | null): OAuthStartCheck | null {
  if (!location) {
    return null;
  }

  let url: URL;

  try {
    url = new URL(location);
  } catch {
    return null;
  }

  if (!url.pathname.includes("oauth-error")) {
    return null;
  }

  return {
    ok: false,
    error: url.searchParams.get("error") || "oauth_provider_error",
    description:
      url.searchParams.get("error_description") ||
      "Quran.com sign-in could not be started. Please check the OAuth redirect URL.",
  };
}

function isRedirectUriMismatch(
  providerStart: Exclude<OAuthStartCheck, { ok: true }>
): boolean {
  return (
    providerStart.error === "invalid_request" &&
    providerStart.description.toLowerCase().includes("redirect_uri")
  );
}

function redirectWithLoginError(
  req: Request,
  error: string,
  description: string
): NextResponse {
  const url = new URL("/oauth/callback", getRequestOrigin(req));
  url.searchParams.set("error", error);
  url.searchParams.set("error_description", description);

  return NextResponse.redirect(url);
}

function readPositiveIntegerEnv(name: string, fallback: number): number {
  const rawValue = process.env[name]?.trim();

  if (!rawValue) {
    return fallback;
  }

  const parsed = Number(rawValue);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
