import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { DEFAULT_LOCALE, LOCALE_HEADER, LOCALES, type Locale } from "@/i18n/config";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/forgot-password", "/admin/reset-password"];
const ADMIN_PREFIXES = ["/admin", "/editor", "/author"];

/* no-store di semua respons area admin (termasuk /admin/login) supaya
 * browser gak simpan halaman ini di bfcache — tanpa ini, tombol Back
 * abis logout bisa nampilin dashboard basi dari cache sebelum request
 * baru ditembak ke server (lihat CHANGELOG v2.8.4). */
function withNoStore(res: NextResponse) {
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  return res;
}

function isAdminPath(pathname: string) {
  return ADMIN_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/* ─── i18n rute publik ───
 * Kenapa gak pakai folder [locale] (pola next-intl standar): app ini udah
 * punya src/app/[panel] (dynamic segment admin/editor/author) di root
 * src/app — Next.js gak ngizinin dua dynamic segment beda nama ("panel" vs
 * "locale") di posisi yang sama, build bakal error. Jadi locale ditangani
 * di sini lewat rewrite, bukan folder terpisah:
 *   - id (default) TANPA prefix — URL lama & SEO existing gak berubah.
 *   - /en, /zh -> di-rewrite ke path aslinya (prefix dibuang) + header
 *     x-locale dititipkan ke request supaya Server Component & Server
 *     Action bisa baca locale-nya lewat headers() (lihat getLocale()).
 *   - /id/... (prefix eksplisit) -> redirect ke versi tanpa prefix supaya
 *     gak ada 2 URL beda utk konten yang sama.
 */
function handleLocale(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split("/");
  const maybeLocale = segments[1] ?? "";
  const requestHeaders = new Headers(request.headers);

  if ((LOCALES as readonly string[]).includes(maybeLocale)) {
    const locale = maybeLocale as Locale;
    const rest = "/" + segments.slice(2).join("/");
    const cleanPath = rest.length > 1 ? rest.replace(/\/+$/, "") || "/" : "/";

    if (locale === DEFAULT_LOCALE) {
      const url = request.nextUrl.clone();
      url.pathname = cleanPath;
      return NextResponse.redirect(url, 308);
    }

    requestHeaders.set(LOCALE_HEADER, locale);
    const url = request.nextUrl.clone();
    url.pathname = cleanPath;
    return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  }

  // URL tanpa prefix (bare) — SENGAJA gak set x-locale di sini. getLocale()
  // (Server Component/Action, boleh akses DB) yang resolve: cookie
  // preferensi eksplisit pengunjung dulu, baru fallback ke
  // Settings.defaultLocale (bisa diubah admin, gak selalu Bahasa Indonesia).
  return NextResponse.next();
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isAdminPath(pathname)) {
    if (PUBLIC_ADMIN_PATHS.includes(pathname)) return withNoStore(NextResponse.next());

    // Cek cepat via cookie (tanpa hit DB) — cukup utk redirect di edge;
    // validasi session sebenarnya tetap terjadi di Server Component/Server Action.
    const sessionCookie = getSessionCookie(request);
    if (!sessionCookie) {
      return withNoStore(NextResponse.redirect(new URL("/admin/login", request.url)));
    }
    return withNoStore(NextResponse.next());
  }

  return handleLocale(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api|uploads).*)"],
};
