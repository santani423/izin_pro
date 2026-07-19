import { requirePanelAccess } from "@/lib/admin-guard";
import FaqPageClient from "./FaqPageClient";

/* ─── Halaman FAQ Admin ───
 * Server Component: cek role (Author gak boleh akses) lalu render konten
 * (masih mock React state, belum tersambung Prisma). */
export default async function AdminFaqPage({
  params,
}: {
  params: Promise<{ panel: string }>;
}) {
  const { panel } = await params;
  await requirePanelAccess(panel, "/faq");

  return <FaqPageClient />;
}
