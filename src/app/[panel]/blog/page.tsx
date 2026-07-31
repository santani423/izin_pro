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
  const [posts, bannerContent] = await Promise.all([
    prisma.blogPost.findMany({
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
    }),
    prisma.blogPageContent.findUniqueOrThrow({ where: { id: "1" } }),
  ]);

  /* Jumlah komentar PENDING per artikel, buat badge tombol Statistik —
   * query terpisah (bukan filtered _count relasi) spy gak gantung versi
   * fitur Prisma tertentu. */
  const pendingRows = await prisma.comment.groupBy({
    by: ["postId"],
    where: { postId: { in: posts.map((p) => p.id) }, status: "PENDING" },
    _count: { _all: true },
  });
  const pendingCommentCounts = Object.fromEntries(
    pendingRows.map((r) => [r.postId, r._count._all]),
  );

  return (
    <BlogPageClient
      initialPosts={posts}
      panel={panel}
      role={role}
      bannerContent={bannerContent}
      pendingCommentCounts={pendingCommentCounts}
    />
  );
}
