import { requirePanelAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import FaqPageClient from "./FaqPageClient";

/* ─── Halaman FAQ Admin ───
 * Server Component: cek role (Author gak boleh akses) lalu baca Faq
 * (semua scope: GLOBAL/KONTAK/SERVICE) + daftar Service (utk picker scope
 * Service) langsung dari Prisma. */
export default async function AdminFaqPage({
  params,
}: {
  params: Promise<{ panel: string }>;
}) {
  const { panel } = await params;
  await requirePanelAccess(panel, "/faq");

  const [faqs, services] = await Promise.all([
    prisma.faq.findMany({
      include: { service: { select: { title: true } } },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.service.findMany({
      where: { deletedAt: null },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);

  return <FaqPageClient initialFaqs={faqs} services={services} />;
}
