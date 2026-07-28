import { requirePanelAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import CtaBannerPageClient from "./CtaBannerPageClient";

/* ─── Halaman CTA Banner Admin ───
 * Server Component: cek role (Author gak boleh akses) lalu baca semua
 * Cta (termasuk baris default location=null) langsung dari Prisma. */
export default async function AdminCtaBannerPage({
  params,
}: {
  params: Promise<{ panel: string }>;
}) {
  const { panel } = await params;
  await requirePanelAccess(panel, "/cta-banner");

  const ctas = await prisma.cta.findMany({ orderBy: { createdAt: "asc" } });

  return <CtaBannerPageClient initialCtas={ctas} />;
}
