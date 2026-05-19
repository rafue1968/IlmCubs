import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/app/lib/auth/clearAuthCookies";

export async function POST() {
  return clearAuthCookies(
    NextResponse.json({
      success: true,
    })
  );
}