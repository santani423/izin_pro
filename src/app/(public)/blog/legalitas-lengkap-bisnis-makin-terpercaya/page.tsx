import type { Metadata } from "next";
import dynamic from "next/dynamic";

import PanduanLegalitasHeroSection from "@/components/sections/PanduanLegalitasHeroSection";
import PanduanLegalitasBodySection from "@/components/sections/PanduanLegalitasBodySection";
import ViewContentTracker from "@/components/ViewContentTracker";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { PANDUAN_LEGALITAS_HERO, PANDUAN_LEGALITAS_SLUG } from "@/lib/panduan-legalitas";

/* ─── Lazy load section below the fold ─── */
const CtaSection = dynamic(() => import("@/components/sections/CtaSection"));

export async function generateMetadata(): Promise<Metadata> {
  const dict = getDictionary(await getLocale());
  return {
    title: dict.pages.blogLegalitas.metaTitle,
    description: dict.pages.blogLegalitas.metaDescription,
    alternates: {
      canonical: "https://izinpro.co.id/blog/legalitas-lengkap-bisnis-makin-terpercaya",
    },
  };
}

/* ─── Halaman Legalitas Lengkap, Bisnis Makin Terpercaya (desain baru) ─── */
export default async function PanduanLegalitasPage() {
  const dict = getDictionary(await getLocale());
  return (
    <>
      {/* Meta Pixel — ViewContent. Halaman ini punya route statis sendiri
       * (bukan lewat [slug]/artikel dari DB), jadi gak ada id numerik —
       * pakai slug sbg identifier sesuai instruksi #7. */}
      <ViewContentTracker
        content_name={`${PANDUAN_LEGALITAS_HERO.titleLead} ${PANDUAN_LEGALITAS_HERO.titleHighlight}`}
        content_type="article"
        content_ids={[PANDUAN_LEGALITAS_SLUG]}
        content_category={PANDUAN_LEGALITAS_HERO.kicker}
      />

      {/* 1. Hero + breadcrumb + CTA */}
      <PanduanLegalitasHeroSection />

      {/* 2. Konten panduan legalitas & sidebar */}
      <PanduanLegalitasBodySection />

      {/* 3. CTA Banner */}
      <CtaSection
        title={dict.pages.blogLegalitas.ctaTitle}
        subtitle={dict.pages.blogLegalitas.ctaSubtitle}
      />
    </>
  );
}
