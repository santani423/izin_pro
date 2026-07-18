"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { Role } from "@prisma/client";

export type ActionResult = { ok: true } | { ok: false; message: string };

const ADMIN_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN"];

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !ADMIN_ROLES.includes(session.user.role as Role)) {
    throw new Error("Anda tidak punya akses ke halaman ini.");
  }
  return session;
}

function errorMessage(e: unknown, fallback: string) {
  return e instanceof Error ? e.message : fallback;
}

export async function createUserAction(data: {
  name: string;
  email: string;
  phone: string;
  role: Role;
  isActive: boolean;
  password: string;
}): Promise<ActionResult> {
  try {
    await requireAdmin();
    const result = await auth.api.signUpEmail({
      body: { email: data.email, password: data.password, name: data.name },
    });
    await prisma.user.update({
      where: { id: result.user.id },
      data: { phone: data.phone || null, role: data.role, isActive: data.isActive },
    });
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menambahkan pengguna.") };
  }
}

export async function updateUserAction(
  id: string,
  data: { name: string; email: string; phone: string; role: Role; isActive: boolean },
): Promise<ActionResult> {
  try {
    await requireAdmin();
    await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        role: data.role,
        isActive: data.isActive,
      },
    });
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal memperbarui pengguna.") };
  }
}

export async function toggleUserActiveAction(id: string, isActive: boolean): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    if (session.user.id === id) {
      return { ok: false, message: "Tidak bisa menonaktifkan akun sendiri." };
    }
    await prisma.user.update({ where: { id }, data: { isActive } });
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal mengubah status pengguna.") };
  }
}

export async function deleteUserAction(id: string): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    if (session.user.id === id) {
      return { ok: false, message: "Tidak bisa menghapus akun sendiri." };
    }
    await prisma.user.delete({ where: { id } });
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menghapus pengguna.") };
  }
}
