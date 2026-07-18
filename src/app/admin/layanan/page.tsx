import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canAccessAdminRoute } from "@/lib/permissions";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import LayananManager from "./LayananManager";

/* ─── Halaman Manajemen Layanan Admin ───
 * Server Component: cek role (Author gak boleh kelola Layanan) + fetch data
 * layanan & kategori asli dari Prisma, lalu serahkan interaksi ke
 * LayananManager (client). */
export default async function AdminLayananPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !canAccessAdminRoute(session.user.role as Role, "/admin/layanan")) {
    redirect("/admin/dashboard");
  }

  const [services, categories] = await Promise.all([
    prisma.service.findMany({
      where: { deletedAt: null },
      include: {
        category: true,
        createdBy: { select: { name: true } },
        updatedBy: { select: { name: true } },
      },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.serviceCategory.findMany({ orderBy: { name: "asc" } }),
  ]);

  return <LayananManager initialServices={services} categories={categories} />;
}
