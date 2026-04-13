import { NextResponse } from "next/server";
import { getEnv } from "@/app/lib/env";

const CLIENT_ID = getEnv("QURAN_CLIENT_ID");
const BASE_URL = getEnv("QURAN_OAUTH_BASE_URL");
const REDIRECT_URI = "http://localhost:3000/api/auth/callback";

export async function GET() {
  const url = new URL(`${BASE_URL}/authorize`);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", CLIENT_ID);
  url.searchParams.set("redirect_uri", REDIRECT_URI);

  return NextResponse.redirect(url);
}
