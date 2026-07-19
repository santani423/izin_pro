import { requirePanelAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import KlienManager from "./KlienManager";

/* ─── Halaman Manajemen Klien / Partner Admin (BARU, gak ada mock referensi) ───
 * Server Component: cek role (Author gak boleh) + fetch Partner+logoMedia
 * asli dari Prisma, serahkan interaksi ke KlienManager (client). */
export default async function AdminKlienPage({
  params,
}: {
  params: Promise<{ panel: string }>;
}) {
  const { panel } = await params;
  await requirePanelAccess(panel, "/klien");

  const partners = await prisma.partner.findMany({
    where: { deletedAt: null },
    include: {
      logoMedia: true,
      createdBy: { select: { name: true } },
      updatedBy: { select: { name: true } },
    },
    orderBy: { sortOrder: "asc" },
  });

  return <KlienManager initialPartners={partners} />;
}
