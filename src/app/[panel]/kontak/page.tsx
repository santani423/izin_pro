import { requirePanelAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import KontakPageClient from "./KontakPageClient";

/* ─── Halaman Kelola Konten Kontak (admin) ───
 * Server Component: cek akses (AUTHOR gak boleh) lalu baca KontakPageContent
 * (singleton id "1"), serahkan ke KontakPageClient (client). FAQ (scope
 * KONTAK) dikelola terpisah di /admin/faq — cuma ditautkan dari sini. */
export default async function AdminKontakPage({
  params,
}: {
  params: Promise<{ panel: string }>;
}) {
  const { panel } = await params;
  await requirePanelAccess(panel, "/kontak");

  const [content, faqCount] = await Promise.all([
    prisma.kontakPageContent.findUniqueOrThrow({ where: { id: "1" } }),
    prisma.faq.count({ where: { scope: "KONTAK" } }),
  ]);

  return <KontakPageClient content={content} faqCount={faqCount} panel={panel} />;
}
