import { prisma } from "@/lib/db";
import { getLocale } from "@/i18n/get-dictionary";
import { pickLocalizedText } from "@/lib/locale-field";

export interface LocalizedGeneralSettings {
  companyName: string;
  tagline: string;
  description: string;
  operatingHours: string;
}

/* ─── Settings.companyName/tagline/description/operatingHours sesuai locale
 * aktif ─── * Dipakai lintas komponen publik (root layout metadata, Footer,
 * MaintenancePage, LocationSection, LayananConsultSection,
 * PromoConsultSection) — satu query singleton, hasilnya sudah dipilihkan
 * varian EN/ZH-nya (fallback ke Bahasa Indonesia kalau admin belum isi). */
export async function getLocalizedGeneralSettings(): Promise<LocalizedGeneralSettings> {
  const [locale, settings] = await Promise.all([
    getLocale(),
    prisma.settings.findUnique({
      where: { id: "1" },
      select: {
        companyName: true,
        companyNameEn: true,
        companyNameZh: true,
        tagline: true,
        taglineEn: true,
        taglineZh: true,
        description: true,
        descriptionEn: true,
        descriptionZh: true,
        operatingHours: true,
        operatingHoursEn: true,
        operatingHoursZh: true,
      },
    }),
  ]);

  return {
    companyName: pickLocalizedText(settings?.companyName ?? "IzinPro", settings?.companyNameEn, settings?.companyNameZh, locale),
    tagline: pickLocalizedText(settings?.tagline ?? "", settings?.taglineEn, settings?.taglineZh, locale),
    description: pickLocalizedText(settings?.description ?? "", settings?.descriptionEn, settings?.descriptionZh, locale),
    operatingHours: pickLocalizedText(settings?.operatingHours ?? "", settings?.operatingHoursEn, settings?.operatingHoursZh, locale),
  };
}
