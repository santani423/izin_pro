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

/* Sama pola dgn requireHeroEditor() di hero.ts — SUPER_ADMIN, ADMIN, EDITOR
 * boleh ubah konten About Us (AUTHOR gak pernah sampe sini, ketahan
 * requirePanelAccess duluan di page.tsx). */
async function requireAboutEditor() {
  const session = await auth.api.getSession({ headers: await headers() });
  const role = session?.user.role as Role | undefined;
  if (!session || !role || !canAccessAdminRoute(role, "/tentang-kami")) {
    throw new Error("Anda tidak punya akses untuk mengubah konten Tentang Kami.");
  }
  return session;
}

function revalidateAbout() {
  revalidateAdminPaths("/tentang-kami");
  revalidatePath("/tentang-kami");
}

export interface AboutStatInput {
  icon: string;
  value: string;
  label: string;
}

export interface AboutValueInput {
  icon: string;
  title: string;
  description: string;
}

/* ─── Hero ─── */
export async function saveAboutHeroContentAction(data: {
  heroKicker: string;
  heroTitle: string;
  heroTitleHighlight: string;
  heroSubtitleBold: string;
  heroSubtitleBody: string;
}): Promise<ActionResult> {
  try {
    const session = await requireAboutEditor();
    const heroTitle = data.heroTitle.trim();
    const heroTitleHighlight = data.heroTitleHighlight.trim();
    const heroSubtitleBold = data.heroSubtitleBold.trim();
    const heroSubtitleBody = data.heroSubtitleBody.trim();

    if (!heroTitle || !heroTitleHighlight) {
      return { ok: false, message: "Judul hero gak boleh kosong." };
    }
    if (!heroSubtitleBold || !heroSubtitleBody) {
      return { ok: false, message: "Subjudul hero gak boleh kosong." };
    }

    await prisma.aboutPageContent.update({
      where: { id: "1" },
      data: {
        heroKicker: data.heroKicker.trim() || null,
        heroTitle,
        heroTitleHighlight,
        heroSubtitleBold,
        heroSubtitleBody,
        updatedById: session.user.id,
      },
    });
    revalidateAbout();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan konten Hero.") };
  }
}

export type AboutImageActionResult = { ok: true; imageUrl: string | null } | { ok: false; message: string };

/** Ganti/hapus gambar Hero About Us — kosong (null) = balik ke kartu
 * gradient placeholder bawaan (lihat PageHero.tsx). */
export async function saveAboutHeroImageAction(formData: FormData): Promise<AboutImageActionResult> {
  try {
    const session = await requireAboutEditor();
    const file = formData.get("image") as File | null;
    const reset = formData.get("reset") === "true";
    const current = await prisma.aboutPageContent.findUnique({ where: { id: "1" } });

    if (file && file.size > 0) {
      const media = await saveUploadedImage(file, "tentang", session.user.id);
      await prisma.aboutPageContent.update({
        where: { id: "1" },
        data: { heroImageUrl: media.url, updatedById: session.user.id },
      });
      if (current?.heroImageUrl) {
        await deleteUploadedFile(current.heroImageUrl);
        await prisma.media.deleteMany({ where: { url: current.heroImageUrl } });
      }
      revalidateAbout();
      return { ok: true, imageUrl: media.url };
    }

    if (reset) {
      await prisma.aboutPageContent.update({
        where: { id: "1" },
        data: { heroImageUrl: null, updatedById: session.user.id },
      });
      if (current?.heroImageUrl) {
        await deleteUploadedFile(current.heroImageUrl);
        await prisma.media.deleteMany({ where: { url: current.heroImageUrl } });
      }
      revalidateAbout();
      return { ok: true, imageUrl: null };
    }

    return { ok: false, message: "Tidak ada perubahan gambar." };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan gambar Hero.") };
  }
}

/* ─── Tentang Kami + Statistik ─── */
export async function saveAboutSectionContentAction(data: {
  aboutKicker: string;
  aboutTitle: string;
  aboutTitleHighlight: string;
  aboutParagraphs: string[];
  stats: AboutStatInput[];
}): Promise<ActionResult> {
  try {
    const session = await requireAboutEditor();
    const aboutKicker = data.aboutKicker.trim();
    const aboutTitle = data.aboutTitle.trim();
    const aboutTitleHighlight = data.aboutTitleHighlight.trim();
    const aboutParagraphs = data.aboutParagraphs.map((p) => p.trim()).filter(Boolean);
    const stats = data.stats.map((s) => ({ icon: s.icon, value: s.value.trim(), label: s.label.trim() }));

    if (!aboutKicker || !aboutTitle || !aboutTitleHighlight) {
      return { ok: false, message: "Kicker & judul section Tentang Kami wajib diisi." };
    }
    if (aboutParagraphs.length === 0) {
      return { ok: false, message: "Minimal 1 paragraf deskripsi wajib diisi." };
    }
    if (stats.length === 0 || stats.some((s) => !s.value || !s.label)) {
      return { ok: false, message: "Setiap statistik wajib punya nilai & label." };
    }

    await prisma.aboutPageContent.update({
      where: { id: "1" },
      data: {
        aboutKicker,
        aboutTitle,
        aboutTitleHighlight,
        aboutParagraphs,
        stats,
        updatedById: session.user.id,
      },
    });
    revalidateAbout();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan konten Tentang Kami.") };
  }
}

export async function saveAboutSectionImageAction(formData: FormData): Promise<AboutImageActionResult> {
  try {
    const session = await requireAboutEditor();
    const file = formData.get("image") as File | null;
    const reset = formData.get("reset") === "true";
    const current = await prisma.aboutPageContent.findUnique({ where: { id: "1" } });

    if (file && file.size > 0) {
      const media = await saveUploadedImage(file, "tentang", session.user.id);
      await prisma.aboutPageContent.update({
        where: { id: "1" },
        data: { aboutImageUrl: media.url, updatedById: session.user.id },
      });
      if (current?.aboutImageUrl) {
        await deleteUploadedFile(current.aboutImageUrl);
        await prisma.media.deleteMany({ where: { url: current.aboutImageUrl } });
      }
      revalidateAbout();
      return { ok: true, imageUrl: media.url };
    }

    if (reset) {
      await prisma.aboutPageContent.update({
        where: { id: "1" },
        data: { aboutImageUrl: null, updatedById: session.user.id },
      });
      if (current?.aboutImageUrl) {
        await deleteUploadedFile(current.aboutImageUrl);
        await prisma.media.deleteMany({ where: { url: current.aboutImageUrl } });
      }
      revalidateAbout();
      return { ok: true, imageUrl: null };
    }

    return { ok: false, message: "Tidak ada perubahan gambar." };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan gambar Tentang Kami.") };
  }
}

/* ─── Nilai-Nilai ─── */
export async function saveAboutValuesContentAction(data: {
  valuesEnabled: boolean;
  valuesTitle: string;
  valuesTitleHighlight: string;
  valuesSubtitle: string;
  values: AboutValueInput[];
}): Promise<ActionResult> {
  try {
    const session = await requireAboutEditor();
    const valuesTitle = data.valuesTitle.trim();
    const valuesTitleHighlight = data.valuesTitleHighlight.trim();
    const valuesSubtitle = data.valuesSubtitle.trim();
    const values = data.values.map((v) => ({ icon: v.icon, title: v.title.trim(), description: v.description.trim() }));

    if (!valuesTitle || !valuesTitleHighlight || !valuesSubtitle) {
      return { ok: false, message: "Judul & subjudul section Nilai-Nilai wajib diisi." };
    }
    if (data.valuesEnabled && (values.length === 0 || values.some((v) => !v.title || !v.description))) {
      return { ok: false, message: "Setiap nilai wajib punya judul & deskripsi (minimal 1)." };
    }

    await prisma.aboutPageContent.update({
      where: { id: "1" },
      data: {
        valuesEnabled: data.valuesEnabled,
        valuesTitle,
        valuesTitleHighlight,
        valuesSubtitle,
        values,
        updatedById: session.user.id,
      },
    });
    revalidateAbout();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan konten Nilai-Nilai.") };
  }
}

/* ─── Visi & Misi ─── */
export async function saveAboutVisiMisiContentAction(data: {
  visiMisiEnabled: boolean;
  vision: string;
  mission: string[];
}): Promise<ActionResult> {
  try {
    const session = await requireAboutEditor();
    const vision = data.vision.trim();
    const mission = data.mission.map((m) => m.trim()).filter(Boolean);

    if (data.visiMisiEnabled) {
      if (!vision) {
        return { ok: false, message: "Visi gak boleh kosong." };
      }
      if (mission.length === 0) {
        return { ok: false, message: "Minimal 1 poin misi wajib diisi." };
      }
    }

    await prisma.aboutPageContent.update({
      where: { id: "1" },
      data: {
        visiMisiEnabled: data.visiMisiEnabled,
        vision,
        mission,
        updatedById: session.user.id,
      },
    });
    revalidateAbout();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan konten Visi & Misi.") };
  }
}

/** Ganti/hapus ilustrasi skyline Visi — kosong (null) = balik ke ilustrasi
 * bawaan /images/tentang-skyline-v3.png (lihat TentangVisiMisiSection.tsx),
 * BUKAN gradient placeholder seperti gambar lain — ilustrasi ini bagian
 * desain asli yang harus tetap ada kalau admin belum ganti. */
export async function saveAboutVisionImageAction(formData: FormData): Promise<AboutImageActionResult> {
  try {
    const session = await requireAboutEditor();
    const file = formData.get("image") as File | null;
    const reset = formData.get("reset") === "true";
    const current = await prisma.aboutPageContent.findUnique({ where: { id: "1" } });

    if (file && file.size > 0) {
      const media = await saveUploadedImage(file, "tentang", session.user.id);
      await prisma.aboutPageContent.update({
        where: { id: "1" },
        data: { visionImageUrl: media.url, updatedById: session.user.id },
      });
      if (current?.visionImageUrl) {
        await deleteUploadedFile(current.visionImageUrl);
        await prisma.media.deleteMany({ where: { url: current.visionImageUrl } });
      }
      revalidateAbout();
      return { ok: true, imageUrl: media.url };
    }

    if (reset) {
      await prisma.aboutPageContent.update({
        where: { id: "1" },
        data: { visionImageUrl: null, updatedById: session.user.id },
      });
      if (current?.visionImageUrl) {
        await deleteUploadedFile(current.visionImageUrl);
        await prisma.media.deleteMany({ where: { url: current.visionImageUrl } });
      }
      revalidateAbout();
      return { ok: true, imageUrl: null };
    }

    return { ok: false, message: "Tidak ada perubahan gambar." };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan ilustrasi Visi.") };
  }
}

/** Ganti/hapus ilustrasi Misi — kosong (null) = balik ke kartu gradient
 * placeholder bawaan (beda dari Visi, blm ada ilustrasi desain asli utk
 * Misi, jadi fallback-nya gradient kayak gambar Hero/Tentang Kami lainnya). */
export async function saveAboutMissionImageAction(formData: FormData): Promise<AboutImageActionResult> {
  try {
    const session = await requireAboutEditor();
    const file = formData.get("image") as File | null;
    const reset = formData.get("reset") === "true";
    const current = await prisma.aboutPageContent.findUnique({ where: { id: "1" } });

    if (file && file.size > 0) {
      const media = await saveUploadedImage(file, "tentang", session.user.id);
      await prisma.aboutPageContent.update({
        where: { id: "1" },
        data: { missionImageUrl: media.url, updatedById: session.user.id },
      });
      if (current?.missionImageUrl) {
        await deleteUploadedFile(current.missionImageUrl);
        await prisma.media.deleteMany({ where: { url: current.missionImageUrl } });
      }
      revalidateAbout();
      return { ok: true, imageUrl: media.url };
    }

    if (reset) {
      await prisma.aboutPageContent.update({
        where: { id: "1" },
        data: { missionImageUrl: null, updatedById: session.user.id },
      });
      if (current?.missionImageUrl) {
        await deleteUploadedFile(current.missionImageUrl);
        await prisma.media.deleteMany({ where: { url: current.missionImageUrl } });
      }
      revalidateAbout();
      return { ok: true, imageUrl: null };
    }

    return { ok: false, message: "Tidak ada perubahan gambar." };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan ilustrasi Misi.") };
  }
}

/* ─── Tim (cuma judul/subjudul & toggle — anggota dikelola /admin/tim) ─── */
export async function saveAboutTeamSettingsAction(data: {
  teamEnabled: boolean;
  teamTitle: string;
  teamTitleHighlight: string;
  teamSubtitle: string;
}): Promise<ActionResult> {
  try {
    const session = await requireAboutEditor();
    const teamTitle = data.teamTitle.trim();
    const teamTitleHighlight = data.teamTitleHighlight.trim();
    const teamSubtitle = data.teamSubtitle.trim();

    if (!teamTitle || !teamTitleHighlight || !teamSubtitle) {
      return { ok: false, message: "Judul & subjudul section Tim wajib diisi." };
    }

    await prisma.aboutPageContent.update({
      where: { id: "1" },
      data: {
        teamEnabled: data.teamEnabled,
        teamTitle,
        teamTitleHighlight,
        teamSubtitle,
        updatedById: session.user.id,
      },
    });
    revalidateAbout();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan pengaturan section Tim.") };
  }
}

/* ─── SEO ─── */
export async function saveAboutSeoAction(data: {
  metaTitle: string;
  metaDescription: string;
}): Promise<ActionResult> {
  try {
    const session = await requireAboutEditor();
    await prisma.aboutPageContent.update({
      where: { id: "1" },
      data: {
        metaTitle: data.metaTitle.trim() || null,
        metaDescription: data.metaDescription.trim() || null,
        updatedById: session.user.id,
      },
    });
    revalidateAbout();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan SEO.") };
  }
}
