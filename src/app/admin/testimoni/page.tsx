import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canAccessAdminRoute } from "@/lib/permissions";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import TestimoniPageClient from "./TestimoniPageClient";

/* ─── Halaman Testimoni Admin ───
 * Server Component: cek role (Author gak boleh akses) + fetch testimoni &
 * kategori asli dari Prisma, lalu serahkan interaksi ke TestimoniPageClient
 * (client). */
export default async function AdminTestimoniPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !canAccessAdminRoute(session.user.role as Role, "/admin/testimoni")) {
    redirect("/admin/dashboard");
  }

  const [testimonials, categories] = await Promise.all([
    prisma.testimonial.findMany({
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

  return <TestimoniPageClient initialTestimonials={testimonials} categories={categories} />;
}
