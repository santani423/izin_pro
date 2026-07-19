"use server";

import { headers } from "next/headers";
import fs from "node:fs/promises";
import path from "node:path";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidateAdminPaths } from "@/lib/admin-guard";
import type { ActionResult } from "./users";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "avatars");
const MAX_PHOTO_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_MIME = ["image/png", "image/jpeg", "image/webp"];

function errorMessage(e: unknown, fallback: string) {
  return e instanceof Error ? e.message : fallback;
}

/** Ganti foto profil sendiri — file lama (kalau ada & disimpan di
 * public/uploads/avatars) ikut dihapus, best-effort. */
export async function updateProfilePhotoAction(formData: FormData): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { ok: false, message: "Sesi Anda telah berakhir, silakan login ulang." };

    const file = formData.get("photo") as File | null;
    if (!file || file.size === 0) return { ok: false, message: "File foto tidak ditemukan." };
    if (!ALLOWED_MIME.includes(file.type)) {
      return { ok: false, message: "Format foto harus PNG, JPG, atau WebP." };
    }
    if (file.size > MAX_PHOTO_BYTES) {
      return { ok: false, message: "Ukuran foto maksimal 2MB." };
    }

    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const ext = path.extname(file.name) || ".png";
    const fileName = `${session.user.id}-${Date.now()}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(UPLOAD_DIR, fileName), buffer);
    const url = `/uploads/avatars/${fileName}`;

    const before = await prisma.user.findUnique({ where: { id: session.user.id }, select: { image: true } });
    await prisma.user.update({ where: { id: session.user.id }, data: { image: url } });

    if (before?.image?.startsWith("/uploads/avatars/")) {
      await fs.unlink(path.join(process.cwd(), "public", before.image)).catch(() => {});
    }

    revalidateAdminPaths("/profile");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal mengunggah foto profil.") };
  }
}

/** Hapus foto profil sendiri — balik ke fallback inisial. File di
 * public/uploads/avatars ikut dihapus, best-effort. */
export async function removeProfilePhotoAction(): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { ok: false, message: "Sesi Anda telah berakhir, silakan login ulang." };

    const before = await prisma.user.findUnique({ where: { id: session.user.id }, select: { image: true } });
    await prisma.user.update({ where: { id: session.user.id }, data: { image: null } });

    if (before?.image?.startsWith("/uploads/avatars/")) {
      await fs.unlink(path.join(process.cwd(), "public", before.image)).catch(() => {});
    }

    revalidateAdminPaths("/profile");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menghapus foto profil.") };
  }
}
