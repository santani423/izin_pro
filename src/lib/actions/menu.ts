"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidateAdminPaths } from "@/lib/admin-guard";
import type { Role } from "@prisma/client";

export type ActionResult = { ok: true } | { ok: false; message: string };

const CONTENT_EDITOR_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "EDITOR"];

async function requireContentEditor() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !CONTENT_EDITOR_ROLES.includes(session.user.role as Role)) {
    throw new Error("Anda tidak punya akses ke halaman ini.");
  }
  return session;
}

function errorMessage(e: unknown, fallback: string) {
  return e instanceof Error ? e.message : fallback;
}

/* Navbar & Footer baca Menu ini langsung dari Prisma di dalam
 * src/app/(public)/layout.tsx (Navbar) & Footer.tsx sendiri — layout itu
 * dipakai SEMUA halaman publik, jadi revalidate type "layout" (bukan cuma
 * "/" doang) supaya ke-refresh di semua halaman, bukan cuma homepage. */
function revalidateMenuConsumers() {
  revalidateAdminPaths("/menu");
  revalidatePath("/", "layout");
}

export async function createMenuItemAction(
  menuKey: "header" | "footer",
  data: { label: string; href: string; labelEn?: string | null; labelZh?: string | null; parentId?: string | null },
): Promise<ActionResult> {
  try {
    const session = await requireContentEditor();
    if (!data.label.trim() || !data.href.trim()) {
      return { ok: false, message: "Label dan URL wajib diisi." };
    }
    const menu = await prisma.menu.findUnique({ where: { key: menuKey } });
    if (!menu) return { ok: false, message: "Menu tidak ditemukan." };

    const parentId = data.parentId ?? null;
    const count = await prisma.menuItem.count({
      where: { menuId: menu.id, parentId, deletedAt: null },
    });
    await prisma.menuItem.create({
      data: {
        menuId: menu.id,
        parentId,
        label: data.label.trim(),
        labelEn: data.labelEn?.trim() || null,
        labelZh: data.labelZh?.trim() || null,
        href: data.href.trim(),
        sortOrder: count,
        createdById: session.user.id,
        updatedById: session.user.id,
      },
    });
    revalidateMenuConsumers();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menambahkan menu.") };
  }
}

export async function updateMenuItemAction(
  id: string,
  data: { label: string; href: string; labelEn?: string | null; labelZh?: string | null },
): Promise<ActionResult> {
  try {
    const session = await requireContentEditor();
    if (!data.label.trim() || !data.href.trim()) {
      return { ok: false, message: "Label dan URL wajib diisi." };
    }
    await prisma.menuItem.update({
      where: { id },
      data: {
        label: data.label.trim(),
        labelEn: data.labelEn?.trim() || null,
        labelZh: data.labelZh?.trim() || null,
        href: data.href.trim(),
        updatedById: session.user.id,
      },
    });
    revalidateMenuConsumers();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal memperbarui menu.") };
  }
}

/** Soft delete — item & seluruh submenu-nya ditandai deletedAt, bukan
 * dihapus permanen dari DB. */
export async function deleteMenuItemAction(id: string): Promise<ActionResult> {
  try {
    const session = await requireContentEditor();
    await prisma.menuItem.updateMany({
      where: { parentId: id },
      data: { deletedAt: new Date(), deletedById: session.user.id, updatedById: session.user.id },
    });
    await prisma.menuItem.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById: session.user.id, updatedById: session.user.id },
    });
    revalidateMenuConsumers();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menghapus menu.") };
  }
}

export async function moveMenuItemAction(
  id: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  try {
    const session = await requireContentEditor();
    const item = await prisma.menuItem.findUnique({ where: { id } });
    if (!item) return { ok: false, message: "Menu tidak ditemukan." };

    const siblings = await prisma.menuItem.findMany({
      where: { menuId: item.menuId, parentId: item.parentId, deletedAt: null },
      orderBy: { sortOrder: "asc" },
    });
    const index = siblings.findIndex((s) => s.id === id);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= siblings.length) {
      return { ok: true }; // sudah di ujung, gak ada yg perlu ditukar
    }
    const other = siblings[swapIndex];

    await prisma.$transaction([
      prisma.menuItem.update({
        where: { id: item.id },
        data: { sortOrder: other.sortOrder, updatedById: session.user.id },
      }),
      prisma.menuItem.update({
        where: { id: other.id },
        data: { sortOrder: item.sortOrder, updatedById: session.user.id },
      }),
    ]);
    revalidateMenuConsumers();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal memindahkan urutan menu.") };
  }
}
