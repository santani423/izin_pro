import { requirePanelAccess } from "@/lib/admin-guard";
import PagesPageClient from "./PagesPageClient";

/* ─── Halaman Halaman Admin ───
 * Server Component: cek role (Author gak boleh akses) lalu render konten
 * (masih mock React state, belum tersambung Prisma). */
export default async function AdminPagesPage({
  params,
}: {
  params: Promise<{ panel: string }>;
}) {
  const { panel } = await params;
  await requirePanelAccess(panel, "/pages");

  return <PagesPageClient />;
}
