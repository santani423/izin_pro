import type { Metadata } from "next";
import dynamic from "next/dynamic";

import PageHero from "@/components/shared/PageHero";
import BlogCatalogSection from "@/components/sections/BlogCatalogSection";

/* ─── Lazy load section below the fold ─── */
const CtaSection = dynamic(() => import("@/components/sections/CtaSection"));

export const metadata: Metadata = {
  title: "Artikel & Insight Seputar Perizinan Usaha",
  description:
    "Informasi terbaru seputar perizinan usaha, regulasi, dan tips untuk mendukung pertumbuhan bisnis Anda — dari tim IzinPro.",
  alternates: {
    canonical: "https://izinpro.co.id/blog",
  },
};

/* ─── Halaman Artikel / Blog (desain baru) ─── */
export default function BlogPage() {
  return (
    <>
      {/* 1. Hero + breadcrumb */}
      <PageHero
        crumbs={[{ label: "Beranda", href: "/" }, { label: "Artikel" }]}
        title={
          <>
            Artikel & <span className="text-primary">Insight</span>
          </>
        }
        description="Informasi terbaru seputar perizinan usaha, regulasi, dan tips untuk mendukung pertumbuhan bisnis Anda."
        imageLabel="Ilustrasi laptop menampilkan artikel IzinPro"
        overlap
      />

      {/* 2. Search + sidebar + grid artikel */}
      <BlogCatalogSection />

      {/* 3. CTA Banner */}
      <CtaSection
        title="Butuh Bantuan Perizinan untuk Bisnis Anda?"
        subtitle="Konsultasikan kebutuhan perizinan Anda sekarang juga secara gratis bersama tim ahli kami."
      />
    </>
  );
}
