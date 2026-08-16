"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidateAdminPaths } from "@/lib/admin-guard";
import { Prisma } from "@prisma/client";
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

export interface ServicePackageLangData {
  name: string;
  features: string[];
}

export interface ServicePackageFormData {
  price: number;
  originalPrice: number | null;
  isPopular: boolean;
  estimatedDurationLabel: string | null;
  isActive: boolean;
  id: ServicePackageLangData;
  en: ServicePackageLangData;
  zh: ServicePackageLangData;
}

function stringArrayOrNull(arr: string[]): string[] | null {
  const cleaned = arr.map((s) => s.trim()).filter(Boolean);
  return cleaned.length === 0 ? null : cleaned;
}

async function revalidateForService(serviceId: string) {
  const service = await prisma.service.findUnique({ where: { id: serviceId }, select: { slug: true } });
  revalidateAdminPaths("/layanan");
  if (service) revalidatePath(`/layanan/${service.slug}`);
}

export async function createServicePackageAction(
  serviceId: string,
  data: ServicePackageFormData,
): Promise<ActionResult> {
  try {
    await requireContentEditor();
    if (!data.id.name.trim()) return { ok: false, message: "Nama paket (Bahasa Indonesia) wajib diisi." };
    if (data.price <= 0) return { ok: false, message: "Harga paket harus lebih dari 0." };

    const count = await prisma.servicePackage.count({ where: { serviceId } });
    await prisma.servicePackage.create({
      data: {
        serviceId,
        name: data.id.name.trim(),
        features: data.id.features.filter(Boolean),
        nameEn: data.en.name.trim() || null,
        featuresEn: stringArrayOrNull(data.en.features) ?? Prisma.DbNull,
        nameZh: data.zh.name.trim() || null,
        featuresZh: stringArrayOrNull(data.zh.features) ?? Prisma.DbNull,
        price: data.price,
        originalPrice: data.originalPrice,
        isPopular: data.isPopular,
        estimatedDurationLabel: data.estimatedDurationLabel,
        isActive: data.isActive,
        sortOrder: count,
      },
    });
    await revalidateForService(serviceId);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menambahkan paket.") };
  }
}

export async function updateServicePackageAction(
  id: string,
  data: ServicePackageFormData,
): Promise<ActionResult> {
  try {
    await requireContentEditor();
    if (!data.id.name.trim()) return { ok: false, message: "Nama paket (Bahasa Indonesia) wajib diisi." };
    if (data.price <= 0) return { ok: false, message: "Harga paket harus lebih dari 0." };

    const pkg = await prisma.servicePackage.update({
      where: { id },
      data: {
        name: data.id.name.trim(),
        features: data.id.features.filter(Boolean),
        nameEn: data.en.name.trim() || null,
        featuresEn: stringArrayOrNull(data.en.features) ?? Prisma.DbNull,
        nameZh: data.zh.name.trim() || null,
        featuresZh: stringArrayOrNull(data.zh.features) ?? Prisma.DbNull,
        price: data.price,
        originalPrice: data.originalPrice,
        isPopular: data.isPopular,
        estimatedDurationLabel: data.estimatedDurationLabel,
        isActive: data.isActive,
      },
    });
    await revalidateForService(pkg.serviceId);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal memperbarui paket.") };
  }
}

export async function deleteServicePackageAction(id: string): Promise<ActionResult> {
  try {
    await requireContentEditor();
    const pkg = await prisma.servicePackage.delete({ where: { id } });
    await revalidateForService(pkg.serviceId);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menghapus paket.") };
  }
}

export async function reorderServicePackagesAction(
  serviceId: string,
  orderedIds: string[],
): Promise<ActionResult> {
  try {
    await requireContentEditor();
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.servicePackage.update({ where: { id }, data: { sortOrder: index } }),
      ),
    );
    await revalidateForService(serviceId);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal mengubah urutan paket.") };
  }
}
