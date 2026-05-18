import { cookies } from "next/headers";

export const QURAN_ACCESS_TOKEN_COOKIE = "quran_access_token";
export const QURAN_REFRESH_TOKEN_COOKIE = "quran_refresh_token";
export const QURAN_OAUTH_PROFILE_COOKIE = "quran_oauth_profile";
export const APP_USER_SESSION_COOKIE = "ilmcubs_user_id";

export type QuranOAuthProfile = {
  displayName: string;
  initials: string;
  oAuthUserId?: string;
};

type StoredQuranOAuthProfile = QuranOAuthProfile & {
  subject?: string;
};

type JwtPayload = {
  sub?: unknown;
  name?: unknown;
  given_name?: unknown;
  family_name?: unknown;
  preferred_username?: unknown;
  email?: unknown;
};

export async function getQuranOAuthProfile(): Promise<QuranOAuthProfile | null> {
  const cookieStore = await cookies();
  const hasAccessToken = Boolean(
    cookieStore.get(QURAN_ACCESS_TOKEN_COOKIE)?.value
  );

  if (!hasAccessToken) {
    return null;
  }

  const storedProfile = decodeProfileCookie(
    cookieStore.get(QURAN_OAUTH_PROFILE_COOKIE)?.value
  );

  return (
    storedProfile ?? {
      displayName: "Quran.com learner",
      initials: "Q",
    }
  );
}

export function createQuranOAuthProfileCookieValue(
  idToken: unknown
): string | null {
  if (typeof idToken !== "string" || !idToken.trim()) {
    return null;
  }

  const payload = decodeJwtPayload(idToken);

  if (!payload) {
    return null;
  }

  const displayName = getDisplayName(payload);

  if (!displayName) {
    return null;
  }

  return encodeProfileCookie({
    displayName,
    initials: getInitials(displayName),
    subject: getString(payload.sub) ?? undefined,
    oAuthUserId: getString(payload.sub) ?? undefined,
  });
}

function decodeJwtPayload(idToken: string): JwtPayload | null {
  const [, payload] = idToken.split(".");

  if (!payload) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

function getDisplayName(payload: JwtPayload): string | null {
  const fullName = getString(payload.name);

  if (fullName) {
    return fullName;
  }

  const givenName = getString(payload.given_name);
  const familyName = getString(payload.family_name);
  const joinedName = [givenName, familyName].filter(Boolean).join(" ").trim();

  if (joinedName) {
    return joinedName;
  }

  const username = getString(payload.preferred_username);

  if (username) {
    return username;
  }

  const email = getString(payload.email);

  if (email) {
    return email.split("@")[0] || null;
  }

  return null;
}

function getString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getInitials(displayName: string): string {
  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return initials || "Q";
}

function encodeProfileCookie(profile: StoredQuranOAuthProfile): string {
  return Buffer.from(JSON.stringify(profile), "utf8").toString("base64url");
}

function decodeProfileCookie(
  value: string | undefined
): QuranOAuthProfile | null {
  if (!value) {
    return null;
  }

  try {
    const profile = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8")
    ) as Partial<StoredQuranOAuthProfile>;

    if (
      typeof profile.displayName !== "string" ||
      !profile.displayName.trim()
    ) {
      return null;
    }

    return {
      displayName: profile.displayName.trim(),
      initials:
        typeof profile.initials === "string" && profile.initials.trim()
          ? profile.initials.trim().slice(0, 2).toUpperCase()
          : getInitials(profile.displayName),
      oAuthUserId: profile.oAuthUserId,
    };
  } catch {
    return null;
  }
}
