"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidateAdminPaths } from "@/lib/admin-guard";
import { canAccessAdminRoute } from "@/lib/permissions";
import { saveUploadedVideo, deleteUploadedFile } from "@/lib/media";
import { isValidYoutubeUrl } from "@/lib/youtube";
import { Prisma } from "@prisma/client";
import type { Role, AboutVideoSource } from "@prisma/client";

export type ActionResult = { ok: true } | { ok: false; message: string };

function errorMessage(e: unknown, fallback: string) {
  return e instanceof Error ? e.message : fallback;
}

/* Section "Tentang IzinPro" dikelola di halaman admin /beranda yang sama
 * dgn Hero (sama-sama konten beranda) — sama pola akses dgn
 * requireHeroEditor() di hero.ts. */
async function requireAboutHomeEditor() {
  const session = await auth.api.getSession({ headers: await headers() });
  const role = session?.user.role as Role | undefined;
  if (!session || !role || !canAccessAdminRoute(role, "/beranda")) {
    throw new Error("Anda tidak punya akses untuk mengubah konten Tentang IzinPro.");
  }
  return session;
}

function revalidateAboutHome() {
  revalidateAdminPaths("/beranda");
  revalidatePath("/");
}

export interface AboutHomeLangInput {
  heading: string;
  description: string;
  points: string[];
  buttonLabel: string;
  videoTitle: string;
}

/** null kalau field EN/ZH gak diisi sama sekali — biar getAboutHomeContent()
 * di beranda gampang bedain "belum diterjemahkan" dari "diterjemahkan tapi
 * kosong". Sama pola dgn stringArrayOrNull() di actions/about.ts. */
function pointsOrNull(points: string[]) {
  const cleaned = points.map((p) => p.trim());
  return cleaned.every((p) => !p) ? null : cleaned;
}

export async function saveAboutHomeContentAction(data: {
  id: AboutHomeLangInput;
  en: AboutHomeLangInput;
  zh: AboutHomeLangInput;
  buttonHref: string;
}): Promise<ActionResult> {
  try {
    const session = await requireAboutHomeEditor();
    const heading = data.id.heading.trim();
    const description = data.id.description.trim();
    const buttonLabel = data.id.buttonLabel.trim();
    const videoTitle = data.id.videoTitle.trim();
    const buttonHref = data.buttonHref.trim();
    const points = data.id.points.map((p) => p.trim()).filter(Boolean);

    if (!heading) return { ok: false, message: "Judul (Bahasa Indonesia) gak boleh kosong." };
    if (!description) return { ok: false, message: "Deskripsi (Bahasa Indonesia) gak boleh kosong." };
    if (points.length === 0) return { ok: false, message: "Minimal 1 poin checklist wajib diisi." };
    if (!buttonLabel || !buttonHref) return { ok: false, message: "Label & link tombol gak boleh kosong." };
    if (!videoTitle) return { ok: false, message: "Judul video (aksesibilitas) gak boleh kosong." };

    await prisma.aboutHomeContent.update({
      where: { id: "1" },
      data: {
        heading,
        description,
        points,
        buttonLabel,
        buttonHref,
        videoTitle,
        headingEn: data.en.heading.trim() || null,
        descriptionEn: data.en.description.trim() || null,
        pointsEn: pointsOrNull(data.en.points) ?? Prisma.DbNull,
        buttonLabelEn: data.en.buttonLabel.trim() || null,
        videoTitleEn: data.en.videoTitle.trim() || null,
        headingZh: data.zh.heading.trim() || null,
        descriptionZh: data.zh.description.trim() || null,
        pointsZh: pointsOrNull(data.zh.points) ?? Prisma.DbNull,
        buttonLabelZh: data.zh.buttonLabel.trim() || null,
        videoTitleZh: data.zh.videoTitle.trim() || null,
        updatedById: session.user.id,
      },
    });

    revalidateAboutHome();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan konten Tentang IzinPro.") };
  }
}

export type AboutHomeVideoActionResult =
  | { ok: true; videoSource: AboutVideoSource; videoYoutubeUrl: string | null; videoUploadUrl: string | null }
  | { ok: false; message: string };

/** Ganti sumber video kolom kanan section Tentang — YouTube (link ditempel
 * admin, disimpan apa adanya) atau upload file (disimpan di
 * public/uploads/about-home, lama dihapus kalau diganti). */
export async function saveAboutHomeVideoAction(formData: FormData): Promise<AboutHomeVideoActionResult> {
  try {
    const session = await requireAboutHomeEditor();
    const source = formData.get("source") as AboutVideoSource | null;
    const current = await prisma.aboutHomeContent.findUnique({ where: { id: "1" } });

    if (source === "YOUTUBE") {
      const youtubeUrl = (formData.get("youtubeUrl") as string | null)?.trim() ?? "";
      if (!youtubeUrl || !isValidYoutubeUrl(youtubeUrl)) {
        return { ok: false, message: "Link YouTube tidak valid. Pastikan URL video YouTube yang benar." };
      }
      await prisma.aboutHomeContent.update({
        where: { id: "1" },
        data: {
          videoSource: "YOUTUBE",
          videoYoutubeUrl: youtubeUrl,
          videoUploadUrl: null,
          updatedById: session.user.id,
        },
      });
      if (current?.videoUploadUrl) {
        await deleteUploadedFile(current.videoUploadUrl);
      }
      revalidateAboutHome();
      return { ok: true, videoSource: "YOUTUBE", videoYoutubeUrl: youtubeUrl, videoUploadUrl: null };
    }

    if (source === "UPLOAD") {
      const file = formData.get("video") as File | null;
      if (!file || file.size === 0) {
        return { ok: false, message: "File video wajib diunggah." };
      }
      const { url } = await saveUploadedVideo(file, "about-home");
      await prisma.aboutHomeContent.update({
        where: { id: "1" },
        data: {
          videoSource: "UPLOAD",
          videoUploadUrl: url,
          updatedById: session.user.id,
        },
      });
      if (current?.videoUploadUrl) {
        await deleteUploadedFile(current.videoUploadUrl);
      }
      revalidateAboutHome();
      return { ok: true, videoSource: "UPLOAD", videoYoutubeUrl: current?.videoYoutubeUrl ?? null, videoUploadUrl: url };
    }

    return { ok: false, message: "Sumber video tidak valid." };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan video.") };
  }
}
