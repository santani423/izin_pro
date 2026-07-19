import { requirePanelAccess } from "@/lib/admin-guard";
import AnalitikPageClient from "./AnalitikPageClient";

/* ─── Halaman Analitik Admin ───
 * Server Component: cek role (Author gak boleh akses) lalu render konten
 * (masih mock React state, belum tersambung Prisma). */
export default async function AdminAnalitikPage({
  params,
}: {
  params: Promise<{ panel: string }>;
}) {
  const { panel } = await params;
  await requirePanelAccess(panel, "/analitik");

  return <AnalitikPageClient />;
}
