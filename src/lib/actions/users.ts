"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canManageUser, visibleUserRoles } from "@/lib/permissions";
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
    const session = await requireAdmin();
    if (!visibleUserRoles(session.user.role as Role).includes(data.role)) {
      return { ok: false, message: "Anda tidak punya izin membuat pengguna dengan role ini." };
    }
    const result = await auth.api.signUpEmail({
      body: { email: data.email, password: data.password, name: data.name },
    });
    await prisma.user.update({
      where: { id: result.user.id },
      data: {
        phone: data.phone || null,
        role: data.role,
        isActive: data.isActive,
        createdById: session.user.id,
        updatedById: session.user.id,
      },
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
    const session = await requireAdmin();
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return { ok: false, message: "Pengguna tidak ditemukan." };
    if (!canManageUser(session.user.role as Role, target.role)) {
      return { ok: false, message: "Anda tidak punya izin mengubah akun ini." };
    }
    if (!visibleUserRoles(session.user.role as Role).includes(data.role)) {
      return { ok: false, message: "Anda tidak punya izin mengubah pengguna ke role ini." };
    }
    await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        role: data.role,
        isActive: data.isActive,
        updatedById: session.user.id,
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
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return { ok: false, message: "Pengguna tidak ditemukan." };
    if (!canManageUser(session.user.role as Role, target.role)) {
      return { ok: false, message: "Anda tidak punya izin mengubah status akun ini." };
    }
    await prisma.user.update({ where: { id }, data: { isActive, updatedById: session.user.id } });
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal mengubah status pengguna.") };
  }
}

/** Soft delete — akun ditandai deletedAt & dinonaktifkan (isActive: false,
 * ikut nolak login lewat pengecekan yg sama di auth.ts), bukan dihapus
 * permanen dari DB. */
export async function deleteUserAction(id: string): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    if (session.user.id === id) {
      return { ok: false, message: "Tidak bisa menghapus akun sendiri." };
    }
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return { ok: false, message: "Pengguna tidak ditemukan." };
    if (!canManageUser(session.user.role as Role, target.role)) {
      return { ok: false, message: "Anda tidak punya izin menghapus akun ini." };
    }
    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false, updatedById: session.user.id },
    });
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menghapus pengguna.") };
  }
}
