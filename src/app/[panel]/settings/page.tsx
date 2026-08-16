import { requirePanelAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { DEFAULT_FONT_SLUG } from "@/lib/fonts";
import SettingsPageClient from "./SettingsPageClient";

/* ─── Halaman Pengaturan Admin ───
 * Server Component: EDITOR & AUTHOR gak boleh akses sama sekali; ADMIN boleh
 * lihat tapi view-only (gak bisa ubah/simpan); SUPER_ADMIN akses penuh.
 * Tab Kontak/Sosmed/SEO masih data mock (COMPANY_INFO) — belum disambung
 * Prisma (di luar scope). Tab Umum (Nama Perusahaan/Tagline/Deskripsi/Jam
 * Operasional, tiap-tiap ID+EN+ZH), Font, & Maintenance di bawah ini yang
 * beneran baca/simpan ke tabel Settings. */
export default async function AdminSettingsPage({
  params,
}: {
  params: Promise<{ panel: string }>;
}) {
  const { panel } = await params;
  const { role } = await requirePanelAccess(panel, "/settings");

  const settings = await prisma.settings.findUnique({ where: { id: "1" } });

  return (
    <SettingsPageClient
      readOnly={role === "ADMIN"}
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
      fontFamilyId={settings?.fontFamilyId ?? DEFAULT_FONT_SLUG.id}
      fontFamilyEn={settings?.fontFamilyEn ?? DEFAULT_FONT_SLUG.en}
      fontFamilyZh={settings?.fontFamilyZh ?? DEFAULT_FONT_SLUG.zh}
    />
  );
}
