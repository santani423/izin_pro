import { requirePanelAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { syncStaticMediaFiles } from "@/lib/media";
import MediaPageClient from "./MediaPageClient";

/* ─── Halaman Media Library Admin ───
 * Server Component: cek role vs panel, sinkron dulu file gambar di
 * public/ yang belum tercatat di tabel Media (lihat syncStaticMediaFiles),
 * baru ambil semua file (dipakai bareng semua role — galeri terpusat,
 * bukan per-uploader). */
export default async function AdminMediaPage({
  params,
}: {
  params: Promise<{ panel: string }>;
}) {
  const { panel } = await params;
  await requirePanelAccess(panel, "/media");

  await syncStaticMediaFiles();

  const items = await prisma.media.findMany({
    include: { uploadedBy: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return <MediaPageClient initialItems={items} />;
}
