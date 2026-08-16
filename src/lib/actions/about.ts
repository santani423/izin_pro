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
export interface AboutStatLangInput {
  value: string;
  label: string;
}

export interface AboutValueInput {
  icon: string;
  title: string;
  description: string;
}
export interface AboutValueLangInput {
  title: string;
  description: string;
}

/* ─── Helper fallback per-index (array EN/ZH kosong semua -> null, biar
 * getLocalizedAboutContent() gampang bedain "belum diterjemahkan" dari
 * "diterjemahkan tapi isinya string kosong"). Sama pola dgn hero.ts. ─── */
function stringArrayOrNull(arr: string[]): string[] | null {
  const cleaned = arr.map((s) => s.trim());
  return cleaned.every((s) => !s) ? null : cleaned;
}
function statsLangOrNull(stats: AboutStatLangInput[]) {
  const cleaned = stats.map((s) => ({ value: s.value.trim(), label: s.label.trim() }));
  return cleaned.every((s) => !s.value && !s.label) ? null : cleaned;
}
function valuesLangOrNull(values: AboutValueLangInput[]) {
  const cleaned = values.map((v) => ({ title: v.title.trim(), description: v.description.trim() }));
  return cleaned.every((v) => !v.title && !v.description) ? null : cleaned;
}

/* ─── Hero ─── */
export interface AboutHeroLangInput {
  heroKicker: string;
  heroTitle: string;
  heroTitleHighlight: string;
  heroSubtitleBold: string;
  heroSubtitleBody: string;
}

export async function saveAboutHeroContentAction(data: {
  id: AboutHeroLangInput;
  en: AboutHeroLangInput;
  zh: AboutHeroLangInput;
}): Promise<ActionResult> {
  try {
    const session = await requireAboutEditor();
    const heroTitle = data.id.heroTitle.trim();
    const heroTitleHighlight = data.id.heroTitleHighlight.trim();
    const heroSubtitleBold = data.id.heroSubtitleBold.trim();
    const heroSubtitleBody = data.id.heroSubtitleBody.trim();

    if (!heroTitle || !heroTitleHighlight) {
      return { ok: false, message: "Judul hero (Bahasa Indonesia) gak boleh kosong." };
    }
    if (!heroSubtitleBold || !heroSubtitleBody) {
      return { ok: false, message: "Subjudul hero (Bahasa Indonesia) gak boleh kosong." };
    }

    await prisma.aboutPageContent.update({
      where: { id: "1" },
      data: {
        heroKicker: data.id.heroKicker.trim() || null,
        heroTitle,
        heroTitleHighlight,
        heroSubtitleBold,
        heroSubtitleBody,
        heroKickerEn: data.en.heroKicker.trim() || null,
        heroTitleEn: data.en.heroTitle.trim() || null,
        heroTitleHighlightEn: data.en.heroTitleHighlight.trim() || null,
        heroSubtitleBoldEn: data.en.heroSubtitleBold.trim() || null,
        heroSubtitleBodyEn: data.en.heroSubtitleBody.trim() || null,
        heroKickerZh: data.zh.heroKicker.trim() || null,
        heroTitleZh: data.zh.heroTitle.trim() || null,
        heroTitleHighlightZh: data.zh.heroTitleHighlight.trim() || null,
        heroSubtitleBoldZh: data.zh.heroSubtitleBold.trim() || null,
        heroSubtitleBodyZh: data.zh.heroSubtitleBody.trim() || null,
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
export interface AboutSectionIdInput {
  aboutKicker: string;
  aboutTitle: string;
  aboutTitleHighlight: string;
  aboutParagraphs: string[];
  stats: AboutStatInput[];
}
export interface AboutSectionLangInput {
  aboutKicker: string;
  aboutTitle: string;
  aboutTitleHighlight: string;
  aboutParagraphs: string[];
  stats: AboutStatLangInput[];
}

export async function saveAboutSectionContentAction(data: {
  id: AboutSectionIdInput;
  en: AboutSectionLangInput;
  zh: AboutSectionLangInput;
}): Promise<ActionResult> {
  try {
    const session = await requireAboutEditor();
    const aboutKicker = data.id.aboutKicker.trim();
    const aboutTitle = data.id.aboutTitle.trim();
    const aboutTitleHighlight = data.id.aboutTitleHighlight.trim();
    const aboutParagraphs = data.id.aboutParagraphs.map((p) => p.trim()).filter(Boolean);
    const stats = data.id.stats.map((s) => ({ icon: s.icon, value: s.value.trim(), label: s.label.trim() }));

    if (!aboutKicker || !aboutTitle || !aboutTitleHighlight) {
      return { ok: false, message: "Kicker & judul section Tentang Kami (Bahasa Indonesia) wajib diisi." };
    }
    if (aboutParagraphs.length === 0) {
      return { ok: false, message: "Minimal 1 paragraf deskripsi (Bahasa Indonesia) wajib diisi." };
    }
    if (stats.length === 0 || stats.some((s) => !s.value || !s.label)) {
      return { ok: false, message: "Setiap statistik (Bahasa Indonesia) wajib punya nilai & label." };
    }

    await prisma.aboutPageContent.update({
      where: { id: "1" },
      data: {
        aboutKicker,
        aboutTitle,
        aboutTitleHighlight,
        aboutParagraphs,
        stats,
        aboutKickerEn: data.en.aboutKicker.trim() || null,
        aboutTitleEn: data.en.aboutTitle.trim() || null,
        aboutTitleHighlightEn: data.en.aboutTitleHighlight.trim() || null,
        aboutParagraphsEn: stringArrayOrNull(data.en.aboutParagraphs) ?? Prisma.DbNull,
        statsEn: statsLangOrNull(data.en.stats) ?? Prisma.DbNull,
        aboutKickerZh: data.zh.aboutKicker.trim() || null,
        aboutTitleZh: data.zh.aboutTitle.trim() || null,
        aboutTitleHighlightZh: data.zh.aboutTitleHighlight.trim() || null,
        aboutParagraphsZh: stringArrayOrNull(data.zh.aboutParagraphs) ?? Prisma.DbNull,
        statsZh: statsLangOrNull(data.zh.stats) ?? Prisma.DbNull,
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
export interface AboutValuesIdInput {
  valuesEnabled: boolean;
  valuesTitle: string;
  valuesTitleHighlight: string;
  valuesSubtitle: string;
  values: AboutValueInput[];
}
export interface AboutValuesLangInput {
  valuesTitle: string;
  valuesTitleHighlight: string;
  valuesSubtitle: string;
  values: AboutValueLangInput[];
}

export async function saveAboutValuesContentAction(data: {
  id: AboutValuesIdInput;
  en: AboutValuesLangInput;
  zh: AboutValuesLangInput;
}): Promise<ActionResult> {
  try {
    const session = await requireAboutEditor();
    const valuesTitle = data.id.valuesTitle.trim();
    const valuesTitleHighlight = data.id.valuesTitleHighlight.trim();
    const valuesSubtitle = data.id.valuesSubtitle.trim();
    const values = data.id.values.map((v) => ({ icon: v.icon, title: v.title.trim(), description: v.description.trim() }));

    if (!valuesTitle || !valuesTitleHighlight || !valuesSubtitle) {
      return { ok: false, message: "Judul & subjudul section Nilai-Nilai (Bahasa Indonesia) wajib diisi." };
    }
    if (data.id.valuesEnabled && (values.length === 0 || values.some((v) => !v.title || !v.description))) {
      return { ok: false, message: "Setiap nilai (Bahasa Indonesia) wajib punya judul & deskripsi (minimal 1)." };
    }

    await prisma.aboutPageContent.update({
      where: { id: "1" },
      data: {
        valuesEnabled: data.id.valuesEnabled,
        valuesTitle,
        valuesTitleHighlight,
        valuesSubtitle,
        values,
        valuesTitleEn: data.en.valuesTitle.trim() || null,
        valuesTitleHighlightEn: data.en.valuesTitleHighlight.trim() || null,
        valuesSubtitleEn: data.en.valuesSubtitle.trim() || null,
        valuesEn: valuesLangOrNull(data.en.values) ?? Prisma.DbNull,
        valuesTitleZh: data.zh.valuesTitle.trim() || null,
        valuesTitleHighlightZh: data.zh.valuesTitleHighlight.trim() || null,
        valuesSubtitleZh: data.zh.valuesSubtitle.trim() || null,
        valuesZh: valuesLangOrNull(data.zh.values) ?? Prisma.DbNull,
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
export interface AboutVisiMisiLangInput {
  vision: string;
  mission: string[];
}

export async function saveAboutVisiMisiContentAction(data: {
  visiMisiEnabled: boolean;
  id: AboutVisiMisiLangInput;
  en: AboutVisiMisiLangInput;
  zh: AboutVisiMisiLangInput;
}): Promise<ActionResult> {
  try {
    const session = await requireAboutEditor();
    const vision = data.id.vision.trim();
    const mission = data.id.mission.map((m) => m.trim()).filter(Boolean);

    if (data.visiMisiEnabled) {
      if (!vision) {
        return { ok: false, message: "Visi (Bahasa Indonesia) gak boleh kosong." };
      }
      if (mission.length === 0) {
        return { ok: false, message: "Minimal 1 poin misi (Bahasa Indonesia) wajib diisi." };
      }
    }

    await prisma.aboutPageContent.update({
      where: { id: "1" },
      data: {
        visiMisiEnabled: data.visiMisiEnabled,
        vision,
        mission,
        visionEn: data.en.vision.trim() || null,
        missionEn: stringArrayOrNull(data.en.mission) ?? Prisma.DbNull,
        visionZh: data.zh.vision.trim() || null,
        missionZh: stringArrayOrNull(data.zh.mission) ?? Prisma.DbNull,
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
export interface AboutTeamLangInput {
  teamTitle: string;
  teamTitleHighlight: string;
  teamSubtitle: string;
}

export async function saveAboutTeamSettingsAction(data: {
  teamEnabled: boolean;
  id: AboutTeamLangInput;
  en: AboutTeamLangInput;
  zh: AboutTeamLangInput;
}): Promise<ActionResult> {
  try {
    const session = await requireAboutEditor();
    const teamTitle = data.id.teamTitle.trim();
    const teamTitleHighlight = data.id.teamTitleHighlight.trim();
    const teamSubtitle = data.id.teamSubtitle.trim();

    if (!teamTitle || !teamTitleHighlight || !teamSubtitle) {
      return { ok: false, message: "Judul & subjudul section Tim (Bahasa Indonesia) wajib diisi." };
    }

    await prisma.aboutPageContent.update({
      where: { id: "1" },
      data: {
        teamEnabled: data.teamEnabled,
        teamTitle,
        teamTitleHighlight,
        teamSubtitle,
        teamTitleEn: data.en.teamTitle.trim() || null,
        teamTitleHighlightEn: data.en.teamTitleHighlight.trim() || null,
        teamSubtitleEn: data.en.teamSubtitle.trim() || null,
        teamTitleZh: data.zh.teamTitle.trim() || null,
        teamTitleHighlightZh: data.zh.teamTitleHighlight.trim() || null,
        teamSubtitleZh: data.zh.teamSubtitle.trim() || null,
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
export interface AboutSeoLangInput {
  metaTitle: string;
  metaDescription: string;
}

export async function saveAboutSeoAction(data: {
  id: AboutSeoLangInput;
  en: AboutSeoLangInput;
  zh: AboutSeoLangInput;
}): Promise<ActionResult> {
  try {
    const session = await requireAboutEditor();
    await prisma.aboutPageContent.update({
      where: { id: "1" },
      data: {
        metaTitle: data.id.metaTitle.trim() || null,
        metaDescription: data.id.metaDescription.trim() || null,
        metaTitleEn: data.en.metaTitle.trim() || null,
        metaDescriptionEn: data.en.metaDescription.trim() || null,
        metaTitleZh: data.zh.metaTitle.trim() || null,
        metaDescriptionZh: data.zh.metaDescription.trim() || null,
        updatedById: session.user.id,
      },
    });
    revalidateAbout();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan SEO.") };
  }
}
