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

  return <LayananDetailEditor service={service} panel={panel} />;
}
