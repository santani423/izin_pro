import { requirePanelAccess } from "@/lib/admin-guard";
import CtaBannerPageClient from "./CtaBannerPageClient";

/* ─── Halaman CTA Banner Admin ───
 * Server Component: cek role (Author gak boleh akses) lalu render konten
 * (masih mock React state, belum tersambung Prisma). */
export default async function AdminCtaBannerPage({
  params,
}: {
  params: Promise<{ panel: string }>;
}) {
  const { panel } = await params;
  await requirePanelAccess(panel, "/cta-banner");

  return <CtaBannerPageClient />;
}
