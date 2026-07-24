import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PUBLIC_ADMIN_PATHS = ["/admin/login"];

/* no-store di semua respons area admin (termasuk /admin/login) supaya
 * browser gak simpan halaman ini di bfcache — tanpa ini, tombol Back
 * abis logout bisa nampilin dashboard basi dari cache sebelum request
 * baru ditembak ke server (lihat CHANGELOG v2.8.4). */
function withNoStore(res: NextResponse) {
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  return res;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_ADMIN_PATHS.includes(pathname)) return withNoStore(NextResponse.next());

  // Cek cepat via cookie (tanpa hit DB) — cukup utk redirect di edge;
  // validasi session sebenarnya tetap terjadi di Server Component/Server Action.
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    return withNoStore(NextResponse.redirect(new URL("/admin/login", request.url)));
  }
  return withNoStore(NextResponse.next());
}

export const config = {
  matcher: ["/admin/:path*", "/editor/:path*", "/author/:path*"],
};
