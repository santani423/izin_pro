"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
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
  revalidatePath("/admin/testimoni");
  revalidatePath("/");
  revalidatePath("/testimoni");
}

export interface TestimonialFormData {
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  categoryId: string | null;
  isVideo: boolean;
  videoUrl: string | null;
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
        content: data.content,
        rating: data.rating,
        categoryId: data.categoryId,
        isVideo: data.isVideo,
        videoUrl: data.isVideo ? data.videoUrl : null,
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
        content: data.content,
        rating: data.rating,
        categoryId: data.categoryId,
        isVideo: data.isVideo,
        videoUrl: data.isVideo ? data.videoUrl : null,
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
      data: { deletedAt: new Date(), updatedById: session.user.id },
    });
    revalidateTestimoniPaths();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menghapus testimoni.") };
  }
}
