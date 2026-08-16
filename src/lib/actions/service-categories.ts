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

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function revalidateCategories() {
  revalidateAdminPaths("/layanan");
  revalidatePath("/");
  revalidatePath("/layanan");
}

export interface ServiceCategoryLangData {
  name: string;
  description: string | null;
}

export interface ServiceCategoryFormData {
  icon: string | null;
  id: ServiceCategoryLangData;
  en: ServiceCategoryLangData;
  zh: ServiceCategoryLangData;
}

export async function createServiceCategoryAction(data: ServiceCategoryFormData): Promise<ActionResult> {
  try {
    const session = await requireContentEditor();
    if (!data.id.name.trim()) return { ok: false, message: "Nama kategori (Bahasa Indonesia) wajib diisi." };

    const count = await prisma.serviceCategory.count();
    await prisma.serviceCategory.create({
      data: {
        slug: slugify(data.id.name),
        name: data.id.name.trim(),
        icon: data.icon,
        description: data.id.description,
        nameEn: data.en.name.trim() || null,
        descriptionEn: data.en.description,
        nameZh: data.zh.name.trim() || null,
        descriptionZh: data.zh.description,
        sortOrder: count,
        createdById: session.user.id,
        updatedById: session.user.id,
      },
    });
    revalidateCategories();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menambahkan kategori.") };
  }
}

export async function updateServiceCategoryAction(
  id: string,
  data: ServiceCategoryFormData,
): Promise<ActionResult> {
  try {
    const session = await requireContentEditor();
    if (!data.id.name.trim()) return { ok: false, message: "Nama kategori (Bahasa Indonesia) wajib diisi." };

    await prisma.serviceCategory.update({
      where: { id },
      data: {
        slug: slugify(data.id.name),
        name: data.id.name.trim(),
        icon: data.icon,
        description: data.id.description,
        nameEn: data.en.name.trim() || null,
        descriptionEn: data.en.description,
        nameZh: data.zh.name.trim() || null,
        descriptionZh: data.zh.description,
        updatedById: session.user.id,
      },
    });
    revalidateCategories();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal memperbarui kategori.") };
  }
}

export async function toggleServiceCategoryActiveAction(id: string, isActive: boolean): Promise<ActionResult> {
  try {
    const session = await requireContentEditor();
    await prisma.serviceCategory.update({ where: { id }, data: { isActive, updatedById: session.user.id } });
    revalidateCategories();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal mengubah status kategori.") };
  }
}

/** Gagal kalau kategori masih dipakai minimal 1 layanan — daripada
 * layanan jadi yatim (categoryId wajib/non-null di schema Service). */
export async function deleteServiceCategoryAction(id: string): Promise<ActionResult> {
  try {
    await requireContentEditor();
    const usageCount = await prisma.service.count({ where: { categoryId: id } });
    if (usageCount > 0) {
      return { ok: false, message: `Kategori masih dipakai ${usageCount} layanan, pindahkan dulu layanan tsb.` };
    }
    await prisma.serviceCategory.delete({ where: { id } });
    revalidateCategories();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menghapus kategori.") };
  }
}

export async function reorderServiceCategoriesAction(orderedIds: string[]): Promise<ActionResult> {
  try {
    const session = await requireContentEditor();
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.serviceCategory.update({
          where: { id },
          data: { sortOrder: index, updatedById: session.user.id },
        }),
      ),
    );
    revalidateCategories();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal mengubah urutan kategori.") };
  }
}
