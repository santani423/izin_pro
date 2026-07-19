import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { canAccessAdminRoute } from "@/lib/permissions";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import BlogFormPageClient from "../../BlogFormPageClient";

/* ─── Halaman Edit Artikel — pakai slug (bukan id) di URL biar rapi &
 * gampang dibaca. Cek akses ke rute INDUK "/admin/blog" (lihat catatan
 * yg sama di baru/page.tsx). ─── */
export default async function AdminBlogEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !canAccessAdminRoute(session.user.role as Role, "/admin/blog")) {
    redirect("/admin/dashboard");
  }

  const { slug } = await params;

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

  return <BlogFormPageClient mode="edit" categories={categories} post={post} />;
}
