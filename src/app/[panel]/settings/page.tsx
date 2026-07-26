import { requirePanelAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import SettingsPageClient from "./SettingsPageClient";

/* ─── Halaman Pengaturan Admin ───
 * Server Component: EDITOR & AUTHOR gak boleh akses sama sekali; ADMIN boleh
 * lihat tapi view-only (gak bisa ubah/simpan); SUPER_ADMIN akses penuh.
 * Tab Umum/Kontak/Sosmed/SEO masih data mock (COMPANY_INFO) — belum
 * disambung Prisma (di luar scope task Under Maintenance). Tab Maintenance
 * di bawah ini yang beneran baca/simpan ke tabel Settings. */
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
    />
  );
}
