// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname;

  // --- PUBLIC ROUTES (NOT PROTECTED) ---
  const publicRoutes = ["/sign-in", "/sign-up"];

  // If the current path starts with a public route → allow access
  if (publicRoutes.some(route => url.startsWith(route))) {
    return NextResponse.next();
  }

  // --- CHECK USER SESSION ---
  const session = getSessionCookie(req);

  // No session and route is protected → redirect to sign-in
  if (!session) {
    const signInUrl = new URL("/sign-in", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Authenticated → continue
  return NextResponse.next();
}

// Apply to ALL ROUTES
export const config = {
  matcher: [
    "/((?!_next|static|.*\\.(png|jpg|jpeg|gif|svg|ico|webp)).*)",
  ],
};
