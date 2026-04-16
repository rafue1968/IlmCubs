import { NextResponse } from "next/server";
import { getEnv } from "@/app/lib/env";

type LoginUrlRequest = {
  codeChallenge?: string;
  state?: string;
  redirectUri?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as LoginUrlRequest;

    if (!body.codeChallenge || !body.state || !body.redirectUri) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing codeChallenge, state, or redirectUri",
        },
        { status: 400 }
      );
    }

    const clientId = getEnv("QURAN_CLIENT_ID");
    const baseUrl = getEnv("QURAN_OAUTH_BASE_URL");

    const url = new URL(`${baseUrl}/oauth2/auth`);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", body.redirectUri);
    url.searchParams.set("code_challenge", body.codeChallenge);
    url.searchParams.set("code_challenge_method", "S256");
    url.searchParams.set("state", body.state);
    url.searchParams.set("scope", "openid offline_access user streak");

    return NextResponse.json({
      success: true,
      url: url.toString(),
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