import { requirePanelAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import AboutPageEditor from "./AboutPageEditor";

/* ─── Halaman Kelola Konten Tentang Kami (admin) ───
 * Server Component: cek akses (AUTHOR gak boleh) lalu baca AboutPageContent
 * (singleton id "1", selalu ada dari seed/migration) buat form editor. */
export default async function AdminTentangKamiPage({
  params,
}: {
  params: Promise<{ panel: string }>;
}) {
  const { panel } = await params;
  await requirePanelAccess(panel, "/tentang-kami");

  const content = await prisma.aboutPageContent.findUniqueOrThrow({ where: { id: "1" } });
  const teamCount = await prisma.teamMember.count({ where: { deletedAt: null } });

  return <AboutPageEditor content={content} teamCount={teamCount} panel={panel} />;
}
