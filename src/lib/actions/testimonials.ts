"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import fs from "node:fs/promises";
import path from "node:path";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidateAdminPaths } from "@/lib/admin-guard";
import { humanizeFileName } from "@/lib/media";
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

function revalidateTestimoniPaths() {
  revalidateAdminPaths("/testimoni");
  revalidatePath("/");
  revalidatePath("/testimoni");
}

const THUMBNAIL_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "testimonials");
const MAX_THUMBNAIL_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_THUMBNAIL_MIME = ["image/png", "image/jpeg", "image/webp"];

export type UploadResult = { ok: true; url: string } | { ok: false; message: string };

/** Upload thumbnail video testimoni — sama polanya dgn saveLogoFile di
 * actions/partners.ts (simpan file apa adanya, belum ada resize/WebP). */
export async function uploadTestimonialThumbnailAction(formData: FormData): Promise<UploadResult> {
  try {
    const session = await requireContentEditor();
    const file = formData.get("thumbnail") as File | null;
    if (!file || file.size === 0) return { ok: false, message: "File thumbnail wajib diunggah." };
    if (!ALLOWED_THUMBNAIL_MIME.includes(file.type)) {
      return { ok: false, message: "Format thumbnail harus PNG, JPG, atau WebP." };
    }
    if (file.size > MAX_THUMBNAIL_BYTES) {
      return { ok: false, message: "Ukuran thumbnail maksimal 2MB." };
    }

    await fs.mkdir(THUMBNAIL_UPLOAD_DIR, { recursive: true });
    const ext = path.extname(file.name) || ".jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(THUMBNAIL_UPLOAD_DIR, fileName), buffer);

    const url = `/uploads/testimonials/${fileName}`;
    await prisma.media.create({
      data: {
        fileName,
        url,
        mimeType: file.type,
        sizeBytes: file.size,
        title: humanizeFileName(file.name),
        uploadedById: session.user.id,
      },
    });

    return { ok: true, url };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal mengunggah thumbnail.") };
  }
}

export interface TestimonialFormData {
  name: string;
  role: string;
  company: string;
  content: string | null;
  rating: number | null;
  categoryId: string | null;
  isVideo: boolean;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  duration: string | null;
}

export async function createTestimonialAction(data: TestimonialFormData): Promise<ActionResult> {
  try {
    const session = await requireContentEditor();
    const count = await prisma.testimonial.count({ where: { deletedAt: null } });
    await prisma.testimonial.create({
      data: {
        name: data.name,
        role: data.role,
        company: data.company,
        content: data.isVideo ? null : data.content,
        rating: data.isVideo ? null : data.rating,
        categoryId: data.categoryId,
        isVideo: data.isVideo,
        videoUrl: data.isVideo ? data.videoUrl : null,
        thumbnailUrl: data.isVideo ? data.thumbnailUrl : null,
        duration: data.isVideo ? data.duration : null,
        sortOrder: count,
        createdById: session.user.id,
        updatedById: session.user.id,
      },
    });
    revalidateTestimoniPaths();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menambahkan testimoni.") };
  }
}

export async function updateTestimonialAction(id: string, data: TestimonialFormData): Promise<ActionResult> {
  try {
    const session = await requireContentEditor();
    await prisma.testimonial.update({
      where: { id },
      data: {
        name: data.name,
        role: data.role,
        company: data.company,
        content: data.isVideo ? null : data.content,
        rating: data.isVideo ? null : data.rating,
        categoryId: data.categoryId,
        isVideo: data.isVideo,
        videoUrl: data.isVideo ? data.videoUrl : null,
        thumbnailUrl: data.isVideo ? data.thumbnailUrl : null,
        duration: data.isVideo ? data.duration : null,
        updatedById: session.user.id,
      },
    });
    revalidateTestimoniPaths();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal memperbarui testimoni.") };
  }
}

export async function toggleTestimonialActiveAction(id: string, isActive: boolean): Promise<ActionResult> {
  try {
    const session = await requireContentEditor();
    await prisma.testimonial.update({ where: { id }, data: { isActive, updatedById: session.user.id } });
    revalidateTestimoniPaths();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal mengubah status testimoni.") };
  }
}

/** Soft delete — sesuai keputusan desain schema (Testimonial punya deletedAt). */
export async function deleteTestimonialAction(id: string): Promise<ActionResult> {
  try {
    const session = await requireContentEditor();
    await prisma.testimonial.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById: session.user.id, updatedById: session.user.id },
    });
    revalidateTestimoniPaths();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menghapus testimoni.") };
  }
}
