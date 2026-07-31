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
        featuredMedia: { select: { id: true, url: true } },
        createdBy: { select: { name: true } },
        updatedBy: { select: { name: true } },
      },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.serviceCategory.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  // Prisma Decimal bukan plain object — gak bisa lolos batas Server -> Client
  // Component, harus dikonversi ke number dulu (sama pola dgn PromoPageClient).
  const servicesForClient = services.map((s) => ({
    ...s,
    basePrice: s.basePrice ? s.basePrice.toNumber() : null,
  }));

  return <LayananManager initialServices={servicesForClient} categories={categories} />;
}
