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
  await requirePanelAccess(panel, "/blog");

  const posts = await prisma.blogPost.findMany({
    where: { deletedAt: null },
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
