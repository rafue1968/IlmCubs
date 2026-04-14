import { NextResponse } from "next/server";
import { getEnv } from "@/app/lib/env";

type CallbackRequest = {
  code?: string;
  codeVerifier?: string;
  redirectUri?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CallbackRequest;

    if (!body.code || !body.codeVerifier || !body.redirectUri) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing code, codeVerifier, or redirectUri",
        },
        { status: 400 }
      );
    }

    const clientId = getEnv("QURAN_CLIENT_ID");
    const clientSecret = getEnv("QURAN_CLIENT_SECRET");
    const baseUrl = getEnv("QURAN_OAUTH_BASE_URL");

    const form = new URLSearchParams({
      grant_type: "authorization_code",
      code: body.code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: body.redirectUri,
      code_verifier: body.codeVerifier,
    });

    const tokenRes = await fetch(`${baseUrl}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
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
      return NextResponse.json(
        {
          success: false,
          message: "Token exchange failed",
          upstreamStatus: tokenRes.status,
          upstream: data,
        },
        { status: 400 }
      );
    }

    const accessToken = data.access_token;
    const refreshToken = data.refresh_token;
    const expiresIn = data.expires_in;

    if (typeof accessToken !== "string" || !accessToken) {
      return NextResponse.json(
        {
          success: false,
          message: "No access token returned",
          upstream: data,
        },
        { status: 400 }
      );
    }

    const res = NextResponse.json({ success: true });

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