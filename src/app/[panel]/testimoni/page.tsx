import { requirePanelAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import TestimoniPageClient from "./TestimoniPageClient";

/* ─── Halaman Testimoni Admin ───
 * Server Component: cek role (Author gak boleh akses) + fetch testimoni &
 * kategori asli dari Prisma, lalu serahkan interaksi ke TestimoniPageClient
 * (client). */
export default async function AdminTestimoniPage({
  params,
}: {
  params: Promise<{ panel: string }>;
}) {
  const { panel } = await params;
  await requirePanelAccess(panel, "/testimoni");

  const [testimonials, categories] = await Promise.all([
    prisma.testimonial.findMany({
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

  return <TestimoniPageClient initialTestimonials={testimonials} categories={categories} />;
}
