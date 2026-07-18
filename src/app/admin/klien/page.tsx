import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canAccessAdminRoute } from "@/lib/permissions";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import KlienManager from "./KlienManager";

/* ─── Halaman Manajemen Klien / Partner Admin (BARU, gak ada mock referensi) ───
 * Server Component: cek role (Author gak boleh) + fetch Partner+logoMedia
 * asli dari Prisma, serahkan interaksi ke KlienManager (client). */
export default async function AdminKlienPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !canAccessAdminRoute(session.user.role as Role, "/admin/klien")) {
    redirect("/admin/dashboard");
  }

  const partners = await prisma.partner.findMany({
    where: { deletedAt: null },
    include: {
      logoMedia: true,
      createdBy: { select: { name: true } },
      updatedBy: { select: { name: true } },
    },
    orderBy: { sortOrder: "asc" },
  });

  return <KlienManager initialPartners={partners} />;
}
