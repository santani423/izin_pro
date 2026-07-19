import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canAccessAdminRoute } from "@/lib/permissions";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import BlogFormPageClient from "../BlogFormPageClient";

/* ─── Halaman Artikel Baru — cek akses ke rute INDUK "/admin/blog",
 * bukan pathname literal ini, krn canAccessAdminRoute cuma lookup key
 * persis & default-allow kalau key gak terdaftar. ─── */
export default async function AdminBlogNewPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !canAccessAdminRoute(session.user.role as Role, "/admin/blog")) {
    redirect("/admin/dashboard");
  }

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return <BlogFormPageClient mode="create" categories={categories} />;
}
