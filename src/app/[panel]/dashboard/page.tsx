import { requirePanelAccess } from "@/lib/admin-guard";
import DashboardPageClient from "./DashboardPageClient";

/* ─── Halaman Dashboard Admin ───
 * Server Component: cek role vs panel, lalu render konten (masih mock
 * React state, belum tersambung Prisma). */
export default async function DashboardPage({
  params,
}: {
  params: Promise<{ panel: string }>;
}) {
  const { panel } = await params;
  await requirePanelAccess(panel, "/dashboard");

  return <DashboardPageClient panel={panel} />;
}
