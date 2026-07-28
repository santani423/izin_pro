import { notFound } from "next/navigation";
import { requirePanelAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import LayananDetailEditor from "../../LayananDetailEditor";

/* ─── Halaman Kelola Konten Detail Layanan (admin) ───
 * Server Component: cek akses (sama kayak /layanan) lalu baca Service
 * lengkap (detailContent + packages + FAQ khusus service ini) buat
 * form editor. */
export default async function AdminLayananDetailEditPage({
  params,
}: {
  params: Promise<{ panel: string; id: string }>;
}) {
  const { panel, id } = await params;
  await requirePanelAccess(panel, "/layanan");

  const service = await prisma.service.findUnique({
    where: { id },
    include: {
      featuredMedia: { select: { id: true, url: true } },
      packages: { orderBy: { sortOrder: "asc" } },
      faqs: { where: { scope: "SERVICE" }, orderBy: { sortOrder: "asc" } },
    },
  });
  if (!service || service.deletedAt) notFound();

  // Prisma Decimal bukan plain object — gak bisa lolos batas Server -> Client
  // Component, harus dikonversi ke number dulu di sini.
  const plainService = {
    ...service,
    packages: service.packages.map((pkg) => ({
      ...pkg,
      price: pkg.price.toNumber(),
      originalPrice: pkg.originalPrice ? pkg.originalPrice.toNumber() : null,
    })),
  };

  return <LayananDetailEditor service={plainService} panel={panel} />;
}
