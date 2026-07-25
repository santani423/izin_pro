"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidateAdminPaths } from "@/lib/admin-guard";
import { saveUploadedImage } from "@/lib/media";
import type { Role } from "@prisma/client";

export type ActionResult = { ok: true } | { ok: false; message: string };

/* /admin/blog mengizinkan role AUTHOR (lihat permissions.ts), beda dari
 * CONTENT_EDITOR_ROLES di actions lain yang gak termasuk AUTHOR. */
const BLOG_EDITOR_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "EDITOR", "AUTHOR"];

async function requireBlogEditor() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !BLOG_EDITOR_ROLES.includes(session.user.role as Role)) {
    throw new Error("Anda tidak punya akses ke halaman ini.");
  }
  return session;
}

/* AUTHOR cuma boleh ubah/hapus/publish artikel miliknya sendiri (gaya
 * WordPress) — role lain (SUPER_ADMIN/ADMIN/EDITOR) bebas kelola semua. */
function assertOwnsPost(session: Awaited<ReturnType<typeof requireBlogEditor>>, authorId: string) {
  if (session.user.role === "AUTHOR" && authorId !== session.user.id) {
    throw new Error("Anda hanya bisa mengelola artikel milik sendiri.");
  }
}

function errorMessage(e: unknown, fallback: string) {
  return e instanceof Error ? e.message : fallback;
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function revalidateBlogPaths(slug?: string, oldSlug?: string) {
  revalidateAdminPaths("/blog");
  revalidatePath("/");
  revalidatePath("/blog");
  if (slug) revalidatePath(`/blog/${slug}`);
  if (oldSlug && oldSlug !== slug) revalidatePath(`/blog/${oldSlug}`);
  revalidatePath("/sitemap.xml");
}

export interface BlogPostFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: string;
  featuredMediaId: string | null;
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED";
  scheduledAt: string | null; // ISO string, wajib diisi kalau status SCHEDULED
  metaTitle: string | null;
  metaDescription: string | null;
  tagIds: string[];
}

async function setPostTags(
  tx: Omit<typeof prisma, "$transaction" | "$connect" | "$disconnect" | "$on" | "$use" | "$extends">,
  postId: string,
  tagIds: string[],
) {
  await tx.postTag.deleteMany({ where: { postId } });
  if (tagIds.length > 0) {
    await tx.postTag.createMany({ data: tagIds.map((tagId) => ({ postId, tagId })) });
  }
}

function validateBlogPostData(data: BlogPostFormData): string | null {
  if (!data.title.trim()) return "Judul wajib diisi.";
  if (!data.slug.trim()) return "Slug wajib diisi.";
  if (!data.excerpt.trim()) return "Ringkasan wajib diisi.";
  if (!data.content.trim()) return "Isi artikel wajib diisi.";
  if (!data.categoryId) return "Kategori wajib dipilih.";
  if (data.status === "SCHEDULED") {
    if (!data.scheduledAt) return "Tanggal & jam jadwal wajib diisi.";
    if (Number.isNaN(new Date(data.scheduledAt).getTime())) return "Tanggal & jam jadwal tidak valid.";
    if (new Date(data.scheduledAt).getTime() <= Date.now()) return "Jadwal harus di waktu yang akan datang.";
  }
  return null;
}

export async function createBlogPostAction(data: BlogPostFormData): Promise<ActionResult> {
  try {
    const session = await requireBlogEditor();
    const validationError = validateBlogPostData(data);
    if (validationError) return { ok: false, message: validationError };

    const slug = slugify(data.slug);
    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (existing) return { ok: false, message: "Slug sudah dipakai artikel lain." };

    const post = await prisma.$transaction(async (tx) => {
      const created = await tx.blogPost.create({
        data: {
          slug,
          title: data.title,
          excerpt: data.excerpt,
          content: data.content,
          categoryId: data.categoryId,
          featuredMediaId: data.featuredMediaId,
          status: data.status,
          publishedAt: data.status === "PUBLISHED" ? new Date() : null,
          scheduledAt: data.status === "SCHEDULED" ? new Date(data.scheduledAt!) : null,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          authorId: session.user.id,
          updatedById: session.user.id,
        },
      });
      await setPostTags(tx, created.id, data.tagIds);
      return created;
    });

    revalidateBlogPaths(post.slug);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menambahkan artikel.") };
  }
}

export async function updateBlogPostAction(id: string, data: BlogPostFormData): Promise<ActionResult> {
  try {
    const session = await requireBlogEditor();
    const validationError = validateBlogPostData(data);
    if (validationError) return { ok: false, message: validationError };

    const current = await prisma.blogPost.findUnique({ where: { id } });
    if (!current) return { ok: false, message: "Artikel tidak ditemukan." };
    assertOwnsPost(session, current.authorId);

    const slug = slugify(data.slug);
    if (slug !== current.slug) {
      const slugTaken = await prisma.blogPost.findUnique({ where: { slug } });
      if (slugTaken) return { ok: false, message: "Slug sudah dipakai artikel lain." };
    }

    /* publishedAt cuma di-set sekali (pertama kali berstatus PUBLISHED) —
     * republish gak boleh reset tanggal terbit aslinya. scheduledAt cuma
     * relevan pas status SCHEDULED, selain itu selalu dikosongkan lagi
     * (mis. batal jadwal balik ke Draft, atau publish manual duluan). */
    const publishedAt =
      data.status === "PUBLISHED" ? current.publishedAt ?? new Date() : current.publishedAt;
    const scheduledAt = data.status === "SCHEDULED" ? new Date(data.scheduledAt!) : null;

    const post = await prisma.$transaction(async (tx) => {
      const updated = await tx.blogPost.update({
        where: { id },
        data: {
          slug,
          title: data.title,
          excerpt: data.excerpt,
          content: data.content,
          categoryId: data.categoryId,
          featuredMediaId: data.featuredMediaId,
          status: data.status,
          publishedAt,
          scheduledAt,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          updatedById: session.user.id,
        },
      });
      await setPostTags(tx, updated.id, data.tagIds);
      return updated;
    });

    revalidateBlogPaths(post.slug, current.slug);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal memperbarui artikel.") };
  }
}

export async function toggleBlogPostStatusAction(
  id: string,
  status: "DRAFT" | "PUBLISHED",
): Promise<ActionResult> {
  try {
    const session = await requireBlogEditor();
    const current = await prisma.blogPost.findUnique({ where: { id } });
    if (!current) return { ok: false, message: "Artikel tidak ditemukan." };
    assertOwnsPost(session, current.authorId);

    const publishedAt = status === "PUBLISHED" ? current.publishedAt ?? new Date() : current.publishedAt;
    await prisma.blogPost.update({
      where: { id },
      data: { status, publishedAt, updatedById: session.user.id },
    });
    revalidateBlogPaths(current.slug);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal mengubah status artikel.") };
  }
}

/** Soft delete — sesuai keputusan desain schema (BlogPost punya deletedAt). */
export async function deleteBlogPostAction(id: string): Promise<ActionResult> {
  try {
    const session = await requireBlogEditor();
    const current = await prisma.blogPost.findUnique({ where: { id } });
    if (!current) return { ok: false, message: "Artikel tidak ditemukan." };
    assertOwnsPost(session, current.authorId);
    await prisma.blogPost.update({
      where: { id },
      data: { deletedAt: new Date(), updatedById: session.user.id },
    });
    revalidateBlogPaths(current.slug);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menghapus artikel.") };
  }
}

export type UploadImageResult =
  | { ok: true; mediaId: string; url: string }
  | { ok: false; message: string };

/** Featured image — BlogPost.featuredMediaId itu relasi ke Media (beda dari
 * Testimonial.thumbnailUrl yg cuma string), jadi perlu balikin mediaId. */
export async function uploadBlogFeaturedImageAction(formData: FormData): Promise<UploadImageResult> {
  try {
    const session = await requireBlogEditor();
    const file = formData.get("image") as File | null;
    if (!file || file.size === 0) return { ok: false, message: "File gambar wajib diunggah." };
    const media = await saveUploadedImage(file, "blog", session.user.id);
    return { ok: true, mediaId: media.id, url: media.url };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal mengunggah gambar unggulan.") };
  }
}

export type UploadContentImageResult = { ok: true; url: string } | { ok: false; message: string };

/** Gambar inline di editor Tiptap — cuma butuh URL, gak perlu mediaId
 * ditempel ke field manapun di BlogPost. */
export async function uploadBlogContentImageAction(
  formData: FormData,
): Promise<UploadContentImageResult> {
  try {
    const session = await requireBlogEditor();
    const file = formData.get("image") as File | null;
    if (!file || file.size === 0) return { ok: false, message: "File gambar wajib diunggah." };
    const media = await saveUploadedImage(file, "blog-content", session.user.id);
    return { ok: true, url: media.url };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal mengunggah gambar.") };
  }
}

export interface TagOption {
  id: string;
  name: string;
  slug: string;
}

export async function searchTagsAction(query: string): Promise<TagOption[]> {
  await requireBlogEditor();
  const q = query.trim();
  const tags = await prisma.tag.findMany({
    where: q ? { name: { contains: q } } : undefined,
    orderBy: { name: "asc" },
    take: 10,
  });
  return tags;
}

export async function findOrCreateTagAction(
  name: string,
): Promise<{ ok: true; tag: TagOption } | { ok: false; message: string }> {
  try {
    await requireBlogEditor();
    const trimmed = name.trim();
    if (!trimmed) return { ok: false, message: "Nama tag tidak boleh kosong." };
    const slug = slugify(trimmed);
    const existing = await prisma.tag.findUnique({ where: { slug } });
    if (existing) return { ok: true, tag: existing };
    const created = await prisma.tag.create({ data: { name: trimmed, slug } });
    return { ok: true, tag: created };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal membuat tag.") };
  }
}
