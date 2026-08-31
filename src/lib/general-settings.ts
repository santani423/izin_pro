import { prisma } from "@/lib/db";
import { getLocale } from "@/i18n/get-dictionary";
import { pickLocalizedText } from "@/lib/locale-field";

export interface LocalizedGeneralSettings {
  companyName: string;
  tagline: string;
  description: string;
  operatingHours: string;
  whatsapp: string;
  phoneDisplay: string;
  email: string;
  address: string;
  mapsUrl: string;
  mapsEmbedUrl: string;
  social: {
    linkedin: string;
    facebook: string;
    instagram: string;
    twitter: string;
    youtube: string;
  };
}

/* Settings.whatsapp disimpan format internasional tanpa "+" (mis.
 * "6282280007821") buat dipakai langsung di link wa.me — versi tampilan
 * (mis. "0822-8000-7821") diturunkan dari situ, gak ada kolom terpisah. */
function formatWhatsappDisplay(whatsapp: string): string {
  const digits = whatsapp.replace(/\D/g, "");
  const local = digits.startsWith("62") ? `0${digits.slice(2)}` : digits;
  return local.replace(/(\d{4})(?=\d)/g, "$1-");
}

/* ─── Settings.companyName/tagline/description/operatingHours sesuai locale
 * aktif, + kontak (whatsapp/email/address/mapsUrl — gak ada varian
 * EN/ZH-nya) ─── * Dipakai lintas komponen publik (root layout metadata,
 * Footer, MaintenancePage, LocationSection, LayananConsultSection,
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
        whatsapp: true,
        email: true,
        address: true,
        mapsUrl: true,
        mapsEmbedUrl: true,
        socialLinkedin: true,
        socialFacebook: true,
        socialInstagram: true,
        socialX: true,
        socialYoutube: true,
      },
    }),
  ]);

  return {
    companyName: pickLocalizedText(settings?.companyName ?? "IzinPro", settings?.companyNameEn, settings?.companyNameZh, locale),
    tagline: pickLocalizedText(settings?.tagline ?? "", settings?.taglineEn, settings?.taglineZh, locale),
    description: pickLocalizedText(settings?.description ?? "", settings?.descriptionEn, settings?.descriptionZh, locale),
    operatingHours: pickLocalizedText(settings?.operatingHours ?? "", settings?.operatingHoursEn, settings?.operatingHoursZh, locale),
    whatsapp: settings?.whatsapp ?? "",
    phoneDisplay: formatWhatsappDisplay(settings?.whatsapp ?? ""),
    email: settings?.email ?? "",
    address: settings?.address ?? "",
    mapsUrl: settings?.mapsUrl ?? "",
    mapsEmbedUrl: settings?.mapsEmbedUrl ?? "",
    social: {
      linkedin: settings?.socialLinkedin ?? "",
      facebook: settings?.socialFacebook ?? "",
      instagram: settings?.socialInstagram ?? "",
      twitter: settings?.socialX ?? "",
      youtube: settings?.socialYoutube ?? "",
    },
  };
}
