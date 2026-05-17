import { createHash, randomBytes } from "crypto";

export const OAUTH_STATE_COOKIE = "quran_oauth_state";
export const OAUTH_CODE_VERIFIER_COOKIE = "quran_pkce_code_verifier";
export const OAUTH_REDIRECT_URI_COOKIE = "quran_oauth_redirect_uri";
export const OAUTH_NONCE_COOKIE = "quran_oauth_nonce";

const DEFAULT_OAUTH_SCOPES = "openid offline_access user reading_session streak";

const DEFAULT_CALLBACK_PATH = "/api/auth/callback";
const FALLBACK_CALLBACK_PATHS = ["/callback", "/oauth/callback"];

export function randomOauthValue(byteLength = 32): string {
  return randomBytes(byteLength).toString("base64url");
}

export function createCodeChallenge(codeVerifier: string): string {
  return createHash("sha256").update(codeVerifier).digest("base64url");
}

export function getOAuthScopes(): string {
  return readCleanEnv("QURAN_OAUTH_SCOPES") || DEFAULT_OAUTH_SCOPES;
}

export function getRequestOrigin(req: Request): string {
  const forwardedHost = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const requestUrl = new URL(req.url);
  const forwardedProto = req.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();
  const proto = forwardedProto || requestUrl.protocol.replace(":", "") || "https";
  const host = forwardedHost || req.headers.get("host")?.trim();

  if (host) {
    return `${proto}://${host}`;
  }

  return requestUrl.origin;
}

export function getOAuthRedirectUri(req: Request): string {
  return getOAuthRedirectUriCandidates(req)[0];
}

export function getOAuthRedirectUriCandidates(req: Request): string[] {
  const configuredRedirectUri = getConfiguredOAuthRedirectUri();

  if (configuredRedirectUri) {
    return [normalizeRedirectUri(configuredRedirectUri)];
  }

  const requestOrigin = getRequestOrigin(req);
  const siteOrigin = getConfiguredSiteOrigin();
  const origins = uniqueValues([
    siteOrigin,
    getCanonicalRequestOrigin(requestOrigin),
    requestOrigin,
  ]);
  const callbackPath =
    process.env.QURAN_OAUTH_CALLBACK_PATH?.trim() || DEFAULT_CALLBACK_PATH;
  const paths = uniqueValues([
    callbackPath,
    DEFAULT_CALLBACK_PATH,
    ...FALLBACK_CALLBACK_PATHS,
  ]);

  return origins.flatMap((origin) =>
    paths.map((path) => normalizeRedirectUri(new URL(path, origin).toString()))
  );
}

export function getPreferredOAuthOrigin(req: Request): string {
  return new URL(getOAuthRedirectUri(req)).origin;
}

export function getConfiguredOAuthRedirectUri(): string | null {
  return (
    readCleanEnv("QURAN_OAUTH_REDIRECT_URI") ||
    readCleanEnv("QURAN_REDIRECT_URI") ||
    null
  );
}

function getConfiguredSiteOrigin(): string | null {
  const configuredOrigin =
    readCleanEnv("QURAN_APP_URL") ||
    readCleanEnv("NEXT_PUBLIC_APP_URL") ||
    readCleanEnv("NEXT_PUBLIC_SITE_URL") ||
    readCleanEnv("VERCEL_PROJECT_PRODUCTION_URL") ||
    readCleanEnv("VERCEL_URL");

  if (!configuredOrigin) {
    return null;
  }

  const originWithProtocol = /^https?:\/\//.test(configuredOrigin)
    ? configuredOrigin
    : `https://${configuredOrigin}`;

  return new URL(originWithProtocol).origin;
}

function getCanonicalRequestOrigin(origin: string): string {
  const url = new URL(origin);

  if (url.hostname === "127.0.0.1" || url.hostname === "[::1]") {
    url.hostname = "localhost";
  }

  return url.origin;
}

function normalizeRedirectUri(uri: string): string {
  return uri.replace(/\/$/, "");
}

function uniqueValues(values: Array<string | null | undefined>): string[] {
  return Array.from(
    new Set(values.filter((value): value is string => Boolean(value)))
  );
}

function readCleanEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    return "";
  }

  const trimmed = value.trim();
  const unquoted =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
      ? trimmed.slice(1, -1).trim()
      : trimmed;

  return unquoted.replace(/\\r|\\n/g, "").trim();
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
