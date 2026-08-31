"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidateAdminPaths } from "@/lib/admin-guard";
import { saveUploadedImage } from "@/lib/media";
import { Prisma } from "@prisma/client";
import type { ServiceDetailContent } from "@/lib/types/service-detail-content";
import type { ServiceDetailContentLang } from "@/lib/service-detail-locale";
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

export interface ServiceCatalogLangData {
  title: string;
  description: string;
  features: string[];
}

export interface ServiceFormData {
  icon: string;
  color: string;
  bgColor: string;
  categoryId: string;
  featuredMediaId: string | null;
  // Dipakai modul Transaksi (harga dasar & estimasi durasi default saat bikin
  // transaksi baru, lihat createTransactionAction) — opsional, gak wajib
  // diisi utk layanan yg cuma tampil di landing page. Gak per-bahasa.
  basePrice: number | null;
  estimatedDurationLabel: string | null;
  requiredDocuments: string[];
  id: ServiceCatalogLangData;
  en: ServiceCatalogLangData;
  zh: ServiceCatalogLangData;
}

/** null kalau SEMUA item kosong (belum diterjemahkan) — biar
 * pickServiceDetailContent-style fallback bisa bedain "belum diisi" dari
 * "diisi tapi salah satu barisnya kosong". */
function stringArrayOrNull(arr: string[]): string[] | null {
  const cleaned = arr.map((s) => s.trim()).filter(Boolean);
  return cleaned.length === 0 ? null : cleaned;
}

export async function createServiceAction(data: ServiceFormData): Promise<ActionResult> {
  try {
    const session = await requireContentEditor();
    if (!data.id.title.trim() || !data.id.description.trim()) {
      return { ok: false, message: "Judul & deskripsi layanan (Bahasa Indonesia) wajib diisi." };
    }
    const count = await prisma.service.count();
    await prisma.service.create({
      data: {
        slug: slugify(data.id.title),
        title: data.id.title,
        description: data.id.description,
        features: data.id.features,
        titleEn: data.en.title.trim() || null,
        descriptionEn: data.en.description.trim() || null,
        featuresEn: stringArrayOrNull(data.en.features) ?? Prisma.DbNull,
        titleZh: data.zh.title.trim() || null,
        descriptionZh: data.zh.description.trim() || null,
        featuresZh: stringArrayOrNull(data.zh.features) ?? Prisma.DbNull,
        icon: data.icon,
        color: data.color,
        bgColor: data.bgColor,
        categoryId: data.categoryId,
        featuredMediaId: data.featuredMediaId,
        basePrice: data.basePrice,
        estimatedDurationLabel: data.estimatedDurationLabel,
        requiredDocuments: data.requiredDocuments,
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
    if (!data.id.title.trim() || !data.id.description.trim()) {
      return { ok: false, message: "Judul & deskripsi layanan (Bahasa Indonesia) wajib diisi." };
    }
    await prisma.service.update({
      where: { id },
      data: {
        slug: slugify(data.id.title),
        title: data.id.title,
        description: data.id.description,
        features: data.id.features,
        titleEn: data.en.title.trim() || null,
        descriptionEn: data.en.description.trim() || null,
        featuresEn: stringArrayOrNull(data.en.features) ?? Prisma.DbNull,
        titleZh: data.zh.title.trim() || null,
        descriptionZh: data.zh.description.trim() || null,
        featuresZh: stringArrayOrNull(data.zh.features) ?? Prisma.DbNull,
        icon: data.icon,
        color: data.color,
        bgColor: data.bgColor,
        categoryId: data.categoryId,
        featuredMediaId: data.featuredMediaId,
        basePrice: data.basePrice,
        estimatedDurationLabel: data.estimatedDurationLabel,
        requiredDocuments: data.requiredDocuments,
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
 * Durasi/Testimoni-help/CTA override) — satu blok Json per bahasa, satu
 * tombol simpan di admin (lihat LayananDetailEditor.tsx). `en`/`zh` cuma
 * divalidasi ringan (deep-partial, boleh kosong sebagian/semua -> fallback
 * ke `id` per-field lewat pickServiceDetailContent()). */
export async function updateServiceDetailContentAction(
  id: string,
  data: { id: ServiceDetailContent; en: ServiceDetailContentLang; zh: ServiceDetailContentLang },
): Promise<ActionResult> {
  try {
    const session = await requireContentEditor();
    const base = data.id;

    if (!base.kicker.trim() || !base.tagline.trim() || !base.heroDescription.trim()) {
      return { ok: false, message: "Kicker, tagline, dan deskripsi hero (Bahasa Indonesia) wajib diisi." };
    }
    if (!base.process.title.trim() || base.process.steps.length === 0) {
      return { ok: false, message: "Judul & minimal 1 langkah proses (Bahasa Indonesia) wajib diisi." };
    }
    if (base.process.steps.some((s) => !s.title.trim() || !s.description.trim())) {
      return { ok: false, message: "Setiap langkah proses (Bahasa Indonesia) wajib punya judul & deskripsi." };
    }
    if (base.benefits && (base.benefits.items ?? []).some((b) => !b.title.trim() || !b.description.trim())) {
      return { ok: false, message: "Setiap item manfaat (Bahasa Indonesia) wajib punya judul & deskripsi." };
    }
    if (base.types && (base.types.items ?? []).some((t) => !t.title.trim() || !t.description.trim())) {
      return { ok: false, message: "Setiap item jenis layanan (Bahasa Indonesia) wajib punya judul & deskripsi." };
    }

    const service = await prisma.service.findUniqueOrThrow({ where: { id } });
    await prisma.service.update({
      where: { id },
      data: {
        detailContent: base as object,
        detailContentEn: data.en as object,
        detailContentZh: data.zh as object,
        updatedById: session.user.id,
      },
    });
    revalidateServiceDetailPaths(service.slug);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan konten detail layanan.") };
  }
}

export interface ServiceSeoLangData {
  metaTitle: string;
  metaDescription: string;
}

/** SEO + status publish/unpublish — terpisah dari detailContent biar admin
 * bisa nyimpen SEO tanpa harus validasi ulang semua section konten. Status
 * gak per-bahasa (satu status publish utk semua locale). */
export async function updateServiceMetaAction(
  id: string,
  data: { status: ContentStatus; id: ServiceSeoLangData; en: ServiceSeoLangData; zh: ServiceSeoLangData },
): Promise<ActionResult> {
  try {
    const session = await requireContentEditor();
    const service = await prisma.service.update({
      where: { id },
      data: {
        metaTitle: data.id.metaTitle.trim() || null,
        metaDescription: data.id.metaDescription.trim() || null,
        metaTitleEn: data.en.metaTitle.trim() || null,
        metaDescriptionEn: data.en.metaDescription.trim() || null,
        metaTitleZh: data.zh.metaTitle.trim() || null,
        metaDescriptionZh: data.zh.metaDescription.trim() || null,
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
