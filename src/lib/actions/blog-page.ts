"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidateAdminPaths } from "@/lib/admin-guard";
import { canAccessAdminRoute } from "@/lib/permissions";
import { saveUploadedImage, deleteUploadedFile } from "@/lib/media";
import type { Role } from "@prisma/client";

export type ActionResult = { ok: true } | { ok: false; message: string };

function errorMessage(e: unknown, fallback: string) {
  return e instanceof Error ? e.message : fallback;
}

/* Sama pola dgn requireTestimoniEditor()/requireKontakEditor() — SUPER_ADMIN,
 * ADMIN, EDITOR boleh ubah banner Blog. AUTHOR TIDAK termasuk di sini walau
 * boleh akses /admin/blog (lihat BLOG_EDITOR_ROLES di actions/blog.ts) —
 * AUTHOR cuma boleh kelola artikel miliknya sendiri, bukan banner sitewide. */
async function requireBlogPageEditor() {
  const session = await auth.api.getSession({ headers: await headers() });
  const role = session?.user.role as Role | undefined;
  if (!session || !role || !canAccessAdminRoute(role, "/blog") || role === "AUTHOR") {
    throw new Error("Anda tidak punya akses untuk mengubah banner Blog.");
  }
  return session;
}

function revalidateBlog() {
  revalidateAdminPaths("/blog");
  revalidatePath("/blog");
}

/* ─── Banner (Hero) ─── */
export async function saveBlogPageContentAction(data: {
  heroKicker: string;
  heroTitle: string;
  heroTitleHighlight: string;
  heroDescription: string;
}): Promise<ActionResult> {
  try {
    const session = await requireBlogPageEditor();
    const heroTitle = data.heroTitle.trim();
    const heroTitleHighlight = data.heroTitleHighlight.trim();
    const heroDescription = data.heroDescription.trim();

    if (!heroTitle || !heroTitleHighlight) {
      return { ok: false, message: "Judul banner gak boleh kosong." };
    }
    if (!heroDescription) {
      return { ok: false, message: "Deskripsi banner gak boleh kosong." };
    }

    await prisma.blogPageContent.update({
      where: { id: "1" },
      data: {
        heroKicker: data.heroKicker.trim() || null,
        heroTitle,
        heroTitleHighlight,
        heroDescription,
        updatedById: session.user.id,
      },
    });
    revalidateBlog();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan banner.") };
  }
}

export type BlogPageImageActionResult = { ok: true; imageUrl: string | null } | { ok: false; message: string };

/** Ganti/hapus gambar banner /blog — kosong (null) = balik ke kartu gradient
 * placeholder bawaan (lihat PageHero.tsx). */
export async function saveBlogPageImageAction(formData: FormData): Promise<BlogPageImageActionResult> {
  try {
    const session = await requireBlogPageEditor();
    const file = formData.get("image") as File | null;
    const reset = formData.get("reset") === "true";
    const current = await prisma.blogPageContent.findUnique({ where: { id: "1" } });

    if (file && file.size > 0) {
      const media = await saveUploadedImage(file, "blog-banner", session.user.id);
      await prisma.blogPageContent.update({
        where: { id: "1" },
        data: { heroImageUrl: media.url, updatedById: session.user.id },
      });
      if (current?.heroImageUrl) {
        await deleteUploadedFile(current.heroImageUrl);
        await prisma.media.deleteMany({ where: { url: current.heroImageUrl } });
      }
      revalidateBlog();
      return { ok: true, imageUrl: media.url };
    }

    if (reset) {
      await prisma.blogPageContent.update({
        where: { id: "1" },
        data: { heroImageUrl: null, updatedById: session.user.id },
      });
      if (current?.heroImageUrl) {
        await deleteUploadedFile(current.heroImageUrl);
        await prisma.media.deleteMany({ where: { url: current.heroImageUrl } });
      }
      revalidateBlog();
      return { ok: true, imageUrl: null };
    }

    return { ok: false, message: "Tidak ada perubahan gambar." };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan gambar banner.") };
  }
}
