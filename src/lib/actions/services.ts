"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidateAdminPaths } from "@/lib/admin-guard";
import { saveUploadedImage } from "@/lib/media";
import type { ServiceDetailContent } from "@/lib/types/service-detail-content";
import type { Role, ContentStatus } from "@prisma/client";

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
  featuredMediaId: string | null;
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
        featuredMediaId: data.featuredMediaId,
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
        featuredMediaId: data.featuredMediaId,
        updatedById: session.user.id,
      },
    });
    revalidateAdminPaths("/layanan");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal memperbarui layanan.") };
  }
}

export type UploadImageResult =
  | { ok: true; mediaId: string; url: string }
  | { ok: false; message: string };

/** Featured image (gambar titel) — Service.featuredMediaId relasi ke Media,
 * sama pola kayak BlogPost.featuredMediaId (lihat uploadBlogFeaturedImageAction).
 * Cuma upload & bikin Media row — belum nautin ke Service, lihat
 * updateServiceFeaturedMediaAction utk itu (dipanggil terpisah). */
export async function uploadServiceFeaturedImageAction(formData: FormData): Promise<UploadImageResult> {
  try {
    const session = await requireContentEditor();
    const file = formData.get("image") as File | null;
    if (!file || file.size === 0) return { ok: false, message: "File gambar wajib diunggah." };
    const media = await saveUploadedImage(file, "layanan", session.user.id);
    return { ok: true, mediaId: media.id, url: media.url };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal mengunggah gambar titel.") };
  }
}

/** Tautkan (atau lepas, mediaId=null) gambar titel ke Service.featuredMediaId —
 * dipanggil setelah uploadServiceFeaturedImageAction sukses. */
export async function updateServiceFeaturedMediaAction(
  id: string,
  mediaId: string | null,
): Promise<ActionResult> {
  try {
    const session = await requireContentEditor();
    const service = await prisma.service.update({
      where: { id },
      data: { featuredMediaId: mediaId, updatedById: session.user.id },
    });
    revalidateServiceDetailPaths(service.slug);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menautkan gambar titel.") };
  }
}

/** Gambar khusus section "Tentang" — independen dari gambar Hero
 * (Service.featuredMediaId). Kalau gak diisi, section Tentang fallback ke
 * gambar Hero (lihat hydrateLayananDetail), jadi service yg belum diisi
 * gambar khusus ini tampilannya gak berubah. */
export async function uploadServiceAboutImageAction(formData: FormData): Promise<UploadImageResult> {
  try {
    const session = await requireContentEditor();
    const file = formData.get("image") as File | null;
    if (!file || file.size === 0) return { ok: false, message: "File gambar wajib diunggah." };
    const media = await saveUploadedImage(file, "layanan", session.user.id);
    return { ok: true, mediaId: media.id, url: media.url };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal mengunggah gambar Tentang.") };
  }
}

/** Tautkan (atau lepas, mediaId=null) gambar khusus ke Service.aboutMediaId —
 * dipanggil setelah uploadServiceAboutImageAction sukses. */
export async function updateServiceAboutMediaAction(
  id: string,
  mediaId: string | null,
): Promise<ActionResult> {
  try {
    const session = await requireContentEditor();
    const service = await prisma.service.update({
      where: { id },
      data: { aboutMediaId: mediaId, updatedById: session.user.id },
    });
    revalidateServiceDetailPaths(service.slug);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menautkan gambar Tentang.") };
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
      data: { deletedAt: new Date(), deletedById: session.user.id, updatedById: session.user.id },
    });
    revalidateAdminPaths("/layanan");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menghapus layanan.") };
  }
}

/** Reorder daftar layanan di admin (drag-and-drop) — bulk update sortOrder
 * dalam satu transaksi biar gak ada state antara yg keliatan setengah jalan. */
export async function reorderServicesAction(orderedIds: string[]): Promise<ActionResult> {
  try {
    const session = await requireContentEditor();
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.service.update({
          where: { id },
          data: { sortOrder: index, updatedById: session.user.id },
        }),
      ),
    );
    revalidateAdminPaths("/layanan");
    revalidatePath("/");
    revalidatePath("/layanan");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal mengubah urutan layanan.") };
  }
}

function revalidateServiceDetailPaths(slug: string) {
  revalidateAdminPaths("/layanan");
  revalidatePath("/");
  revalidatePath("/layanan");
  revalidatePath(`/layanan/${slug}`);
}

/** Simpan konten section detail (Hero/About/Benefits/Types/Proses/Dokumen/
 * Durasi/Testimoni-help/CTA override) — satu blok Json, satu tombol simpan
 * per accordion section di admin (lihat LayananDetailEditor.tsx). */
export async function updateServiceDetailContentAction(
  id: string,
  data: ServiceDetailContent,
): Promise<ActionResult> {
  try {
    const session = await requireContentEditor();

    if (!data.kicker.trim() || !data.tagline.trim() || !data.heroDescription.trim()) {
      return { ok: false, message: "Kicker, tagline, dan deskripsi hero wajib diisi." };
    }
    if (!data.process.title.trim() || data.process.steps.length === 0) {
      return { ok: false, message: "Judul & minimal 1 langkah proses wajib diisi." };
    }
    if (data.process.steps.some((s) => !s.title.trim() || !s.description.trim())) {
      return { ok: false, message: "Setiap langkah proses wajib punya judul & deskripsi." };
    }
    if (data.benefits && data.benefits.items.some((b) => !b.title.trim() || !b.description.trim())) {
      return { ok: false, message: "Setiap item manfaat wajib punya judul & deskripsi." };
    }
    if (data.types && data.types.items.some((t) => !t.title.trim() || !t.description.trim())) {
      return { ok: false, message: "Setiap item jenis layanan wajib punya judul & deskripsi." };
    }

    const service = await prisma.service.findUniqueOrThrow({ where: { id } });
    await prisma.service.update({
      where: { id },
      data: { detailContent: data as object, updatedById: session.user.id },
    });
    revalidateServiceDetailPaths(service.slug);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan konten detail layanan.") };
  }
}

/** SEO + status publish/unpublish — terpisah dari detailContent biar admin
 * bisa nyimpen SEO tanpa harus validasi ulang semua section konten. */
export async function updateServiceMetaAction(
  id: string,
  data: { metaTitle: string; metaDescription: string; status: ContentStatus },
): Promise<ActionResult> {
  try {
    const session = await requireContentEditor();
    const service = await prisma.service.update({
      where: { id },
      data: {
        metaTitle: data.metaTitle.trim() || null,
        metaDescription: data.metaDescription.trim() || null,
        status: data.status,
        updatedById: session.user.id,
      },
    });
    revalidateServiceDetailPaths(service.slug);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan SEO & status layanan.") };
  }
}
