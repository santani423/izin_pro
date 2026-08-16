import type { Metadata } from "next";
import dynamic from "next/dynamic";
import LayananHeroSection from "@/components/sections/LayananHeroSection";
import LayananHighlightsSection from "@/components/sections/LayananHighlightsSection";
import LayananCatalogSection from "@/components/sections/LayananCatalogSection";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";

/* ─── Lazy load sections below the fold ─── */
const LayananConsultSection = dynamic(
  () => import("@/components/sections/LayananConsultSection"),
);
const CtaSection = dynamic(() => import("@/components/sections/CtaSection"));

export async function generateMetadata(): Promise<Metadata> {
  const dict = getDictionary(await getLocale());
  return {
    title: dict.pages.layanan.metaTitle,
    description: dict.pages.layanan.metaDescription,
    alternates: {
      canonical: "https://izinpro.co.id/layanan",
    },
  };
}

/* ─── Halaman Daftar Layanan (desain baru) ─── */
export default function LayananPage() {
  return (
    <>
      {/* 1. Hero + breadcrumb */}
      <LayananHeroSection />

      {/* 2. Highlight keunggulan */}
      <LayananHighlightsSection />

      {/* 3. Katalog layanan + filter kategori */}
      <LayananCatalogSection />

      {/* 4. Banner konsultasi */}
      <LayananConsultSection />

      {/* 5. CTA Banner */}
      <CtaSection />
    </>
  );
}
