import { requirePanelAccess } from "@/lib/admin-guard";
import TimPageClient from "./TimPageClient";

/* ─── Halaman Tim Admin ───
 * Server Component: cek role (Author gak boleh akses) lalu render konten
 * (masih mock React state, belum tersambung Prisma). */
export default async function AdminTimPage({
  params,
}: {
  params: Promise<{ panel: string }>;
}) {
  const { panel } = await params;
  await requirePanelAccess(panel, "/tim");

  return <TimPageClient />;
}
