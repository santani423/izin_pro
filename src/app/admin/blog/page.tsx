import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canAccessAdminRoute } from "@/lib/permissions";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import BlogPageClient from "./BlogPageClient";

/* ─── Halaman Blog Admin (list) ─── */
export default async function AdminBlogPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !canAccessAdminRoute(session.user.role as Role, "/admin/blog")) {
    redirect("/admin/dashboard");
  }

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

  return <BlogPageClient initialPosts={posts} />;
}
