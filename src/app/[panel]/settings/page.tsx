import { requirePanelAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { DEFAULT_FONT_SLUG } from "@/lib/fonts";
import SettingsPageClient from "./SettingsPageClient";

/* ─── Halaman Pengaturan Admin ───
 * Server Component: EDITOR & AUTHOR gak boleh akses sama sekali; ADMIN &
 * SUPER_ADMIN sama-sama akses penuh (lihat + ubah/simpan).
 * Tab SEO masih data mock (COMPANY_INFO) — belum disambung Prisma (di luar
 * scope). Tab Umum, Font, Kontak (WhatsApp/Email/Alamat/Maps — dipakai
 * LocationSection dkk lewat getLocalizedGeneralSettings()), Sosmed
 * (dipakai Footer lewat getLocalizedGeneralSettings()), & Maintenance di
 * bawah ini yang beneran baca/simpan ke tabel Settings. */
export default async function AdminSettingsPage({
  params,
}: {
  params: Promise<{ panel: string }>;
}) {
  const { panel } = await params;
  await requirePanelAccess(panel, "/settings");

  const settings = await prisma.settings.findUnique({ where: { id: "1" } });

  return (
    <SettingsPageClient
      maintenanceMode={settings?.maintenanceMode ?? false}
      maintenanceMessage={settings?.maintenanceMessage ?? ""}
      appLogoUrl={settings?.appLogoUrl ?? null}
      faviconUrl={settings?.faviconUrl ?? null}
      whacenterDeviceId={settings?.whacenterDeviceId ?? ""}
      defaultLocale={(settings?.defaultLocale as "id" | "en" | "zh" | undefined) ?? "id"}
      companyName={settings?.companyName ?? ""}
      companyNameEn={settings?.companyNameEn ?? ""}
      companyNameZh={settings?.companyNameZh ?? ""}
      tagline={settings?.tagline ?? ""}
      taglineEn={settings?.taglineEn ?? ""}
      taglineZh={settings?.taglineZh ?? ""}
      description={settings?.description ?? ""}
      descriptionEn={settings?.descriptionEn ?? ""}
      descriptionZh={settings?.descriptionZh ?? ""}
      operatingHours={settings?.operatingHours ?? ""}
      operatingHoursEn={settings?.operatingHoursEn ?? ""}
      operatingHoursZh={settings?.operatingHoursZh ?? ""}
      whatsapp={settings?.whatsapp ?? ""}
      email={settings?.email ?? ""}
      address={settings?.address ?? ""}
      mapsUrl={settings?.mapsUrl ?? ""}
      mapsEmbedUrl={settings?.mapsEmbedUrl ?? ""}
      fontFamilyId={settings?.fontFamilyId ?? DEFAULT_FONT_SLUG.id}
      fontFamilyEn={settings?.fontFamilyEn ?? DEFAULT_FONT_SLUG.en}
      fontFamilyZh={settings?.fontFamilyZh ?? DEFAULT_FONT_SLUG.zh}
      socialLinkedin={settings?.socialLinkedin ?? ""}
      socialFacebook={settings?.socialFacebook ?? ""}
      socialInstagram={settings?.socialInstagram ?? ""}
      socialX={settings?.socialX ?? ""}
      socialYoutube={settings?.socialYoutube ?? ""}
    />
  );
}
