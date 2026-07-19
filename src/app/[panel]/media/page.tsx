import { requirePanelAccess } from "@/lib/admin-guard";
import MediaPageClient from "./MediaPageClient";

/* ─── Halaman Media Library Admin ───
 * Server Component: cek role vs panel, lalu render konten (masih mock
 * React state, belum tersambung Prisma). */
export default async function AdminMediaPage({
  params,
}: {
  params: Promise<{ panel: string }>;
}) {
  const { panel } = await params;
  await requirePanelAccess(panel, "/media");

  return <MediaPageClient />;
}
