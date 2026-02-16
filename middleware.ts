"use strict";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const isAuth = !!token;
  const url = req.nextUrl;
  const path = url.pathname;

  // 1. ALWAYS ALLOW - Static assets, images, next internals, and public APIs
  if (
    path.startsWith("/_next") ||
    path.includes(".") ||
    path === "/favicon.ico" ||
    path.startsWith("/api/auth") ||
    path.startsWith("/static")
  ) {
    return NextResponse.next();
  }

  // 2. AUTHENTICATED USERS
  if (isAuth) {
    const status = token.status as string; // Cast to string to be safe

    // CASE A: User is NOT ACTIVE (Pending, Rejected, Banned)
    // They are ONLY allowed to be on /onboarding
    if (status !== 'ACTIVE' && token.role !== 'ADMIN' && token.role !== 'MODERATOR') {
      // Allow access to onboarding and the API to submit application
      if (path === '/onboarding' || path.startsWith('/api/applications') || path.startsWith('/api/uploadthing')) {
        return NextResponse.next();
      }
      // Redirect everything else to onboarding
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    // CASE B: User IS ACTIVE
    // They should NOT be on /onboarding or auth pages
    if (path === '/onboarding' || path.startsWith('/login') || path.startsWith('/register')) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Allow access to everything else
    return NextResponse.next();
  }

  // 3. UNAUTHENTICATED USERS
  // Allowed routes: /login, /register
  const publicRoutes = ['/login', '/register'];
  if (publicRoutes.some(route => path.startsWith(route))) {
    return NextResponse.next();
  }

  // Redirect to login for everything else (including /onboarding, /, /admin, etc.)
  return NextResponse.redirect(new URL("/login", req.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
