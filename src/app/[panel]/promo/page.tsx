import { requirePanelAccess } from "@/lib/admin-guard";
import PromoPageClient from "./PromoPageClient";

/* ─── Halaman Promo Admin ───
 * Server Component: cek role (Author gak boleh akses) lalu render konten
 * (masih mock React state, belum tersambung Prisma). */
export default async function AdminPromoPage({
  params,
}: {
  params: Promise<{ panel: string }>;
}) {
  const { panel } = await params;
  await requirePanelAccess(panel, "/promo");

  return <PromoPageClient />;
}
