import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import UsersManager from "./UsersManager";

/* ─── Halaman Manajemen Pengguna & Role Admin ───
 * Server Component: cek role (cuma Super Admin/Admin yg boleh) + fetch data
 * pengguna asli dari Prisma, lalu serahkan interaksi ke UsersManager (client). */
export default async function AdminUsersPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
    redirect("/admin/dashboard");
  }

  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });

  return <UsersManager initialUsers={users} currentUserId={session.user.id} />;
}
