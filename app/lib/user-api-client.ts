import { getEnv } from "@/app/lib/env";

type UserApiHeaders = {
  "x-auth-token": string;
  "x-client-id": string;
};

const ACCESS_TOKEN_COOKIE = "quran_access_token";

function getCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) {
    return null;
  }

  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.slice(name.length + 1));
}

export function getUserApiClient(request: Request): {
  headers: UserApiHeaders;
} | null {
  const clientId = getEnv("QURAN_CLIENT_ID");
  const accessToken =
    request.headers.get("x-auth-token") ??
    getCookieValue(request.headers.get("cookie"), ACCESS_TOKEN_COOKIE);

  if (!accessToken) {
    return null;
  }

  return {
    headers: {
      "x-auth-token": accessToken,
      "x-client-id": clientId,
    },
  };
}

// TODO: Add OAuth2 integration for user-scoped auth flows.
// TODO: Add token refresh handling when upstream auth expires.
// TODO: Add a caching layer for repeated user API reads where appropriate.
