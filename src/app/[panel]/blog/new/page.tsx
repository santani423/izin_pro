import { requirePanelAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import BlogFormPageClient from "../BlogFormPageClient";

/* ─── Halaman Artikel Baru — cek akses ke rute INDUK "/blog",
 * bukan pathname literal ini, krn canAccessAdminRoute cuma lookup key
 * persis & default-allow kalau key gak terdaftar. ─── */
export default async function AdminBlogNewPage({
  params,
}: {
  params: Promise<{ panel: string }>;
}) {
  const { panel } = await params;
  await requirePanelAccess(panel, "/blog");

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return <BlogFormPageClient mode="create" categories={categories} panel={panel} />;
}
