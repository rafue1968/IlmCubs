const DEFAULT_QF_BASE_URL = "https://prelive-oauth2.quran.foundation";
const PRELIVE_USER_API_BASE_URL = "https://apis-prelive.quran.foundation/auth/v1";
const DEFAULT_SCOPES = "openid offline_access bookmark reading_session streak";

export type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in: number;
  scope?: string;
  token_type: string;
  expires_at?: string;
};

function getRequiredEnv(name: "QF_CLIENT_ID" | "QF_CLIENT_SECRET"): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export function getQfBaseUrl(): string {
  return process.env.QF_BASE_URL?.trim() || DEFAULT_QF_BASE_URL;
}

export function getQfClientId(): string {
  return getRequiredEnv("QF_CLIENT_ID");
}

export function getQfClientSecret(): string {
  return getRequiredEnv("QF_CLIENT_SECRET");
}

export function getQfUserApiBaseUrl(): string {
  return PRELIVE_USER_API_BASE_URL;
}

export function getAuthorizationUrl(redirectUri: string): string {
  if (!redirectUri.trim()) {
    throw new Error("redirectUri is required");
  }

  const url = new URL("/oauth2/auth", getQfBaseUrl());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", getQfClientId());
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", DEFAULT_SCOPES);

  return url.toString();
}

export async function exchangeCodeForToken(
  code: string,
  redirectUri: string
): Promise<TokenResponse> {
  if (!code.trim()) {
    throw new Error("Authorization code is required");
  }

  if (!redirectUri.trim()) {
    throw new Error("redirectUri is required");
  }

  const tokenUrl = new URL("/oauth2/token", getQfBaseUrl()).toString();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      authorization: `Basic ${Buffer.from(
        `${getQfClientId()}:${getQfClientSecret()}`
      ).toString("base64")}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  const payload = (await parseJsonResponse(response)) as
    | TokenResponse
    | {
        message?: string;
        error?: string;
        error_description?: string;
      };

  if (!response.ok) {
    const message = readErrorMessage(payload);

    throw new Error(
      `Failed to exchange authorization code for token (${response.status}): ${message}`
    );
  }

  if (!("access_token" in payload) || !payload.access_token) {
    throw new Error("Token exchange succeeded but no access token was returned");
  }

  return payload;
}

async function parseJsonResponse(response: Response): Promise<unknown> {
  const raw = await response.text();

  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new Error(`Expected JSON response but received: ${raw}`);
  }
}

function readErrorMessage(payload: unknown): string {
  if (typeof payload !== "object" || payload === null) {
    return "token exchange failed";
  }

  if ("message" in payload && typeof payload.message === "string" && payload.message.trim()) {
    return payload.message;
  }

  if (
    "error_description" in payload &&
    typeof payload.error_description === "string" &&
    payload.error_description.trim()
  ) {
    return payload.error_description;
  }

  if ("error" in payload && typeof payload.error === "string" && payload.error.trim()) {
    return payload.error;
  }

  return "token exchange failed";
}
