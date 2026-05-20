import { NextResponse, type NextRequest } from "next/server";

const APP_USER_SESSION_COOKIE = "ilmcubs_user_id";

const protectedRoutes = [
  "/quizzes",
  "/storytime",
  "/api/quiz",
  "/api/generate-quiz",
  "/api/story-ai",
];

function isProtectedRoute(pathname: string) {
  return protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  const userId = request.cookies.get(APP_USER_SESSION_COOKIE)?.value;

  if (userId) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/api/auth/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/quizzes/:path*",
    "/storytime/:path*",
    "/api/quiz/:path*",
    "/api/generate-quiz",
    "/api/story-ai",
  ],
};
