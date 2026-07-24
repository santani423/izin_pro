import { requirePanelAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import BlogPageClient from "./BlogPageClient";

/* ─── Halaman Blog Admin (list) ─── */
export default async function AdminBlogPage({
  params,
}: {
  params: Promise<{ panel: string }>;
}) {
  const { panel } = await params;
  const { session, role } = await requirePanelAccess(panel, "/blog");

  /* AUTHOR (gaya WordPress) cuma boleh lihat & kelola artikel miliknya
   * sendiri — role lain lihat semua artikel. */
  const posts = await prisma.blogPost.findMany({
    where: {
      deletedAt: null,
      ...(role === "AUTHOR" ? { authorId: session.user.id } : {}),
    },
    include: {
      category: true,
      author: { select: { name: true } },
      featuredMedia: true,
      tags: { include: { tag: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return <BlogPageClient initialPosts={posts} panel={panel} />;
}
