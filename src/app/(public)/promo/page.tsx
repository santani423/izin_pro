import type { Metadata } from "next";
import dynamic from "next/dynamic";

import PageHero from "@/components/shared/PageHero";
import HighlightsBar from "@/components/shared/HighlightsBar";
import PromoPackagesSection from "@/components/sections/PromoPackagesSection";
import LayananDetailProcessSection from "@/components/sections/LayananDetailProcessSection";
import { prisma } from "@/lib/db";
import { hydratePromoContent, hydratePromoPackage } from "@/lib/hydrate-promo-content";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";

/* ─── Lazy load sections below the fold ─── */
const PromoCountdownSection = dynamic(
  () => import("@/components/sections/PromoCountdownSection"),
);
const PromoWhySection = dynamic(
  () => import("@/components/sections/PromoWhySection"),
);
const PromoConsultSection = dynamic(
  () => import("@/components/sections/PromoConsultSection"),
);
const CtaSection = dynamic(() => import("@/components/sections/CtaSection"));

export async function generateMetadata(): Promise<Metadata> {
  const dict = getDictionary(await getLocale());
  return {
    title: dict.pages.promo.metaTitle,
    description: dict.pages.promo.metaDescription,
    alternates: {
      canonical: "https://izinpro.co.id/promo",
    },
  };
}

/* ─── Halaman Promo (desain baru) — seluruh konten dikelola admin di /promo ─── */
export default async function PromoPage() {
  const dict = getDictionary(await getLocale());
  const [rawContent, rawPackages] = await Promise.all([
    prisma.promoPageContent.findUniqueOrThrow({ where: { id: "1" } }),
    prisma.promoPackage.findMany({
      include: { service: { select: { slug: true } } },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const content = hydratePromoContent(rawContent);
  const packages = rawPackages.map(hydratePromoPackage);

  return (
    <>
      {/* 1. Hero + breadcrumb */}
      <PageHero
        crumbs={[{ label: dict.common.breadcrumbHome, href: "/" }, { label: dict.pages.promo.breadcrumbPromo }]}
        ariaBreadcrumb={dict.common.ariaBreadcrumb}
        kicker={content.hero.kicker ?? undefined}
        title={
          <>
            {content.hero.title} <span className="text-primary">{content.hero.titleHighlight}</span>
          </>
        }
        description={content.hero.description}
        imageUrl={content.hero.imageUrl}
        imageLabel={dict.pages.promo.imageLabel}
        overlap
      />

      {/* 2. Highlight keunggulan */}
      <HighlightsBar
        items={content.highlights}
        ariaLabel={dict.pages.promo.highlightsAriaLabel}
      />

      {/* 3. Paket promo pilihan */}
      <PromoPackagesSection heading={content.packagesHeading} packages={packages} />

      {/* 4. Countdown diskon */}
      <PromoCountdownSection heading={content.countdown} />

      {/* 5. Kenapa pilih promo */}
      <PromoWhySection
        titlePrefix={content.why.titlePrefix}
        titleHighlight={content.why.titleHighlight}
        items={content.why.items}
      />

      {/* 6. Cara mendapatkan promo */}
      <LayananDetailProcessSection
        process={{ title: content.steps.title, steps: content.steps.steps }}
      />

      {/* 7. Banner ajakan klaim promo */}
      <PromoConsultSection
        titlePrefix={content.consult.titlePrefix}
        titleHighlight={content.consult.titleHighlight}
        description={content.consult.description}
        imageUrl={content.consult.imageUrl}
      />

      {/* 8. CTA Banner */}
      <CtaSection
        title={content.cta.title}
        subtitle={content.cta.subtitle}
        buttonLabel={content.cta.buttonLabel}
      />
    </>
  );
}
