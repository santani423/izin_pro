import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canAccessAdminRoute } from "@/lib/permissions";
import type { Role } from "@prisma/client";
import ProfileManager from "./ProfileManager";

/* ─── Halaman Profil Saya — bisa diakses semua role ───
 * Cuma bisa ganti nama & password, email gak bisa diubah dari sini. */
export default async function AdminProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const role = session?.user.role as Role | undefined;

  if (!session || !role || !canAccessAdminRoute(role, "/admin/profile")) {
    redirect("/admin/login");
  }

  return (
    <ProfileManager
      name={session.user.name}
      email={session.user.email}
      role={role}
      image={session.user.image ?? null}
    />
  );
}
