import { requirePanelAccess } from "@/lib/admin-guard";
import SettingsPageClient from "./SettingsPageClient";

/* ─── Halaman Pengaturan Admin ───
 * Server Component: EDITOR & AUTHOR gak boleh akses sama sekali; ADMIN boleh
 * lihat tapi view-only (gak bisa ubah/simpan); SUPER_ADMIN akses penuh. */
export default async function AdminSettingsPage({
  params,
}: {
  params: Promise<{ panel: string }>;
}) {
  const { panel } = await params;
  const { role } = await requirePanelAccess(panel, "/settings");

  return <SettingsPageClient readOnly={role === "ADMIN"} />;
}
