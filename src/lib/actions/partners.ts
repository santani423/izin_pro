"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import fs from "node:fs/promises";
import path from "node:path";
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

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "partners");
const MAX_LOGO_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_MIME = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

/** Upload sederhana (simpan file apa adanya) — belum ada resize/konversi WebP
 * otomatis, itu bagian Media Library + Sharp.js di v2.3.0. */
async function saveLogoFile(file: File, uploaderId: string) {
  if (!ALLOWED_MIME.includes(file.type)) {
    throw new Error("Format logo harus PNG, JPG, WebP, atau SVG.");
  }
  if (file.size > MAX_LOGO_BYTES) {
    throw new Error("Ukuran logo maksimal 2MB.");
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const ext = path.extname(file.name) || ".png";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(UPLOAD_DIR, fileName), buffer);

  return prisma.media.create({
    data: {
      fileName,
      url: `/uploads/partners/${fileName}`,
      mimeType: file.type,
      sizeBytes: file.size,
      uploadedById: uploaderId,
    },
  });
}

async function deleteMediaFile(url: string) {
  try {
    await fs.unlink(path.join(process.cwd(), "public", url));
  } catch {
    // Best-effort — file mungkin sudah gak ada, gak perlu gagalkan aksi utama
  }
}

export async function createPartnerAction(formData: FormData): Promise<ActionResult> {
  try {
    const session = await requireContentEditor();
    const name = String(formData.get("name") ?? "").trim();
    const file = formData.get("logo") as File | null;

    if (!name) return { ok: false, message: "Nama klien wajib diisi." };
    if (!file || file.size === 0) return { ok: false, message: "Logo wajib diunggah." };

    const media = await saveLogoFile(file, session.user.id);
    const count = await prisma.partner.count({ where: { deletedAt: null } });
    await prisma.partner.create({
      data: {
        name,
        logoMediaId: media.id,
        sortOrder: count,
        createdById: session.user.id,
        updatedById: session.user.id,
      },
    });
    revalidateAdminPaths("/klien");
    revalidatePath("/");
    revalidatePath("/testimoni");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menambahkan klien.") };
  }
}

export async function updatePartnerAction(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const session = await requireContentEditor();
    const name = String(formData.get("name") ?? "").trim();
    const file = formData.get("logo") as File | null;

    if (!name) return { ok: false, message: "Nama klien wajib diisi." };

    if (file && file.size > 0) {
      const partner = await prisma.partner.findUnique({ where: { id }, include: { logoMedia: true } });
      const media = await saveLogoFile(file, session.user.id);
      await prisma.partner.update({
        where: { id },
        data: { name, logoMediaId: media.id, updatedById: session.user.id },
      });
      if (partner) {
        await prisma.media.delete({ where: { id: partner.logoMedia.id } });
        await deleteMediaFile(partner.logoMedia.url);
      }
    } else {
      await prisma.partner.update({ where: { id }, data: { name, updatedById: session.user.id } });
    }
    revalidateAdminPaths("/klien");
    revalidatePath("/");
    revalidatePath("/testimoni");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal memperbarui klien.") };
  }
}

export async function togglePartnerActiveAction(id: string, isActive: boolean): Promise<ActionResult> {
  try {
    const session = await requireContentEditor();
    await prisma.partner.update({ where: { id }, data: { isActive, updatedById: session.user.id } });
    revalidateAdminPaths("/klien");
    revalidatePath("/");
    revalidatePath("/testimoni");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal mengubah status klien.") };
  }
}

/** Soft delete — Media logo TIDAK ikut dihapus (Partner.logoMediaId wajib
 * diisi, jadi row-nya harus tetap utuh selama Partner ini masih ada,
 * walau berstatus "terhapus"). */
export async function deletePartnerAction(id: string): Promise<ActionResult> {
  try {
    const session = await requireContentEditor();
    await prisma.partner.update({
      where: { id },
      data: { deletedAt: new Date(), updatedById: session.user.id },
    });

    revalidateAdminPaths("/klien");
    revalidatePath("/");
    revalidatePath("/testimoni");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menghapus klien.") };
  }
}
