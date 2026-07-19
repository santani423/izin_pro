import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canAccessAdminRoute, visibleUserRoles } from "@/lib/permissions";
import type { Role } from "@prisma/client";
import UsersManager from "./UsersManager";

/* ─── Halaman Manajemen Pengguna & Role Admin ───
 * Server Component: cek role (cuma Super Admin/Admin yg boleh) + fetch data
 * pengguna asli dari Prisma, lalu serahkan interaksi ke UsersManager (client). */
export default async function AdminUsersPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const role = session?.user.role as Role | undefined;

  if (!session || !role || !canAccessAdminRoute(role, "/admin/users")) {
    redirect("/admin/dashboard");
  }

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
