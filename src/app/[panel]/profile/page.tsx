import { requirePanelAccess } from "@/lib/admin-guard";
import ProfileManager from "./ProfileManager";

/* ─── Halaman Profil Saya — bisa diakses semua role ───
 * Cuma bisa ganti nama & password, email gak bisa diubah dari sini. */
export default async function AdminProfilePage({
  params,
}: {
  params: Promise<{ panel: string }>;
}) {
  const { panel } = await params;
  const { session, role } = await requirePanelAccess(panel, "/profile");

  return (
    <ProfileManager
      name={session.user.name}
      email={session.user.email}
      role={role}
      image={session.user.image ?? null}
    />
  );
}
