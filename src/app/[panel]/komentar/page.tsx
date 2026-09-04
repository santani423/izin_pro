import { requirePanelAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import KomentarPageClient from "./KomentarPageClient";

/* ─── Halaman Manajemen Komentar Admin ───
 * Server Component: cek role lalu fetch SEMUA Comment (lintas artikel) dari
 * Prisma, beda dari panel Statistik per-artikel di /admin/blog yang cuma
 * nampilin komentar 1 artikel. AUTHOR (gaya WordPress) cuma boleh lihat &
 * kelola komentar di artikel miliknya sendiri, sama pola dgn /admin/blog. */
export default async function AdminKomentarPage({
  params,
}: {
  params: Promise<{ panel: string }>;
}) {
  const { panel } = await params;
  const { session, role } = await requirePanelAccess(panel, "/komentar");

  const comments = await prisma.comment.findMany({
    where: role === "AUTHOR" ? { post: { authorId: session.user.id } } : {},
    include: { post: { select: { title: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });

  return <KomentarPageClient initialComments={comments} />;
}
