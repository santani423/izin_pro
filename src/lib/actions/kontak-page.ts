"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidateAdminPaths } from "@/lib/admin-guard";
import { canAccessAdminRoute } from "@/lib/permissions";
import { saveUploadedImage, deleteUploadedFile } from "@/lib/media";
import { extractMapsEmbedSrc, isNonEmbeddableMapsUrl } from "@/lib/maps-embed";
import type { Role } from "@prisma/client";

export type ActionResult = { ok: true } | { ok: false; message: string };

function errorMessage(e: unknown, fallback: string) {
  return e instanceof Error ? e.message : fallback;
}

/* Sama pola dgn requireTestimoniEditor()/requirePromoEditor() — SUPER_ADMIN,
 * ADMIN, EDITOR boleh ubah konten Kontak (AUTHOR gak pernah sampe sini,
 * ketahan requirePanelAccess duluan di page.tsx). */
async function requireKontakEditor() {
  const session = await auth.api.getSession({ headers: await headers() });
  const role = session?.user.role as Role | undefined;
  if (!session || !role || !canAccessAdminRoute(role, "/kontak")) {
    throw new Error("Anda tidak punya akses untuk mengubah konten Kontak.");
  }
  return session;
}

function revalidateKontak() {
  revalidateAdminPaths("/kontak");
  revalidatePath("/kontak");
}

/* ─── Banner (Hero) ─── */
export async function saveKontakHeroContentAction(data: {
  heroKicker: string;
  heroTitle: string;
  heroTitleHighlight: string;
  heroDescription: string;
}): Promise<ActionResult> {
  try {
    const session = await requireKontakEditor();
    const heroTitle = data.heroTitle.trim();
    const heroTitleHighlight = data.heroTitleHighlight.trim();
    const heroDescription = data.heroDescription.trim();

    if (!heroTitle || !heroTitleHighlight) {
      return { ok: false, message: "Judul banner gak boleh kosong." };
    }
    if (!heroDescription) {
      return { ok: false, message: "Deskripsi banner gak boleh kosong." };
    }

    await prisma.kontakPageContent.update({
      where: { id: "1" },
      data: {
        heroKicker: data.heroKicker.trim() || null,
        heroTitle,
        heroTitleHighlight,
        heroDescription,
        updatedById: session.user.id,
      },
    });
    revalidateKontak();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan banner.") };
  }
}

export type KontakImageActionResult = { ok: true; imageUrl: string | null } | { ok: false; message: string };

/** Ganti/hapus gambar banner /kontak — kosong (null) = balik ke kartu
 * gradient placeholder bawaan (lihat PageHero.tsx). */
export async function saveKontakHeroImageAction(formData: FormData): Promise<KontakImageActionResult> {
  try {
    const session = await requireKontakEditor();
    const file = formData.get("image") as File | null;
    const reset = formData.get("reset") === "true";
    const current = await prisma.kontakPageContent.findUnique({ where: { id: "1" } });

    if (file && file.size > 0) {
      const media = await saveUploadedImage(file, "kontak", session.user.id);
      await prisma.kontakPageContent.update({
        where: { id: "1" },
        data: { heroImageUrl: media.url, updatedById: session.user.id },
      });
      if (current?.heroImageUrl) {
        await deleteUploadedFile(current.heroImageUrl);
        await prisma.media.deleteMany({ where: { url: current.heroImageUrl } });
      }
      revalidateKontak();
      return { ok: true, imageUrl: media.url };
    }

    if (reset) {
      await prisma.kontakPageContent.update({
        where: { id: "1" },
        data: { heroImageUrl: null, updatedById: session.user.id },
      });
      if (current?.heroImageUrl) {
        await deleteUploadedFile(current.heroImageUrl);
        await prisma.media.deleteMany({ where: { url: current.heroImageUrl } });
      }
      revalidateKontak();
      return { ok: true, imageUrl: null };
    }

    return { ok: false, message: "Tidak ada perubahan gambar." };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan gambar banner.") };
  }
}

/* ─── Bar info kontak ─── */
export interface KontakInfoCardInput {
  icon: string;
  title: string;
  value: string;
  note: string;
}

export async function saveKontakInfoCardsAction(data: {
  infoCards: KontakInfoCardInput[];
}): Promise<ActionResult> {
  try {
    const session = await requireKontakEditor();
    const infoCards = data.infoCards.map((c) => ({
      icon: c.icon,
      title: c.title.trim(),
      value: c.value.trim(),
      note: c.note.trim(),
    }));

    if (infoCards.length === 0 || infoCards.some((c) => !c.title || !c.value)) {
      return { ok: false, message: "Setiap kartu info wajib punya judul & nilai (minimal 1)." };
    }

    await prisma.kontakPageContent.update({
      where: { id: "1" },
      data: { infoCards, updatedById: session.user.id },
    });
    revalidateKontak();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan kartu info.") };
  }
}

/* ─── Form + sidebar kanal kontak ─── */
export interface KontakChannelInput {
  icon: string;
  title: string;
  value: string;
  note: string;
  href: string;
}

export async function saveKontakFormSectionAction(data: {
  formTitle: string;
  formSubtitle: string;
  sidebarTitle: string;
  sidebarSubtitle: string;
  channels: KontakChannelInput[];
}): Promise<ActionResult> {
  try {
    const session = await requireKontakEditor();
    const formTitle = data.formTitle.trim();
    const formSubtitle = data.formSubtitle.trim();
    const sidebarTitle = data.sidebarTitle.trim();
    const sidebarSubtitle = data.sidebarSubtitle.trim();
    const channels = data.channels.map((c) => ({
      icon: c.icon,
      title: c.title.trim(),
      value: c.value.trim() || null,
      note: c.note.trim() || null,
      href: c.href.trim(),
    }));

    if (!formTitle || !formSubtitle) {
      return { ok: false, message: "Judul & subjudul form wajib diisi." };
    }
    if (!sidebarTitle || !sidebarSubtitle) {
      return { ok: false, message: "Judul & subjudul sidebar wajib diisi." };
    }
    if (channels.length === 0 || channels.some((c) => !c.title || !c.href)) {
      return { ok: false, message: "Setiap kanal wajib punya judul & link (minimal 1)." };
    }

    await prisma.kontakPageContent.update({
      where: { id: "1" },
      data: { formTitle, formSubtitle, sidebarTitle, sidebarSubtitle, channels, updatedById: session.user.id },
    });
    revalidateKontak();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan konten form.") };
  }
}

/* ─── Lokasi kantor ─── */
export async function saveKontakLocationAction(data: {
  locationTitle: string;
  mapsEmbedUrl: string;
}): Promise<ActionResult> {
  try {
    const session = await requireKontakEditor();
    const locationTitle = data.locationTitle.trim();
    const mapsEmbedUrl = extractMapsEmbedSrc(data.mapsEmbedUrl);

    if (!locationTitle) {
      return { ok: false, message: "Judul lokasi wajib diisi." };
    }
    if (!mapsEmbedUrl) {
      return { ok: false, message: "URL embed peta wajib diisi." };
    }
    if (isNonEmbeddableMapsUrl(mapsEmbedUrl)) {
      return {
        ok: false,
        message:
          'Tautan itu cuma buat share (goo.gl), gak bisa ditampilkan sebagai peta tertanam — nanti petanya blank/gak muncul. Buka Google Maps → Bagikan → tab "Sematkan peta" (bukan "Kirim tautan") → salin kodenya, tempel di sini.',
      };
    }

    await prisma.kontakPageContent.update({
      where: { id: "1" },
      data: { locationTitle, mapsEmbedUrl, updatedById: session.user.id },
    });
    revalidateKontak();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan lokasi.") };
  }
}

/* ─── FAQ — judul section + kartu bantuan (daftar FAQ-nya sendiri di /admin/faq) ─── */
export async function saveKontakFaqSectionAction(data: {
  faqTitlePrefix: string;
  faqTitleHighlight: string;
  helpCardTitle: string;
  helpCardDescription: string;
  helpCardButtonLabel: string;
}): Promise<ActionResult> {
  try {
    const session = await requireKontakEditor();
    const faqTitlePrefix = data.faqTitlePrefix.trim();
    const faqTitleHighlight = data.faqTitleHighlight.trim();
    const helpCardTitle = data.helpCardTitle.trim();
    const helpCardDescription = data.helpCardDescription.trim();
    const helpCardButtonLabel = data.helpCardButtonLabel.trim();

    if (!faqTitlePrefix || !faqTitleHighlight) {
      return { ok: false, message: "Judul section FAQ wajib diisi." };
    }
    if (!helpCardTitle || !helpCardDescription || !helpCardButtonLabel) {
      return { ok: false, message: "Judul, deskripsi & label tombol kartu bantuan wajib diisi." };
    }

    await prisma.kontakPageContent.update({
      where: { id: "1" },
      data: {
        faqTitlePrefix,
        faqTitleHighlight,
        helpCardTitle,
        helpCardDescription,
        helpCardButtonLabel,
        updatedById: session.user.id,
      },
    });
    revalidateKontak();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan konten FAQ.") };
  }
}

/** Ganti/hapus foto kartu bantuan FAQ — kosong (null) = balik ke foto bawaan
 * /images/promo-konsultasi.png (lihat KontakFaqSection.tsx). */
export async function saveKontakHelpCardImageAction(formData: FormData): Promise<KontakImageActionResult> {
  try {
    const session = await requireKontakEditor();
    const file = formData.get("image") as File | null;
    const reset = formData.get("reset") === "true";
    const current = await prisma.kontakPageContent.findUnique({ where: { id: "1" } });

    if (file && file.size > 0) {
      const media = await saveUploadedImage(file, "kontak", session.user.id);
      await prisma.kontakPageContent.update({
        where: { id: "1" },
        data: { helpCardImageUrl: media.url, updatedById: session.user.id },
      });
      if (current?.helpCardImageUrl) {
        await deleteUploadedFile(current.helpCardImageUrl);
        await prisma.media.deleteMany({ where: { url: current.helpCardImageUrl } });
      }
      revalidateKontak();
      return { ok: true, imageUrl: media.url };
    }

    if (reset) {
      await prisma.kontakPageContent.update({
        where: { id: "1" },
        data: { helpCardImageUrl: null, updatedById: session.user.id },
      });
      if (current?.helpCardImageUrl) {
        await deleteUploadedFile(current.helpCardImageUrl);
        await prisma.media.deleteMany({ where: { url: current.helpCardImageUrl } });
      }
      revalidateKontak();
      return { ok: true, imageUrl: null };
    }

    return { ok: false, message: "Tidak ada perubahan gambar." };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan gambar.") };
  }
}
