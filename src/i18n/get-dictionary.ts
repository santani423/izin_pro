import "server-only";
import { cache } from "react";
import { headers, cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALE_HEADER, LOCALES, type Locale } from "@/i18n/config";
import id from "@/i18n/dictionaries/id";
import en from "@/i18n/dictionaries/en";
import zh from "@/i18n/dictionaries/zh";
import type { Dictionary } from "@/i18n/dictionaries/id";

const DICTIONARIES: Record<Locale, Dictionary> = { id, en, zh };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Settings.defaultLocale (diatur admin di /admin/settings) — di-cache per
 * request (React cache) biar getLocale() yang dipanggil berkali-kali dalam
 * satu request cuma hit DB sekali. */
const getSiteDefaultLocale = cache(async (): Promise<Locale> => {
  const settings = await prisma.settings.findUnique({ where: { id: "1" }, select: { defaultLocale: true } });
  const value = settings?.defaultLocale ?? "";
  return isLocale(value) ? value : DEFAULT_LOCALE;
});

/** Locale aktif — urutan resolusi:
 *   1. Header x-locale (proxy.ts, cuma diset kalau URL eksplisit pakai
 *      prefix /en atau /zh) — URL selalu menang kalau eksplisit.
 *   2. Cookie preferensi pengunjung (diset LocaleSwitcher pas diklik) —
 *      berlaku utk URL bare (tanpa prefix), biar pilihan eksplisit
 *      pengunjung gak keganti tiap admin ubah bahasa default situs.
 *   3. Settings.defaultLocale (admin) — pengunjung baru yang belum pernah
 *      pilih bahasa & buka URL bare.
 * Dipanggil dari Server Component/Server Action. */
export async function getLocale(): Promise<Locale> {
  const h = await headers();
  const headerValue = h.get(LOCALE_HEADER) ?? "";
  if (isLocale(headerValue)) return headerValue;

  const c = await cookies();
  const cookieValue = c.get(LOCALE_COOKIE)?.value ?? "";
  if (isLocale(cookieValue)) return cookieValue;

  return getSiteDefaultLocale();
}
