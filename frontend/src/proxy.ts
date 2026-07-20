import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

/**
 * UX-layer gate only. Server Actions on these paths still run even if a
 * matcher misses (see Next's Proxy docs: "a Proxy matcher that excludes a
 * path will also skip Server Function calls on that path"), so the real
 * authorization boundary is `requireUser`/`requireAdmin` in
 * src/lib/dal/session.ts, called inside every protected Server Action and
 * page - not this file.
 */
export function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminLoginRoute = pathname === "/admin/login";
  const isAccountRoute = pathname.startsWith("/account");

  if (!isAdminRoute && !isAccountRoute) {
    return NextResponse.next();
  }

  if (isAdminLoginRoute) {
    return NextResponse.next();
  }

  const secret = process.env.JWT_ACCESS_SECRET;
  if (!token || !secret) {
    const redirectUrl = isAdminRoute ? "/admin/login" : "/login";
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  try {
    const payload = jwt.verify(token, secret) as { role?: string };
    if (isAdminRoute && payload.role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  } catch {
    const redirectUrl = isAdminRoute ? "/admin/login" : "/login";
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
