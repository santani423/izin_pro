import { requirePanelAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import LayananManager from "./LayananManager";

/* ─── Halaman Manajemen Layanan Admin ───
 * Server Component: cek role (Author gak boleh kelola Layanan) + fetch data
 * layanan & kategori asli dari Prisma, lalu serahkan interaksi ke
 * LayananManager (client). */
export default async function AdminLayananPage({
  params,
}: {
  params: Promise<{ panel: string }>;
}) {
  const { panel } = await params;
  await requirePanelAccess(panel, "/layanan");

  const [services, categories] = await Promise.all([
    prisma.service.findMany({
      where: { deletedAt: null },
      include: {
        category: true,
        createdBy: { select: { name: true } },
        updatedBy: { select: { name: true } },
      },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.serviceCategory.findMany({ orderBy: { name: "asc" } }),
  ]);

  return <LayananManager initialServices={services} categories={categories} />;
}
