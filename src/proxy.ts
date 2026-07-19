import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PUBLIC_ADMIN_PATHS = ["/admin/login"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_ADMIN_PATHS.includes(pathname)) return NextResponse.next();

  // Cek cepat via cookie (tanpa hit DB) — cukup utk redirect di edge;
  // validasi session sebenarnya tetap terjadi di Server Component/Server Action.
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/editor/:path*", "/author/:path*"],
};
