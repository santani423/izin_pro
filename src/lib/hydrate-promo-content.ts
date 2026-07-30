/* ─── Hydrasi PromoPageContent + PromoPackage (DB) -> props section /promo ───
 * Sama pola dgn hydrate-about-content.ts: Json content nyimpen ikon sbg
 * string key, fungsi di sini convert balik jadi LucideIcon SEBELUM dikirim
 * ke komponen section. Harga PromoPackage (Decimal) juga diformat & "saving"
 * dihitung di sini (originalPrice - price) biar gak nyimpen data redundan
 * yang bisa gak sinkron kalau admin ubah harga. */
import type { PromoPageContent, PromoPackage, Service } from "@prisma/client";
import { resolveDetailIcon } from "@/lib/detail-icons";
import type { HighlightItem } from "@/components/shared/HighlightsBar";
import type { PromoPackageItem, PromoPackagesHeading } from "@/components/sections/PromoPackagesSection";
import type { PromoCountdownHeading } from "@/components/sections/PromoCountdownSection";
import type { PromoWhyItem } from "@/components/sections/PromoWhySection";
import type { DetailStep } from "@/lib/hydrate-layanan-detail";

interface RawIconLabel {
  icon: string;
  label: string;
}

interface RawIconTitleDesc {
  icon: string;
  title: string;
  description: string;
}

function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export interface HydratedPromoHero {
  kicker: string | null;
  title: string;
  titleHighlight: string;
  description: string;
  imageUrl: string | null;
}

export interface HydratedPromoConsult {
  titlePrefix: string;
  titleHighlight: string;
  description: string;
  imageUrl: string | null;
}

export interface HydratedPromoCta {
  title: string;
  subtitle: string;
  buttonLabel: string;
}

export interface HydratedPromoContent {
  hero: HydratedPromoHero;
  highlights: HighlightItem[];
  packagesHeading: PromoPackagesHeading;
  countdown: PromoCountdownHeading;
  why: { titlePrefix: string; titleHighlight: string; items: PromoWhyItem[] };
  steps: { title: string; steps: DetailStep[] };
  consult: HydratedPromoConsult;
  cta: HydratedPromoCta;
}

export function hydratePromoContent(content: PromoPageContent): HydratedPromoContent {
  const highlights = content.highlights as unknown as RawIconLabel[];
  const whyItems = content.whyItems as unknown as RawIconTitleDesc[];
  const steps = content.steps as unknown as RawIconTitleDesc[];

  return {
    hero: {
      kicker: content.heroKicker,
      title: content.heroTitle,
      titleHighlight: content.heroTitleHighlight,
      description: content.heroDescription,
      imageUrl: content.heroImageUrl,
    },
    highlights: highlights.map((h) => ({ icon: resolveDetailIcon(h.icon), label: h.label })),
    packagesHeading: {
      titlePrefix: content.packagesTitlePrefix,
      titleHighlight: content.packagesTitleHighlight,
      titleSuffix: content.packagesTitleSuffix,
      subtitle: content.packagesSubtitle,
    },
    countdown: {
      titlePrefix: content.countdownTitlePrefix,
      titleHighlight: content.countdownTitleHighlight,
      description: content.countdownDescription,
    },
    why: {
      titlePrefix: content.whyTitlePrefix,
      titleHighlight: content.whyTitleHighlight,
      items: whyItems.map((w) => ({ icon: resolveDetailIcon(w.icon), title: w.title, description: w.description })),
    },
    steps: {
      title: content.stepsTitle,
      steps: steps.map((s) => ({ icon: resolveDetailIcon(s.icon), title: s.title, description: s.description })),
    },
    consult: {
      titlePrefix: content.consultTitlePrefix,
      titleHighlight: content.consultTitleHighlight,
      description: content.consultDescription,
      imageUrl: content.consultImageUrl,
    },
    cta: {
      title: content.ctaTitle,
      subtitle: content.ctaSubtitle,
      buttonLabel: content.ctaButtonLabel,
    },
  };
}

export function hydratePromoPackage(
  pkg: PromoPackage & { service: Pick<Service, "slug"> | null },
): PromoPackageItem {
  const price = pkg.price.toNumber();
  const originalPrice = pkg.originalPrice ? pkg.originalPrice.toNumber() : null;
  return {
    id: pkg.id,
    badge: pkg.badge,
    title: pkg.title,
    price: formatRupiah(price),
    originalPrice: originalPrice ? formatRupiah(originalPrice) : null,
    saving: originalPrice && originalPrice > price ? `Hemat ${formatRupiah(originalPrice - price)}` : null,
    features: pkg.features as string[],
    href: pkg.service ? `/layanan/${pkg.service.slug}` : "/layanan",
    dark: pkg.isDark,
  };
}
