import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { canAccessAdminRoute, getRolePanel, type AdminPanel } from "@/lib/permissions";
import type { Role } from "@prisma/client";

const ALL_PANELS: AdminPanel[] = ["admin", "editor", "author"];

/** Penjaga akses tiap halaman di src/app/[panel] — dipanggil sekali di awal
 * tiap page.tsx dengan suffix rute-nya (mis. "/blog"). Redirect ke
 * /admin/login kalau belum login, atau ke dashboard panel yg BENAR kalau
 * user nyasar ke panel/rute yang bukan haknya (mis. EDITOR buka /admin/blog
 * langsung, atau AUTHOR buka /editor/users). */
export async function requirePanelAccess(panel: string, routeSuffix: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  const role = session?.user.role as Role | undefined;

  if (!session || !role) {
    redirect("/admin/login");
  }

  const expectedPanel: AdminPanel = getRolePanel(role);
  if (panel !== expectedPanel || !canAccessAdminRoute(role, routeSuffix)) {
    redirect(`/${expectedPanel}/dashboard`);
  }

  return { session, role, panel: expectedPanel };
}

/** Server action panggil ini abis mutasi data — path yg sama bisa diakses
 * dari 3 prefix panel (/admin, /editor, /author) sekaligus, jadi revalidate
 * ketiganya biar gak ada yg nyangkut cache basi. suffix mis. "/blog". */
export function revalidateAdminPaths(suffix: string) {
  for (const panel of ALL_PANELS) {
    revalidatePath(`/${panel}${suffix}`);
  }
}
