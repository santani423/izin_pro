import type { Metadata } from "next";
import dynamic from "next/dynamic";

import PageHero from "@/components/shared/PageHero";
import TrackingFormSection from "@/components/sections/TrackingFormSection";
import TrackingHeroVisual from "@/components/sections/TrackingHeroVisual";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";

/* ─── Lazy load sections below the fold ─── */
const TrackingInfoSection = dynamic(
  () => import("@/components/sections/TrackingInfoSection"),
);
const CtaSection = dynamic(() => import("@/components/sections/CtaSection"));

export async function generateMetadata(): Promise<Metadata> {
  const dict = getDictionary(await getLocale());
  return {
    title: dict.pages.tracking.metaTitle,
    description: dict.pages.tracking.metaDescription,
    alternates: {
      canonical: "https://izinpro.co.id/tracking",
    },
  };
}

/* ─── Halaman Tracking Perizinan ───
 * ?code=TRX-... (dari section tracking homepage / link WhatsApp) langsung
 * dilacak otomatis begitu halaman dimuat. */
export default async function TrackingPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const dict = getDictionary(await getLocale());

  return (
    <>
      {/* 1. Hero + breadcrumb */}
      <PageHero
        crumbs={[{ label: dict.common.breadcrumbHome, href: "/" }, { label: dict.pages.tracking.breadcrumbTracking }]}
        ariaBreadcrumb={dict.common.ariaBreadcrumb}
        title={
          <>
            {dict.pages.tracking.headingPrefix} <span className="text-primary">{dict.pages.tracking.headingHighlight}</span>
          </>
        }
        description={dict.pages.tracking.description}
        imageLabel={dict.pages.tracking.imageLabel}
        imageContent={<TrackingHeroVisual />}
        overlap
      />

      {/* 2. Form lacak + hasil timeline */}
      <TrackingFormSection initialCode={code} />

      {/* 3. Cara kerja */}
      <TrackingInfoSection />

      {/* 4. CTA Banner */}
      <CtaSection
        title={dict.pages.tracking.ctaTitle}
        subtitle={dict.pages.tracking.ctaSubtitle}
      />
    </>
  );
}
