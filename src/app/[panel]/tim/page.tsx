import { requirePanelAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import TimPageClient from "./TimPageClient";

/* ─── Halaman Tim Admin ───
 * Server Component: cek role (Author gak boleh akses) lalu baca TeamMember
 * dari Prisma (dulu mock React state, sekarang tersambung beneran). */
export default async function AdminTimPage({
  params,
}: {
  params: Promise<{ panel: string }>;
}) {
  const { panel } = await params;
  await requirePanelAccess(panel, "/tim");

  const members = await prisma.teamMember.findMany({
    where: { deletedAt: null },
    include: { photoMedia: { select: { url: true } } },
    orderBy: { sortOrder: "asc" },
  });

  return <TimPageClient members={members} />;
}
