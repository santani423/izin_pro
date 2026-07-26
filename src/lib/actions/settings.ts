"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { clearBrandingCache, saveBrandAssetFile, deleteBrandAssetFile } from "@/lib/branding";
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
