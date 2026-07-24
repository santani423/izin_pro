import { notFound } from "next/navigation";
import { requirePanelAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import BlogFormPageClient from "../../BlogFormPageClient";

/* ─── Halaman Edit Artikel — pakai slug (bukan id) di URL biar rapi &
 * gampang dibaca. Cek akses ke rute INDUK "/blog" (lihat catatan
 * yg sama di new/page.tsx). ─── */
export default async function AdminBlogEditPage({
  params,
}: {
  params: Promise<{ panel: string; slug: string }>;
}) {
  const { panel, slug } = await params;
  const { session, role } = await requirePanelAccess(panel, "/blog");

  const [post, categories] = await Promise.all([
    prisma.blogPost.findUnique({
      where: { slug },
      include: {
        category: true,
        featuredMedia: { select: { id: true, url: true } },
        tags: { include: { tag: true } },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!post || post.deletedAt) notFound();
  /* AUTHOR nyoba buka URL edit artikel penulis lain langsung -> 404,
   * bukan cuma disembunyikan dari list (lihat blog.ts: assertOwnsPost). */
  if (role === "AUTHOR" && post.authorId !== session.user.id) notFound();

  return <BlogFormPageClient mode="edit" categories={categories} post={post} panel={panel} />;
}
