"use server";

import { headers } from "next/headers";
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

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export interface ServiceFormData {
  title: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  categoryId: string;
  features: string[];
}

export async function createServiceAction(data: ServiceFormData): Promise<ActionResult> {
  try {
    const session = await requireContentEditor();
    const count = await prisma.service.count();
    await prisma.service.create({
      data: {
        slug: slugify(data.title),
        title: data.title,
        description: data.description,
        icon: data.icon,
        color: data.color,
        bgColor: data.bgColor,
        categoryId: data.categoryId,
        features: data.features,
        sortOrder: count,
        createdById: session.user.id,
        updatedById: session.user.id,
      },
    });
    revalidateAdminPaths("/layanan");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menambahkan layanan.") };
  }
}

export async function updateServiceAction(id: string, data: ServiceFormData): Promise<ActionResult> {
  try {
    const session = await requireContentEditor();
    await prisma.service.update({
      where: { id },
      data: {
        slug: slugify(data.title),
        title: data.title,
        description: data.description,
        icon: data.icon,
        color: data.color,
        bgColor: data.bgColor,
        categoryId: data.categoryId,
        features: data.features,
        updatedById: session.user.id,
      },
    });
    revalidateAdminPaths("/layanan");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal memperbarui layanan.") };
  }
}

export async function toggleServiceActiveAction(id: string, isActive: boolean): Promise<ActionResult> {
  try {
    const session = await requireContentEditor();
    await prisma.service.update({ where: { id }, data: { isActive, updatedById: session.user.id } });
    revalidateAdminPaths("/layanan");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal mengubah status layanan.") };
  }
}

/** Soft delete — sesuai keputusan desain schema (Service punya deletedAt). */
export async function deleteServiceAction(id: string): Promise<ActionResult> {
  try {
    const session = await requireContentEditor();
    await prisma.service.update({
      where: { id },
      data: { deletedAt: new Date(), updatedById: session.user.id },
    });
    revalidateAdminPaths("/layanan");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menghapus layanan.") };
  }
}
