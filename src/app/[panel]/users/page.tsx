import { requirePanelAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { visibleUserRoles } from "@/lib/permissions";
import UsersManager from "./UsersManager";

/* ─── Halaman Manajemen Pengguna & Role Admin ───
 * Server Component: cek role (cuma Super Admin/Admin yg boleh) + fetch data
 * pengguna asli dari Prisma, lalu serahkan interaksi ke UsersManager (client). */
export default async function AdminUsersPage({
  params,
}: {
  params: Promise<{ panel: string }>;
}) {
  const { panel } = await params;
  const { session, role } = await requirePanelAccess(panel, "/users");

  const users = await prisma.user.findMany({
    where: { deletedAt: null, role: { in: visibleUserRoles(role) } },
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: { name: true } },
      updatedBy: { select: { name: true } },
    },
  });

  return (
    <UsersManager
      initialUsers={users}
      currentUserId={session.user.id}
      currentUserRole={role}
    />
  );
}
