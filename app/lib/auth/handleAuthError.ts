import { NextResponse } from "next/server";

export function handleAuthError(error: unknown) {
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  console.error(error);

  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}