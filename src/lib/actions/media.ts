"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { saveUploadedImage, deleteUploadedFile } from "@/lib/media";
import { revalidateAdminPaths } from "@/lib/admin-guard";
import type { Role } from "@prisma/client";

/* /media diizinkan buat semua role (lihat permissions.ts) — sama kayak
 * BLOG_EDITOR_ROLES, dipisah namanya biar jelas ini scope-nya Media Library. */
const MEDIA_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "EDITOR", "AUTHOR"];

async function requireMediaAccess() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !MEDIA_ROLES.includes(session.user.role as Role)) {
    throw new Error("Anda tidak punya akses ke halaman ini.");
  }
  return session;
}

function errorMessage(e: unknown, fallback: string) {
  return e instanceof Error ? e.message : fallback;
}

export type ActionResult = { ok: true } | { ok: false; message: string };

/** Upload 1+ file sekaligus dari toolbar/drag-drop Media Library — beda dari
 * upload cover/inline blog yang always cuma 1 file per aksi. */
export async function uploadMediaFilesAction(formData: FormData): Promise<ActionResult> {
  try {
    const session = await requireMediaAccess();
    const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
    if (files.length === 0) return { ok: false, message: "Tidak ada file yang dipilih." };

    for (const file of files) {
      await saveUploadedImage(file, "media", session.user.id);
    }

    revalidatePath("/admin/media");
    revalidateAdminPaths("/media");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal mengunggah file.") };
  }
}

/** Hapus 1+ file Media Library sekaligus. Kalau ada yang masih dipakai
 * relasi wajib (mis. Partner.logoMediaId), baris itu dilewati & dilaporkan
 * di pesan error — file lain yang gak nyangkut tetap kehapus. */
export async function deleteMediaFilesAction(ids: string[]): Promise<ActionResult> {
  try {
    await requireMediaAccess();
    if (ids.length === 0) return { ok: false, message: "Tidak ada file yang dipilih." };

    const items = await prisma.media.findMany({ where: { id: { in: ids } } });
    const failed: string[] = [];

    for (const item of items) {
      try {
        await prisma.media.delete({ where: { id: item.id } });
        await deleteUploadedFile(item.url);
      } catch {
        // FK Restrict (mis. masih dipakai sbg logo Partner) -> lewati, lapor di akhir.
        failed.push(item.fileName);
      }
    }

    revalidatePath("/admin/media");
    revalidateAdminPaths("/media");

    if (failed.length > 0) {
      return {
        ok: false,
        message: `${failed.length} file masih dipakai di tempat lain jadi gak bisa dihapus: ${failed.join(", ")}.`,
      };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menghapus file.") };
  }
}
