import { prisma } from "@/lib/db";
import { pickLocalizedText } from "@/lib/locale-field";
import type { LandingPromo } from "@/lib/landing";
import type { Locale } from "@/i18n/config";
import type { PromoBannerVariant } from "@prisma/client";

const VARIANT_MAP: Record<PromoBannerVariant, LandingPromo["variant"]> = {
  DISCOUNT: "discount",
  FREE: "free",
  PACKAGE: "package",
};

/* ─── Kartu "Promo Spesial" homepage, dari PromoBanner (admin: /promo) ─── */
export async function getPublicPromos(locale: Locale): Promise<LandingPromo[]> {
  const rows = await prisma.promoBanner.findMany({
    where: { deletedAt: null, isActive: true },
    include: { image: { select: { url: true } } },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map((p) => ({
    id: p.id,
    eyebrow: pickLocalizedText(p.eyebrow, p.eyebrowEn, p.eyebrowZh, locale),
    title: pickLocalizedText(p.title, p.titleEn, p.titleZh, locale),
    description: pickLocalizedText(p.description ?? "", p.descriptionEn, p.descriptionZh, locale),
    ctaLabel: pickLocalizedText(p.ctaLabel ?? "", p.ctaLabelEn, p.ctaLabelZh, locale),
    ctaHref: p.ctaHref,
    imageUrl: p.image?.url ?? null,
    variant: VARIANT_MAP[p.variant],
  }));
}
