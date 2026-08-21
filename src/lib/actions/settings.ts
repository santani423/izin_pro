"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { clearBrandingCache, saveBrandAssetFile, deleteBrandAssetFile } from "@/lib/branding";
import { LOCALES, type Locale } from "@/i18n/config";
import { LATIN_FONT_OPTIONS, CJK_FONT_OPTIONS } from "@/lib/fonts";
import { extractMapsEmbedSrc, isNonEmbeddableMapsUrl } from "@/lib/maps-embed";
import type { Role } from "@prisma/client";

export type ActionResult = { ok: true } | { ok: false; message: string };
export type BrandingActionResult =
  | { ok: true; appLogoUrl: string | null; faviconUrl: string | null }
  | { ok: false; message: string };

function errorMessage(e: unknown, fallback: string) {
  return e instanceof Error ? e.message : fallback;
}

/* Sama kayak readOnly di settings/page.tsx: cuma SUPER_ADMIN yang boleh
 * benar-benar ubah Pengaturan (ADMIN cuma bisa lihat). */
async function requireSettingsEditor() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user.role as Role) !== "SUPER_ADMIN") {
    throw new Error("Anda tidak punya akses untuk mengubah Pengaturan.");
  }
  return session;
}

export interface GeneralSettingsInput {
  defaultLocale: Locale;
  companyName: string;
  companyNameEn: string;
  companyNameZh: string;
  tagline: string;
  taglineEn: string;
  taglineZh: string;
  description: string;
  descriptionEn: string;
  descriptionZh: string;
  operatingHours: string;
  operatingHoursEn: string;
  operatingHoursZh: string;
}

/* Field2 tab Umum (Nama Perusahaan/Tagline/Deskripsi/Jam Operasional) ini
 * ditampilkan lintas halaman publik (root layout metadata, Footer,
 * MaintenancePage, LocationSection dkk — lihat getLocalizedGeneralSettings())
 * jadi revalidate "/", "layout" sama kayak Menu, bukan cuma /admin/settings. */
export async function updateGeneralSettingsAction(data: GeneralSettingsInput): Promise<ActionResult> {
  try {
    await requireSettingsEditor();
    if (!data.companyName.trim() || !data.tagline.trim() || !data.description.trim() || !data.operatingHours.trim()) {
      return { ok: false, message: "Nama Perusahaan, Tagline, Deskripsi, dan Jam Operasional (Bahasa Indonesia) wajib diisi." };
    }
    if (!(LOCALES as readonly string[]).includes(data.defaultLocale)) {
      return { ok: false, message: "Bahasa default situs tidak valid." };
    }
    await prisma.settings.update({
      where: { id: "1" },
      data: {
        defaultLocale: data.defaultLocale,
        companyName: data.companyName.trim(),
        companyNameEn: data.companyNameEn.trim() || null,
        companyNameZh: data.companyNameZh.trim() || null,
        tagline: data.tagline.trim(),
        taglineEn: data.taglineEn.trim() || null,
        taglineZh: data.taglineZh.trim() || null,
        description: data.description.trim(),
        descriptionEn: data.descriptionEn.trim() || null,
        descriptionZh: data.descriptionZh.trim() || null,
        operatingHours: data.operatingHours.trim(),
        operatingHoursEn: data.operatingHoursEn.trim() || null,
        operatingHoursZh: data.operatingHoursZh.trim() || null,
      },
    });
    revalidatePath("/admin/settings");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan Informasi Website.") };
  }
}

export interface ContactSettingsInput {
  whatsapp: string;
  email: string;
  address: string;
  mapsUrl: string;
  mapsEmbedUrl: string;
}

/* Tab Kontak — dipakai LocationSection (beranda) & dkk lewat
 * getLocalizedGeneralSettings(). whatsapp disimpan format internasional
 * tanpa "+" (mis. "6282280007821"), sesuai format link wa.me. mapsEmbedUrl
 * opsional (boleh kosong = LocationSection fallback ke embed otomatis dari
 * address). */
export async function updateContactSettingsAction(data: ContactSettingsInput): Promise<ActionResult> {
  try {
    await requireSettingsEditor();
    const whatsapp = data.whatsapp.replace(/\D/g, "");
    if (!whatsapp || !data.email.trim() || !data.address.trim() || !data.mapsUrl.trim()) {
      return { ok: false, message: "Nomor WhatsApp, Email, Alamat, dan URL Google Maps wajib diisi." };
    }
    const mapsEmbedUrl = extractMapsEmbedSrc(data.mapsEmbedUrl);
    if (mapsEmbedUrl && isNonEmbeddableMapsUrl(mapsEmbedUrl)) {
      return {
        ok: false,
        message:
          'Tautan itu cuma buat share (goo.gl), gak bisa ditampilkan sebagai peta tertanam — nanti petanya blank/gak muncul. Buka Google Maps → Bagikan → tab "Sematkan peta" (bukan "Kirim tautan") → salin kodenya, tempel di sini.',
      };
    }
    await prisma.settings.update({
      where: { id: "1" },
      data: {
        whatsapp,
        email: data.email.trim(),
        address: data.address.trim(),
        mapsUrl: data.mapsUrl.trim(),
        mapsEmbedUrl: mapsEmbedUrl || null,
      },
    });
    revalidatePath("/admin/settings");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan Informasi Kontak.") };
  }
}

export async function updateWhacenterSettingsAction(deviceId: string): Promise<ActionResult> {
  try {
    await requireSettingsEditor();
    await prisma.settings.update({
      where: { id: "1" },
      data: { whacenterDeviceId: deviceId.trim() || null },
    });
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan Device ID WhaCenter.") };
  }
}

export async function updateMaintenanceModeAction(
  maintenanceMode: boolean,
  maintenanceMessage: string,
): Promise<ActionResult> {
  try {
    await requireSettingsEditor();
    await prisma.settings.update({
      where: { id: "1" },
      data: {
        maintenanceMode,
        maintenanceMessage: maintenanceMessage.trim() || null,
      },
    });
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal mengubah mode maintenance.") };
  }
}

export interface FontSettingsInput {
  fontFamilyId: string;
  fontFamilyEn: string;
  fontFamilyZh: string;
}

const LATIN_FONT_VALUES = new Set(LATIN_FONT_OPTIONS.map((o) => o.value));
const CJK_FONT_VALUES = new Set(CJK_FONT_OPTIONS.map((o) => o.value));

/* Font teks WEBSITE PUBLIK per bahasa (tab Font) — lihat FONT_OPTIONS di
 * src/lib/fonts.ts. Revalidate "/", "layout" krn dipakai (public)/layout.tsx
 * di semua halaman publik, bukan cuma /admin/settings. */
export async function updateFontSettingsAction(data: FontSettingsInput): Promise<ActionResult> {
  try {
    await requireSettingsEditor();
    if (!LATIN_FONT_VALUES.has(data.fontFamilyId)) {
      return { ok: false, message: "Font Bahasa Indonesia tidak valid." };
    }
    if (!LATIN_FONT_VALUES.has(data.fontFamilyEn)) {
      return { ok: false, message: "Font English tidak valid." };
    }
    if (!CJK_FONT_VALUES.has(data.fontFamilyZh)) {
      return { ok: false, message: "Font 中文 tidak valid." };
    }
    await prisma.settings.update({
      where: { id: "1" },
      data: {
        fontFamilyId: data.fontFamilyId,
        fontFamilyEn: data.fontFamilyEn,
        fontFamilyZh: data.fontFamilyZh,
      },
    });
    revalidatePath("/admin/settings");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan pengaturan font.") };
  }
}

export async function saveBrandingSettingsAction(formData: FormData): Promise<BrandingActionResult> {
  try {
    await requireSettingsEditor();

    const settings = await prisma.settings.findUnique({ where: { id: "1" } });
    const logoFile = formData.get("appLogo") as File | null;
    const faviconFile = formData.get("favicon") as File | null;
    const resetLogo = formData.get("resetLogo") === "true";
    const resetFavicon = formData.get("resetFavicon") === "true";

    let nextLogoUrl = settings?.appLogoUrl ?? null;
    let nextFaviconUrl = settings?.faviconUrl ?? null;

    // Urutan: simpan file baru & commit ke DB DULU, baru hapus file lama —
    // kalau ada langkah yg gagal di tengah, Settings tetap konsisten sama
    // file yg beneran ada di disk (gak ada window Settings nunjuk ke file
    // yg udah kehapus).
    if (logoFile && logoFile.size > 0) {
      const savedUrl = await saveBrandAssetFile(logoFile, "logo");
      await prisma.settings.update({ where: { id: "1" }, data: { appLogoUrl: savedUrl } });
      await deleteBrandAssetFile(settings?.appLogoUrl);
      clearBrandingCache();
      nextLogoUrl = savedUrl;
    } else if (resetLogo) {
      await prisma.settings.update({ where: { id: "1" }, data: { appLogoUrl: null } });
      await deleteBrandAssetFile(settings?.appLogoUrl);
      clearBrandingCache();
      nextLogoUrl = null;
    }

    if (faviconFile && faviconFile.size > 0) {
      const savedUrl = await saveBrandAssetFile(faviconFile, "favicon");
      await prisma.settings.update({ where: { id: "1" }, data: { faviconUrl: savedUrl } });
      await deleteBrandAssetFile(settings?.faviconUrl);
      clearBrandingCache();
      nextFaviconUrl = savedUrl;
    } else if (resetFavicon) {
      await prisma.settings.update({ where: { id: "1" }, data: { faviconUrl: null } });
      await deleteBrandAssetFile(settings?.faviconUrl);
      clearBrandingCache();
      nextFaviconUrl = null;
    }

    revalidatePath("/admin/settings");
    revalidatePath("/");
    revalidatePath("/admin/login");
    return { ok: true, appLogoUrl: nextLogoUrl, faviconUrl: nextFaviconUrl };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal mengubah logo aplikasi.") };
  }
}
