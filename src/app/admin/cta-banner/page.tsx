import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canAccessAdminRoute } from "@/lib/permissions";
import type { Role } from "@prisma/client";
import CtaBannerPageClient from "./CtaBannerPageClient";

/* ─── Halaman CTA Banner Admin ───
 * Server Component: cek role (Author gak boleh akses) lalu render konten
 * (masih mock React state, belum tersambung Prisma). */
export default async function AdminCtaBannerPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !canAccessAdminRoute(session.user.role as Role, "/admin/cta-banner")) {
    redirect("/admin/dashboard");
  }

  return <CtaBannerPageClient />;
}
