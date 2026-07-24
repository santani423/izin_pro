import { requirePanelAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import MediaPageClient from "./MediaPageClient";

/* ─── Halaman Media Library Admin ───
 * Server Component: cek role vs panel, lalu ambil semua file dari tabel
 * Media (dipakai bareng semua role — galeri terpusat, bukan per-uploader). */
export default async function AdminMediaPage({
  params,
}: {
  params: Promise<{ panel: string }>;
}) {
  const { panel } = await params;
  await requirePanelAccess(panel, "/media");

  const items = await prisma.media.findMany({
    include: { uploadedBy: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return <MediaPageClient initialItems={items} />;
}
