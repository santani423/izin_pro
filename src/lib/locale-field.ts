import type { Cta } from "@prisma/client";
import type { Locale } from "@/i18n/config";

/** Pilih nilai sesuai locale aktif, fallback ke `base` (Bahasa Indonesia)
 * kalau versi EN/ZH kosong/belum diisi admin. Dipakai utk field CMS yang
 * punya varian *En/*Zh (MenuItem.label, Settings.companyName dkk). */
export function pickLocalizedText(
  base: string,
  en: string | null | undefined,
  zh: string | null | undefined,
  locale: Locale,
): string {
  if (locale === "en" && en?.trim()) return en;
  if (locale === "zh" && zh?.trim()) return zh;
  return base;
}

/** Resolve title/subtitle/buttonLabel sebuah baris Cta ke locale aktif —
 * undefined kalau `cta` null, biar caller (<CtaSection>) tetap fallback ke
 * dictionary default (bukan nge-render string kosong). */
export function getLocalizedCta(
  cta: Cta | null | undefined,
  locale: Locale,
): { title: string; subtitle: string | undefined; buttonLabel: string } | undefined {
  if (!cta) return undefined;
  return {
    title: pickLocalizedText(cta.title, cta.titleEn, cta.titleZh, locale),
    subtitle: cta.subtitle ? pickLocalizedText(cta.subtitle, cta.subtitleEn, cta.subtitleZh, locale) : undefined,
    buttonLabel: pickLocalizedText(cta.buttonLabel, cta.buttonLabelEn, cta.buttonLabelZh, locale),
  };
}
