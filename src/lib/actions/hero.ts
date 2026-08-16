"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidateAdminPaths } from "@/lib/admin-guard";
import { canAccessAdminRoute } from "@/lib/permissions";
import { saveUploadedImage, deleteUploadedFile } from "@/lib/media";
import { Prisma } from "@prisma/client";
import type { Role } from "@prisma/client";

export type ActionResult = { ok: true } | { ok: false; message: string };

function errorMessage(e: unknown, fallback: string) {
  return e instanceof Error ? e.message : fallback;
}

/* Sama kayak matrix akses /beranda di permissions.ts — SUPER_ADMIN, ADMIN,
 * EDITOR boleh ubah (AUTHOR gak pernah sampe sini, ketahan requirePanelAccess
 * duluan di page.tsx). */
async function requireHeroEditor() {
  const session = await auth.api.getSession({ headers: await headers() });
  const role = session?.user.role as Role | undefined;
  if (!session || !role || !canAccessAdminRoute(role, "/beranda")) {
    throw new Error("Anda tidak punya akses untuk mengubah konten Hero.");
  }
  return session;
}

export type HeroHighlightInput = { title: string; subtitle: string };

/** Bersihin 1 set highlight (3 badge) — trim tiap field, biarin kosong ("")
 * kalau admin gak isi (fallback per-badge ke Bahasa Indonesia, lihat
 * pickHighlights() di src/lib/general-settings.ts). */
function cleanHighlights(highlights: HeroHighlightInput[]): HeroHighlightInput[] {
  return highlights.map((h) => ({ title: h.title.trim(), subtitle: h.subtitle.trim() }));
}

/** null kalau SEMUA 3 badge kosong (belum diterjemahkan sama sekali) —
 * biar getLocalizedHeroContent() gak perlu bedain "array isinya string
 * kosong semua" dari "belum pernah diisi". */
function highlightsOrNull(highlights: HeroHighlightInput[]) {
  const cleaned = cleanHighlights(highlights);
  return cleaned.every((h) => !h.title && !h.subtitle) ? null : cleaned;
}

export interface HeroContentLangInput {
  titleLine1: string;
  titleHighlight: string;
  titleLine3: string;
  subtitle: string;
  highlights: HeroHighlightInput[];
  ctaPrimaryLabel: string;
  ctaSecondaryLabel: string;
}

export async function saveHeroContentAction(data: {
  id: HeroContentLangInput;
  en: HeroContentLangInput;
  zh: HeroContentLangInput;
  ctaSecondaryHref: string;
}): Promise<ActionResult> {
  try {
    const session = await requireHeroEditor();

    const titleLine1 = data.id.titleLine1.trim();
    const titleHighlight = data.id.titleHighlight.trim();
    const titleLine3 = data.id.titleLine3.trim();
    const subtitle = data.id.subtitle.trim();
    const ctaPrimaryLabel = data.id.ctaPrimaryLabel.trim();
    const ctaSecondaryLabel = data.id.ctaSecondaryLabel.trim();
    const ctaSecondaryHref = data.ctaSecondaryHref.trim();
    const highlights = cleanHighlights(data.id.highlights);

    if (!titleLine1 || !titleHighlight || !titleLine3) {
      return { ok: false, message: "Judul hero (Bahasa Indonesia) gak boleh kosong." };
    }
    if (!subtitle) {
      return { ok: false, message: "Subjudul (Bahasa Indonesia) gak boleh kosong." };
    }
    if (!ctaPrimaryLabel || !ctaSecondaryLabel || !ctaSecondaryHref) {
      return { ok: false, message: "Label & link tombol (Bahasa Indonesia) gak boleh kosong." };
    }
    if (highlights.length !== 3 || highlights.some((h) => !h.title || !h.subtitle)) {
      return { ok: false, message: "Ketiga badge highlight (Bahasa Indonesia) wajib diisi (judul & subjudul)." };
    }

    await prisma.heroContent.update({
      where: { id: "1" },
      data: {
        titleLine1,
        titleHighlight,
        titleLine3,
        subtitle,
        highlights,
        ctaPrimaryLabel,
        ctaSecondaryLabel,
        ctaSecondaryHref,
        titleLine1En: data.en.titleLine1.trim() || null,
        titleHighlightEn: data.en.titleHighlight.trim() || null,
        titleLine3En: data.en.titleLine3.trim() || null,
        subtitleEn: data.en.subtitle.trim() || null,
        highlightsEn: highlightsOrNull(data.en.highlights) ?? Prisma.DbNull,
        ctaPrimaryLabelEn: data.en.ctaPrimaryLabel.trim() || null,
        ctaSecondaryLabelEn: data.en.ctaSecondaryLabel.trim() || null,
        titleLine1Zh: data.zh.titleLine1.trim() || null,
        titleHighlightZh: data.zh.titleHighlight.trim() || null,
        titleLine3Zh: data.zh.titleLine3.trim() || null,
        subtitleZh: data.zh.subtitle.trim() || null,
        highlightsZh: highlightsOrNull(data.zh.highlights) ?? Prisma.DbNull,
        ctaPrimaryLabelZh: data.zh.ctaPrimaryLabel.trim() || null,
        ctaSecondaryLabelZh: data.zh.ctaSecondaryLabel.trim() || null,
        updatedById: session.user.id,
      },
    });

    revalidateAdminPaths("/beranda");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan konten Hero.") };
  }
}

export type HeroImageActionResult = { ok: true; imageUrl: string | null } | { ok: false; message: string };

/** Ganti/hapus gambar kolom kanan Hero. Kosong (null) = balik ke kartu
 * gradient placeholder bawaan — lihat fallback di HeroSection.tsx. */
export async function saveHeroImageAction(formData: FormData): Promise<HeroImageActionResult> {
  try {
    const session = await requireHeroEditor();
    const file = formData.get("image") as File | null;
    const reset = formData.get("reset") === "true";
    const current = await prisma.heroContent.findUnique({ where: { id: "1" } });

    if (file && file.size > 0) {
      const media = await saveUploadedImage(file, "hero", session.user.id);
      await prisma.heroContent.update({
        where: { id: "1" },
        data: { heroImageUrl: media.url, updatedById: session.user.id },
      });
      if (current?.heroImageUrl) {
        await deleteUploadedFile(current.heroImageUrl);
        await prisma.media.deleteMany({ where: { url: current.heroImageUrl } });
      }
      revalidateAdminPaths("/beranda");
      revalidatePath("/");
      return { ok: true, imageUrl: media.url };
    }

    if (reset) {
      await prisma.heroContent.update({
        where: { id: "1" },
        data: { heroImageUrl: null, updatedById: session.user.id },
      });
      if (current?.heroImageUrl) {
        await deleteUploadedFile(current.heroImageUrl);
        await prisma.media.deleteMany({ where: { url: current.heroImageUrl } });
      }
      revalidateAdminPaths("/beranda");
      revalidatePath("/");
      return { ok: true, imageUrl: null };
    }

    return { ok: false, message: "Tidak ada perubahan gambar." };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan gambar Hero.") };
  }
}
