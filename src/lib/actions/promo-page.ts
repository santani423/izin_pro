"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidateAdminPaths } from "@/lib/admin-guard";
import { canAccessAdminRoute } from "@/lib/permissions";
import { saveUploadedImage, deleteUploadedFile } from "@/lib/media";
import type { Role, PromoBannerVariant } from "@prisma/client";

export type ActionResult = { ok: true } | { ok: false; message: string };

function errorMessage(e: unknown, fallback: string) {
  return e instanceof Error ? e.message : fallback;
}

/* Sama pola dgn requireHeroEditor()/requireAboutEditor()/requireTestimoniEditor()
 * — SUPER_ADMIN, ADMIN, EDITOR boleh ubah konten Promo (AUTHOR gak pernah
 * sampe sini, ketahan requirePanelAccess duluan di page.tsx). */
async function requirePromoEditor() {
  const session = await auth.api.getSession({ headers: await headers() });
  const role = session?.user.role as Role | undefined;
  if (!session || !role || !canAccessAdminRoute(role, "/promo")) {
    throw new Error("Anda tidak punya akses untuk mengubah konten Promo.");
  }
  return session;
}

function revalidatePromo() {
  revalidateAdminPaths("/promo");
  revalidatePath("/promo");
}

/* ─── Banner (Hero) ─── */
export async function savePromoHeroContentAction(data: {
  heroKicker: string;
  heroTitle: string;
  heroTitleHighlight: string;
  heroDescription: string;
}): Promise<ActionResult> {
  try {
    const session = await requirePromoEditor();
    const heroTitle = data.heroTitle.trim();
    const heroTitleHighlight = data.heroTitleHighlight.trim();
    const heroDescription = data.heroDescription.trim();

    if (!heroTitle || !heroTitleHighlight) {
      return { ok: false, message: "Judul banner gak boleh kosong." };
    }
    if (!heroDescription) {
      return { ok: false, message: "Deskripsi banner gak boleh kosong." };
    }

    await prisma.promoPageContent.update({
      where: { id: "1" },
      data: {
        heroKicker: data.heroKicker.trim() || null,
        heroTitle,
        heroTitleHighlight,
        heroDescription,
        updatedById: session.user.id,
      },
    });
    revalidatePromo();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan banner.") };
  }
}

export type PromoImageActionResult = { ok: true; imageUrl: string | null } | { ok: false; message: string };

/** Ganti/hapus gambar banner /promo — kosong (null) = balik ke kartu gradient
 * placeholder bawaan (lihat PageHero.tsx). */
export async function savePromoHeroImageAction(formData: FormData): Promise<PromoImageActionResult> {
  try {
    const session = await requirePromoEditor();
    const file = formData.get("image") as File | null;
    const reset = formData.get("reset") === "true";
    const current = await prisma.promoPageContent.findUnique({ where: { id: "1" } });

    if (file && file.size > 0) {
      const media = await saveUploadedImage(file, "promo", session.user.id);
      await prisma.promoPageContent.update({
        where: { id: "1" },
        data: { heroImageUrl: media.url, updatedById: session.user.id },
      });
      if (current?.heroImageUrl) {
        await deleteUploadedFile(current.heroImageUrl);
        await prisma.media.deleteMany({ where: { url: current.heroImageUrl } });
      }
      revalidatePromo();
      return { ok: true, imageUrl: media.url };
    }

    if (reset) {
      await prisma.promoPageContent.update({
        where: { id: "1" },
        data: { heroImageUrl: null, updatedById: session.user.id },
      });
      if (current?.heroImageUrl) {
        await deleteUploadedFile(current.heroImageUrl);
        await prisma.media.deleteMany({ where: { url: current.heroImageUrl } });
      }
      revalidatePromo();
      return { ok: true, imageUrl: null };
    }

    return { ok: false, message: "Tidak ada perubahan gambar." };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan gambar banner.") };
  }
}

/* ─── Highlight bar ─── */
export interface PromoHighlightInput {
  icon: string;
  label: string;
}

export async function savePromoHighlightsAction(data: {
  highlights: PromoHighlightInput[];
}): Promise<ActionResult> {
  try {
    const session = await requirePromoEditor();
    const highlights = data.highlights.map((h) => ({ icon: h.icon, label: h.label.trim() }));

    if (highlights.length === 0 || highlights.some((h) => !h.label)) {
      return { ok: false, message: "Setiap highlight wajib punya label (minimal 1)." };
    }

    await prisma.promoPageContent.update({
      where: { id: "1" },
      data: { highlights, updatedById: session.user.id },
    });
    revalidatePromo();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan highlight.") };
  }
}

/* ─── Judul section Paket Promo (kartu paket-nya sendiri di bawah) ─── */
export async function savePromoPackagesHeadingAction(data: {
  packagesTitlePrefix: string;
  packagesTitleHighlight: string;
  packagesTitleSuffix: string;
  packagesSubtitle: string;
}): Promise<ActionResult> {
  try {
    const session = await requirePromoEditor();
    const packagesTitlePrefix = data.packagesTitlePrefix.trim();
    const packagesTitleHighlight = data.packagesTitleHighlight.trim();
    const packagesTitleSuffix = data.packagesTitleSuffix.trim();
    const packagesSubtitle = data.packagesSubtitle.trim();

    if (!packagesTitlePrefix || !packagesTitleHighlight) {
      return { ok: false, message: "Judul section Paket Promo wajib diisi." };
    }
    if (!packagesSubtitle) {
      return { ok: false, message: "Subjudul section Paket Promo wajib diisi." };
    }

    await prisma.promoPageContent.update({
      where: { id: "1" },
      data: {
        packagesTitlePrefix,
        packagesTitleHighlight,
        packagesTitleSuffix,
        packagesSubtitle,
        updatedById: session.user.id,
      },
    });
    revalidatePromo();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan judul section.") };
  }
}

/* ─── Paket Promo (PromoPackage, relasional — CRUD) ─── */
export interface PromoPackageFormData {
  badge: string;
  title: string;
  price: number;
  originalPrice: number | null;
  features: string[];
  serviceId: string | null;
  isDark: boolean;
}

function validatePackage(data: PromoPackageFormData): string | null {
  if (!data.title.trim()) return "Judul paket wajib diisi.";
  if (!data.price || data.price <= 0) return "Harga wajib diisi & lebih dari 0.";
  if (data.features.length === 0 || data.features.every((f) => !f.trim())) {
    return "Minimal 1 fitur/isi paket wajib diisi.";
  }
  return null;
}

export async function createPromoPackageAction(data: PromoPackageFormData): Promise<ActionResult> {
  try {
    const session = await requirePromoEditor();
    const error = validatePackage(data);
    if (error) return { ok: false, message: error };

    const count = await prisma.promoPackage.count();
    await prisma.promoPackage.create({
      data: {
        badge: data.badge.trim() || null,
        title: data.title.trim(),
        price: data.price,
        originalPrice: data.originalPrice || null,
        features: data.features.map((f) => f.trim()).filter(Boolean),
        serviceId: data.serviceId || null,
        isDark: data.isDark,
        sortOrder: count,
        createdById: session.user.id,
        updatedById: session.user.id,
      },
    });
    revalidatePromo();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menambah paket.") };
  }
}

export async function updatePromoPackageAction(id: string, data: PromoPackageFormData): Promise<ActionResult> {
  try {
    const session = await requirePromoEditor();
    const error = validatePackage(data);
    if (error) return { ok: false, message: error };

    await prisma.promoPackage.update({
      where: { id },
      data: {
        badge: data.badge.trim() || null,
        title: data.title.trim(),
        price: data.price,
        originalPrice: data.originalPrice || null,
        features: data.features.map((f) => f.trim()).filter(Boolean),
        serviceId: data.serviceId || null,
        isDark: data.isDark,
        updatedById: session.user.id,
      },
    });
    revalidatePromo();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal memperbarui paket.") };
  }
}

export async function deletePromoPackageAction(id: string): Promise<ActionResult> {
  try {
    await requirePromoEditor();
    await prisma.promoPackage.delete({ where: { id } });
    revalidatePromo();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menghapus paket.") };
  }
}

export async function reorderPromoPackagesAction(orderedIds: string[]): Promise<ActionResult> {
  try {
    const session = await requirePromoEditor();
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.promoPackage.update({
          where: { id },
          data: { sortOrder: index, updatedById: session.user.id },
        }),
      ),
    );
    revalidatePromo();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal mengurutkan paket.") };
  }
}

/* ─── Banner Promo Beranda (PromoBanner, relasional — CRUD) ───
 * Kartu "Promo Spesial" di homepage (PromoSection), bukan konten halaman
 * /promo di atas. Soft-delete (deletedAt) — beda dari PromoPackage yg hard
 * delete — karena PromoBanner emang udah didesain gitu dari awal (schema). */
export interface PromoBannerLangData {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
}

export interface PromoBannerFormData {
  id: PromoBannerLangData;
  en: PromoBannerLangData;
  zh: PromoBannerLangData;
  variant: PromoBannerVariant;
  ctaHref: string;
  isActive: boolean;
  // Diisi dari uploadPromoBannerImageAction (sama pola dgn TeamMember.photoMediaId)
  // — null = pakai kartu gradient/warna bawaan (lihat VARIANT_STYLES di PromoSection).
  imageMediaId: string | null;
}

function revalidatePromoBanners() {
  revalidatePromo();
  revalidatePath("/");
}

function validateBanner(data: PromoBannerFormData): string | null {
  if (!data.id.eyebrow.trim()) return "Eyebrow (Bahasa Indonesia) wajib diisi.";
  if (!data.id.title.trim()) return "Judul (Bahasa Indonesia) wajib diisi.";
  return null;
}

export async function createPromoBannerAction(data: PromoBannerFormData): Promise<ActionResult> {
  try {
    const session = await requirePromoEditor();
    const error = validateBanner(data);
    if (error) return { ok: false, message: error };

    const count = await prisma.promoBanner.count({ where: { deletedAt: null } });
    await prisma.promoBanner.create({
      data: {
        eyebrow: data.id.eyebrow.trim(),
        eyebrowEn: data.en.eyebrow.trim() || null,
        eyebrowZh: data.zh.eyebrow.trim() || null,
        title: data.id.title.trim(),
        titleEn: data.en.title.trim() || null,
        titleZh: data.zh.title.trim() || null,
        description: data.id.description.trim() || null,
        descriptionEn: data.en.description.trim() || null,
        descriptionZh: data.zh.description.trim() || null,
        ctaLabel: data.id.ctaLabel.trim() || null,
        ctaLabelEn: data.en.ctaLabel.trim() || null,
        ctaLabelZh: data.zh.ctaLabel.trim() || null,
        ctaHref: data.ctaHref.trim() || null,
        imageMediaId: data.imageMediaId,
        variant: data.variant,
        isActive: data.isActive,
        sortOrder: count,
        createdById: session.user.id,
        updatedById: session.user.id,
      },
    });
    revalidatePromoBanners();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menambah banner.") };
  }
}

export async function updatePromoBannerAction(id: string, data: PromoBannerFormData): Promise<ActionResult> {
  try {
    const session = await requirePromoEditor();
    const error = validateBanner(data);
    if (error) return { ok: false, message: error };

    await prisma.promoBanner.update({
      where: { id },
      data: {
        eyebrow: data.id.eyebrow.trim(),
        eyebrowEn: data.en.eyebrow.trim() || null,
        eyebrowZh: data.zh.eyebrow.trim() || null,
        title: data.id.title.trim(),
        titleEn: data.en.title.trim() || null,
        titleZh: data.zh.title.trim() || null,
        description: data.id.description.trim() || null,
        descriptionEn: data.en.description.trim() || null,
        descriptionZh: data.zh.description.trim() || null,
        ctaLabel: data.id.ctaLabel.trim() || null,
        ctaLabelEn: data.en.ctaLabel.trim() || null,
        ctaLabelZh: data.zh.ctaLabel.trim() || null,
        ctaHref: data.ctaHref.trim() || null,
        imageMediaId: data.imageMediaId,
        variant: data.variant,
        isActive: data.isActive,
        updatedById: session.user.id,
      },
    });
    revalidatePromoBanners();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal memperbarui banner.") };
  }
}

export type UploadPromoBannerImageResult =
  | { ok: true; mediaId: string; url: string }
  | { ok: false; message: string };

/** Cuma upload & bikin Media row — belum nautin ke PromoBanner, dipanggil
 * sebelum createPromoBannerAction/updatePromoBannerAction (mediaId dikirim
 * sbg bagian dari payload). Sama pola kayak uploadTeamPhotoAction. */
export async function uploadPromoBannerImageAction(formData: FormData): Promise<UploadPromoBannerImageResult> {
  try {
    const session = await requirePromoEditor();
    const file = formData.get("image") as File | null;
    if (!file || file.size === 0) return { ok: false, message: "File gambar wajib diunggah." };
    const media = await saveUploadedImage(file, "promo-banners", session.user.id);
    return { ok: true, mediaId: media.id, url: media.url };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal mengunggah gambar.") };
  }
}

export async function deletePromoBannerAction(id: string): Promise<ActionResult> {
  try {
    const session = await requirePromoEditor();
    await prisma.promoBanner.update({
      where: { id },
      data: { deletedAt: new Date(), updatedById: session.user.id },
    });
    revalidatePromoBanners();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menghapus banner.") };
  }
}

export async function reorderPromoBannersAction(orderedIds: string[]): Promise<ActionResult> {
  try {
    const session = await requirePromoEditor();
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.promoBanner.update({
          where: { id },
          data: { sortOrder: index, updatedById: session.user.id },
        }),
      ),
    );
    revalidatePromoBanners();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal mengurutkan banner.") };
  }
}

/* ─── Countdown diskon ─── */
export async function savePromoCountdownContentAction(data: {
  countdownTitlePrefix: string;
  countdownTitleHighlight: string;
  countdownDescription: string;
}): Promise<ActionResult> {
  try {
    const session = await requirePromoEditor();
    const countdownTitlePrefix = data.countdownTitlePrefix.trim();
    const countdownTitleHighlight = data.countdownTitleHighlight.trim();
    const countdownDescription = data.countdownDescription.trim();

    if (!countdownTitlePrefix || !countdownTitleHighlight) {
      return { ok: false, message: "Judul countdown wajib diisi." };
    }
    if (!countdownDescription) {
      return { ok: false, message: "Deskripsi countdown wajib diisi." };
    }

    await prisma.promoPageContent.update({
      where: { id: "1" },
      data: {
        countdownTitlePrefix,
        countdownTitleHighlight,
        countdownDescription,
        updatedById: session.user.id,
      },
    });
    revalidatePromo();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan countdown.") };
  }
}

/* ─── Kenapa Pilih Promo ─── */
export interface PromoWhyInput {
  icon: string;
  title: string;
  description: string;
}

export async function savePromoWhyContentAction(data: {
  whyTitlePrefix: string;
  whyTitleHighlight: string;
  whyItems: PromoWhyInput[];
}): Promise<ActionResult> {
  try {
    const session = await requirePromoEditor();
    const whyTitlePrefix = data.whyTitlePrefix.trim();
    const whyTitleHighlight = data.whyTitleHighlight.trim();
    const whyItems = data.whyItems.map((w) => ({ icon: w.icon, title: w.title.trim(), description: w.description.trim() }));

    if (!whyTitlePrefix || !whyTitleHighlight) {
      return { ok: false, message: "Judul section wajib diisi." };
    }
    if (whyItems.length === 0 || whyItems.some((w) => !w.title || !w.description)) {
      return { ok: false, message: "Setiap kartu wajib punya judul & deskripsi (minimal 1)." };
    }

    await prisma.promoPageContent.update({
      where: { id: "1" },
      data: { whyTitlePrefix, whyTitleHighlight, whyItems, updatedById: session.user.id },
    });
    revalidatePromo();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan konten.") };
  }
}

/* ─── Cara Mendapatkan Promo (steps) ─── */
export interface PromoStepInput {
  icon: string;
  title: string;
  description: string;
}

export async function savePromoStepsContentAction(data: {
  stepsTitle: string;
  steps: PromoStepInput[];
}): Promise<ActionResult> {
  try {
    const session = await requirePromoEditor();
    const stepsTitle = data.stepsTitle.trim();
    const steps = data.steps.map((s) => ({ icon: s.icon, title: s.title.trim(), description: s.description.trim() }));

    if (!stepsTitle) {
      return { ok: false, message: "Judul section wajib diisi." };
    }
    if (steps.length === 0 || steps.some((s) => !s.title || !s.description)) {
      return { ok: false, message: "Setiap langkah wajib punya judul & deskripsi (minimal 1)." };
    }

    await prisma.promoPageContent.update({
      where: { id: "1" },
      data: { stepsTitle, steps, updatedById: session.user.id },
    });
    revalidatePromo();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan konten.") };
  }
}

/* ─── Banner ajakan klaim promo ─── */
export async function savePromoConsultContentAction(data: {
  consultTitlePrefix: string;
  consultTitleHighlight: string;
  consultDescription: string;
}): Promise<ActionResult> {
  try {
    const session = await requirePromoEditor();
    const consultTitlePrefix = data.consultTitlePrefix.trim();
    const consultTitleHighlight = data.consultTitleHighlight.trim();
    const consultDescription = data.consultDescription.trim();

    if (!consultTitlePrefix || !consultTitleHighlight) {
      return { ok: false, message: "Judul banner ajakan wajib diisi." };
    }
    if (!consultDescription) {
      return { ok: false, message: "Deskripsi banner ajakan wajib diisi." };
    }

    await prisma.promoPageContent.update({
      where: { id: "1" },
      data: {
        consultTitlePrefix,
        consultTitleHighlight,
        consultDescription,
        updatedById: session.user.id,
      },
    });
    revalidatePromo();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan konten.") };
  }
}

/** Ganti/hapus foto banner ajakan klaim promo — kosong (null) = balik ke foto
 * bawaan /images/promo-konsultasi.png (lihat PromoConsultSection.tsx). */
export async function savePromoConsultImageAction(formData: FormData): Promise<PromoImageActionResult> {
  try {
    const session = await requirePromoEditor();
    const file = formData.get("image") as File | null;
    const reset = formData.get("reset") === "true";
    const current = await prisma.promoPageContent.findUnique({ where: { id: "1" } });

    if (file && file.size > 0) {
      const media = await saveUploadedImage(file, "promo", session.user.id);
      await prisma.promoPageContent.update({
        where: { id: "1" },
        data: { consultImageUrl: media.url, updatedById: session.user.id },
      });
      if (current?.consultImageUrl) {
        await deleteUploadedFile(current.consultImageUrl);
        await prisma.media.deleteMany({ where: { url: current.consultImageUrl } });
      }
      revalidatePromo();
      return { ok: true, imageUrl: media.url };
    }

    if (reset) {
      await prisma.promoPageContent.update({
        where: { id: "1" },
        data: { consultImageUrl: null, updatedById: session.user.id },
      });
      if (current?.consultImageUrl) {
        await deleteUploadedFile(current.consultImageUrl);
        await prisma.media.deleteMany({ where: { url: current.consultImageUrl } });
      }
      revalidatePromo();
      return { ok: true, imageUrl: null };
    }

    return { ok: false, message: "Tidak ada perubahan gambar." };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan gambar.") };
  }
}

/* ─── CTA Banner penutup ─── */
export async function savePromoCtaContentAction(data: {
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButtonLabel: string;
}): Promise<ActionResult> {
  try {
    const session = await requirePromoEditor();
    const ctaTitle = data.ctaTitle.trim();
    const ctaSubtitle = data.ctaSubtitle.trim();
    const ctaButtonLabel = data.ctaButtonLabel.trim();

    if (!ctaTitle || !ctaSubtitle || !ctaButtonLabel) {
      return { ok: false, message: "Judul, subjudul & label tombol CTA wajib diisi." };
    }

    await prisma.promoPageContent.update({
      where: { id: "1" },
      data: { ctaTitle, ctaSubtitle, ctaButtonLabel, updatedById: session.user.id },
    });
    revalidatePromo();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Gagal menyimpan CTA.") };
  }
}
