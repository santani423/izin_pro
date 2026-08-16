/* ─── Konfigurasi locale situs publik ───
 * Default (id) sengaja TANPA prefix URL (kompatibel dgn URL lama & SEO
 * existing) — en/zh pakai prefix /en, /zh yang ditangani proxy.ts (rewrite,
 * bukan folder [locale] — lihat catatan di proxy.ts kenapa). */
export const LOCALES = ["id", "en", "zh"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "id";

export const LOCALE_LABELS: Record<Locale, string> = {
  id: "Indonesia",
  en: "English",
  zh: "中文",
};

export const LOCALE_SHORT_LABELS: Record<Locale, string> = {
  id: "ID",
  en: "EN",
  zh: "中文",
};

/** Header internal (request header, bukan response) tempat proxy.ts
 * menitipkan locale hasil deteksi ke Server Component lewat headers(). */
export const LOCALE_HEADER = "x-locale";

/** Cookie preferensi bahasa eksplisit pengunjung — diset LocaleSwitcher tiap
 * kali diklik. Dibaca getLocale() KHUSUS utk URL tanpa prefix (bare "/"),
 * biar pilihan eksplisit pengunjung menang di atas Settings.defaultLocale
 * (mis. situs default-nya diubah admin ke English, tapi pengunjung ini udah
 * pernah pilih Indonesia lewat switcher -> tetap Indonesia). */
export const LOCALE_COOKIE = "locale";

function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Buang prefix /en atau /zh dari sebuah pathname (no-op kalau gak ada
 * prefix / prefix-nya "id"). Dipakai proxy.ts & LocaleSwitcher. */
export function stripLocalePrefix(pathname: string): string {
  const segments = pathname.split("/");
  const maybe = segments[1] ?? "";
  if (isLocale(maybe)) {
    const rest = "/" + segments.slice(2).join("/");
    return rest.length > 1 ? rest.replace(/\/+$/, "") || "/" : "/";
  }
  return pathname;
}

/** Path publik (tanpa prefix locale) -> href yang sesuai locale target. */
export function localizeHref(pathname: string, target: Locale): string {
  const clean = stripLocalePrefix(pathname);
  if (target === DEFAULT_LOCALE) return clean;
  return clean === "/" ? `/${target}` : `/${target}${clean}`;
}

export function parseLocaleSegment(pathname: string): Locale | null {
  const segments = pathname.split("/");
  const maybe = segments[1] ?? "";
  return isLocale(maybe) ? maybe : null;
}
