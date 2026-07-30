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

/* Sama pola dgn requireHeroEditor()/requireAboutEditor() — SUPER_ADMIN, ADMIN,
 * EDITOR boleh ubah banner Testimoni (AUTHOR gak pernah sampe sini, ketahan
 * requirePanelAccess duluan di page.tsx). */
async function requireTestimoniEditor() {
  const session = await auth.api.getSession({ headers: await headers() });
  const role = session?.user.role as Role | undefined;
  if (!session || !role || !canAccessAdminRoute(role, "/testimoni")) {
    throw new Error("Anda tidak punya akses untuk mengubah banner Testimoni.");
  }
  return session;
}

function revalidateTestimoni() {
  revalidateAdminPaths("/testimoni");
  revalidatePath("/testimoni");
}

/* ─── Banner (Hero) ─── */
export async function saveTestimoniHeroContentAction(data: {
  heroKicker: string;
  heroTitle: string;
  heroTitleHighlight: string;
  heroDescription: string;
}): Promise<ActionResult> {
  try {
    const session = await requireTestimoniEditor();
    const heroTitle = data.heroTitle.trim();
    const heroTitleHighlight = data.heroTitleHighlight.trim();
    const heroDescription = data.heroDescription.trim();

    if (!heroTitle || !heroTitleHighlight) {
      return { ok: false, message: "Judul banner gak boleh kosong." };
    }
    if (!heroDescription) {
      return { ok: false, message: "Deskripsi banner gak boleh kosong." };
    }

    await prisma.testimoniPageContent.update({
      where: { id: "1" },
      data: {
        heroKicker: data.heroKicker.trim() || null,
        heroTitle,
        heroTitleHighlight,
        heroDescription,
        updatedById: session.user.id,
      },
    });
    revalidateTestimoni();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan banner.") };
  }
}

export type TestimoniImageActionResult = { ok: true; imageUrl: string | null } | { ok: false; message: string };

/** Ganti/hapus gambar banner /testimoni — kosong (null) = balik ke kartu
 * gradient placeholder bawaan (lihat PageHero.tsx). */
export async function saveTestimoniHeroImageAction(formData: FormData): Promise<TestimoniImageActionResult> {
  try {
    const session = await requireTestimoniEditor();
    const file = formData.get("image") as File | null;
    const reset = formData.get("reset") === "true";
    const current = await prisma.testimoniPageContent.findUnique({ where: { id: "1" } });

    if (file && file.size > 0) {
      const media = await saveUploadedImage(file, "testimoni", session.user.id);
      await prisma.testimoniPageContent.update({
        where: { id: "1" },
        data: { heroImageUrl: media.url, updatedById: session.user.id },
      });
      if (current?.heroImageUrl) {
        await deleteUploadedFile(current.heroImageUrl);
        await prisma.media.deleteMany({ where: { url: current.heroImageUrl } });
      }
      revalidateTestimoni();
      return { ok: true, imageUrl: media.url };
    }

    if (reset) {
      await prisma.testimoniPageContent.update({
        where: { id: "1" },
        data: { heroImageUrl: null, updatedById: session.user.id },
      });
      if (current?.heroImageUrl) {
        await deleteUploadedFile(current.heroImageUrl);
        await prisma.media.deleteMany({ where: { url: current.heroImageUrl } });
      }
      revalidateTestimoni();
      return { ok: true, imageUrl: null };
    }

    return { ok: false, message: "Tidak ada perubahan gambar." };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan gambar banner.") };
  }
}

/* ─── Kartu Statistik (di bawah banner) ─── */
export interface TestimoniStatInput {
  icon: string;
  value: string;
  label: string;
}

export async function saveTestimoniStatsAction(data: {
  stats: TestimoniStatInput[];
}): Promise<ActionResult> {
  try {
    const session = await requireTestimoniEditor();
    const stats = data.stats.map((s) => ({ icon: s.icon, value: s.value.trim(), label: s.label.trim() }));

    if (stats.length === 0 || stats.some((s) => !s.value || !s.label)) {
      return { ok: false, message: "Setiap kartu statistik wajib punya nilai & label (minimal 1)." };
    }

    await prisma.testimoniPageContent.update({
      where: { id: "1" },
      data: {
        stats,
        updatedById: session.user.id,
      },
    });
    revalidateTestimoni();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan kartu statistik.") };
  }
}
