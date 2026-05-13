import { createHash, randomBytes } from "crypto";

export const OAUTH_STATE_COOKIE = "quran_oauth_state";
export const OAUTH_CODE_VERIFIER_COOKIE = "quran_pkce_code_verifier";
export const OAUTH_REDIRECT_URI_COOKIE = "quran_oauth_redirect_uri";

export const OAUTH_SCOPES = "openid offline_access user streak";

const CALLBACK_PATH = "/oauth/callback";

export function randomOauthValue(byteLength = 32): string {
  return randomBytes(byteLength).toString("base64url");
}

export function createCodeChallenge(codeVerifier: string): string {
  return createHash("sha256").update(codeVerifier).digest("base64url");
}

export function getRequestOrigin(req: Request): string {
  const forwardedHost = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const forwardedProto =
    req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return new URL(req.url).origin;
}

export function getOAuthRedirectUri(req: Request): string {
  const configuredRedirectUri = process.env.QURAN_OAUTH_REDIRECT_URI?.trim();
  const redirectUri =
    configuredRedirectUri || new URL(CALLBACK_PATH, getRequestOrigin(req)).toString();

  return redirectUri.replace(/\/$/, "");
}

export function getCookieValue(req: Request, name: string): string | null {
  const cookies = req.headers.get("cookie")?.split(";") ?? [];
  const match = cookies
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`));

  if (!match) {
    return null;
  }

  return match.split("=").slice(1).join("=");
}

export function redactUrlForLogs(url: string): string {
  const parsed = new URL(url);

  for (const key of ["code", "state", "code_challenge"]) {
    if (parsed.searchParams.has(key)) {
      parsed.searchParams.set(key, "[redacted]");
    }
  }

  const clientId = parsed.searchParams.get("client_id");
  if (clientId) {
    parsed.searchParams.set("client_id", redactValue(clientId));
  }

  return parsed.toString();
}

export function redactValue(value: string): string {
  if (value.length <= 8) {
    return "[configured]";
  }

  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}
