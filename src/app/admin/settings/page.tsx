import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canAccessAdminRoute } from "@/lib/permissions";
import type { Role } from "@prisma/client";
import SettingsPageClient from "./SettingsPageClient";

/* ─── Halaman Pengaturan Admin ───
 * Server Component: EDITOR & AUTHOR gak boleh akses sama sekali; ADMIN boleh
 * lihat tapi view-only (gak bisa ubah/simpan); SUPER_ADMIN akses penuh. */
export default async function AdminSettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const role = session?.user.role as Role | undefined;

  if (!session || !role || !canAccessAdminRoute(role, "/admin/settings")) {
    redirect("/admin/dashboard");
  }

  return <SettingsPageClient readOnly={role === "ADMIN"} />;
}
